const base = require('./announcement.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // CRUD
    create: base.create || noopNotImpl('create'),
    findAll: base.findAll || noopNotImpl('findAll'),
    findOne: base.findOne || noopNotImpl('findOne'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),

    // Additional route handlers expected by routes
    getCourseAnnouncements: base.getCourseAnnouncements || noopNotImpl('getCourseAnnouncements'),
    getMyAnnouncements: base.getMyAnnouncements || noopNotImpl('getMyAnnouncements'),
    publish: base.publish || noopNotImpl('publish'),
    getRecipients: base.getRecipients || noopNotImpl('getRecipients')
};

module.exports = compat;