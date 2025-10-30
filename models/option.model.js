module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define("Option", {
    OptionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    QuestionID: { type: DataTypes.INTEGER, allowNull: false },
    OptionText: { type: DataTypes.STRING(255) },
    IsCorrect: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: "Options",
    timestamps: false
  });
  return Option;
};
