const db = require('../models');
const Assignment = db.Assignment;

exports.create = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      LessonID,
      Title,
      Description,
      Instructions,
      MaxScore,
      DueDate,
      AllowLateSubmission,
      LateSubmissionPenalty,
      RequiredFiles,
      MaxFileSize,
    } = req.body;

    // Validate required fields
    if (!LessonID || !Title) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'LessonID and Title are required',
      });
    }

    // Validate lesson exists and user has permission
    const lesson = await db.Lesson.findByPk(LessonID, {
      include: [
        {
          model: db.Course,
          as: 'course',
        },
      ],
    });

    if (!lesson) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Lesson not found',
      });
    }

    // Check if user is instructor of the course
    if (lesson.course.InstructorID !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You must be the course instructor to create assignments',
      });
    }

    // Create assignment
    const assignment = await Assignment.create(
      {
        LessonID,
        Title,
        Description,
        Instructions,
        MaxScore,
        DueDate,
        AllowLateSubmission,
        LateSubmissionPenalty,
        RequiredFiles,
        MaxFileSize,
        Status: 'active',
      },
      { transaction },
    );

    await transaction.commit();

    // Return created assignment with related data
    const createdAssignment = await Assignment.findByPk(assignment.AssignmentID, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
    });

    res.status(201).json(createdAssignment);
  } catch (error) {
    await transaction.rollback();
    console.error('Create assignment error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const {
      lessonId,
      courseId,
      status,
      dueDate,
      search,
      sort_by,
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build where clause
    const whereClause = {};
    if (lessonId) whereClause.LessonID = lessonId;
    if (status) whereClause.Status = status;
    if (search) {
      whereClause[Op.or] = [
        { Title: { [Op.like]: `%${search}%` } },
        { Description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add course filter if provided
    let lessonInclude = {
      model: db.Lesson,
      as: 'lesson',
      include: ['course'],
    };
    if (courseId) {
      lessonInclude.where = { CourseID: courseId };
    }

    // Build order clause
    const orderClause = [];
    if (sort_by) {
      orderClause.push([sort_by, order.toUpperCase()]);
    } else {
      orderClause.push(['CreatedAt', 'DESC']);
    }

    // Add due date filter if provided
    if (dueDate === 'upcoming') {
      whereClause.DueDate = { [Op.gt]: new Date() };
    } else if (dueDate === 'past') {
      whereClause.DueDate = { [Op.lt]: new Date() };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get assignments with pagination
    const { count, rows: assignments } = await Assignment.findAndCountAll({
      where: whereClause,
      include: [
        lessonInclude,
        {
          model: db.Submission,
          as: 'submissions',
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('SubmissionID')), 'submissionCount'],
            [sequelize.fn('AVG', sequelize.col('Score')), 'averageScore'],
          ],
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
      group: ['AssignmentID'],
    });

    // Get submission statistics for each assignment
    for (const assignment of assignments) {
      const stats = await db.Submission.findAll({
        where: { AssignmentID: assignment.AssignmentID },
        attributes: ['Status', [sequelize.fn('COUNT', sequelize.col('Status')), 'count']],
        group: ['Status'],
      });

      assignment.setDataValue('submissionStats', {
        draft: 0,
        submitted: 0,
        graded: 0,
        ...Object.fromEntries(stats.map(s => [s.Status, parseInt(s.get('count'))])),
      });
    }

    res.json({
      assignments: assignments,
      pagination: {
        total: count.length,
        pages: Math.ceil(count.length / limit),
        current_page: parseInt(page),
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Find assignments error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
        {
          model: db.Submission,
          as: 'submissions',
          include: ['user'],
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({ message: `Assignment with ID ${id} not found` });
    }

    // Get submission statistics
    const stats = await db.Submission.findAll({
      where: { AssignmentID: id },
      attributes: [
        'Status',
        [sequelize.fn('COUNT', sequelize.col('Status')), 'count'],
        [sequelize.fn('AVG', sequelize.col('Score')), 'averageScore'],
      ],
      group: ['Status'],
    });

    // Format statistics
    const submissionStats = {
      draft: 0,
      submitted: 0,
      graded: 0,
      averageScore: 0,
      ...Object.fromEntries(stats.map(s => [s.Status, parseInt(s.get('count'))])),
    };

    // Calculate average score only from graded submissions
    const gradedStats = stats.find(s => s.Status === 'graded');
    if (gradedStats) {
      submissionStats.averageScore = parseFloat(gradedStats.get('averageScore')) || 0;
    }

    // Add submission timeline
    const timeline = await db.Submission.findAll({
      where: { AssignmentID: id },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('CreatedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('SubmissionID')), 'count'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('CreatedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('CreatedAt')), 'ASC']],
    });

    // Add statistics to assignment response
    assignment.setDataValue('submissionStats', submissionStats);
    assignment.setDataValue('submissionTimeline', timeline);

    res.json(assignment);
  } catch (error) {
    console.error('Find assignment error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const id = req.params.id;
    const updateData = req.body;

    // Find assignment with course info to check permissions
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
      transaction,
    });

    if (!assignment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the course instructor
    if (assignment.lesson.course.InstructorID !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You must be the course instructor to update assignments',
      });
    }

    // Validate if there are submissions when trying to modify critical fields
    if (['MaxScore', 'RequiredFiles', 'MaxFileSize'].some(field => field in updateData)) {
      const submissionCount = await db.Submission.count({
        where: {
          AssignmentID: id,
          Status: { [Op.ne]: 'draft' },
        },
        transaction,
      });

      if (submissionCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Cannot modify critical assignment parameters after submissions have been made',
        });
      }
    }

    // Prevent updating certain fields
    delete updateData.LessonID; // Cannot change lesson assignment
    delete updateData.CreatedAt;
    delete updateData.UpdatedAt;

    // Update assignment
    await Assignment.update(updateData, {
      where: { AssignmentID: id },
      transaction,
    });

    // Get updated assignment with related data
    const updatedAssignment = await Assignment.findByPk(id, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
      transaction,
    });

    await transaction.commit();
    res.json(updatedAssignment);
  } catch (error) {
    await transaction.rollback();
    console.error('Update assignment error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const id = req.params.id;

    // Find assignment with course info to check permissions
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
      transaction,
    });

    if (!assignment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the course instructor
    if (assignment.lesson.course.InstructorID !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You must be the course instructor to delete assignments',
      });
    }

    // Check if there are any submissions
    const submissionCount = await db.Submission.count({
      where: { AssignmentID: id },
      transaction,
    });

    if (submissionCount > 0) {
      // Soft delete if there are submissions
      await Assignment.update(
        { Status: 'deleted' },
        {
          where: { AssignmentID: id },
          transaction,
        },
      );
    } else {
      // Hard delete if no submissions exist
      await Assignment.destroy({
        where: { AssignmentID: id },
        transaction,
      });
    }

    await transaction.commit();
    res.json({
      message: 'Assignment deleted successfully',
      type: submissionCount > 0 ? 'soft' : 'hard',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: error.message });
  }
};
