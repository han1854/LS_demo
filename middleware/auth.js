const jwt = require('jsonwebtoken');
const JWT_SECRET = "your-secret-key";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware để kiểm tra role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "You don't have permission to perform this action" 
            });
        }
        next();
    };
};

module.exports = {
    authMiddleware,
    checkRole
};