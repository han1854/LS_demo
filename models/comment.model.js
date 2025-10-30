module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    CommentID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    UserID: { type: DataTypes.INTEGER, allowNull: false },
    CourseID: { type: DataTypes.INTEGER },
    LessonID: { type: DataTypes.INTEGER },
    Content: { type: DataTypes.TEXT, allowNull: false },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "Comments",
    timestamps: false
  });
  return Comment;
};
