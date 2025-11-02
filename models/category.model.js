const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Course, {
        foreignKey: 'CategoryID',
        as: 'courses',
      });

      Category.belongsTo(Category, {
        foreignKey: 'ParentID',
        as: 'parent',
      });

      Category.hasMany(Category, {
        foreignKey: 'ParentID',
        as: 'children',
      });
    }
  }

  Category.init(
    {
      CategoryID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Tên danh mục không được để trống',
          },
        },
      },
      Slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Slug không được để trống',
          },
        },
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ParentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'CategoryID',
        },
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'inactive']],
            msg: 'Trạng thái không hợp lệ',
          },
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
      modelName: 'Category',
      tableName: 'Categories',
      timestamps: false,
      hooks: {
        beforeCreate: category => {
          if (!category.Slug) {
            category.Slug = category.Name.toLowerCase()
              .replace(/đ/g, 'd')
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
          if (!category.LastModifiedAt) {
            category.LastModifiedAt = new Date();
          }
        },
        beforeUpdate: category => {
          if (category.changed('Name') && !category.changed('Slug')) {
            category.Slug = category.Name.toLowerCase()
              .replace(/đ/g, 'd')
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
          category.LastModifiedAt = new Date();
        },
      },
      indexes: [
        { name: 'IX_Categories_Slug', fields: ['Slug'] },
        { name: 'IX_Categories_ParentID', fields: ['ParentID'] },
        { name: 'IX_Categories_Status', fields: ['Status'] },
      ],
    },
  );

  return Category;
};
