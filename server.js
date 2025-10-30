require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const lessonRoutes = require("./routes/lesson.routes");
const enrollRoutes = require("./routes/enroll.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const quizRoutes = require("./routes/quiz.routes");
const commentRoutes = require("./routes/comment.routes");
const submissionRoutes = require("./routes/submission.routes");
const forumRoutes = require("./routes/forum.routes");
const announcementRoutes = require("./routes/announcement.routes");
const transactionRoutes = require("./routes/transaction.routes");
const fileRoutes = require("./routes/file.routes");
const ratingRoutes = require("./routes/rating.routes");
const certificateRoutes = require("./routes/certificate.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const progressRoutes = require("./routes/progress.routes");
const notificationRoutes = require("./routes/notification.routes");

app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("Website Học Tập - LS Backend"));

const PORT = process.env.PORT || 5000;

// Test DB connection then start server
db.sequelize.authenticate()
  .then(() => {
    console.log("✅ DB connection OK");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
  });
