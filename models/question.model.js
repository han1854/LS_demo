module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    QuestionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    QuizID: { type: DataTypes.INTEGER, allowNull: false },
    QuestionText: { type: DataTypes.TEXT }
  }, {
    tableName: "Questions",
    timestamps: false
  });
  return Question;
};
