const base = require('./course.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    create: base.create || noopNotImpl('create'),
    findAll: base.findAll || noopNotImpl('findAll'),
    findOne: base.findOne || noopNotImpl('findOne'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),

    publish: base.publish || noopNotImpl('publish'),
    archive: base.archive || noopNotImpl('archive'),
    addLesson: base.addLesson || noopNotImpl('addLesson'),
    reorderLessons: base.reorderLessons || noopNotImpl('reorderLessons'),
    getCourseAnalytics: base.getCourseAnalytics || noopNotImpl('getCourseAnalytics'),
    getCourseProgress: base.getCourseProgress || noopNotImpl('getCourseProgress'),
    getEnrolledCourses: base.getEnrolledCourses || noopNotImpl('getEnrolledCourses'),
    getCompletedCourses: base.getCompletedCourses || noopNotImpl('getCompletedCourses'),
    getCourseSyllabus: base.getCourseSyllabus || noopNotImpl('getCourseSyllabus'),
    getCourseReviews: base.getCourseReviews || noopNotImpl('getCourseReviews'),
    addCourseReview: base.addCourseReview || noopNotImpl('addCourseReview')
};

module.exports = compat;
