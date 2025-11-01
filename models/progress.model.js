const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      Progress.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'user',
      });
      Progress.belongsTo(models.Lesson, {
        foreignKey: 'LessonID',
        as: 'lesson',
      });
      Progress.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'course',
      });
    }
  }

  Progress.init(
    {
      ProgressID: {
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
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'CourseID',
        },
      },
      LessonID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Lessons',
          key: 'LessonID',
        },
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'not-started',
        validate: {
          isIn: [['not-started', 'in-progress', 'completed']],
        },
      },
      CompletionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      TimeSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Time spent in minutes',
      },
      LastAccessDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('GETDATE'),
      },
      Score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      Notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Progress',
      tableName: 'Progress',
      timestamps: false,
      indexes: [
        {
          name: 'UQ_UserCourseLesson',
          unique: true,
          fields: ['UserID', 'CourseID', 'LessonID'],
        },
        {
          name: 'IX_Progress_UserID_CourseID',
          fields: ['UserID', 'CourseID'],
        },
        {
          name: 'IX_Progress_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Progress_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_Progress_LessonID',
          fields: ['LessonID'],
        },
      ],
      hooks: {
        afterUpdate: async (progress, options) => {
          try {
            if (progress.changed && progress.changed('Status') && progress.Status === 'completed') {
              const lesson = await sequelize.models.Lesson.findByPk(progress.LessonID);
              if (lesson) {
                // Update enrollment progress
                const totalLessons = await sequelize.models.Lesson.count({
                  where: { CourseID: lesson.CourseID },
                });

                const completedLessons = await Progress.count({
                  where: {
                    UserID: progress.UserID,
                    Status: 'completed',
                  },
                  include: [
                    {
                      model: sequelize.models.Lesson,
                      as: 'lesson',
                      required: true,
                      where: { CourseID: lesson.CourseID },
                    },
                  ],
                });

                const progressPercentage =
                  totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                await sequelize.models.Enrollment.update(
                  {
                    Progress: progressPercentage,
                    Status: progressPercentage === 100 ? 'completed' : 'active',
                    LastAccessedAt: new Date(),
                    CompletedAt: progressPercentage === 100 ? new Date() : null,
                  },
                  {
                    where: {
                      UserID: progress.UserID,
                      CourseID: lesson.CourseID,
                    },
                    transaction: options ? options.transaction : null,
                  },
                );
              }
            }
          } catch (err) {
            // don't let hook failures crash the app; log and continue
            console.error('Error in Progress.afterUpdate hook:', err);
          }
        },
      },
    },
  );

  return Progress;
};
