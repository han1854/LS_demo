const base = require('./rating.controller');

const noopNotImpl = name => (req, res) =>
  res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
  // Core CRUD
  create: base.create || noopNotImpl('create'),
  update: base.update || noopNotImpl('update'),
  delete: base.delete || noopNotImpl('delete'),

  // Rating Retrieval
  getByCourse: base.getByCourse || noopNotImpl('getByCourse'),
  getCourseSummary: base.getCourseSummary || noopNotImpl('getCourseSummary'),
  getMyRatings: base.getMyRatings || noopNotImpl('getMyRatings'),

  // Rating Responses
  replyToRating: base.replyToRating || noopNotImpl('replyToRating'),
  updateReply: base.updateReply || noopNotImpl('updateReply'),
  deleteReply: base.deleteReply || noopNotImpl('deleteReply'),

  // Rating Moderation
  moderateRating: base.moderateRating || noopNotImpl('moderateRating'),
  deleteRating: base.deleteRating || noopNotImpl('deleteRating'),

  // Rating Reports
  reportRating: base.reportRating || noopNotImpl('reportRating'),
  getRatingReports: base.getRatingReports || noopNotImpl('getRatingReports'),
  handleReport: base.handleReport || noopNotImpl('handleReport'),

  // Analytics
  getCourseRatingAnalytics:
    base.getCourseRatingAnalytics || noopNotImpl('getCourseRatingAnalytics'),
  getInstructorRatingAnalytics:
    base.getInstructorRatingAnalytics || noopNotImpl('getInstructorRatingAnalytics'),

  // Filtering
  filterRatings: base.filterRatings || noopNotImpl('filterRatings'),

  // Helpful Votes
  markAsHelpful: base.markAsHelpful || noopNotImpl('markAsHelpful'),
  removeHelpfulMark: base.removeHelpfulMark || noopNotImpl('removeHelpfulMark'),
};

module.exports = compat;
