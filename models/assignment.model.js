module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define("Assignment", {
    AssignmentID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    LessonID: { type: DataTypes.INTEGER, allowNull: false },
    Title: { type: DataTypes.STRING(200), allowNull: false },
    Description: { type: DataTypes.TEXT },
    MaxScore: { type: DataTypes.DECIMAL(5,2), defaultValue: 10 }
  }, {
    tableName: "Assignments",
    timestamps: false
  });
  return Assignment;
};
