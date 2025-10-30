const base = require('./comment.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Core CRUD
    create: base.create || noopNotImpl('create'),
    update: base.update || noopNotImpl('update'),
    delete: base.delete || noopNotImpl('delete'),

    // Comment Management
    getPostComments: base.getPostComments || noopNotImpl('getPostComments'),
    reply: base.reply || noopNotImpl('reply'),
    
    // Moderation
    moderate: base.moderate || noopNotImpl('moderate')
};

module.exports = compat;