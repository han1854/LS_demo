module.exports = (sequelize, DataTypes) => {
  const Result = sequelize.define("Result", {
    ResultID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    QuizID: { type: DataTypes.INTEGER, allowNull: false },
    StudentID: { type: DataTypes.INTEGER, allowNull: false },
    Score: { type: DataTypes.DECIMAL(5,2) },
    TakenAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "Results",
    timestamps: false
  });
  return Result;
};
