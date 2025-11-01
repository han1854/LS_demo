module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define(
    'Option',
    {
      OptionID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      QuestionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Questions',
          key: 'QuestionID',
        },
      },
      Text: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000],
        },
      },
      IsCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ExplanationText: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000],
        },
      },
      OrderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      Points: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          isFloat: true,
          min: -100,
          max: 100,
        },
        comment: 'Points awarded when selected (can be negative for penalties)',
      },
      FeedbackText: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000],
        },
        comment: 'Feedback shown when this option is selected',
      },
      IsImage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether the Text field contains an image URL',
      },
      ImageURL: {
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
        comment: 'Additional metadata specific to option type',
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
      tableName: 'Options',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Options_QuestionID',
          fields: ['QuestionID'],
        },
        {
          name: 'IX_Options_OrderIndex',
          fields: ['OrderIndex'],
        },
        {
          name: 'IX_Options_Status',
          fields: ['Status'],
        },
        {
          name: 'IX_Options_IsCorrect',
          fields: ['IsCorrect'],
        },
      ],
      hooks: {
        beforeValidate: async option => {
          // Validate based on question type
          const question = await sequelize.models.Question.findByPk(option.QuestionID);
          if (question) {
            switch (question.QuestionType) {
              case 'single':
                // For single choice, if this option is marked correct,
                // ensure no other options are marked correct
                if (option.IsCorrect) {
                  const otherCorrect = await Option.findOne({
                    where: {
                      QuestionID: option.QuestionID,
                      OptionID: { [sequelize.Op.ne]: option.OptionID || 0 },
                      IsCorrect: true,
                      Status: 'active',
                    },
                  });
                  if (otherCorrect) {
                    throw new Error('Single choice questions can only have one correct answer');
                  }
                }
                break;

              case 'points':
                // For points-based questions, ensure points are provided
                if (option.Points === undefined || option.Points === null) {
                  throw new Error('Points-based options must have points value');
                }
                break;

              case 'matching':
                // For matching questions, ensure matching pair is provided
                if (!option.Metadata || !option.Metadata.matchingPair) {
                  throw new Error('Matching options must have a matching pair defined');
                }
                break;
            }
          }
        },
        beforeUpdate: option => {
          option.LastModifiedAt = new Date();
        },
        afterCreate: async option => {
          // Update question validation metadata
          const question = await sequelize.models.Question.findByPk(option.QuestionID);
          if (question) {
            const metadata = question.Metadata || {};

            switch (question.QuestionType) {
              case 'matching':
                // Update matching pairs
                metadata.pairs = metadata.pairs || [];
                metadata.pairs.push({
                  optionId: option.OptionID,
                  text: option.Text,
                  matchingPair: option.Metadata.matchingPair,
                });
                break;

              case 'points':
                // Update total possible points
                metadata.maxPoints = (metadata.maxPoints || 0) + Math.max(0, option.Points);
                metadata.minPoints = Math.min(metadata.minPoints || 0, Math.min(0, option.Points));
                break;
            }

            await question.update({ Metadata: metadata });
          }
        },
        afterUpdate: async option => {
          if (
            option.changed('Points') ||
            option.changed('IsCorrect') ||
            option.changed('Status') ||
            option.changed('Metadata')
          ) {
            // Update question validation metadata
            const question = await sequelize.models.Question.findByPk(option.QuestionID);
            if (question) {
              const metadata = question.Metadata || {};

              switch (question.QuestionType) {
                case 'matching':
                  if (option.changed('Metadata')) {
                    // Update matching pairs
                    metadata.pairs = metadata.pairs.filter(p => p.optionId !== option.OptionID);
                    if (option.Status === 'active') {
                      metadata.pairs.push({
                        optionId: option.OptionID,
                        text: option.Text,
                        matchingPair: option.Metadata.matchingPair,
                      });
                    }
                  }
                  break;

                case 'points':
                  if (option.changed('Points') || option.changed('Status')) {
                    // Recalculate total possible points
                    const activeOptions = await Option.findAll({
                      where: {
                        QuestionID: option.QuestionID,
                        Status: 'active',
                      },
                    });
                    metadata.maxPoints = activeOptions.reduce(
                      (max, opt) => max + Math.max(0, opt.Points),
                      0,
                    );
                    metadata.minPoints = activeOptions.reduce(
                      (min, opt) => Math.min(min, opt.Points),
                      0,
                    );
                  }
                  break;
              }

              await question.update({ Metadata: metadata });
            }
          }
        },
      },
    },
  );

  Option.prototype.isValidMatch = function (matchingOptionId) {
    if (!this.Metadata || !this.Metadata.matchingPair) {
      return false;
    }
    return this.Metadata.matchingPair.optionId === matchingOptionId;
  };

  return Option;
};
