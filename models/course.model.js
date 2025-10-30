module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    CourseID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    InstructorID: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    Title: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },
    Description: { 
      type: DataTypes.TEXT 
    },
    Category: { 
      type: DataTypes.STRING(100) 
    },
    Price: { 
      type: DataTypes.DECIMAL(10,2), 
      defaultValue: 0 
    }
  }, {
    tableName: "Courses",
    // Không để Sequelize tự động gửi createdAt; dùng mặc định DB (GETDATE())
    timestamps: false
  });
  return Course;
};
