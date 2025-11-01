const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Result extends Model {
    static associate(models) {
      Result.belongsTo(models.Quiz, {
        foreignKey: 'QuizID',
        as: 'Quiz',
      });

      Result.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'User',
      });

      Result.belongsTo(models.User, {
        foreignKey: 'ReviewedBy',
        as: 'Reviewer',
      });
    }

    calculateTimeRemaining() {
      if (!this.ExpiresAt || this.Status !== 'in_progress') {
        return 0;
      }
      const now = new Date();
      const remaining = this.ExpiresAt.getTime() - now.getTime();
      return Math.max(0, Math.floor(remaining / 1000)); // Return seconds remaining
    }

    isExpired() {
      if (this.Status === 'completed' || this.Status === 'cancelled') {
        return false;
      }
      return this.ExpiresAt && new Date() > this.ExpiresAt;
    }

    async addAnswer(questionId, answer, transaction) {
      if (this.Status !== 'in_progress') {
        throw new Error('Cannot add answers to a completed or expired quiz attempt');
      }

      if (this.isExpired()) {
        this.Status = 'expired';
        await this.save({ transaction });
        throw new Error('Quiz attempt has expired');
      }

      // Get question details
      const question = await sequelize.models.Question.findByPk(questionId);
      if (!question || question.QuizID !== this.QuizID) {
        throw new Error('Invalid question for this quiz');
      }

      // Initialize or update answers array
      const answers = this.Answers || [];
      const existingIndex = answers.findIndex(a => a.QuestionID === questionId);
      const answerData = {
        QuestionID: questionId,
        Answer: answer,
        SubmittedAt: new Date(),
      };

      if (existingIndex >= 0) {
        answers[existingIndex] = answerData;
      } else {
        answers.push(answerData);
      }

      // Save answers
      this.Answers = answers;
      await this.save({ transaction });

      return question.validateAnswer(answer);
    }

    async complete(transaction) {
      if (this.Status !== 'in_progress') {
        throw new Error('Cannot complete a quiz that is not in progress');
      }

      if (this.isExpired()) {
        this.Status = 'expired';
        await this.save({ transaction });
        throw new Error('Quiz attempt has expired');
      }

      // Get quiz and question details
      const quiz = await sequelize.models.Quiz.findByPk(this.QuizID, {
        include: [
          {
            model: sequelize.models.Question,
            as: 'questions',
            where: { Status: 'active' },
            required: false,
          },
        ],
      });

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Calculate final score
      let earnedPoints = 0;
      const details = [];
      for (const question of quiz.questions) {
        const answer = this.Answers?.find(a => a.QuestionID === question.QuestionID);

        if (!answer && question.IsRequired) {
          throw new Error(`Required question ${question.QuestionID} not answered`);
        }

        if (answer) {
          const points = await question.validateAnswer(answer.Answer);
          earnedPoints += points;
          details.push({
            QuestionID: question.QuestionID,
            Answer: answer.Answer,
            Points: points,
            MaxPoints: question.Points,
          });
        }
      }

      // Update result
      this.Status = 'completed';
      this.CompletedAt = new Date();
      this.EarnedPoints = earnedPoints;
      this.TotalPoints = quiz.TotalPoints;
      this.Score = quiz.TotalPoints > 0 ? (earnedPoints / quiz.TotalPoints) * 100 : 0;
      this.Details = details;
      this.TimeTaken = Math.floor((this.CompletedAt.getTime() - this.StartedAt.getTime()) / 1000);

      await this.save({ transaction });

      return {
        score: this.Score,
        earnedPoints: this.EarnedPoints,
        totalPoints: this.TotalPoints,
        timeTaken: this.TimeTaken,
        details: this.Details,
      };
    }
  }

  Result.init(
    {
      ResultID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      QuizID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Quizzes',
          key: 'QuizID',
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      AttemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      Score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
          isFloat: true,
        },
        comment: 'Final score as percentage',
      },
      EarnedPoints: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          isFloat: true,
        },
        comment: 'Total points earned',
      },
      TotalPoints: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          isFloat: true,
        },
        comment: 'Maximum possible points',
      },
      TimeTaken: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
        comment: 'Time taken in seconds',
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'in_progress',
        validate: {
          isIn: [['in_progress', 'completed', 'expired', 'cancelled']],
        },
      },
      Details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Detailed results per question including selected options and scores',
      },
      Answers: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'User submitted answers',
      },
      FeedbackNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000],
        },
      },
      ReviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      ReviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      StartedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('GETDATE'),
      },
      CompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isAfterStartedAt(value) {
            if (value && value <= this.StartedAt) {
              throw new Error('Expiry time must be after start time');
            }
          },
        },
      },
      IP: {
        type: DataTypes.STRING(45),
        allowNull: true,
        validate: {
          isIP: true,
        },
      },
      UserAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      Metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional metadata about the attempt (browser info, device, etc)',
      },
    },
    {
      sequelize,
      modelName: 'Result',
      tableName: 'Results',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Results_QuizID_UserID',
          fields: ['QuizID', 'UserID'],
        },
        {
          name: 'IX_Results_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_Results_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Results_CompletedAt',
          fields: ['CompletedAt'],
        },
        {
          name: 'IX_Results_Score',
          fields: ['Score'],
        },
        {
          name: 'IX_Results_ReviewedBy',
          fields: ['ReviewedBy'],
        },
        {
          name: 'IX_Results_ExpiresAt',
          fields: ['ExpiresAt'],
        },
        {
          name: 'IX_Results_QuizID_Status',
          fields: ['QuizID', 'Status'],
        },
      ],
      hooks: {
        beforeValidate: async result => {
          if (!result.AttemptNumber) {
            // Auto-increment attempt number for user
            const lastAttempt = await Result.findOne({
              where: {
                QuizID: result.QuizID,
                UserID: result.UserID,
              },
              order: [['AttemptNumber', 'DESC']],
            });
            result.AttemptNumber = lastAttempt ? lastAttempt.AttemptNumber + 1 : 1;
          }
        },
        beforeCreate: async result => {
          // Set expiry time based on quiz duration
          const quiz = await sequelize.models.Quiz.findByPk(result.QuizID);
          if (quiz && quiz.Duration) {
            result.ExpiresAt = new Date(result.StartedAt.getTime() + quiz.Duration * 60 * 1000);
          }
        },
        afterUpdate: async (result, options) => {
          // Update user progress when quiz is completed
          if (result.changed('Status') && result.Status === 'completed') {
            const quiz = await sequelize.models.Quiz.findByPk(result.QuizID, {
              include: [
                {
                  model: sequelize.models.Lesson,
                  as: 'lesson',
                },
              ],
            });

            if (quiz) {
              // Update lesson progress
              await sequelize.models.Progress.findOrCreate({
                where: {
                  UserID: result.UserID,
                  LessonID: quiz.LessonID,
                },
                defaults: {
                  Status: result.Score >= quiz.PassingScore ? 'completed' : 'in-progress',
                  Score: result.Score,
                  LastAccessDate: new Date(),
                },
                transaction: options.transaction,
              });

              // Check and update course progress
              const courseProgress = await sequelize.models.Progress.count({
                where: {
                  UserID: result.UserID,
                  Status: 'completed',
                  LessonID: {
                    [sequelize.Op.in]: sequelize.literal(
                      `SELECT LessonID FROM Lessons WHERE CourseID = ${quiz.lesson.CourseID}`,
                    ),
                  },
                },
              });

              const totalLessons = await sequelize.models.Lesson.count({
                where: { CourseID: quiz.lesson.CourseID },
              });

              if (courseProgress === totalLessons) {
                // All lessons completed, update enrollment
                await sequelize.models.Enrollment.update(
                  {
                    Status: 'completed',
                    CompletedAt: new Date(),
                  },
                  {
                    where: {
                      UserID: result.UserID,
                      CourseID: quiz.lesson.CourseID,
                    },
                    transaction: options.transaction,
                  },
                );

                // Generate certificate if enabled for course
                const course = await sequelize.models.Course.findByPk(quiz.lesson.CourseID);
                if (course && course.AutoCertificate) {
                  await sequelize.models.Certificate.create(
                    {
                      UserID: result.UserID,
                      CourseID: course.CourseID,
                      IssueDate: new Date(),
                      Status: 'active',
                    },
                    { transaction: options.transaction },
                  );
                }
              }
            }
          }
        },
      },
    },
  );

  // Instance methods

  return Result;
};
