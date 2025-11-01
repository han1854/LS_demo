const { authMiddleware, checkRole } = require('./auth');

const authJwt = {
  verifyToken: authMiddleware,
  isAdmin: checkRole('admin'),
  isInstructor: checkRole('instructor'),
  isStudent: checkRole('student'),
};

module.exports = { authJwt };
