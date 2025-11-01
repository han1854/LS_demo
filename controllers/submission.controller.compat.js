const base = require('./submission.controller');

const noopNotImpl = name => (req, res) =>
  res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
  // Core CRUD
  create: base.create || noopNotImpl('create'),
  findAll: base.findAll || noopNotImpl('findAll'),
  findOne: base.findOne || noopNotImpl('findOne'),
  update: base.update || noopNotImpl('update'),
  delete: base.delete || noopNotImpl('delete'),

  // Submission Actions
  // legacy names used by routes mapped to base implementation when available
  submit: base.submit || noopNotImpl('submit'),
  resubmit: base.resubmit || noopNotImpl('resubmit'),
  grade: base.grade || noopNotImpl('grade'),
  gradeSubmission: base.grade || base.gradeSubmission || noopNotImpl('gradeSubmission'),
  provideFeedback: base.provideFeedback || noopNotImpl('provideFeedback'),
  bulkGradeSubmissions: base.bulkGradeSubmissions || noopNotImpl('bulkGradeSubmissions'),

  // Student Views
  getMySubmissions: base.getMySubmissions || noopNotImpl('getMySubmissions'),
  getSubmissionDetails: base.getSubmissionDetails || noopNotImpl('getSubmissionDetails'),
  getMyGrades: base.getMyGrades || base.getMyGradesSummary || noopNotImpl('getMyGrades'),

  // Instructor Views
  getPendingSubmissions: base.getPendingSubmissions || noopNotImpl('getPendingSubmissions'),
  getGradedSubmissions: base.getGradedSubmissions || noopNotImpl('getGradedSubmissions'),
  getCourseSubmissions: base.getCourseSubmissions || noopNotImpl('getCourseSubmissions'),
  getAssignmentSubmissions:
    base.getAssignmentSubmissions || noopNotImpl('getAssignmentSubmissions'),
  getStudentSubmissions: base.getStudentSubmissions || noopNotImpl('getStudentSubmissions'),

  // Analytics
  getSubmissionStats: base.getSubmissionStats || noopNotImpl('getSubmissionStats'),
  getGradingTrends: base.getGradingTrends || noopNotImpl('getGradingTrends'),
  // Extension / Late submissions
  requestExtension: base.requestExtension || noopNotImpl('requestExtension'),
  handleExtensionRequest: base.handleExtensionRequest || noopNotImpl('handleExtensionRequest'),
};

module.exports = compat;
