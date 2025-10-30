const base = require('./assignment.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Core CRUD
    create: base.create || noopNotImpl('create'),
    findAll: base.findAll || noopNotImpl('findAll'),
    findOne: base.findOne || noopNotImpl('findOne'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),

    // Assignment Management
    publishAssignment: base.publishAssignment || noopNotImpl('publishAssignment'),
    unpublishAssignment: base.unpublishAssignment || noopNotImpl('unpublishAssignment'),
    extendDeadline: base.extendDeadline || noopNotImpl('extendDeadline'),
    
    // Student Views
    getMyPendingAssignments: base.getMyPendingAssignments || noopNotImpl('getMyPendingAssignments'),
    getMyCompletedAssignments: base.getMyCompletedAssignments || noopNotImpl('getMyCompletedAssignments'),
    getMyUpcomingAssignments: base.getMyUpcomingAssignments || noopNotImpl('getMyUpcomingAssignments'),
    
    // Statistics & Analysis
    getAssignmentStats: base.getAssignmentStats || noopNotImpl('getAssignmentStats'),
    getAssignmentSubmissions: base.getAssignmentSubmissions || noopNotImpl('getAssignmentSubmissions')
};

module.exports = compat;