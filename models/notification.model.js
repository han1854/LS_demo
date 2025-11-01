const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'user',
      });
    }
  }

  Notification.init(
    {
      NotificationID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Type: {
        type: DataTypes.STRING(50), // system, course, assignment, quiz, etc.
        allowNull: false,
      },
      RelatedID: {
        type: DataTypes.INTEGER, // ID của item liên quan (courseID, assignmentID, etc.)
      },
      IsRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'Notifications',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Notifications_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_Notifications_Type',
          fields: ['Type'],
        },
        {
          name: 'IX_Notifications_IsRead',
          fields: ['IsRead'],
        },
      ],
    },
  );

  return Notification;
};
