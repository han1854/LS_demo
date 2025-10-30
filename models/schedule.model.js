module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define("Schedule", {
    ScheduleID: { 
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
    Title: { 
      type: DataTypes.STRING(200),
      allowNull: false 
    },
    Description: { 
      type: DataTypes.TEXT 
    },
    StartTime: { 
      type: DataTypes.DATE,
      allowNull: false 
    },
    EndTime: { 
      type: DataTypes.DATE,
      allowNull: false 
    },
    Type: { 
      type: DataTypes.STRING(50),  // lesson, assignment, quiz, live-session
      allowNull: false 
    },
    Status: { 
      type: DataTypes.STRING(20),  // scheduled, ongoing, completed, cancelled
      defaultValue: 'scheduled' 
    },
    MeetingLink: { 
      type: DataTypes.STRING(500)  // For online sessions
    },
    Reminder: { 
      type: DataTypes.INTEGER  // minutes before start to send reminder
    },
    CreatedAt: { 
      type: DataTypes.DATE, 
      defaultValue: sequelize.fn('GETDATE') 
    }
  }, {
    tableName: "Schedules",
    timestamps: false
  });

  return Schedule;
};