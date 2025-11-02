const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    static associate(models) {
      Assignment.belongsTo(models.Lesson, {
        foreignKey: 'LessonID',
        as: 'lesson',
      });
      Assignment.hasMany(models.Submission, {
        foreignKey: 'AssignmentID',
        as: 'submissions',
      });
      Assignment.belongsTo(models.User, {
        foreignKey: 'CreatedBy',
        as: 'creator',
      });
    }
  }

  Assignment.init(
    {
      AssignmentID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      LessonID: {
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
      Instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed instructions for completing the assignment',
      },
      MaxScore: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10,
        validate: {
          min: 0,
          max: 100,
        },
      },
      DueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      AllowLateSubmission: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      LateSubmissionPenalty: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Percentage penalty for late submissions',
      },
      RequiredFiles: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Comma-separated list of required file types (e.g., "pdf,doc,docx")',
      },
      MaxFileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum file size in MB',
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: {
          isIn: [['draft', 'published', 'archived']],
        },
      },
      RubricData: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Rubric data in JSON format',
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
      modelName: 'Assignment',
      tableName: 'Assignments',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Assignments_LessonID',
          fields: ['LessonID'],
        },
        {
          name: 'IX_Assignments_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Assignments_DueDate',
          fields: ['DueDate'],
        },
      ],
      hooks: {
        beforeUpdate: assignment => {
          assignment.LastModifiedAt = new Date();
        },
        afterCreate: async (assignment, options) => {
          // Get course ID from lesson
          const lesson = await sequelize.models.Lesson.findByPk(assignment.LessonID);
          if (lesson) {
            // Get all enrolled students
            const enrollments = await sequelize.models.Enrollment.findAll({
              where: {
                CourseID: lesson.CourseID,
                Status: ['active', 'completed'],
              },
            });

            // Create notifications for all enrolled students
            for (const enrollment of enrollments) {
              await sequelize.models.Notification.create(
                {
                  UserID: enrollment.UserID,
                  Title: 'New Assignment',
                  Message: `A new assignment "${assignment.Title}" has been added to your course`,
                  Type: 'assignment',
                  RelatedID: assignment.AssignmentID,
                },
                { ...options },
              );
            }
          }
        },
      },
    },
  );

  return Assignment;
};
