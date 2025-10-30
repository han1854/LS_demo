module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
    TransactionID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    UserID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    CourseID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'CourseID' 
      }
    },
    Amount: { 
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    Currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    PaymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    PaymentDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Status: { 
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']]
      }
    },
    RefundAmount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    RefundReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TransactionReference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    CreatedAt: { 
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    ProcessedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    RefundedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "Transactions",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Transactions_UserID',
        fields: ['UserID']
      },
      {
        name: 'IX_Transactions_CourseID', 
        fields: ['CourseID']
      },
      {
        name: 'IX_Transactions_Status',
        fields: ['Status']  
      },
      {
        name: 'UQ_TransactionReference',
        unique: true,
        fields: ['TransactionReference']
      }
    ],
    hooks: {
      afterUpdate: async (transaction, options) => {
        if(transaction.changed('Status')) {
          // Khi giao dịch hoàn thành
          if(transaction.Status === 'completed') {
            const course = await sequelize.models.Course.findByPk(transaction.CourseID);
            if(course) {
              // Tạo revenue share
              const instructorShare = transaction.Amount * 0.7; // 70% cho giảng viên
              await sequelize.models.RevenueShare.create({
                CourseID: transaction.CourseID,
                InstructorID: course.InstructorID,
                TransactionID: transaction.TransactionID,
                Amount: instructorShare,
                Status: 'pending'
              }, { transaction: options.transaction });

              // Tạo enrollment
              await sequelize.models.Enrollment.create({
                UserID: transaction.UserID,
                CourseID: transaction.CourseID,
                Status: 'active'
              }, { transaction: options.transaction });

              // Thông báo
              await sequelize.models.Notification.create({
                UserID: transaction.UserID,
                Title: 'Course Access Granted',
                Message: `You now have access to ${course.Title}`,
                Type: 'enrollment',
                RelatedID: transaction.CourseID
              }, { transaction: options.transaction });
            }
          }
          // Khi giao dịch được hoàn tiền
          else if(transaction.Status === 'refunded') {
            // Hủy enrollment
            await sequelize.models.Enrollment.update(
              { Status: 'dropped' },
              { 
                where: {
                  UserID: transaction.UserID,
                  CourseID: transaction.CourseID
                },
                transaction: options.transaction
              }
            );
          }
        }
      }
    }
  });
  return Transaction;
};
