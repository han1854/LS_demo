module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    'Question',
    {
      QuestionID: {
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
      QuestionType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'single',
        validate: {
          isIn: [['single', 'multiple', 'points', 'text', 'matching']],
        },
        comment:
          'single=single choice, multiple=multiple choice, points=points per option, text=free text, matching=match pairs',
      },
      QuestionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 4000],
        },
      },
      ExplanationText: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000],
        },
        comment: 'Explanation shown after answering',
      },
      Points: {
        type: DataTypes.FLOAT,
        defaultValue: 1,
        validate: {
          min: 0,
          max: 100,
          isFloat: true,
        },
        comment: 'Maximum points possible for this question',
      },
      PartialCredit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether partial credit is allowed for partially correct answers',
      },
      OrderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order in which questions are displayed',
      },
      IsRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether the question must be answered',
      },
      TimeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 5,
          max: 3600,
        },
        comment: 'Time limit in seconds for this specific question (null = no limit)',
      },
      ImageURL: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      VideoURL: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      AudioURL: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      Difficulty: {
        type: DataTypes.STRING(20),
        defaultValue: 'medium',
        validate: {
          isIn: [['easy', 'medium', 'hard']],
        },
      },
      Tags: {
        type: DataTypes.STRING(500),
        allowNull: true,
        get() {
          const tags = this.getDataValue('Tags');
          return tags ? tags.split(',') : [];
        },
        set(val) {
          if (Array.isArray(val)) {
            this.setDataValue('Tags', val.join(','));
          }
        },
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'inactive', 'deleted']],
        },
      },
      Metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          'Additional metadata specific to question type (e.g., matching pairs, text validation)',
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      CreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      LastModifiedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      LastModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
    },
    {
      tableName: 'Questions',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Questions_QuizID',
          fields: ['QuizID'],
        },
        {
          name: 'IX_Questions_OrderIndex',
          fields: ['OrderIndex'],
        },
        {
          name: 'IX_Questions_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Questions_Difficulty',
          fields: ['Difficulty'],
        },
        {
          name: 'IX_Questions_Type',
          fields: ['QuestionType'],
        },
      ],
      hooks: {
        beforeValidate: async question => {
          // Validate question based on type
          switch (question.QuestionType) {
            case 'single':
            case 'multiple':
              // Check options exist
              const optionCount = await sequelize.models.Option.count({
                where: {
                  QuestionID: question.QuestionID,
                  Status: 'active',
                },
              });
              if (optionCount < 2) {
                throw new Error(
                  `${question.QuestionType} choice questions must have at least 2 options`,
                );
              }

              // For single choice, ensure exactly one correct option
              if (question.QuestionType === 'single') {
                const correctCount = await sequelize.models.Option.count({
                  where: {
                    QuestionID: question.QuestionID,
                    Status: 'active',
                    IsCorrect: true,
                  },
                });
                if (correctCount !== 1) {
                  throw new Error('Single choice questions must have exactly one correct option');
                }
              }
              break;

            case 'matching':
              // Validate matching pairs in metadata
              if (
                !question.Metadata ||
                !Array.isArray(question.Metadata.pairs) ||
                question.Metadata.pairs.length < 2
              ) {
                throw new Error('Matching questions must define at least 2 pairs');
              }
              break;

            case 'text':
              // Validate text answer criteria
              if (!question.Metadata || !question.Metadata.validation) {
                throw new Error('Text questions must define validation criteria');
              }
              break;
          }
        },
        beforeUpdate: question => {
          question.LastModifiedAt = new Date();
        },
        afterCreate: async question => {
          // Update quiz total points
          await updateQuizPoints(question.QuizID);
        },
        afterUpdate: async question => {
          if (question.changed('Points') || question.changed('Status')) {
            await updateQuizPoints(question.QuizID);
          }
        },
        afterDestroy: async question => {
          await updateQuizPoints(question.QuizID);
        },
      },
    },
  );

  const updateQuizPoints = async quizId => {
    const total = await Question.sum('Points', {
      where: {
        QuizID: quizId,
        Status: 'active',
      },
    });

    await sequelize.models.Quiz.update({ TotalPoints: total || 0 }, { where: { QuizID: quizId } });
  };

  Question.prototype.validateAnswer = async function (answer) {
    switch (this.QuestionType) {
      case 'single':
        return this.validateSingleChoice(answer);

      case 'multiple':
        return this.validateMultipleChoice(answer);

      case 'points':
        return this.validatePointsQuestion(answer);

      case 'text':
        return this.validateTextAnswer(answer);

      case 'matching':
        return this.validateMatchingAnswer(answer);

      default:
        throw new Error(`Unsupported question type: ${this.QuestionType}`);
    }
  };

  Question.prototype.validateSingleChoice = async function (selectedOption) {
    const option = await sequelize.models.Option.findOne({
      where: {
        OptionID: selectedOption,
        QuestionID: this.QuestionID,
        Status: 'active',
      },
    });

    return option && option.IsCorrect ? this.Points : 0;
  };

  Question.prototype.validateMultipleChoice = async function (selectedOptions) {
    const options = await sequelize.models.Option.findAll({
      where: {
        QuestionID: this.QuestionID,
        Status: 'active',
      },
    });

    const correctOptions = options.filter(o => o.IsCorrect);
    const selectedCorrect = selectedOptions.every(id =>
      correctOptions.some(o => o.OptionID === id),
    );
    const allCorrectSelected = correctOptions.every(o => selectedOptions.includes(o.OptionID));

    if (selectedCorrect && allCorrectSelected) {
      return this.Points;
    }

    if (this.PartialCredit) {
      const correctSelections = selectedOptions.filter(id =>
        correctOptions.some(o => o.OptionID === id),
      ).length;
      return (correctSelections / correctOptions.length) * this.Points;
    }

    return 0;
  };

  Question.prototype.validatePointsQuestion = async function (selectedOptions) {
    const options = await sequelize.models.Option.findAll({
      where: {
        OptionID: selectedOptions,
        QuestionID: this.QuestionID,
        Status: 'active',
      },
    });

    return options.reduce((total, option) => total + option.Score, 0);
  };

  Question.prototype.validateTextAnswer = async function (answer) {
    const validation = this.Metadata.validation;

    // Case insensitive comparison if specified
    const userAnswer = validation.caseInsensitive ? answer.toLowerCase() : answer;
    const correctAnswer = validation.caseInsensitive
      ? validation.answer.toLowerCase()
      : validation.answer;

    // Exact match
    if (validation.type === 'exact') {
      return userAnswer === correctAnswer ? this.Points : 0;
    }

    // Contains specific words/phrases
    if (validation.type === 'contains') {
      const required = Array.isArray(validation.required)
        ? validation.required
        : [validation.required];

      const matches = required.filter(word =>
        validation.caseInsensitive
          ? userAnswer.includes(word.toLowerCase())
          : userAnswer.includes(word),
      );

      if (this.PartialCredit) {
        return (matches.length / required.length) * this.Points;
      }

      return matches.length === required.length ? this.Points : 0;
    }

    // Regex match
    if (validation.type === 'regex') {
      const regex = new RegExp(validation.pattern, validation.caseInsensitive ? 'i' : '');
      return regex.test(userAnswer) ? this.Points : 0;
    }

    return 0;
  };

  Question.prototype.validateMatchingAnswer = async function (pairs) {
    const correctPairs = this.Metadata.pairs;
    const correctMatches = pairs.filter(pair =>
      correctPairs.some(correct => correct.left === pair.left && correct.right === pair.right),
    ).length;

    if (this.PartialCredit) {
      return (correctMatches / correctPairs.length) * this.Points;
    }

    return correctMatches === correctPairs.length ? this.Points : 0;
  };

  return Question;
};
