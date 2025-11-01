// Note: actual controller filename is `forumPost.controller.js`
const base = require('./forumPost.controller');

const noopNotImpl = name => (req, res) =>
  res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
  // Core
  findAll: base.findAll || noopNotImpl('findAll'),
  findOne: base.findOne || noopNotImpl('findOne'),
  create: base.create || noopNotImpl('create'),
  update: base.update || noopNotImpl('update'),
  delete: base.delete || noopNotImpl('delete'),

  // Listing / discovery
  getCoursePosts: base.getCoursePosts || base.getPostsByCourse || noopNotImpl('getCoursePosts'),
  getPopularPosts: base.getPopularPosts || base.getPopularThreads || noopNotImpl('getPopularPosts'),
  getRecentPosts: base.getRecentPosts || noopNotImpl('getRecentPosts'),
  searchPosts: base.searchPosts || noopNotImpl('searchPosts'),
  getMyPosts: base.getMyPosts || noopNotImpl('getMyPosts'),

  // Interactions
  likePost: base.likePost || noopNotImpl('likePost'),
  unlikePost: base.unlikePost || noopNotImpl('unlikePost'),
  getLikes: base.getLikes || noopNotImpl('getLikes'),

  // Comments
  getComments: base.getComments || base.getPostComments || noopNotImpl('getComments'),
  addComment: base.addComment || base.createComment || noopNotImpl('addComment'),
  updateComment: base.updateComment || noopNotImpl('updateComment'),
  deleteComment: base.deleteComment || noopNotImpl('deleteComment'),

  // Moderation / post state
  pinPost: base.pinPost || base.pinThread || noopNotImpl('pinPost'),
  unpinPost: base.unpinPost || base.unpinThread || noopNotImpl('unpinPost'),
  closePost: base.closePost || base.lockThread || noopNotImpl('closePost'),
  reopenPost: base.reopenPost || base.unlockThread || noopNotImpl('reopenPost'),

  // Taxonomy
  getCategories: base.getCategories || noopNotImpl('getCategories'),
  getTags: base.getTags || noopNotImpl('getTags'),
  getPostsByCategory: base.getPostsByCategory || noopNotImpl('getPostsByCategory'),
  getPostsByTag: base.getPostsByTag || noopNotImpl('getPostsByTag'),

  // Analytics
  getForumAnalytics: base.getForumAnalytics || noopNotImpl('getForumAnalytics'),
  getUserEngagement:
    base.getUserEngagement || base.getEngagementStats || noopNotImpl('getUserEngagement'),
};

module.exports = compat;
