module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    UserID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true
    },
    Email: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    PasswordHash: { 
      type: DataTypes.STRING(255), 
      allowNull: false
    },
    FullName: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      validate: {
        len: [2, 100],
        is: /^[a-zA-ZÀ-ỹ\s]+$/
      }
    },
    Role: { 
      type: DataTypes.STRING(50), 
      defaultValue: 'student',
      validate: {
        isIn: [['student', 'teacher', 'admin']]
      }
    },
    PhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9]{10,11}$/
      }
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'banned']]
      }
    },
    Avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    CreatedAt: { 
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    }
  }, {
    tableName: "Users",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Users_Status',
        fields: ['Status']
      }
    ]
  });
  return User;
};
