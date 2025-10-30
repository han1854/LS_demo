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
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    Comment: { 
      type: DataTypes.TEXT,
      allowNull: true
    },
    CreatedAt: { 
      type: DataTypes.DATE, 
      defaultValue: sequelize.fn('GETDATE') 
    },
    LastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Helpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of users who found this review helpful'
    },
    ReportCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times this review was reported'
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'hidden', 'deleted']]
      }
    }
  }, {
    tableName: "Ratings",
    timestamps: false,
    indexes: [
      {
        name: 'UQ_UserCourseRating',
        unique: true,
        fields: ['CourseID', 'UserID']
      },
      {
        name: 'IX_Ratings_CourseID',
        fields: ['CourseID']
      },
      {
        name: 'IX_Ratings_Score',
        fields: ['Score']
      },
      {
        name: 'IX_Ratings_Status',
        fields: ['Status']
      }
    ],
    hooks: {
      beforeUpdate: (rating) => {
        rating.LastModifiedAt = new Date();
      },
      afterCreate: async (rating, options) => {
        // Update course average rating
        const avgRating = await Rating.findOne({
          where: { CourseID: rating.CourseID, Status: 'active' },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('Score')), 'averageScore'],
            [sequelize.fn('COUNT', sequelize.col('RatingID')), 'totalRatings']
          ],
          raw: true
        });

        if (avgRating) {
          await sequelize.models.Course.update({
            AverageRating: avgRating.averageScore,
            TotalRatings: avgRating.totalRatings
          }, {
            where: { CourseID: rating.CourseID }
          });
        }
      }
    }
  });

  return Rating;
};