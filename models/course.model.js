const { Model, DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsTo(models.User, {
        foreignKey: 'InstructorID',
        as: 'instructor',
      });

      Course.belongsTo(models.Category, {
        foreignKey: 'CategoryID',
        as: 'category',
      });

      Course.hasMany(models.Lesson, {
        foreignKey: 'CourseID',
        as: 'lessons',
      });

      Course.hasMany(models.Enrollment, {
        foreignKey: 'CourseID',
        as: 'enrollments',
      });

      Course.hasMany(models.Rating, {
        foreignKey: 'CourseID',
        as: 'ratings',
      });
    }
  }

  Course.init(
    {
      CourseID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'CategoryID',
        },
      },
      Slug: {
        type: DataTypes.STRING(200),
        unique: true,
      },
      InstructorID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      ThumbnailURL: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: {
          isIn: [['draft', 'published', 'archived']],
        },
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      LastModifiedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'Courses',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Courses_InstructorID',
          fields: ['InstructorID'],
        },
        {
          name: 'IX_Courses_Status',
          fields: ['Status'],
        },
      ],
      hooks: {
        beforeUpdate: course => {
          course.LastModifiedAt = new Date();
        },
      },
    },
  );
  return Course;
};
