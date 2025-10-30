const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = db.User;

// JWT Secret Key - Trong thực tế nên đặt trong biến môi trường
const JWT_SECRET = "your-secret-key";

// Login
exports.login = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        
        // Validate input
        if (!Email || !Password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        // Find user by email
        const user = await User.findOne({ where: { Email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(Password, user.PasswordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.UserID,
                email: user.Email,
                role: user.Role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info and token
        const userResponse = user.toJSON();
        delete userResponse.PasswordHash;
        
        res.json({
            ...userResponse,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new user
exports.create = async (req, res) => {
    try {
        const { 
            FullName, 
            Email, 
            Password, 
            Role,
            Avatar,
            Bio,
            PhoneNumber,
            Address 
        } = req.body;
        
        // Basic validation
        if (!FullName || !Email || !Password) {
            return res.status(400).json({ 
                message: "FullName, Email and Password are required" 
            });
        }

        // Hash password
        const PasswordHash = await bcrypt.hash(Password, 10);

        // Create user with optional fields
        const user = await User.create({
            FullName,
            Email,
            PasswordHash,
            Role: Role || 'student',
            Status: 'active',
            Avatar: Avatar || null,
            Bio: Bio || null,
            PhoneNumber: PhoneNumber || null,
            Address: Address || null
        });
        
        // Don't send password hash in response
        const userResponse = user.toJSON();
        delete userResponse.PasswordHash;
        
        res.status(201).json(userResponse);
    } catch (error) {
        console.error("Error creating user:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get all users
exports.findAll = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['PasswordHash'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by id
exports.findOne = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['PasswordHash'] }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user
exports.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Handle password update separately
        if (updateData.Password) {
            updateData.PasswordHash = await bcrypt.hash(updateData.Password, 10);
            delete updateData.Password;
        }

        // Remove fields that shouldn't be updated directly
        delete updateData.UserID;
        delete updateData.CreatedAt;

        // Validate status if it's being updated
        if (updateData.Status && !['active', 'inactive', 'banned'].includes(updateData.Status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const [updated] = await User.update(updateData, {
            where: { UserID: req.params.id },
            returning: true,
            validate: true
        });

        if (updated === 1) {
            const user = await User.findByPk(req.params.id, {
                attributes: { exclude: ['PasswordHash'] }
            });
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete user
exports.delete = async (req, res) => {
    try {
        const deleted = await User.destroy({
            where: { UserID: req.params.id }
        });

        if (deleted) {
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};