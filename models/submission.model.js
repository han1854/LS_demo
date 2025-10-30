module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define("Submission", {
    SubmissionID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true,
      primaryKey: true 
    },
    AssignmentID: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    UserID: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    FileURL: { 
      type: DataTypes.STRING(255),
      allowNull: true
    },
    FileName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    FileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
    },
    FileType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Score: { 
      type: DataTypes.DECIMAL(5,2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    Feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'submitted', 'graded']]
      }
    },
    IsLate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    SubmittedAt: { 
      type: DataTypes.DATE,
      allowNull: true
    },
    GradedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    GradedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    LastModifiedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    }
  }, {
    tableName: "Submissions",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Submissions_AssignmentID',
        fields: ['AssignmentID']
      },
      {
        name: 'IX_Submissions_UserID',
        fields: ['UserID']
      },
      {
        name: 'IX_Submissions_Status',
        fields: ['Status']
      }
    ],
    hooks: {
      beforeUpdate: (submission) => {
        submission.LastModifiedAt = new Date();
      },
      beforeCreate: async (submission, options) => {
        // Check if submission is late
        const assignment = await sequelize.models.Assignment.findByPk(submission.AssignmentID);
        if (assignment && assignment.DueDate) {
          submission.IsLate = new Date() > assignment.DueDate;
        }
      },
      afterUpdate: async (submission, options) => {
        // If submission was graded, create notification
        if (submission.changed('Status') && submission.Status === 'graded') {
          await sequelize.models.Notification.create({
            UserID: submission.StudentID,
            Title: 'Assignment Graded',
            Message: `Your submission has been graded. Score: ${submission.Score}`,
            Type: 'submission_graded',
            RelatedID: submission.SubmissionID
          }, { ...options });

          // Update progress
          const assignment = await sequelize.models.Assignment.findByPk(submission.AssignmentID, {
            include: ['lesson']
          });
          
          if (assignment && assignment.lesson) {
            await sequelize.models.Progress.update(
              {
                Score: submission.Score,
                Status: 'completed',
                CompletionDate: new Date()
              },
              {
                where: {
                  UserID: submission.UserID,
                  LessonID: assignment.lesson.LessonID
                },
                ...options
              }
            );
          }
        }
      }
    }
  });

  return Submission;
};
