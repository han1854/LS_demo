module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define("Rating", {
    RatingID: { 
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
    Score: { 
      type: DataTypes.INTEGER,  // 1-5 stars
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    Comment: { 
      type: DataTypes.TEXT 
    },
    CreatedAt: { 
      type: DataTypes.DATE, 
      defaultValue: sequelize.fn('GETDATE') 
    }
  }, {
    tableName: "Ratings",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['CourseID', 'UserID']  // Mỗi user chỉ đánh giá 1 lần/khóa học
      }
    ]
  });

  return Rating;
};