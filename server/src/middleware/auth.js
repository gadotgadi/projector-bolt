const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.roleCode)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

function validateUserExists(req, res, next) {
  const db = getDatabase();
  const userId = req.user.id;

  db.get(
    'SELECT id, employee_id, full_name, role_code FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      req.user.currentUser = user;
      next();
    }
  );
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  validateUserExists
};