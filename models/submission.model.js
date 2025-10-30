module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define("Submission", {
    SubmissionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    AssignmentID: { type: DataTypes.INTEGER, allowNull: false },
    StudentID: { type: DataTypes.INTEGER, allowNull: false },
    SubmittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    FileURL: { type: DataTypes.STRING(255) },
    Score: { type: DataTypes.DECIMAL(5,2) }
  }, {
    tableName: "Submissions",
    timestamps: false
  });
  return Submission;
};
