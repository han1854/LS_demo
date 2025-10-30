module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
    TransactionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    UserID: { type: DataTypes.INTEGER, allowNull: false },
    CourseID: { type: DataTypes.INTEGER, allowNull: false },
    Amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    Status: { type: DataTypes.STRING(50) },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "Transactions",
    timestamps: false
  });
  return Transaction;
};
