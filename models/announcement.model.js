module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define("Announcement", {
    AnnouncementID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    CourseID: { type: DataTypes.INTEGER },
    Title: { type: DataTypes.STRING(200), allowNull: false },
    Content: { type: DataTypes.TEXT },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "Announcements",
    timestamps: false
  });
  return Announcement;
};
