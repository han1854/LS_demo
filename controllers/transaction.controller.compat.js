const base = require('./transaction.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Basic CRUD
    create: base.create || noopNotImpl('create'),
    findAll: base.findAll || noopNotImpl('findAll'),
    findOne: base.findOne || noopNotImpl('findOne'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),

    // Payments
    initiateCheckout: base.initiateCheckout || noopNotImpl('initiateCheckout'),
    processPayment: base.processPayment || noopNotImpl('processPayment'),

    // Status
    getTransactionStatus: base.getTransactionStatus || noopNotImpl('getTransactionStatus'),
    updateTransactionStatus: base.updateTransactionStatus || noopNotImpl('updateTransactionStatus'),

    // User Transactions
    getMyTransactions: base.getMyTransactions || noopNotImpl('getMyTransactions'),
    getTransactionDetails: base.getTransactionDetails || noopNotImpl('getTransactionDetails'),

    // Refunds
    initiateRefund: base.initiateRefund || noopNotImpl('initiateRefund'),
    getRefundStatus: base.getRefundStatus || noopNotImpl('getRefundStatus'),

    // Invoices & receipts
    generateInvoice: base.generateInvoice || noopNotImpl('generateInvoice'),
    generateReceipt: base.generateReceipt || noopNotImpl('generateReceipt'),

    // Course / Instructor
    getCourseTransactions: base.getCourseTransactions || noopNotImpl('getCourseTransactions'),
    getCourseRevenue: base.getCourseRevenue || noopNotImpl('getCourseRevenue'),
    getInstructorEarnings: base.getInstructorEarnings || noopNotImpl('getInstructorEarnings'),
    getPayoutHistory: base.getPayoutHistory || noopNotImpl('getPayoutHistory'),

    // Admin
    getTransactionOverview: base.getTransactionOverview || noopNotImpl('getTransactionOverview'),
    generateTransactionReports: base.generateTransactionReports || noopNotImpl('generateTransactionReports'),

    // Revenue sharing & payouts
    calculateRevenueShare: base.calculateRevenueShare || noopNotImpl('calculateRevenueShare'),
    processInstructorPayout: base.processInstructorPayout || noopNotImpl('processInstructorPayout'),

    // Subscriptions
    createSubscription: base.createSubscription || noopNotImpl('createSubscription'),
    updateSubscription: base.updateSubscription || noopNotImpl('updateSubscription'),
    cancelSubscription: base.cancelSubscription || noopNotImpl('cancelSubscription'),

    // Analytics
    getRevenueAnalytics: base.getRevenueAnalytics || noopNotImpl('getRevenueAnalytics'),
    getTransactionTrends: base.getTransactionTrends || noopNotImpl('getTransactionTrends')
};

module.exports = compat;