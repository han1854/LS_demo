const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'course',
      });
      Announcement.belongsTo(models.User, {
        foreignKey: 'CreatedBy',
        as: 'creator',
      });
    }
  }

  Announcement.init(
    {
      AnnouncementID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Priority: {
        type: DataTypes.STRING(20),
        defaultValue: 'medium',
        validate: {
          isIn: [['low', 'medium', 'high']],
        },
      },
      StartDate: {
        type: DataTypes.DATE,
      },
      EndDate: {
        type: DataTypes.DATE,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: {
          isIn: [['draft', 'published', 'archived']],
        },
      },
      CreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'Announcement',
      tableName: 'Announcements',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Announcements_CourseID',
          fields: ['CourseID'],
        },
        {
          name: 'IX_Announcements_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Announcements_CreatedBy',
          fields: ['CreatedBy'],
        },
        {
          name: 'IX_Announcements_Priority',
          fields: ['Priority'],
        },
      ],
    },
  );

  return Announcement;
};
