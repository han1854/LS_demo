const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'User',
      });

      Transaction.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'Course',
      });
    }

    // Method to process payment completion
    async completePayment(transaction) {
      // Find the course
      const course = await sequelize.models.Course.findByPk(this.CourseID);
      if (!course) {
        throw new Error('Course not found');
      }

      // Create revenue share record
      await sequelize.models.RevenueShare.create(
        {
          CourseID: this.CourseID,
          InstructorID: course.InstructorID,
          Percentage: 70,
          Status: 'active',
        },
        { transaction },
      );

      // Create enrollment
      await sequelize.models.Enrollment.create(
        {
          UserID: this.UserID,
          CourseID: this.CourseID,
          Status: 'active',
        },
        { transaction },
      );

      // Create notification
      await sequelize.models.Notification.create(
        {
          UserID: this.UserID,
          Type: 'payment',
          Title: 'Course Access Granted',
          Message: `You now have access to ${course.Title}`,
          ReferenceType: 'course',
          ReferenceID: this.CourseID,
        },
        { transaction },
      );
    }

    // Method to process refund
    async processRefund(transaction) {
      // Cancel enrollment
      await sequelize.models.Enrollment.update(
        { Status: 'cancelled' },
        {
          where: {
            UserID: this.UserID,
            CourseID: this.CourseID,
          },
          transaction,
        },
      );

      this.Status = 'refunded';
      this.RefundDate = new Date();
      await this.save({ transaction });
    }
  }

  Transaction.init(
    {
      TransactionID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'UserID' },
      },
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Courses', key: 'CourseID' },
      },
      Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      Currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'VND',
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        validate: { isIn: [['pending', 'completed', 'failed', 'refunded']] },
      },
      PaymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      PaymentDetails: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      TransactionDate: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      RefundDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'Transactions',
      timestamps: false,
      indexes: [
        { name: 'IX_Transactions_UserID', fields: ['UserID'] },
        { name: 'IX_Transactions_CourseID', fields: ['CourseID'] },
        { name: 'IX_Transactions_Status', fields: ['Status'] },
      ],
      hooks: {
        afterUpdate: async (transaction, options) => {
          if (transaction.changed && transaction.changed('Status')) {
            if (transaction.Status === 'completed') {
              const course = await sequelize.models.Course.findByPk(transaction.CourseID);
              if (course) {
                await sequelize.models.RevenueShare.create(
                  {
                    CourseID: transaction.CourseID,
                    InstructorID: course.InstructorID,
                    Percentage: 70,
                    Status: 'active',
                  },
                  { transaction: options.transaction },
                );

                await sequelize.models.Enrollment.create(
                  {
                    UserID: transaction.UserID,
                    CourseID: transaction.CourseID,
                    Status: 'active',
                  },
                  { transaction: options.transaction },
                );

                await sequelize.models.Notification.create(
                  {
                    UserID: transaction.UserID,
                    Type: 'payment',
                    Title: 'Course Access Granted',
                    Message: `You now have access to ${course.Title}`,
                    ReferenceType: 'course',
                    ReferenceID: transaction.CourseID,
                  },
                  { transaction: options.transaction },
                );
              }
            } else if (transaction.Status === 'refunded') {
              await sequelize.models.Enrollment.update(
                { Status: 'cancelled' },
                {
                  where: { UserID: transaction.UserID, CourseID: transaction.CourseID },
                  transaction: options.transaction,
                },
              );
            }
          }
        },
      },
    },
  );
  Transaction.addHook('afterUpdate', async (transaction, options) => {
    if (transaction.changed && transaction.changed('Status')) {
      if (transaction.Status === 'completed') {
        await transaction.completePayment(options.transaction);
      } else if (transaction.Status === 'refunded') {
        await transaction.processRefund(options.transaction);
      }
    }
  });

  return Transaction;
};
