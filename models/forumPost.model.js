module.exports = (sequelize, DataTypes) => {
  const ForumPost = sequelize.define("ForumPost", {
    PostID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    CourseID: { type: DataTypes.INTEGER, allowNull: false },
    UserID: { type: DataTypes.INTEGER, allowNull: false },
    Content: { type: DataTypes.TEXT, allowNull: false },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "ForumPosts",
    timestamps: false
  });
  return ForumPost;
};
