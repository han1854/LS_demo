module.exports = (sequelize, DataTypes) => {
  const RevenueShare = sequelize.define("RevenueShare", {
    ShareID: { 
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
    InstructorID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    TransactionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Transactions',
        key: 'TransactionID'
      }
    },
    Amount: { 
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    SharePercentage: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 70.00, // 70%
      validate: {
        min: 0,
        max: 100
      }
    },
    Currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    PaymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PaymentDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'processing', 'paid', 'failed']]
      }
    },
    PaymentReference: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CreatedAt: { 
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    ProcessedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PaidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "RevenueShares",
    timestamps: false,
    indexes: [
      {
        name: 'IX_RevenueShares_CourseID',
        fields: ['CourseID']
      },
      {
        name: 'IX_RevenueShares_InstructorID',
        fields: ['InstructorID']
      },
      {
        name: 'IX_RevenueShares_TransactionID',
        fields: ['TransactionID']
      },
      {
        name: 'IX_RevenueShares_Status',
        fields: ['Status']
      }
    ],
    hooks: {
      afterUpdate: async (share, options) => {
        if(share.changed('Status') && share.Status === 'paid') {
          // Tạo thông báo cho giảng viên
          await sequelize.models.Notification.create({
            UserID: share.InstructorID,
            Title: 'Revenue Share Payment',
            Message: `Your revenue share payment of ${share.Amount} ${share.Currency} has been processed`,
            Type: 'revenue_share',
            RelatedID: share.ShareID
          }, { transaction: options.transaction });
        }
      }
    }
  });
  return RevenueShare;
};
