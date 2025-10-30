module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    UserID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true
    },
    FullName: { 
      type: DataTypes.STRING(100), 
      allowNull: false
    },
    Email: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      unique: true
    },
    PasswordHash: { 
      type: DataTypes.STRING(255), 
      allowNull: false
    },
    Role: { 
      type: DataTypes.STRING(50), 
      defaultValue: 'student'
    },
    CreatedAt: { 
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    }
  }, {
    tableName: "Users",
    timestamps: false
  });
  return User;
};
