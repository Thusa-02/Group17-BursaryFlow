const jwt = require('jsonwebtoken');
const User = require('../module1/users/user.model');
const { normalizeRole } = require('../config/constants');

/**
 * Authentication Middleware
 * Validates JWT from Authorization header and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    // Find user in database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
    }

    // Normalize role to canonical format
    const canonicalRole = normalizeRole(user.role);

    // Attach user to request object
    req.user = {
      _id: user._id,
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: canonicalRole,
      rawUser: user
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please login again.'
      });
    }
    next(error);
  }
};

module.exports = {
  authenticate
};
