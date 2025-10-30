module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    CommentID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    UserID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID' 
      }
    },
    CourseID: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Courses',
        key: 'CourseID'
      } 
    },
    LessonID: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Lessons',
        key: 'LessonID'
      }
    },
    PostID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ForumPosts',
        key: 'PostID'
      }
    },
    ParentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Comments',
        key: 'CommentID'
      }
    },
    Content: { 
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000] // Giới hạn độ dài
      }
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'hidden', 'deleted']]
      }
    },
    IsInstructor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    IsAnswer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    Likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ReportCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
    },
    EditedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "Comments",
    timestamps: false,
    indexes: [
      {
        name: 'IX_Comments_UserID',
        fields: ['UserID']
      },
      {
        name: 'IX_Comments_CourseID',
        fields: ['CourseID']
      },
      {
        name: 'IX_Comments_LessonID',
        fields: ['LessonID']  
      },
      {
        name: 'IX_Comments_PostID',
        fields: ['PostID']
      },
      {
        name: 'IX_Comments_ParentID',
        fields: ['ParentID']
      },
      {
        name: 'IX_Comments_Status',
        fields: ['Status']
      }
    ],
    hooks: {
      beforeUpdate: (comment) => {
        comment.EditedAt = new Date();
      },
      afterCreate: async (comment, options) => {
        // Nếu là phản hồi cho comment khác
        if(comment.ParentID) {
          const parentComment = await Comment.findByPk(comment.ParentID);
          if(parentComment) {
            await sequelize.models.Notification.create({
              UserID: parentComment.UserID,
              Title: 'New Reply to Your Comment',
              Message: 'Someone replied to your comment',
              Type: 'comment_reply',
              RelatedID: comment.CommentID
            }, { transaction: options.transaction });
          }
        }
        
        // Nếu là comment trong forum post
        if(comment.PostID) {
          const post = await sequelize.models.ForumPost.findByPk(comment.PostID);
          if(post && post.UserID !== comment.UserID) {
            await sequelize.models.Notification.create({
              UserID: post.UserID,
              Title: 'New Comment on Your Post',
              Message: 'Someone commented on your forum post',
              Type: 'post_comment',
              RelatedID: comment.CommentID
            }, { transaction: options.transaction });
          }
        }

        // Nếu là comment trong bài học
        if(comment.LessonID) {
          const lesson = await sequelize.models.Lesson.findByPk(comment.LessonID, {
            include: ['course']
          });
          if(lesson && lesson.course.InstructorID !== comment.UserID) {
            await sequelize.models.Notification.create({
              UserID: lesson.course.InstructorID,
              Title: 'New Comment in Your Lesson',
              Message: 'A student commented in your lesson',
              Type: 'lesson_comment',
              RelatedID: comment.CommentID
            }, { transaction: options.transaction });
          }
        }
      }
    }
  });
  return Comment;
};
