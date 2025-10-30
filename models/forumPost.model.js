module.exports = (sequelize, DataTypes) => {
  const ForumPost = sequelize.define("ForumPost", {
    PostID: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    CourseID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'CourseID'
      }
    },
    UserID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'UserID'
      }
    },
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    Content: { 
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 5000] // Min 10 chars, max 5000
      }
    },
    Category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'general',
      validate: {
        isIn: [['general', 'question', 'discussion', 'announcement']]
      }
    },
    Tags: {
      type: DataTypes.STRING(200),
      get() {
        return this.getDataValue('Tags')?.split(',') || [];
      },
      set(val) {
        this.setDataValue('Tags', Array.isArray(val) ? val.join(',') : val);
      }
    },
    Status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'closed', 'hidden', 'deleted']]
      }
    },
    Views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    IsPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false  
    },
    IsAnswered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    LastActivityAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('GETDATE')
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
    tableName: "ForumPosts",
    timestamps: false,
    indexes: [
      {
        name: 'IX_ForumPosts_CourseID',
        fields: ['CourseID']
      },
      {
        name: 'IX_ForumPosts_UserID',
        fields: ['UserID']
      },
      {
        name: 'IX_ForumPosts_Category',
        fields: ['Category']
      },
      {
        name: 'IX_ForumPosts_Status',
        fields: ['Status']
      },
      {
        name: 'IX_ForumPosts_IsPinned',
        fields: ['IsPinned']
      }
    ],
    hooks: {
      beforeUpdate: (post) => {
        post.EditedAt = new Date();
      },
      afterCreate: async (post, options) => {
        // Thông báo cho người theo dõi khóa học
        const enrollments = await sequelize.models.Enrollment.findAll({
          where: { 
            CourseID: post.CourseID,
            Status: 'active'
          }
        });

        const notifications = enrollments.map(enrollment => ({
          UserID: enrollment.UserID,
          Title: 'New Forum Post',
          Message: `New post in your course: ${post.Title}`,
          Type: 'forum_post',
          RelatedID: post.PostID
        }));

        if (notifications.length > 0) {
          await sequelize.models.Notification.bulkCreate(notifications, {
            transaction: options.transaction
          });
        }
      }
    }
  });
  return ForumPost;
};
