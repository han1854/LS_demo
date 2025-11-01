const db = require('../models');
const ForumPost = db.ForumPost;
const { buildUserResponse } = require('../utils/userHelper');

exports.create = async (req, res) => {
  try {
    const forumPost = await ForumPost.create(req.body);
    res.status(201).json(forumPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const forumPosts = await ForumPost.findAll({
      include: ['course', 'user', 'comments'],
    });
    // Transform user data in posts and comments
    const transformedPosts = forumPosts.map(post => {
      const plainPost = post.get();
      if (plainPost.user) {
        plainPost.user = buildUserResponse(plainPost.user);
      }
      if (plainPost.comments) {
        plainPost.comments = plainPost.comments.map(comment => {
          const plainComment = comment.get();
          if (plainComment.user) {
            plainComment.user = buildUserResponse(plainComment.user);
          }
          return plainComment;
        });
      }
      return plainPost;
    });
    res.json(transformedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const forumPost = await ForumPost.findByPk(req.params.id, {
      include: ['course', 'user', 'comments'],
    });
    if (forumPost) {
      const plainPost = forumPost.get();
      if (plainPost.user) {
        plainPost.user = buildUserResponse(plainPost.user);
      }
      if (plainPost.comments) {
        plainPost.comments = plainPost.comments.map(comment => {
          const plainComment = comment.get();
          if (plainComment.user) {
            plainComment.user = buildUserResponse(plainComment.user);
          }
          return plainComment;
        });
      }
      res.json(plainPost);
    } else {
      res.status(404).json({ message: 'Forum post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const pk = ForumPost.primaryKeyAttribute;
    const updated = await ForumPost.update(req.body, {
      where: { [pk]: req.params.id },
    });
    if (updated[0] === 1) {
      res.json({ message: 'Forum post updated successfully' });
    } else {
      res.status(404).json({ message: 'Forum post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pk = ForumPost.primaryKeyAttribute;
    const deleted = await ForumPost.destroy({ where: { [pk]: req.params.id } });
    if (deleted === 1) {
      res.json({ message: 'Forum post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Forum post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
