const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('employeeId').isLength({ min: 4, max: 4 }).withMessage('Employee ID must be 4 digits'),
  body('password').isLength({ min: 6, max: 6 }).withMessage('Password must be 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, password } = req.body;
    const db = getDatabase();

    db.get(
      'SELECT * FROM users WHERE employee_id = ?',
      [employeeId],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { 
            id: user.id, 
            employeeId: user.employee_id,
            roleCode: user.role_code 
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            employeeId: user.employee_id,
            fullName: user.full_name,
            roleCode: user.role_code,
            roleDescription: user.role_description,
            procurementTeam: user.procurement_team
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT id, employee_id, full_name, role_code, role_description, procurement_team, email FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        employeeId: user.employee_id,
        fullName: user.full_name,
        roleCode: user.role_code,
        roleDescription: user.role_description,
        procurementTeam: user.procurement_team,
        email: user.email
      });
    }
  );
});

// Change password
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const db = getDatabase();

    db.get(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        db.run(
          'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newPasswordHash, req.user.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update password' });
            }
            res.json({ message: 'Password updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;