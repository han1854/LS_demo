module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define("Progress", {
    ProgressID: { 
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
    CourseID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'CourseID'
      }
    },
    LessonID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'LessonID'
      }
    },
    Status: { 
      type: DataTypes.STRING(20),  // not-started, in-progress, completed
      defaultValue: 'not-started' 
    },
    CompletionDate: { 
      type: DataTypes.DATE 
    },
    TimeSpent: { 
      type: DataTypes.INTEGER  // minutes spent on lesson
    },
    LastAccessDate: { 
      type: DataTypes.DATE 
    },
    Score: { 
      type: DataTypes.INTEGER  // If lesson has quiz/assignment
    }
  }, {
    tableName: "Progress",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['UserID', 'CourseID', 'LessonID']
      }
    ]
  });

  return Progress;
};