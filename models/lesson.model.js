module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define("Lesson", {
    LessonID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    CourseID: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    Title: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VideoURL: { 
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Content: { 
      type: DataTypes.TEXT,
      allowNull: true
    },
    Duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    OrderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    Status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'published', 'archived']]
      }
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    LastModifiedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    }
  }, {
    tableName: "Lessons",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Lessons_CourseID',
        fields: ['CourseID']
      },
      {
        name: 'IX_Lessons_Status',
        fields: ['Status']
      }
    ],
    hooks: {
      beforeUpdate: (lesson) => {
        lesson.LastModifiedAt = new Date();
      }
    }
  });
  return Lesson;
};
