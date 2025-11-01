const base = require('./lesson.controller');

const noopNotImpl = name => (req, res) =>
  res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
  // Core CRUD
  create: base.create || noopNotImpl('create'),
  findAll: base.findAll || noopNotImpl('findAll'),
  findOne: base.findOne || noopNotImpl('findOne'),
  update: base.update || noopNotImpl('update'),
  delete: base.delete || noopNotImpl('delete'),

  // Lesson Access
  getCourseLessons: base.getCourseLessons || noopNotImpl('getCourseLessons'),
  getLessonContent: base.getLessonContent || noopNotImpl('getLessonContent'),
  markAsComplete: base.markAsComplete || noopNotImpl('markAsComplete'),
  getMyProgress: base.getMyProgress || noopNotImpl('getMyProgress'),
  getMyBookmarks: base.getMyBookmarks || noopNotImpl('getMyBookmarks'),

  // Publishing
  publish: base.publish || noopNotImpl('publish'),
  unpublish: base.unpublish || noopNotImpl('unpublish'),

  // Resources
  addResource: base.addResource || noopNotImpl('addResource'),
  deleteResource: base.deleteResource || noopNotImpl('deleteResource'),
  updateOrder: base.updateOrder || noopNotImpl('updateOrder'),

  // Student Interactions
  bookmarkLesson: base.bookmarkLesson || noopNotImpl('bookmarkLesson'),
  removeBookmark: base.removeBookmark || noopNotImpl('removeBookmark'),
  addNote: base.addNote || noopNotImpl('addNote'),
  getNotes: base.getNotes || noopNotImpl('getNotes'),
  updateNote: base.updateNote || noopNotImpl('updateNote'),
  deleteNote: base.deleteNote || noopNotImpl('deleteNote'),

  // Progress & Stats
  getLessonProgress: base.getLessonProgress || noopNotImpl('getLessonProgress'),
  getCompletionStats: base.getCompletionStats || noopNotImpl('getCompletionStats'),

  // Preview
  previewLesson: base.previewLesson || noopNotImpl('previewLesson'),
  generatePreview: base.generatePreview || noopNotImpl('generatePreview'),

  // Analytics
  getEngagementAnalytics: base.getEngagementAnalytics || noopNotImpl('getEngagementAnalytics'),
  getTimeSpentAnalytics: base.getTimeSpentAnalytics || noopNotImpl('getTimeSpentAnalytics'),
};

module.exports = compat;
