module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define("Certificate", {
    CertificateID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    CourseID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'CourseID'
      }
    },
    UserID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    IssueDate: { 
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('GETDATE')
    },
    CertificateNumber: { 
      type: DataTypes.STRING(50),
      unique: true 
    },
    CompletionDate: { 
      type: DataTypes.DATE,
      allowNull: false 
    },
    Status: { 
      type: DataTypes.STRING(20),
      defaultValue: 'active'  // active, revoked
    }
  }, {
    tableName: "Certificates",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['CourseID', 'UserID']  // Một user chỉ nhận một chứng chỉ cho mỗi khóa học
      }
    ]
  });

  return Certificate;
};