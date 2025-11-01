const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, {
        foreignKey: 'UserID',
        as: 'user',
      });
      Comment.belongsTo(models.Lesson, {
        foreignKey: 'LessonID',
        as: 'lesson',
      });
      Comment.belongsTo(Comment, {
        foreignKey: 'ParentID',
        as: 'parent',
      });
      Comment.hasMany(Comment, {
        foreignKey: 'ParentID',
        as: 'replies',
      });
    }
  }

  Comment.init(
    {
      CommentID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      ParentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'CommentID',
        },
      },
      Type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['lesson', 'discussion']],
        },
      },
      ReferenceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'hidden', 'deleted']],
        },
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'Comments',
      timestamps: false,
      indexes: [
        {
          name: 'IX_Comments_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_Comments_ReferenceID',
          fields: ['ReferenceID'],
        },
        {
          name: 'IX_Comments_Status',
          fields: ['Status'],
        },
      ],
      hooks: {
        afterCreate: async (comment, options) => {
          // Nếu là phản hồi cho comment khác
          if (comment.ParentID) {
            const parentComment = await Comment.findByPk(comment.ParentID);
            if (parentComment) {
              await sequelize.models.Notification.create(
                {
                  UserID: parentComment.UserID,
                  Title: 'New Reply to Your Comment',
                  Message: 'Someone replied to your comment',
                  Type: 'comment_reply',
                  ReferenceType: 'comment',
                  ReferenceID: comment.CommentID,
                },
                { transaction: options.transaction },
              );
            }
          }

          // Nếu là comment trong bài học
          if (comment.Type === 'lesson') {
            const lesson = await sequelize.models.Lesson.findByPk(comment.ReferenceID, {
              include: [
                {
                  model: sequelize.models.Course,
                  as: 'course',
                },
              ],
            });

            if (lesson && lesson.course.InstructorID !== comment.UserID) {
              await sequelize.models.Notification.create(
                {
                  UserID: lesson.course.InstructorID,
                  Title: 'New Comment in Your Lesson',
                  Message: 'A student commented in your lesson',
                  Type: 'lesson_comment',
                  ReferenceType: 'comment',
                  ReferenceID: comment.CommentID,
                },
                { transaction: options.transaction },
              );
            }
          }
        },
      },
    },
  );
  return Comment;
};
