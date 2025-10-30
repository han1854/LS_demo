require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const db = require("./models");
const {
    limiter,
    apiLimiter,
    authLimiter,
    helmetConfig,
    corsOptions,
    validateTokenFormat,
    apiSecurity
} = require('./middleware/security');

const app = express();

// Secure cookie settings
app.use(cookieParser());
app.set('trust proxy', 1); // Trust first proxy
app.use((req, res, next) => {
    res.cookie('sessionId', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    next();
});

// Global Security Middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(limiter); // Rate limiting cho toàn bộ server

// Body Parser với giới hạn kích thước
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// API Security cho tất cả route /api
app.use('/api', apiSecurity);

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

// Auth routes với rate limiting riêng
app.use("/api/auth", authLimiter);

// API routes với security middleware
app.use("/api/users", (req, res, next) => {
    // Bypass token validation for register and login routes
    if (req.path === '/register' || req.path === '/login') {
        return next();
    }
    validateTokenFormat(req, res, next);
}, apiLimiter, userRoutes);

app.use("/api/courses", validateTokenFormat, apiLimiter, courseRoutes);
app.use("/api/lessons", validateTokenFormat, apiLimiter, lessonRoutes);
app.use("/api/enrollments", validateTokenFormat, apiLimiter, enrollRoutes);
app.use("/api/assignments", validateTokenFormat, apiLimiter, assignmentRoutes);
app.use("/api/submissions", validateTokenFormat, apiLimiter, submissionRoutes);
app.use("/api/quizzes", validateTokenFormat, apiLimiter, quizRoutes);
app.use("/api/comments", validateTokenFormat, apiLimiter, commentRoutes);
app.use("/api/forum", validateTokenFormat, apiLimiter, forumRoutes);
app.use("/api/announcements", validateTokenFormat, apiLimiter, announcementRoutes);
app.use("/api/transactions", validateTokenFormat, apiLimiter, transactionRoutes);
app.use("/api/files", validateTokenFormat, apiLimiter, fileRoutes);
app.use("/api/ratings", validateTokenFormat, apiLimiter, ratingRoutes);
app.use("/api/certificates", validateTokenFormat, apiLimiter, certificateRoutes);
app.use("/api/schedules", validateTokenFormat, apiLimiter, scheduleRoutes);
app.use("/api/progress", validateTokenFormat, apiLimiter, progressRoutes);
app.use("/api/notifications", validateTokenFormat, apiLimiter, notificationRoutes);

// Error Handling Middleware
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const errorResponse = {
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? (statusCode === 500 ? 'Internal server error' : err.message)
            : err.message
    };

    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
        console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        });
    }

    res.status(statusCode).json(errorResponse);
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Root route với security headers
app.get("/", (req, res) => {
    res.set({
        'Content-Security-Policy': "default-src 'self'",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
    });
    res.send("Website Học Tập - LS Backend")});

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.sequelize.close().then(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});

// Unhandled promise rejections and uncaught exceptions
const handleUnexpectedError = (err) => {
    console.error('Unexpected Error:', err && err.stack ? err.stack : err);
    // In non-production, exit to allow process manager to restart and avoid undefined state
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
};

process.on('unhandledRejection', handleUnexpectedError);
process.on('uncaughtException', handleUnexpectedError);

// Set security timeout
setTimeout(() => {
    console.error('Security timeout - Server shutting down...');
    process.exit(1);
}, 24 * 60 * 60 * 1000); // 24 hours

// Test DB connection, sync models, then start server
let server;
db.sequelize.authenticate()
    .then(() => {
        console.log("✅ DB connection OK");
        // Sync all models without altering tables
        return db.sequelize.sync({ force: false });
    })
    .then(() => {
        console.log("✅ Database synchronized");
        server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            if (process.env.NODE_ENV === 'production') {
                console.log('🔒 Running in production mode with security measures enabled');
            }
        });
    })
    .catch(err => {
        console.error("❌ Database error:", err);
        process.exit(1);
    });