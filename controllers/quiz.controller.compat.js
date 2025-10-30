const base = require('./quiz.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Core CRUD
    create: base.create || noopNotImpl('create'),
    findAll: base.findAll || noopNotImpl('findAll'),
    findOne: base.findOne || noopNotImpl('findOne'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),

    // Quiz Management
    getQuizzesByLesson: base.getQuizzesByLesson || noopNotImpl('getQuizzesByLesson'),
    publish: base.publish || noopNotImpl('publish'),
    reorderQuestions: base.reorderQuestions || noopNotImpl('reorderQuestions'),

    // Question Management
    addQuestion: base.addQuestion || noopNotImpl('addQuestion'),
    updateQuestion: base.updateQuestion || noopNotImpl('updateQuestion'),
    deleteQuestion: base.deleteQuestion || noopNotImpl('deleteQuestion'),
    getQuestions: base.getQuestions || noopNotImpl('getQuestions'),

    // Quiz Taking and Results
    startQuiz: base.startQuiz || noopNotImpl('startQuiz'),
    submitQuiz: base.submitQuiz || noopNotImpl('submitQuiz'),
    getQuizResults: base.getQuizResults || noopNotImpl('getQuizResults'),
    getQuizResult: base.getQuizResult || noopNotImpl('getQuizResult'),
    getMyResults: base.getMyResults || noopNotImpl('getMyResults'),

    // Analytics
    getQuizStats: base.getQuizStats || noopNotImpl('getQuizStats'),
    getQuizAttempts: base.getQuizAttempts || noopNotImpl('getQuizAttempts')
};

module.exports = compat;