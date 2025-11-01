const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = db.User;

// JWT Secret Key - Đặt trong biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Helper to build user response object: exclude password and add FullName fallback
function buildUserResponse(userInstance) {
  const u = userInstance.toJSON ? userInstance.toJSON() : { ...userInstance };
  delete u.Password;
  // Compute FullName: prefer FirstName + ' ' + LastName when available, otherwise Username
  const first = u.FirstName || u.firstName || '';
  const last = u.LastName || u.lastName || '';
  const full = `${first} ${last}`.trim();
  u.FullName = full || u.Username || u.username || '';
  return u;
}

// Login (by Username or Email)
exports.login = async (req, res) => {
  try {
    const { Username, Email, Password } = req.body;

    // Validate input: require either Username or Email, and Password
    if ((!Username && !Email) || !Password) {
      return res.status(400).json({ message: 'Username or Email and Password are required' });
    }

    // Find user by username or email
    const where = Username ? { Username } : { Email };
    const user = await User.findOne({ where });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(Password, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        role: user.Role,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    // Return user info and token (without password) and with FullName
    const userResponse = buildUserResponse(user);
    res.json({
      ...userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new user (registration) - only require Username and Password
exports.create = async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      Username,
      Email,
      Password,
      Role,
      Avatar,
      Bio,
      PhoneNumber,
      Address,
    } = req.body;

    // Basic validation: only Username and Password are required for registration
    if (!Username || !Password) {
      return res.status(400).json({ message: 'Username and Password are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create user with provided fields; FirstName/LastName/Email are optional now
    const user = await User.create({
      FirstName: FirstName || null,
      LastName: LastName || null,
      Username,
      Email: Email || null,
      Password: hashedPassword,
      Role: Role || 'student',
      Status: 'active',
      Avatar: Avatar || null,
      Bio: Bio || null,
      PhoneNumber: PhoneNumber || null,
      Address: Address || null,
    });

    // Don't send password in response
    const userResponse = buildUserResponse(user);
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Determine which field caused unique constraint
      const field = error.errors && error.errors[0] && error.errors[0].path;
      const message = field === 'Username' ? 'Username already exists' : field === 'Email' ? 'Email already exists' : 'Unique constraint error';
      return res.status(400).json({ message });
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

// Get all users
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['Password'] },
    });
    // attach FullName for each user
    const mapped = users.map(u => buildUserResponse(u));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by id
exports.findOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['Password'] },
    });
    if (user) {
      res.json(buildUserResponse(user));
    } else {
      res.status(404).json({ message: 'User not found' });
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
      // Hash the new password and store it in the Password field
      updateData.Password = await bcrypt.hash(updateData.Password, 10);
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.UserID;
    delete updateData.CreatedAt;

    // Validate status if it's being updated
    if (updateData.Status && !['active', 'inactive', 'banned'].includes(updateData.Status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [updated] = await User.update(updateData, {
      where: { UserID: req.params.id },
      returning: true,
      validate: true,
    });

    if (updated === 1) {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['Password'] },
      });
      res.json(buildUserResponse(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
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

// Delete user
exports.delete = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { UserID: req.params.id },
    });

    if (deleted) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
