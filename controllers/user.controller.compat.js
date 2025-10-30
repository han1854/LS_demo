const base = require('./user.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Authentication & registration
    register: base.register || base.create || noopNotImpl('register'),
    login: base.login || noopNotImpl('login'),
    refreshToken: base.refreshToken || noopNotImpl('refreshToken'),
    logout: base.logout || noopNotImpl('logout'),

    // Password management
    forgotPassword: base.forgotPassword || noopNotImpl('forgotPassword'),
    resetPassword: base.resetPassword || noopNotImpl('resetPassword'),
    changePassword: base.changePassword || noopNotImpl('changePassword'),

    // Email verification
    verifyEmail: base.verifyEmail || noopNotImpl('verifyEmail'),
    resendVerification: base.resendVerification || noopNotImpl('resendVerification'),

    // Profile
    getProfile: base.getProfile || noopNotImpl('getProfile'),
    updateProfile: base.updateProfile || base.update || noopNotImpl('updateProfile'),
    uploadAvatar: base.uploadAvatar || noopNotImpl('uploadAvatar'),
    deleteAvatar: base.deleteAvatar || noopNotImpl('deleteAvatar'),

    // User learning
    getMyCourses: base.getMyCourses || noopNotImpl('getMyCourses'),
    getMyProgress: base.getMyProgress || noopNotImpl('getMyProgress'),
    getMyCertificates: base.getMyCertificates || noopNotImpl('getMyCertificates'),
    getMyAssignments: base.getMyAssignments || noopNotImpl('getMyAssignments'),

    // Preferences
    getPreferences: base.getPreferences || noopNotImpl('getPreferences'),
    updatePreferences: base.updatePreferences || noopNotImpl('updatePreferences'),
    updateNotificationSettings: base.updateNotificationSettings || noopNotImpl('updateNotificationSettings'),

    // Instructor public
    getInstructors: base.getInstructors || noopNotImpl('getInstructors'),
    getInstructorProfile: base.getInstructorProfile || noopNotImpl('getInstructorProfile'),
    getInstructorCourses: base.getInstructorCourses || noopNotImpl('getInstructorCourses'),
    getInstructorReviews: base.getInstructorReviews || noopNotImpl('getInstructorReviews'),
    applyForInstructor: base.applyForInstructor || noopNotImpl('applyForInstructor'),

    // Admin user management
    findAll: base.findAll || noopNotImpl('findAll'),
    findOne: base.findOne || noopNotImpl('findOne'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),
    updateStatus: base.updateStatus || noopNotImpl('updateStatus'),
    updateRole: base.updateRole || noopNotImpl('updateRole'),
    verifyUser: base.verifyUser || noopNotImpl('verifyUser'),

    // Analytics
    getUserAnalytics: base.getUserAnalytics || noopNotImpl('getUserAnalytics'),
    getUserEngagement: base.getUserEngagement || noopNotImpl('getUserEngagement')
};

module.exports = compat;
