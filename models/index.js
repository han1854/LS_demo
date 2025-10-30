const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  pool: dbConfig.pool,
  logging: console.log
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import models
db.User = require("./user.model.js")(sequelize, DataTypes);
db.Course = require("./course.model.js")(sequelize, DataTypes);
db.Lesson = require("./lesson.model.js")(sequelize, DataTypes);
db.Enrollment = require("./enrollment.model.js")(sequelize, DataTypes);
db.Assignment = require("./assignment.model.js")(sequelize, DataTypes);
db.Submission = require("./submission.model.js")(sequelize, DataTypes);
db.Quiz = require("./quiz.model.js")(sequelize, DataTypes);
db.Question = require("./question.model.js")(sequelize, DataTypes);
db.Option = require("./option.model.js")(sequelize, DataTypes);
db.Result = require("./result.model.js")(sequelize, DataTypes);
db.Comment = require("./comment.model.js")(sequelize, DataTypes);
db.Transaction = require("./transaction.model.js")(sequelize, DataTypes);
db.RevenueShare = require("./revenueShare.model.js")(sequelize, DataTypes);
db.ForumPost = require("./forumPost.model.js")(sequelize, DataTypes);
db.Announcement = require("./announcement.model.js")(sequelize, DataTypes);
db.File = require("./file.model.js")(sequelize, DataTypes);

// associations (with aliases)
db.User.hasMany(db.Course, { foreignKey: "InstructorID", as: "courses" });
db.Course.belongsTo(db.User, { foreignKey: "InstructorID", as: "instructor" });

db.Course.hasMany(db.Lesson, { foreignKey: "CourseID", as: "lessons" });
db.Lesson.belongsTo(db.Course, { foreignKey: "CourseID", as: "course" });

db.User.belongsToMany(db.Course, {
  through: db.Enrollment,
  foreignKey: "UserID",
  otherKey: "CourseID",
  as: "enrolledCourses"
});
db.Course.belongsToMany(db.User, {
  through: db.Enrollment,
  foreignKey: "CourseID",
  otherKey: "UserID",
  as: "students"
});

db.Lesson.hasMany(db.Assignment, { foreignKey: "LessonID", as: "assignments" });
db.Assignment.belongsTo(db.Lesson, { foreignKey: "LessonID", as: "lesson" });

db.Lesson.hasMany(db.Quiz, { foreignKey: "LessonID", as: "quizzes" });
db.Quiz.belongsTo(db.Lesson, { foreignKey: "LessonID", as: "lesson" });

db.Assignment.hasMany(db.Submission, { foreignKey: "AssignmentID", as: "submissions" });
db.Submission.belongsTo(db.Assignment, { foreignKey: "AssignmentID", as: "assignment" });

db.Quiz.hasMany(db.Question, { foreignKey: "QuizID", as: "questions" });
db.Question.belongsTo(db.Quiz, { foreignKey: "QuizID", as: "quiz" });

db.Question.hasMany(db.Option, { foreignKey: "QuestionID", as: "options" });
db.Option.belongsTo(db.Question, { foreignKey: "QuestionID", as: "question" });

db.Quiz.hasMany(db.Result, { foreignKey: "QuizID", as: "results" });
db.Result.belongsTo(db.Quiz, { foreignKey: "QuizID", as: "quiz" });

db.User.hasMany(db.Comment, { foreignKey: "UserID", as: "comments" });
db.Course.hasMany(db.Comment, { foreignKey: "CourseID", as: "courseComments" });
db.Lesson.hasMany(db.Comment, { foreignKey: "LessonID", as: "lessonComments" });

db.Lesson.hasMany(db.File, { foreignKey: "LessonID", as: "files" });
db.File.belongsTo(db.Lesson, { foreignKey: "LessonID", as: "lesson" });

db.User.hasMany(db.File, { foreignKey: "UploadedBy", as: "uploadedFiles" });
db.File.belongsTo(db.User, { foreignKey: "UploadedBy", as: "uploader" });

module.exports = db;