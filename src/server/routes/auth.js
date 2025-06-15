import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';
import { authenticateToken, getUserFromToken } from '../middleware/auth.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    // Validate input
    if (!employeeId || !password) {
      return res.status(400).json({ error: 'Employee ID and password are required' });
    }

    if (employeeId.length !== 4 || !/^\d{4}$/.test(employeeId)) {
      return res.status(400).json({ error: 'Employee ID must be exactly 4 digits' });
    }

    if (password.length !== 6) {
      return res.status(400).json({ error: 'Password must be exactly 6 characters' });
    }

    const db = getDatabase();

    // Find user by employee ID
    db.get(
      `SELECT w.*, d.name as division_name, dept.name as department_name, or_role.description as role_description
       FROM workers w 
       LEFT JOIN divisions d ON w.division_id = d.id 
       LEFT JOIN departments dept ON w.department_id = dept.id 
       LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
       WHERE w.employee_id = ?`,
      [employeeId],
      async (err, user) => {
        if (err) {
          console.error('Database error during login:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            employeeId: user.employee_id, 
            roleCode: user.role_code 
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Return user data and token
        res.json({
          token,
          user: {
            id: user.id,
            employeeId: user.employee_id,
            fullName: user.full_name,
            roleCode: user.role_code,
            roleDescription: user.role_description || 'Unknown Role',
            procurementTeam: user.procurement_team,
            email: user.email,
            divisionName: user.division_name,
            departmentName: user.department_name
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization.split(' ')[1]);
    
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
      email: user.email,
      divisionName: user.division_name,
      departmentName: user.department_name
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;