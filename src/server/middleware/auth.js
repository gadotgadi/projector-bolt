import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT w.*, d.name as division_name, dept.name as department_name 
         FROM workers w 
         LEFT JOIN divisions d ON w.division_id = d.id 
         LEFT JOIN departments dept ON w.department_id = dept.id 
         WHERE w.id = ?`,
        [decoded.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};