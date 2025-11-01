const base = require('./enrollment.controller');

const noopNotImpl = name => (req, res) =>
  res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
  // Core Enrollment Actions
  enrollInCourse: base.enrollInCourse || noopNotImpl('enrollInCourse'),
  unenrollFromCourse: base.unenrollFromCourse || noopNotImpl('unenrollFromCourse'),

  // Student Enrollment Views
  getMyEnrollments: base.getMyEnrollments || noopNotImpl('getMyEnrollments'),
  getMyCompletedCourses: base.getMyCompletedCourses || noopNotImpl('getMyCompletedCourses'),
  getMyActiveCourses: base.getMyActiveCourses || noopNotImpl('getMyActiveCourses'),

  // Course Management
  getCourseEnrollments: base.getCourseEnrollments || noopNotImpl('getCourseEnrollments'),
  getCourseEnrollmentStats:
    base.getCourseEnrollmentStats || noopNotImpl('getCourseEnrollmentStats'),

  // Enrollment Status Management
  activateEnrollment: base.activateEnrollment || noopNotImpl('activateEnrollment'),
  deactivateEnrollment: base.deactivateEnrollment || noopNotImpl('deactivateEnrollment'),

  // Batch Operations
  batchEnroll: base.batchEnroll || noopNotImpl('batchEnroll'),
  batchUpdateStatus: base.batchUpdateStatus || noopNotImpl('batchUpdateStatus'),

  // Analytics
  getEnrollmentAnalytics: base.getEnrollmentAnalytics || noopNotImpl('getEnrollmentAnalytics'),
  getEnrollmentTrends: base.getEnrollmentTrends || noopNotImpl('getEnrollmentTrends'),

  // History and Verification
  getEnrollmentHistory: base.getEnrollmentHistory || noopNotImpl('getEnrollmentHistory'),
  verifyEnrollment: base.verifyEnrollment || noopNotImpl('verifyEnrollment'),

  // Payment
  getEnrollmentPayment: base.getEnrollmentPayment || noopNotImpl('getEnrollmentPayment'),
  updatePaymentStatus: base.updatePaymentStatus || noopNotImpl('updatePaymentStatus'),
};

module.exports = compat;
