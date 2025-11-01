const db = require('../models');
const Quiz = db.Quiz;
const { Op, sequelize } = require('sequelize');

// Helper function to calculate quiz score
const calculateQuizScore = async (quizId, answers, transaction) => {
  const quiz = await Quiz.findByPk(quizId, {
    include: [
      {
        model: db.Question,
        as: 'questions',
        include: [
          {
            model: db.Option,
            as: 'options',
          },
        ],
      },
    ],
    transaction,
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  let totalPoints = 0;
  let earnedPoints = 0;
  const questionResults = [];

  for (const question of quiz.questions) {
    totalPoints += question.Points;
    const questionAnswer = answers.find(a => a.QuestionID === question.QuestionID);

    if (!questionAnswer && question.IsRequired) {
      throw new Error(`Question ${question.QuestionID} is required`);
    }

    let questionScore = 0;
    const questionResult = {
      QuestionID: question.QuestionID,
      selectedOptions: [],
      isCorrect: false,
      score: 0,
    };

    if (questionAnswer) {
      const selectedOptionIds = Array.isArray(questionAnswer.SelectedOptions)
        ? questionAnswer.SelectedOptions
        : [questionAnswer.SelectedOptions];

      questionResult.selectedOptions = selectedOptionIds;

      // Validate all selected options belong to this question
      const validOptionIds = question.options.map(o => o.OptionID);
      const invalidOptions = selectedOptionIds.filter(id => !validOptionIds.includes(id));
      if (invalidOptions.length > 0) {
        throw new Error(`Invalid options selected for question ${question.QuestionID}`);
      }

      switch (question.QuestionType) {
        case 'single':
          if (selectedOptionIds.length !== 1) {
            throw new Error(`Question ${question.QuestionID} requires exactly one answer`);
          }
          const selectedOption = question.options.find(o => o.OptionID === selectedOptionIds[0]);
          if (selectedOption.IsCorrect) {
            questionScore = question.Points;
            questionResult.isCorrect = true;
          }
          break;

        case 'multiple':
          const correctOptions = question.options.filter(o => o.IsCorrect);
          const selectedCorrect = selectedOptionIds.every(id =>
            question.options.find(o => o.OptionID === id && o.IsCorrect),
          );
          const allCorrectSelected = correctOptions.every(o =>
            selectedOptionIds.includes(o.OptionID),
          );
          if (selectedCorrect && allCorrectSelected) {
            questionScore = question.Points;
            questionResult.isCorrect = true;
          }
          break;

        case 'points':
          questionScore = selectedOptionIds.reduce((score, optId) => {
            const option = question.options.find(o => o.OptionID === optId);
            return score + (option ? option.Points : 0);
          }, 0);
          questionResult.isCorrect = questionScore > 0;
          break;

        default:
          throw new Error(`Unsupported question type: ${question.QuestionType}`);
      }
    }

    questionResult.score = questionScore;
    questionResults.push(questionResult);
    earnedPoints += questionScore;
  }

  const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return {
    score: finalScore,
    earnedPoints,
    totalPoints,
    questionResults,
  };
};

exports.submitQuiz = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const quizId = req.params.id;
    const userId = req.user.UserID;
    const { answers } = req.body;

    // Validate quiz exists and is published
    const quiz = await Quiz.findByPk(quizId, {
      transaction,
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
    });

    if (!quiz) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.IsPublished) {
      await transaction.rollback();
      return res.status(403).json({ message: 'This quiz is not available' });
    }

    // Check course enrollment
    const enrollment = await db.Enrollment.findOne({
      where: {
        UserID: userId,
        CourseID: quiz.lesson.course.CourseID,
        Status: 'active',
      },
      transaction,
    });

    if (!enrollment) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You must be enrolled in the course to take this quiz',
      });
    }

    // Check attempt limits
    const attemptCount = await db.Result.count({
      where: { QuizID: quizId, UserID: userId },
    });

    if (quiz.AttemptsAllowed !== 0 && attemptCount >= quiz.AttemptsAllowed) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You have reached the maximum number of attempts for this quiz',
      });
    }

    // Calculate score
    const result = await calculateQuizScore(quizId, answers, transaction);

    // Create quiz result
    const quizResult = await db.Result.create(
      {
        QuizID: quizId,
        UserID: userId,
        Score: result.score,
        TimeTaken: req.body.timeTaken,
        AttemptDate: new Date(),
        Details: result.questionResults,
      },
      { transaction },
    );

    // Update progress if passed
    if (result.score >= quiz.PassingScore) {
      await db.Progress.findOrCreate({
        where: {
          UserID: userId,
          LessonID: quiz.LessonID,
        },
        defaults: {
          Status: 'completed',
          Progress: 100,
        },
        transaction,
      });

      // Check if all lesson items are completed
      const lessonProgress = await db.Progress.findAll({
        where: {
          UserID: userId,
          LessonID: quiz.LessonID,
        },
        transaction,
      });

      if (lessonProgress.every(p => p.Status === 'completed')) {
        // Update enrollment progress
        const totalLessons = await db.Lesson.count({
          where: { CourseID: quiz.lesson.course.CourseID },
        });
        const completedLessons = await db.Progress.count({
          where: {
            UserID: userId,
            Status: 'completed',
            LessonID: {
              [Op.in]: sequelize.literal(
                `SELECT LessonID FROM Lessons WHERE CourseID = ${quiz.lesson.course.CourseID}`,
              ),
            },
          },
        });

        const courseProgress = (completedLessons / totalLessons) * 100;
        await enrollment.update(
          {
            Progress: courseProgress,
          },
          { transaction },
        );
      }
    }

    await transaction.commit();

    res.json({
      resultId: quizResult.ResultID,
      score: result.score,
      earnedPoints: result.earnedPoints,
      totalPoints: result.totalPoints,
      passed: result.score >= quiz.PassingScore,
      questionResults: result.questionResults,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Submit quiz error:', error);

    if (
      error.message.includes('required') ||
      error.message.includes('Invalid options') ||
      error.message.includes('exactly one answer')
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.getQuizResult = async (req, res) => {
  try {
    const resultId = req.params.resultId;
    const userId = req.user.UserID;

    const result = await db.Result.findByPk(resultId, {
      include: [
        {
          model: db.Quiz,
          as: 'quiz',
          include: [
            {
              model: db.Question,
              as: 'questions',
              include: [
                {
                  model: db.Option,
                  as: 'options',
                },
              ],
            },
          ],
        },
      ],
    });

    if (!result) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }

    // Check if user owns this result or is the instructor
    if (result.UserID !== userId && result.quiz.lesson.course.InstructorID !== userId) {
      return res.status(403).json({
        message: "You don't have permission to view this result",
      });
    }

    const response = {
      resultId: result.ResultID,
      quizId: result.QuizID,
      score: result.Score,
      timeTaken: result.TimeTaken,
      attemptDate: result.AttemptDate,
      passed: result.Score >= result.quiz.PassingScore,
      questions: result.quiz.questions.map(q => ({
        questionId: q.QuestionID,
        text: q.QuestionText,
        type: q.QuestionType,
        points: q.Points,
        explanation: q.ExplanationText,
        options: o.options.map(o => ({
          optionId: o.OptionID,
          text: o.Text,
          isCorrect: o.IsCorrect,
          explanation: o.ExplanationText,
          score: o.Points,
        })),
        result: result.Details.find(d => d.QuestionID === q.QuestionID),
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Get quiz result error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      LessonID,
      Title,
      Description,
      Duration,
      PassingScore,
      AttemptsAllowed,
      ShuffleQuestions,
      ShowAnswers,
      questions, // Array of question objects
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
      transaction,
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
        message: 'You must be the course instructor to create quizzes',
      });
    }

    // Create quiz
    const quiz = await Quiz.create(
      {
        LessonID,
        Title,
        Description,
        Duration,
        PassingScore,
        AttemptsAllowed,
        ShuffleQuestions,
        ShowAnswers,
        Status: 'draft',
      },
      { transaction },
    );

    // Create questions and options if provided
    if (questions && Array.isArray(questions)) {
      for (const [index, q] of questions.entries()) {
        const question = await db.Question.create(
          {
            QuizID: quiz.QuizID,
            QuestionType: q.type,
            QuestionText: q.text,
            ExplanationText: q.explanation,
            Points: q.points,
            OrderIndex: index,
            IsRequired: q.isRequired !== false,
            ImageURL: q.imageUrl,
            Status: 'active',
          },
          { transaction },
        );

        if (q.options && Array.isArray(q.options)) {
          await Promise.all(
            q.options.map((opt, optIndex) =>
              db.Option.create(
                {
                  QuestionID: question.QuestionID,
                  Text: opt.text,
                  IsCorrect: opt.isCorrect || false,
                  ExplanationText: opt.explanation,
                  OrderIndex: optIndex,
                  ImageURL: opt.imageUrl,
                  Points: opt.score || 0,
                  Status: 'active',
                },
                { transaction },
              ),
            ),
          );
        }
      }
    }

    await transaction.commit();

    // Return created quiz with related data
    const createdQuiz = await Quiz.findByPk(quiz.QuizID, {
      include: [
        {
          model: db.Question,
          as: 'questions',
          include: ['options'],
        },
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
    });

    res.status(201).json(createdQuiz);
  } catch (error) {
    await transaction.rollback();
    console.error('Create quiz error:', error);

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
      search,
      sort_by,
      order = 'asc',
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

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get quizzes with pagination
    const { count, rows: quizzes } = await Quiz.findAndCountAll({
      where: whereClause,
      include: [
        lessonInclude,
        {
          model: db.Question,
          as: 'questions',
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('QuestionID')), 'questionCount'],
            [sequelize.fn('SUM', sequelize.col('Points')), 'totalPoints'],
          ],
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
      group: ['QuizID'],
    });

    // Get statistics for each quiz
    for (const quiz of quizzes) {
      // Get attempt statistics
      const attemptStats = await db.Result.findAll({
        where: { QuizID: quiz.QuizID },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('ResultID')), 'attemptCount'],
          [sequelize.fn('AVG', sequelize.col('Score')), 'averageScore'],
          [sequelize.fn('MAX', sequelize.col('Score')), 'highestScore'],
          [sequelize.fn('MIN', sequelize.col('Score')), 'lowestScore'],
          [
            sequelize.literal(`SUM(CASE WHEN Score >= ${quiz.PassingScore} THEN 1 ELSE 0 END)`),
            'passCount',
          ],
        ],
        group: ['QuizID'],
      });

      if (attemptStats.length > 0) {
        const stats = attemptStats[0].get();
        quiz.setDataValue('statistics', {
          totalAttempts: parseInt(stats.attemptCount) || 0,
          averageScore: parseFloat(stats.averageScore) || 0,
          highestScore: parseFloat(stats.highestScore) || 0,
          lowestScore: parseFloat(stats.lowestScore) || 0,
          passRate:
            stats.attemptCount > 0
              ? (parseInt(stats.passCount) / parseInt(stats.attemptCount)) * 100
              : 0,
        });
      } else {
        quiz.setDataValue('statistics', {
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
        });
      }
    }

    res.json({
      quizzes: quizzes,
      pagination: {
        total: count.length,
        pages: Math.ceil(count.length / limit),
        current_page: parseInt(page),
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Find quizzes error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user?.UserID; // Get authenticated user if available

    // Get quiz with related data
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
        {
          model: db.Question,
          as: 'questions',
          include: [
            {
              model: db.Option,
              as: 'options',
              attributes: userId
                ? ['OptionID', 'Text', 'IsImage']
                : ['OptionID', 'Text', 'IsImage', 'IsCorrect', 'Points'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get quiz statistics
    const statistics = await db.Result.findAll({
      where: { QuizID: quizId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('ResultID')), 'attemptCount'],
        [sequelize.fn('AVG', sequelize.col('Score')), 'averageScore'],
        [sequelize.fn('MAX', sequelize.col('Score')), 'highestScore'],
        [sequelize.fn('MIN', sequelize.col('Score')), 'lowestScore'],
        [
          sequelize.literal(`SUM(CASE WHEN Score >= ${quiz.PassingScore} THEN 1 ELSE 0 END)`),
          'passCount',
        ],
      ],
    });

    // Get user's attempt history if authenticated
    let userAttempts = null;
    if (userId) {
      userAttempts = await db.Result.findAll({
        where: { QuizID: quizId, UserID: userId },
        order: [['AttemptDate', 'DESC']],
        attributes: [
          'ResultID',
          'Score',
          'AttemptDate',
          'TimeTaken',
          [
            sequelize.literal(`CASE WHEN Score >= ${quiz.PassingScore} THEN 1 ELSE 0 END`),
            'isPassed',
          ],
        ],
      });
    }

    // Format response
    const response = {
      ...quiz.toJSON(),
      statistics: {
        totalAttempts: parseInt(statistics[0].get('attemptCount')) || 0,
        averageScore: parseFloat(statistics[0].get('averageScore')) || 0,
        highestScore: parseFloat(statistics[0].get('highestScore')) || 0,
        lowestScore: parseFloat(statistics[0].get('lowestScore')) || 0,
        passRate:
          statistics[0].get('attemptCount') > 0
            ? (parseInt(statistics[0].get('passCount')) /
                parseInt(statistics[0].get('attemptCount'))) *
              100
            : 0,
      },
    };

    if (userAttempts) {
      response.userAttempts = userAttempts;
      response.canAttempt =
        quiz.MaxAttempts === 0 ||
        userAttempts.length < quiz.MaxAttempts ||
        userAttempts.some(attempt => attempt.get('isPassed'));
    }

    // If quiz is not published and user is not instructor, restrict access
    if (!quiz.IsPublished && (!req.user || req.user.Role !== 'instructor')) {
      return res.status(403).json({ message: 'This quiz is not yet published' });
    }

    res.json(response);
  } catch (error) {
    console.error('Find quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const quizId = req.params.id;
    const {
      Title,
      Description,
      Duration,
      PassingScore,
      AttemptsAllowed,
      ShuffleQuestions,
      ShowAnswers,
      Status,
      questions,
    } = req.body;

    // Find quiz with lesson and course info for permission check
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: [
            {
              model: db.Course,
              as: 'course',
            },
          ],
        },
      ],
      transaction,
    });

    if (!quiz) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the course instructor
    if (quiz.lesson.course.InstructorID !== req.user.UserID) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'Only the course instructor can update this quiz',
      });
    }

    // Check if quiz has any attempts before allowing certain updates
    const hasAttempts = await db.Result.count({
      where: { QuizID: quizId },
    });

    if (hasAttempts > 0 && Status === 'published') {
      const restrictedFields = ['Duration', 'PassingScore', 'AttemptsAllowed'];
      const attemptedUpdate = restrictedFields.some(
        field => req.body[field] !== undefined && req.body[field] !== quiz[field],
      );

      if (attemptedUpdate) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Cannot modify quiz settings after attempts have been made',
        });
      }
    }

    // Update quiz
    await quiz.update(
      {
        Title,
        Description,
        Duration,
        PassingScore,
        AttemptsAllowed,
        ShuffleQuestions,
        ShowAnswers,
        Status,
      },
      { transaction },
    );

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Handle question updates/creation
      for (const [index, q] of questions.entries()) {
        if (q.QuestionID) {
          // Update existing question
          const question = await db.Question.findByPk(q.QuestionID, { transaction });
          if (question && question.QuizID === parseInt(quizId)) {
            await question.update(
              {
                QuestionType: q.type,
                QuestionText: q.text,
                ExplanationText: q.explanation,
                Points: q.points,
                OrderIndex: index,
                IsRequired: q.isRequired !== false,
                ImageURL: q.imageUrl,
                Status: q.status || 'active',
              },
              { transaction },
            );

            // Update options
            if (q.options && Array.isArray(q.options)) {
              // Delete removed options
              await db.Option.destroy({
                where: {
                  QuestionID: question.QuestionID,
                  OptionID: {
                    [Op.notIn]: q.options.filter(opt => opt.OptionID).map(opt => opt.OptionID),
                  },
                },
                transaction,
              });

              // Update/create options
              for (const [optIndex, opt] of q.options.entries()) {
                if (opt.OptionID) {
                  await db.Option.update(
                    {
                      Text: opt.text,
                      IsCorrect: opt.isCorrect || false,
                      ExplanationText: opt.explanation,
                      OrderIndex: optIndex,
                      ImageURL: opt.imageUrl,
                      Points: opt.score || 0,
                      Status: opt.status || 'active',
                    },
                    {
                      where: {
                        OptionID: opt.OptionID,
                        QuestionID: question.QuestionID,
                      },
                      transaction,
                    },
                  );
                } else {
                  await db.Option.create(
                    {
                      QuestionID: question.QuestionID,
                      Text: opt.text,
                      IsCorrect: opt.isCorrect || false,
                      ExplanationText: opt.explanation,
                      OrderIndex: optIndex,
                      ImageURL: opt.imageUrl,
                      Points: opt.score || 0,
                      Status: 'active',
                    },
                    { transaction },
                  );
                }
              }
            }
          }
        } else {
          // Create new question
          const question = await db.Question.create(
            {
              QuizID: quizId,
              QuestionType: q.type,
              QuestionText: q.text,
              ExplanationText: q.explanation,
              Points: q.points,
              OrderIndex: index,
              IsRequired: q.isRequired !== false,
              ImageURL: q.imageUrl,
              Status: 'active',
            },
            { transaction },
          );

          // Create options for new question
          if (q.options && Array.isArray(q.options)) {
            await Promise.all(
              q.options.map((opt, optIndex) =>
                db.Option.create(
                  {
                    QuestionID: question.QuestionID,
                    Text: opt.text,
                    IsCorrect: opt.isCorrect || false,
                    ExplanationText: opt.explanation,
                    OrderIndex: optIndex,
                    ImageURL: opt.imageUrl,
                    Points: opt.score || 0,
                    Status: 'active',
                  },
                  { transaction },
                ),
              ),
            );
          }
        }
      }

      // Remove questions not included in the update
      const questionIds = questions.filter(q => q.QuestionID).map(q => q.QuestionID);

      await db.Question.update(
        { Status: 'deleted' },
        {
          where: {
            QuizID: quizId,
            QuestionID: {
              [Op.notIn]: questionIds,
            },
          },
          transaction,
        },
      );
    }

    await transaction.commit();

    // Fetch updated quiz with all related data
    const updatedQuiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: db.Question,
          as: 'questions',
          where: { Status: 'active' },
          include: [
            {
              model: db.Option,
              as: 'options',
              where: { Status: 'active' },
            },
          ],
        },
        {
          model: db.Lesson,
          as: 'lesson',
          include: ['course'],
        },
      ],
    });

    res.json(updatedQuiz);
  } catch (error) {
    await transaction.rollback();
    console.error('Update quiz error:', error);

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
    const quizId = req.params.id;

    // Find quiz with lesson and course info for permission check
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: db.Lesson,
          as: 'lesson',
          include: [
            {
              model: db.Course,
              as: 'course',
            },
          ],
        },
      ],
      transaction,
    });

    if (!quiz) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the course instructor
    if (quiz.lesson.course.InstructorID !== req.user.UserID) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'Only the course instructor can delete this quiz',
      });
    }

    // Check if quiz has any attempts
    const hasAttempts = await db.Result.count({
      where: { QuizID: quizId },
    });

    if (hasAttempts > 0) {
      // Soft delete if quiz has attempts
      await quiz.update({ Status: 'deleted' }, { transaction });

      // Also soft delete related questions
      await db.Question.update(
        { Status: 'deleted' },
        {
          where: { QuizID: quizId },
          transaction,
        },
      );

      // And their options
      await db.Option.update(
        { Status: 'deleted' },
        {
          where: {
            QuestionID: {
              [Op.in]: sequelize.literal(
                `SELECT QuestionID FROM Questions WHERE QuizID = ${quizId}`,
              ),
            },
          },
          transaction,
        },
      );
    } else {
      // Hard delete if no attempts
      await quiz.destroy({ transaction });

      // This will cascade delete questions and options
    }

    await transaction.commit();

    res.json({
      message: hasAttempts
        ? 'Quiz has been archived successfully'
        : 'Quiz has been deleted successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};
