const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    static associate(models) {
      Certificate.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'user',
      });
      Certificate.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'course',
      });
    }
  }

  Certificate.init(
    {
      CertificateID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'CourseID',
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      IssueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('GETDATE'),
      },
      CertificateNumber: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      CompletionDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active', // active, revoked
      },
    },
    {
      sequelize,
      modelName: 'Certificate',
      tableName: 'Certificates',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Certificates_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_Certificates_CourseID',
          fields: ['CourseID'],
        },
        {
          name: 'IX_Certificates_Status',
          fields: ['Status'],
        },
        {
          name: 'UQ_Certificates_CourseUser',
          unique: true,
          fields: ['CourseID', 'UserID'],
        },
      ],
    },
  );

  return Certificate;
};
