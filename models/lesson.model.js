const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {}

  Lesson.init(
    {
      LessonID: {
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
      Description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      VideoURL: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duration in minutes',
      },
      OrderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      Status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'draft',
        validate: {
          isIn: [['draft', 'published', 'archived']],
        },
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      LastModifiedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'Lesson',
      tableName: 'Lessons',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Lessons_CourseID',
          fields: ['CourseID'],
        },
        {
          name: 'IX_Lessons_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Lessons_OrderIndex',
          fields: ['OrderIndex'],
        },
      ],
      hooks: {
        beforeUpdate: lesson => {
          lesson.LastModifiedAt = new Date();
        },
      },
    },
  );

  Lesson.associate = function (models) {
    Lesson.belongsTo(models.Course, {
      foreignKey: 'CourseID',
      as: 'course',
    });
    Lesson.hasMany(models.Assignment, {
      foreignKey: 'LessonID',
      as: 'assignments',
    });
    Lesson.hasMany(models.Quiz, {
      foreignKey: 'LessonID',
      as: 'quizzes',
    });
    Lesson.hasMany(models.Progress, {
      foreignKey: 'LessonID',
      as: 'progress',
    });
    Lesson.hasMany(models.Comment, {
      foreignKey: 'LessonID',
      as: 'comments',
    });
  };

  return Lesson;
};
