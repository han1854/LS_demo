const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const db = require('../models');
const Course = db.Course;
const Category = db.Category;
const User = db.User;

// Attach common locals for views (current user and current path)
router.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.currentPath = req.path || '';
    next();
});

// Auth routes
router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Public routes
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({ where: { Status: 'active' } });
        const courses = await Course.findAll({ 
            where: { Status: 'published' }, 
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'instructor' }
            ], 
            limit: 8, 
            order: [['CreatedAt', 'DESC']] 
        });
        console.log('Categories:', categories); // Debug log
        console.log('Courses:', JSON.stringify(courses, null, 2)); // Debug log
        res.render('index', { 
            categories, 
            featuredCourses: courses, 
            currentUser: req.user || null, 
            currentPath: req.path 
        });
    } catch (err) {
        console.error('Error rendering index view:', err);
        console.error(err.stack); // Log full error stack
        res.render('index', { 
            categories: [], 
            featuredCourses: [], 
            currentUser: req.user || null, 
            currentPath: req.path 
        });
    }
});

router.get('/catalog', async (req, res) => {
    try {
        const categories = await Category.findAll({ where: { status: 'active' } });
        let whereClause = { status: 'published' };
        if (req.query.category) {
            whereClause.categoryId = req.query.category;
        }
        const courses = await Course.findAll({ 
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'instructor' }
            ],
            order: [['createdAt', 'DESC']]
        });
        console.log('Categories:', categories); // Debug log
        console.log('Courses:', JSON.stringify(courses, null, 2)); // Debug log
        const selectedCategory = req.query.category || null;
        res.render('course/catalog', { 
            categories, 
            courses, 
            selectedCategory, 
            currentUser: req.user || null, 
            currentPath: req.path 
        });
    } catch (err) {
        console.error('Error rendering catalog view:', err);
        console.error(err.stack); // Log full error stack
        res.render('course/catalog', { 
            categories: [], 
            courses: [], 
            selectedCategory: null, 
            currentUser: req.user || null, 
            currentPath: req.path 
        });
    }
});

// Support legacy /courses URL and render the same catalog view
router.get('/courses', async (req, res) => {
    try {
        const categories = await Category.findAll({ where: { status: 'active' } });
        let whereClause = { status: 'published' };
        if (req.query.category) {
            whereClause.categoryId = req.query.category;
        }
        const courses = await Course.findAll({ 
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'instructor' }
            ],
            order: [['createdAt', 'DESC']]
        });
        console.log('Categories:', categories); // Debug log
        console.log('Courses:', JSON.stringify(courses, null, 2)); // Debug log
        const selectedCategory = req.query.category || null;
        res.render('course/catalog', { 
            categories, 
            courses, 
            selectedCategory, 
            currentUser: req.user || null, 
            currentPath: req.path 
        });
    } catch (err) {
        console.error('Error rendering courses view:', err);
        console.error(err.stack); // Log full error stack
        res.render('course/catalog', { 
            categories: [], 
            courses: [], 
            selectedCategory: null, 
            currentUser: req.user || null, 
            currentPath: req.path 
        });
    }
});

router.get('/course/:id', async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, { include: ['lessons', 'category', 'instructor', 'ratings'] });
        if (!course) return res.status(404).render('404', { message: 'Course not found', currentUser: req.user || null, currentPath: req.path });
        res.render('course/details', { course, currentUser: req.user || null, currentPath: req.path });
    } catch (err) {
        console.error('Error rendering course details:', err);
        res.status(500).render('course/details', { course: null, error: err.message, currentUser: req.user || null, currentPath: req.path });
    }
});

// Protected routes
router.get('/learn/:courseId', authMiddleware, (req, res) => {
    res.render('course/learn', { courseId: req.params.courseId });
});

// Instructor routes
router.get('/instructor/dashboard', authMiddleware, (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('instructor/dashboard');
});

router.get('/instructor/courses', authMiddleware, (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('instructor/courses');
});

router.get('/instructor/lessons/:courseId', authMiddleware, (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('instructor/lessons', { courseId: req.params.courseId });
});

router.get('/instructor/students', authMiddleware, (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('instructor/students');
});

router.get('/instructor/profile', authMiddleware, (req, res) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('instructor/profile');
});

// Student routes
router.get('/student/dashboard', authMiddleware, (req, res) => {
    if (req.user.role !== 'student') {
        return res.redirect('/login');
    }
    res.render('student/dashboard');
});

router.get('/student/courses', authMiddleware, (req, res) => {
    if (req.user.role !== 'student') {
        return res.redirect('/login');
    }
    res.render('student/courses');
});

router.get('/student/profile', authMiddleware, (req, res) => {
    if (req.user.role !== 'student') {
        return res.redirect('/login');
    }
    res.render('student/profile');
});

// Admin routes 
router.get('/admin/dashboard', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('admin/dashboard');
});

router.get('/admin/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('admin/users');
});

router.get('/admin/categories', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('admin/categories');
});

module.exports = router;