const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      Schedule.belongsTo(models.Course, {
        foreignKey: 'CourseID',
        as: 'Course',
      });
    }

    // Add static method to find upcoming schedules
    static async findUpcoming(courseId = null, limit = 10) {
      const where = {
        StartTime: {
          [sequelize.Op.gt]: new Date(),
        },
        Status: 'scheduled',
      };

      if (courseId) {
        where.CourseID = courseId;
      }

      return await this.findAll({
        where,
        order: [['StartTime', 'ASC']],
        limit,
      });
    }

    // Add static method to find ongoing schedules
    static async findOngoing() {
      const now = new Date();
      return await this.findAll({
        where: {
          StartTime: {
            [sequelize.Op.lte]: now,
          },
          EndTime: {
            [sequelize.Op.gt]: now,
          },
          Status: 'ongoing',
        },
      });
    }
  }

  Schedule.init(
    {
      ScheduleID: {
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
      Title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
      },
      StartTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      EndTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Type: {
        type: DataTypes.STRING(50), // lesson, assignment, quiz, live-session
        allowNull: false,
      },
      Status: {
        type: DataTypes.STRING(20), // scheduled, ongoing, completed, cancelled
        defaultValue: 'scheduled',
      },
      MeetingLink: {
        type: DataTypes.STRING(500), // For online sessions
      },
      Reminder: {
        type: DataTypes.INTEGER, // minutes before start to send reminder
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
      },
    },
    {
      sequelize,
      modelName: 'Schedule',
      tableName: 'Schedules',
      timestamps: false,
    },
  );

  Schedule.addHook('beforeSave', async schedule => {
    // Validate end time is after start time
    if (schedule.EndTime <= schedule.StartTime) {
      throw new Error('End time must be after start time');
    }
  });

  Schedule.addHook('afterCreate', async (schedule, options) => {
    // Create notifications for enrolled users
    const enrollments = await sequelize.models.Enrollment.findAll({
      where: {
        CourseID: schedule.CourseID,
        Status: 'active',
      },
    });

    const notifications = enrollments.map(enrollment => ({
      UserID: enrollment.UserID,
      Type: 'schedule',
      Title: `New Schedule: ${schedule.Title}`,
      Message: `A new schedule has been added to your course: ${schedule.Title}`,
      ReferenceType: 'schedule',
      ReferenceID: schedule.ScheduleID,
    }));

    if (notifications.length > 0) {
      await sequelize.models.Notification.bulkCreate(notifications, {
        transaction: options.transaction,
      });
    }
  });

  return Schedule;
};
