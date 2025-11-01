module.exports = (sequelize, DataTypes) => {
  const ForumPost = sequelize.define(
    'ForumPost',
    {
      PostID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'CourseID',
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
      },
      Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [5, 200],
        },
      },
      Content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 5000], // Min 10 chars, max 5000
        },
      },
      Tags: {
        type: DataTypes.STRING(500),
        get() {
          return this.getDataValue('Tags')?.split(',') || [];
        },
        set(val) {
          this.setDataValue('Tags', Array.isArray(val) ? val.join(',') : val);
        },
      },
      Views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      tableName: 'ForumPosts',
      timestamps: false,
      indexes: [
        {
          name: 'IX_ForumPosts_UserID',
          fields: ['UserID'],
        },
        {
          name: 'IX_ForumPosts_CourseID',
          fields: ['CourseID'],
        },
        {
          name: 'IX_ForumPosts_Status',
          fields: ['Status'],
        },
      ],
      hooks: {
        afterCreate: async (post, options) => {
          // Thông báo cho người theo dõi khóa học
          const enrollments = await sequelize.models.Enrollment.findAll({
            where: {
              CourseID: post.CourseID,
              Status: 'active',
            },
          });

          const notifications = enrollments.map(enrollment => ({
            UserID: enrollment.UserID,
            Title: 'New Forum Post',
            Message: `New post in your course: ${post.Title}`,
            Type: 'forum_post',
            ReferenceType: 'post',
            ReferenceID: post.PostID,
          }));

          if (notifications.length > 0) {
            await sequelize.models.Notification.bulkCreate(notifications, {
              transaction: options.transaction,
            });
          }
        },
      },
    },
  );
  return ForumPost;
};
