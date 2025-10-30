module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {
    EnrollmentID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    UserID: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    CourseID: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    EnrolledAt: { 
      type: DataTypes.DATE, 
      defaultValue: sequelize.fn('GETDATE') 
    },
    Progress: { 
      type: DataTypes.DECIMAL(5,2), 
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    LastAccessDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'completed', 'dropped']]
      }
    }
  }, {
    tableName: "Enrollments",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Enrollments_UserID',
        fields: ['UserID']
      },
      {
        name: 'IX_Enrollments_CourseID',
        fields: ['CourseID']
      },
      {
        name: 'IX_Enrollments_Status',
        fields: ['Status']
      }
    ]
  });
  return Enrollment;
};
