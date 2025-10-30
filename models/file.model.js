module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {
    FileID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    LessonID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'LessonID'
      }
    },
    FileName: { 
      type: DataTypes.STRING(255), 
      allowNull: false 
    },
    FileType: { 
      type: DataTypes.STRING(50)  // pdf, doc, video, etc.
    },
    FilePath: { 
      type: DataTypes.STRING(500), 
      allowNull: false 
    },
    FileSize: { 
      type: DataTypes.INTEGER  // in bytes
    },
    UploadedBy: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    CreatedAt: { 
      type: DataTypes.DATE, 
      defaultValue: sequelize.fn('GETDATE') 
    }
  }, {
    tableName: "Files",
    timestamps: false
  });

  return File;
};