const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RevenueShare extends Model {
    static associate(models) {
      RevenueShare.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'Course',
      });

      RevenueShare.belongsTo(models.User, {
        foreignKey: 'InstructorID',
        as: 'Instructor',
      });
    }
  }

  RevenueShare.init(
    {
      ShareID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'CourseID',
        },
      },
      InstructorID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      Percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 70.0,
        allowNull: false,
        validate: { min: 0, max: 100 },
      },
      EffectiveFrom: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      EffectiveUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: { isIn: [['active', 'inactive']] },
      },
    },
    {
      sequelize,
      modelName: 'RevenueShare',
      tableName: 'RevenueShare',
      timestamps: false,
      indexes: [
        { name: 'IX_RevenueShare_CourseID', fields: ['CourseID'] },
        { name: 'IX_RevenueShare_InstructorID', fields: ['InstructorID'] },
        { name: 'IX_RevenueShare_Status', fields: ['Status'] },
      ],
      hooks: {
        afterUpdate: async (share, options) => {
          if (share.changed && share.changed('Status') && share.Status === 'active') {
            // create notification for instructor using existing Notifications schema
            await sequelize.models.Notification.create(
              {
                UserID: share.InstructorID,
                Type: 'payment',
                Title: 'Revenue Share Updated',
                Message: `Your revenue share for course ${share.CourseID} is now ${share.Status}`,
                ReferenceType: 'revenue_share',
                ReferenceID: share.ShareID,
              },
              { transaction: options.transaction },
            );
          }
        },
      },
    },
  );
  return RevenueShare;
};
