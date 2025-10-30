module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define("Progress", {
    ProgressID: { 
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
    LessonID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'LessonID'
      }
    },
    Status: { 
      type: DataTypes.STRING(20),
      defaultValue: 'not-started',
      validate: {
        isIn: [['not-started', 'in-progress', 'completed']]
      }
    },
    CompletionDate: { 
      type: DataTypes.DATE,
      allowNull: true
    },
    TimeSpent: { 
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Time spent in minutes'
    },
    LastAccessDate: { 
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('GETDATE')
    },
    Score: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    Notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "Progress",
    timestamps: false,
    indexes: [
      {
        name: 'UQ_UserCourseLesson',
        unique: true,
        fields: ['UserID', 'CourseID', 'LessonID']
      },
      {
        name: 'IX_Progress_UserID_CourseID',
        fields: ['UserID', 'CourseID']
      },
      {
        name: 'IX_Progress_Status',
        fields: ['Status']
      }
    ]
  });

  Progress.addHook('afterUpdate', async (progress, options) => {
    if (progress.changed('Status') && progress.Status === 'completed') {
      // Update course progress when a lesson is completed
      const totalLessons = await sequelize.models.Lesson.count({
        where: { CourseID: progress.CourseID }
      });
      
      const completedLessons = await Progress.count({
        where: {
          UserID: progress.UserID,
          CourseID: progress.CourseID,
          Status: 'completed'
        }
      });

      const progressPercentage = (completedLessons / totalLessons) * 100;

      await sequelize.models.Enrollment.update(
        {
          Progress: progressPercentage,
          Status: progressPercentage === 100 ? 'completed' : 'active',
          LastAccessDate: new Date()
        },
        {
          where: {
            UserID: progress.UserID,
            CourseID: progress.CourseID
          }
        }
      );
    }
  });

  return Progress;
};