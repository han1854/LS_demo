module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define("Quiz", {
    QuizID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    LessonID: { type: DataTypes.INTEGER, allowNull: false },
    Title: { type: DataTypes.STRING(200) }
  }, {
    tableName: "Quizzes",
    timestamps: false
  });
  return Quiz;
};
