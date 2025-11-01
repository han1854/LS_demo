const db = require('../models');
const Rating = db.Rating;

// Create rating
exports.create = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { courseId } = req.params;
      const { rating: ratingValue, review } = req.body;

    // Validate required fields
      if (!ratingValue) {
      await transaction.rollback();
      return res.status(400).json({
          message: 'Rating is required',
      });
    }

    // Validate score range
      if (ratingValue < 1 || ratingValue > 5) {
      await transaction.rollback();
      return res.status(400).json({
          message: 'Rating must be between 1 and 5',
      });
    }

    // Check course enrollment and completion status
    const enrollment = await db.Enrollment.findOne({
      where: {
        CourseID: courseId,
        UserID: req.user.id,
        Status: ['active', 'completed'],
      },
      transaction,
    });

    if (!enrollment) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You must be enrolled and active in the course to rate it',
      });
    }

    // Create rating
    const rating = await Rating.create(
      {
        CourseID: courseId,
        UserID: req.user.id,
          Rating: ratingValue,
          Review: review,
        Status: 'active',
      },
      { transaction },
    );

    // Create notification for instructor
    await db.Notification.create(
      {
        UserID: (await db.Course.findByPk(courseId)).InstructorID,
        Title: 'New Course Rating',
          Message: `A new ${ratingValue}-star rating was added to your course`,
        Type: 'rating',
        RelatedID: rating.RatingID,
      },
      { transaction },
    );

    await transaction.commit();

    // Return rating with user info
    const ratingWithUser = await Rating.findByPk(rating.RatingID, {
      include: [
        {
          model: db.User,
          attributes: ['FirstName', 'LastName', 'Avatar'],
        },
      ],
    });

    res.status(201).json(ratingWithUser);
  } catch (error) {
    await transaction.rollback();
    console.error('Create rating error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'You have already rated this course',
      });
    }
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

// Get ratings by course
exports.getByCourse = async (req, res) => {
  try {
      const { courseId, rating, sort = 'recent', page = 1, limit = 10 } = req.query;

    // Build where clause
    const whereClause = {
      CourseID: courseId,
      Status: 'active',
    };
      if (rating) whereClause.Rating = rating;

    // Build order clause
    let orderClause = [];
    switch (sort) {
      case 'helpful':
        orderClause = [['Helpful', 'DESC']];
        break;
      case 'highest':
          orderClause = [['Rating', 'DESC']];
        break;
      case 'lowest':
          orderClause = [['Rating', 'ASC']];
        break;
      case 'recent':
      default:
        orderClause = [['CreatedAt', 'DESC']];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get ratings with pagination
    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          attributes: ['UserID', 'FirstName', 'LastName', 'Avatar'],
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
    });

    // Get rating statistics
    const stats = await Rating.findAll({
      where: { CourseID: courseId, Status: 'active' },
      attributes: ['Rating', [sequelize.fn('COUNT', sequelize.col('RatingID')), 'count']],
      group: ['Rating'],
    });

    // Format statistics
    const ratingStats = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    stats.forEach(stat => {
      ratingStats[stat.Rating] = parseInt(stat.get('count'));
    });

    const totalRatings = Object.values(ratingStats).reduce((a, b) => a + b, 0);
    const weightedSum = Object.entries(ratingStats).reduce(
      (sum, [score, count]) => sum + parseInt(score) * count,
      0,
    );
    const averageScore = totalRatings > 0 ? weightedSum / totalRatings : 0;

    res.json({
      ratings: ratings,
      statistics: {
        averageScore: parseFloat(averageScore.toFixed(1)),
        totalRatings: totalRatings,
        distributionByScore: ratingStats,
      },
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current_page: parseInt(page),
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update rating
exports.update = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
      const { rating: ratingValue, review } = req.body;

    // Find rating
      const existingRating = await Rating.findByPk(id, { transaction });
      if (!existingRating) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check permission
      if (existingRating.UserID !== req.user.id && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You can only update your own rating',
      });
    }

    // Validate score if provided
      if (ratingValue !== undefined) {
        if (ratingValue < 1 || ratingValue > 5) {
        await transaction.rollback();
        return res.status(400).json({
            message: 'Rating must be between 1 and 5',
        });
      }
    }

    // Update rating
      await existingRating.update(
      {
          Rating: ratingValue !== undefined ? ratingValue : existingRating.Rating,
          Review: review !== undefined ? review : existingRating.Review,
        LastModifiedAt: new Date(),
      },
      { transaction },
    );

    // Create notification for instructor if score changed
      if (ratingValue !== undefined && ratingValue !== existingRating.Rating) {
      await db.Notification.create(
        {
            UserID: (await db.Course.findByPk(existingRating.CourseID)).InstructorID,
          Title: 'Rating Updated',
            Message: `A rating for your course was updated to ${ratingValue} stars`,
          Type: 'rating_update',
            RelatedID: existingRating.RatingID,
        },
        { transaction },
      );
    }

    await transaction.commit();

    // Return updated rating with user info
      const updatedRating = await Rating.findByPk(existingRating.RatingID, {
      include: [
        {
          model: db.User,
            attributes: ['FirstName', 'LastName', 'Avatar'],
        },
      ],
    });

    res.json(updatedRating);
  } catch (error) {
    await transaction.rollback();
    console.error('Update rating error:', error);

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

// Delete rating (soft delete)
exports.delete = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const rating = await Rating.findByPk(id, { transaction });

    if (!rating) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check permission
    if (rating.UserID !== req.user.id && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    // Soft delete by updating status
    await rating.update(
      {
        Status: 'deleted',
        LastModifiedAt: new Date(),
      },
      { transaction },
    );

    // Create notification for instructor
    await db.Notification.create(
      {
        UserID: (await db.Course.findByPk(rating.CourseID)).InstructorID,
        Title: 'Rating Removed',
        Message: `A rating for your course was removed`,
        Type: 'rating_delete',
        RelatedID: rating.RatingID,
      },
      { transaction },
    );

    await transaction.commit();
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete rating error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark rating as helpful
exports.markHelpful = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const rating = await Rating.findByPk(id, { transaction });

    if (!rating) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Increment helpful count
    await rating.increment('Helpful', { transaction });

    await transaction.commit();
    res.json({ message: 'Rating marked as helpful' });
  } catch (error) {
    await transaction.rollback();
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Report rating
exports.reportRating = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rating = await Rating.findByPk(id, { transaction });

    if (!rating) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Increment report count
    await rating.increment('ReportCount', { transaction });

    // If report count exceeds threshold, hide the rating
    if (rating.ReportCount >= 5) {
      await rating.update(
        {
          Status: 'hidden',
          LastModifiedAt: new Date(),
        },
        { transaction },
      );
    }

    // Create notification for admin
    await db.Notification.create(
      {
        UserID: 1, // Assuming admin has ID 1
        Title: 'Rating Reported',
        Message: `A rating has been reported. Reason: ${reason}`,
        Type: 'rating_report',
        RelatedID: rating.RatingID,
      },
      { transaction },
    );

    await transaction.commit();
    res.json({ message: 'Rating reported successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Report rating error:', error);
    res.status(500).json({ message: error.message });
  }
};
