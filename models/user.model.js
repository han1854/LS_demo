const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Course association is defined centrally in models/index.js to avoid duplicate aliases
      User.hasMany(models.Enrollment, {
        foreignKey: 'UserID',
        as: 'enrollments',
      });
      User.hasMany(models.Rating, {
        foreignKey: 'UserID',
        as: 'ratings',
      });
      User.hasMany(models.Comment, {
        foreignKey: 'UserID',
        as: 'comments',
      });
      User.hasMany(models.ForumPost, {
        foreignKey: 'UserID',
        as: 'forumPosts',
      });
      User.hasMany(models.Transaction, {
        foreignKey: 'UserID',
        as: 'transactions',
      });
    }
  }

  User.init(
    {
      UserID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          is: /^[a-zA-Z0-9_]+$/,
        },
      },
      Email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      Password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      FirstName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: [2, 50],
          is: /^[a-zA-ZÀ-ỹ\s]+$/,
        },
      },
      LastName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: [2, 50],
          is: /^[a-zA-ZÀ-ỹ\s]+$/,
        },
      },
      Role: {
        type: DataTypes.STRING(20),
        defaultValue: 'student',
        validate: {
          isIn: [['student', 'instructor', 'admin']],
        },
      },
      PhoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[0-9]{10,11}$/,
        },
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'inactive', 'banned']],
        },
      },
      Avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Users_Status',
          fields: ['Status'],
        },
      ],
    },
  );
  return User;
};
