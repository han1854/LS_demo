module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    NotificationID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    UserID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    Title: { 
      type: DataTypes.STRING(200),
      allowNull: false 
    },
    Message: { 
      type: DataTypes.TEXT,
      allowNull: false 
    },
    Type: { 
      type: DataTypes.STRING(50),  // system, course, assignment, quiz, etc.
      allowNull: false 
    },
    RelatedID: { 
      type: DataTypes.INTEGER  // ID của item liên quan (courseID, assignmentID, etc.)
    },
    IsRead: { 
      type: DataTypes.BOOLEAN,
      defaultValue: false 
    },
    CreatedAt: { 
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE') 
    }
  }, {
    tableName: "Notifications",
    timestamps: false
  });

  return Notification;
};