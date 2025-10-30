module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define("Quiz", {
    QuizID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    LessonID: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'LessonID'
      }
    },
    Title: { 
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200]
      }
    },
    Description: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 2000]
      }
    },
    Duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 1,
        max: 180
      },
      comment: 'Duration in minutes'
    },
    PassingScore: {
      type: DataTypes.FLOAT,
      defaultValue: 70,
      validate: {
        min: 0,
        max: 100,
        isFloat: true
      },
      comment: 'Minimum score required to pass the quiz (percentage)'
    },
    AttemptsAllowed: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0,  // 0 = unlimited
        max: 10
      },
      comment: 'Number of attempts allowed (0 = unlimited)'
    },
    ShuffleQuestions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether to randomize question order for each attempt'
    },
    ShowAnswers: {
      type: DataTypes.STRING(20),
      defaultValue: 'after_submit',
      validate: {
        isIn: [['never', 'after_submit', 'after_deadline', 'after_all_attempts']]
      },
      comment: 'When to show correct answers to students'
    },
    IsPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the quiz is available to students'
    },
    AvailableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      },
      comment: 'Start date when quiz becomes available'
    },
    AvailableUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isAfterAvailableFrom(value) {
          if (this.AvailableFrom && value && value <= this.AvailableFrom) {
            throw new Error('Available Until must be after Available From');
          }
        }
      },
      comment: 'End date when quiz becomes unavailable'
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'published', 'archived', 'deleted']]
      }
    },
    TotalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total possible points for all questions'
    },
    TimeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 180
      },
      comment: 'Time limit in minutes (null = no limit)'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    LastModifiedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    LastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    }
  }, {
    tableName: "Quizzes",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Quizzes_LessonID',
        fields: ['LessonID'] 
      },
      {
        name: 'IX_Quizzes_Status',
        fields: ['Status']
      },
      {
        name: 'IX_Quizzes_IsPublished',
        fields: ['IsPublished']
      },
      {
        name: 'IX_Quizzes_AvailableDates',
        fields: ['AvailableFrom', 'AvailableUntil']
      }
    ],
    hooks: {
      beforeValidate: async (quiz) => {
        if (quiz.changed('IsPublished') && quiz.IsPublished) {
          // Check requirements before publishing
          const questionCount = await sequelize.models.Question.count({
            where: { 
              QuizID: quiz.QuizID,
              Status: 'active'
            }
          });

          if (questionCount === 0) {
            throw new Error('Cannot publish quiz without any active questions');
          }
        }
      },
      beforeUpdate: (quiz) => {
        quiz.LastModifiedAt = new Date();
      },
      beforeSave: async (quiz) => {
        // Calculate total points
        if (!quiz.isNewRecord) {
          const total = await sequelize.models.Question.sum('Points', {
            where: { 
              QuizID: quiz.QuizID,
              Status: 'active'
            }
          });
          quiz.TotalPoints = total || 0;
        }
      }
    }
  });

  // Instance methods
  Quiz.prototype.isAvailable = function() {
    if (!this.IsPublished || this.Status !== 'published') {
      return false;
    }

    const now = new Date();
    if (this.AvailableFrom && now < this.AvailableFrom) {
      return false;
    }
    if (this.AvailableUntil && now > this.AvailableUntil) {
      return false;
    }

    return true;
  };

  Quiz.prototype.canTakeQuiz = async function(userId) {
    // Check if quiz is available
    if (!this.isAvailable()) {
      return false;
    }

    // Check attempts limit
    if (this.AttemptsAllowed !== 0) {
      const attemptCount = await sequelize.models.Result.count({
        where: { 
          QuizID: this.QuizID,
          UserID: userId
        }
      });

      if (attemptCount >= this.AttemptsAllowed) {
        return false;
      }
    }

    return true;
  };

  Quiz.prototype.shuffleQuestionsForUser = async function(userId) {
    if (!this.ShuffleQuestions) {
      return await sequelize.models.Question.findAll({
        where: { 
          QuizID: this.QuizID,
          Status: 'active'
        },
        order: [['OrderIndex', 'ASC']]
      });
    }

    const questions = await sequelize.models.Question.findAll({
      where: { 
        QuizID: this.QuizID,
        Status: 'active'
      }
    });

    // Use user ID and quiz ID to generate consistent but unique shuffle
    const seed = parseInt(userId.toString() + this.QuizID.toString());
    return questions.sort(() => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    });
  };

  return Quiz;
};
