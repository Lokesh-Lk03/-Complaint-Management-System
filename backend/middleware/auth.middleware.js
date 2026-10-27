const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'supersecret_uni_erp_key_2026';
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // { id, role, dept }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'User role is not authorized to access this route' });
        }
        next();
    };
};

module.exports = { protect, authorize };
