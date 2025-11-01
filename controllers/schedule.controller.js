const db = require('../models');
const Schedule = db.Schedule;
const { Op } = require('sequelize');

// Create schedule
exports.create = async (req, res) => {
  try {
    const { courseId, title, description, startTime, endTime, type, meetingLink, reminder } =
      req.body;

    // Kiểm tra quyền tạo lịch
    const course = await db.Course.findByPk(courseId);
    if (course.InstructorID !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only course instructor or admin can create schedule',
      });
    }

    const schedule = await Schedule.create({
      CourseID: courseId,
      Title: title,
      Description: description,
      StartTime: startTime,
      EndTime: endTime,
      Type: type,
      Status: 'scheduled',
      MeetingLink: meetingLink,
      Reminder: reminder,
    });

    // Gửi thông báo cho học viên đã đăng ký
    const enrollments = await db.Enrollment.findAll({
      where: { CourseID: courseId },
    });

    for (const enrollment of enrollments) {
      await db.Notification.create({
        UserID: enrollment.UserID,
        Title: 'New Schedule Added',
        Message: `New ${type} scheduled for course: ${title}`,
        Type: 'schedule',
        RelatedID: schedule.ScheduleID,
      });
    }

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course schedule
exports.getByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const schedules = await Schedule.findAll({
      where: { CourseID: courseId },
      order: [['StartTime', 'ASC']],
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user schedule
exports.getUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    // Lấy danh sách khóa học của user
    const enrollments = await db.Enrollment.findAll({
      where: { UserID: userId },
    });

    const courseIds = enrollments.map(e => e.CourseID);

    // Lấy lịch học trong khoảng thời gian
    const schedules = await Schedule.findAll({
      where: {
        CourseID: { [Op.in]: courseIds },
        StartTime: {
          [Op.between]: [new Date(start), new Date(end)],
        },
      },
      include: [
        {
          model: db.Course,
          attributes: ['Title'],
        },
      ],
      order: [['StartTime', 'ASC']],
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update schedule
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Kiểm tra quyền cập nhật
    const course = await db.Course.findByPk(schedule.CourseID);
    if (course.InstructorID !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await schedule.update(req.body);

    // Thông báo thay đổi cho học viên
    const enrollments = await db.Enrollment.findAll({
      where: { CourseID: schedule.CourseID },
    });

    for (const enrollment of enrollments) {
      await db.Notification.create({
        UserID: enrollment.UserID,
        Title: 'Schedule Updated',
        Message: `Schedule for ${schedule.Title} has been updated`,
        Type: 'schedule',
        RelatedID: schedule.ScheduleID,
      });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel schedule
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Kiểm tra quyền hủy lịch
    const course = await db.Course.findByPk(schedule.CourseID);
    if (course.InstructorID !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await schedule.update({ Status: 'cancelled' });

    // Thông báo hủy cho học viên
    const enrollments = await db.Enrollment.findAll({
      where: { CourseID: schedule.CourseID },
    });

    for (const enrollment of enrollments) {
      await db.Notification.create({
        UserID: enrollment.UserID,
        Title: 'Schedule Cancelled',
        Message: `${schedule.Title} has been cancelled`,
        Type: 'schedule',
        RelatedID: schedule.ScheduleID,
      });
    }

    res.json({ message: 'Schedule cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
