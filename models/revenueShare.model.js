module.exports = (sequelize, DataTypes) => {
  const RevenueShare = sequelize.define("RevenueShare", {
    ShareID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    CourseID: { type: DataTypes.INTEGER, allowNull: false },
    InstructorID: { type: DataTypes.INTEGER, allowNull: false },
    Amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "RevenueShares",
    timestamps: false
  });
  return RevenueShare;
};
