const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'User',
      });

      Rating.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'Course',
      });
    }

    static async updateCourseRating(courseId) {
      const avgRating = await this.findOne({
        where: { CourseID: courseId, Status: 'approved' },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('Rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('RatingID')), 'totalRatings'],
        ],
        raw: true,
      });

      if (avgRating) {
        await sequelize.models.Course.update(
          {
            Rating: avgRating.averageRating,
            EnrollmentCount: avgRating.totalRatings,
          },
          {
            where: { CourseID: courseId },
          },
        );
      }
    }
  }

  Rating.init(
    {
      RatingID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'CourseID',
        },
      },
      Rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      Review: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'approved', 'rejected']],
        },
      },
    },
    {
      sequelize,
      modelName: 'Rating',
      tableName: 'Ratings',
      timestamps: false,
      indexes: [
        {
          name: 'UQ_UserCourseRating',
          unique: true,
          fields: ['CourseID', 'UserID'],
        },
        {
          name: 'IX_Ratings_CourseID',
          fields: ['CourseID'],
        },
        {
          name: 'IX_Ratings_Rating',
          fields: ['Rating'],
        },
        {
          name: 'IX_Ratings_Status',
          fields: ['Status'],
        },
      ],
      hooks: {
        beforeUpdate: rating => {
          rating.UpdatedAt = new Date();
        },
        afterCreate: async (rating, options) => {
          await Rating.updateCourseRating(rating.CourseID);
        },
      },
    },
  );

  return Rating;
};
