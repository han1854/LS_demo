module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define("Lesson", {
    LessonID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    CourseID: { type: DataTypes.INTEGER, allowNull: false },
    Title: { type: DataTypes.STRING(200), allowNull: false },
    VideoURL: { type: DataTypes.STRING(255) },
    Content: { type: DataTypes.TEXT }
  }, {
    tableName: "Lessons",
    timestamps: false
  });
  return Lesson;
};
