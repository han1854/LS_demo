module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {
    EnrollmentID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    UserID: { type: DataTypes.INTEGER, allowNull: false },
    CourseID: { type: DataTypes.INTEGER, allowNull: false },
    EnrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    Progress: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 }
  }, {
    tableName: "Enrollments",
    timestamps: false
  });
  return Enrollment;
};
