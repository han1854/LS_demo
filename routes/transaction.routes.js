const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller.compat.js');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validations');

// Payment Processing
router.post(
  '/checkout',
  authMiddleware,
  validateTransaction,
  transactionController.initiateCheckout,
);

router.post('/process-payment', authMiddleware, transactionController.processPayment);

// Transaction Status
router.get('/:id/status', authMiddleware, transactionController.getTransactionStatus);

router.put(
  '/:id/status',
  authMiddleware,
  checkRole(['admin']),
  transactionController.updateTransactionStatus,
);

// Transaction Management
router.get('/my', authMiddleware, transactionController.getMyTransactions);

router.get('/:id', authMiddleware, transactionController.getTransactionDetails);

// Refunds
router.post(
  '/:id/refund',
  authMiddleware,
  checkRole(['admin']),
  transactionController.initiateRefund,
);

router.get('/:id/refund/status', authMiddleware, transactionController.getRefundStatus);

// Invoices & Receipts
router.get('/:id/invoice', authMiddleware, transactionController.generateInvoice);

router.get('/:id/receipt', authMiddleware, transactionController.generateReceipt);

// Course Transactions
router.get(
  '/course/:courseId',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  transactionController.getCourseTransactions,
);

router.get(
  '/course/:courseId/revenue',
  authMiddleware,
  checkRole(['instructor', 'admin']),
  transactionController.getCourseRevenue,
);

// Instructor Earnings
router.get(
  '/instructor/earnings',
  authMiddleware,
  checkRole(['instructor']),
  transactionController.getInstructorEarnings,
);

router.get(
  '/instructor/payout-history',
  authMiddleware,
  checkRole(['instructor']),
  transactionController.getPayoutHistory,
);

// Admin Functions
router.get(
  '/admin/overview',
  authMiddleware,
  checkRole(['admin']),
  transactionController.getTransactionOverview,
);

router.get(
  '/admin/reports',
  authMiddleware,
  checkRole(['admin']),
  transactionController.generateTransactionReports,
);

// Revenue Sharing
router.post(
  '/revenue-share/calculate',
  authMiddleware,
  checkRole(['admin']),
  transactionController.calculateRevenueShare,
);

router.post(
  '/payout/process',
  authMiddleware,
  checkRole(['admin']),
  transactionController.processInstructorPayout,
);

// Subscription Management
router.post('/subscription/create', authMiddleware, transactionController.createSubscription);

router.put('/subscription/:id', authMiddleware, transactionController.updateSubscription);

router.delete('/subscription/:id', authMiddleware, transactionController.cancelSubscription);

// Transaction Analytics
router.get(
  '/analytics/revenue',
  authMiddleware,
  checkRole(['admin']),
  transactionController.getRevenueAnalytics,
);

router.get(
  '/analytics/trends',
  authMiddleware,
  checkRole(['admin']),
  transactionController.getTransactionTrends,
);

module.exports = router;
