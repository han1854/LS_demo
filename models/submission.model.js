const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    static associate(models) {
      Submission.belongsTo(models.Assignment, {
        foreignKey: 'AssignmentID',
        as: 'Assignment',
      });

      Submission.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'Student',
      });

      Submission.belongsTo(models.User, {
        foreignKey: 'GradedBy',
        as: 'Grader',
      });
    }

    async grade(score, feedback, graderId, transaction) {
      this.Score = score;
      this.Feedback = feedback;
      this.Status = 'graded';
      this.GradedAt = new Date();
      this.GradedBy = graderId;
      await this.save({ transaction });

      // Create notification
      await sequelize.models.Notification.create(
        {
          UserID: this.UserID,
          Title: 'Assignment Graded',
          Message: `Your submission has been graded. Score: ${score}`,
          Type: 'submission_graded',
          RelatedID: this.SubmissionID,
        },
        { transaction },
      );

      // Update progress
      const assignment = await this.getAssignment({
        include: ['lesson'],
      });

      if (assignment?.lesson) {
        await sequelize.models.Progress.update(
          {
            Score: score,
            Status: 'completed',
            CompletionDate: new Date(),
          },
          {
            where: {
              UserID: this.UserID,
              LessonID: assignment.lesson.LessonID,
            },
            transaction,
          },
        );
      }
    }

    async submit() {
      if (this.Status === 'submitted') {
        throw new Error('Submission already submitted');
      }

      const assignment = await this.getAssignment();
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      this.Status = 'submitted';
      this.SubmittedAt = new Date();
      this.IsLate = assignment.DueDate ? this.SubmittedAt > assignment.DueDate : false;

      await this.save();

      return {
        isLate: this.IsLate,
        submittedAt: this.SubmittedAt,
      };
    }
  }

  Submission.init(
    {
      SubmissionID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      AssignmentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      FileURL: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      FileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      FileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'File size in bytes',
      },
      FileType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      Feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: {
          isIn: [['draft', 'submitted', 'graded']],
        },
      },
      IsLate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      SubmittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      GradedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      GradedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'UserID',
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
      modelName: 'Submission',
      tableName: 'Submissions',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Submissions_AssignmentID',
          fields: ['AssignmentID'],
        },
        {
          name: 'IX_Submissions_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_Submissions_Status',
          fields: ['Status'],
        },
      ],
      hooks: {
        beforeUpdate: submission => {
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
            await sequelize.models.Notification.create(
              {
                UserID: submission.StudentID,
                Title: 'Assignment Graded',
                Message: `Your submission has been graded. Score: ${submission.Score}`,
                Type: 'submission_graded',
                RelatedID: submission.SubmissionID,
              },
              { ...options },
            );

            // Update progress
            const assignment = await sequelize.models.Assignment.findByPk(submission.AssignmentID, {
              include: ['lesson'],
            });

            if (assignment && assignment.lesson) {
              await sequelize.models.Progress.update(
                {
                  Score: submission.Score,
                  Status: 'completed',
                  CompletionDate: new Date(),
                },
                {
                  where: {
                    UserID: submission.UserID,
                    LessonID: assignment.lesson.LessonID,
                  },
                  ...options,
                },
              );
            }
          }
        },
      },
    },
  );

  Submission.addHook('beforeUpdate', submission => {
    submission.LastModifiedAt = new Date();
  });

  Submission.addHook('beforeCreate', async (submission, options) => {
    // Check if submission is late
    const assignment = await sequelize.models.Assignment.findByPk(submission.AssignmentID);
    if (assignment && assignment.DueDate) {
      submission.IsLate = new Date() > assignment.DueDate;
    }
  });

  return Submission;
};
