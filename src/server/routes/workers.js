import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all workers
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  try {
    db.all(`
      SELECT 
        u.*,
        d.name as division_name,
        dept.name as department_name
      FROM users u
      LEFT JOIN divisions d ON u.division_id = d.id
      LEFT JOIN departments dept ON u.department_id = dept.id
      ORDER BY u.full_name
    `, (err, workers) => {
      if (err) {
        console.error('Error fetching workers:', err);
        return res.status(500).json({ error: 'Failed to fetch workers' });
      }
      
      // Transform to match frontend expectations
      const transformedWorkers = workers.map(worker => ({
        id: worker.id,
        employeeId: worker.employee_id,
        roleCode: worker.role_code,
        fullName: worker.full_name,
        roleDescription: worker.role_description,
        divisionId: worker.division_id,
        departmentId: worker.department_id,
        procurementTeam: worker.procurement_team,
        password: '******', // Don't send actual password
        availableWorkDays: worker.available_work_days?.toString(),
        email: worker.email,
        divisionName: worker.division_name,
        departmentName: worker.department_name
      }));
      
      res.json(transformedWorkers);
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Get worker by ID
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  try {
    db.get(`
      SELECT 
        u.*,
        d.name as division_name,
        dept.name as department_name
      FROM users u
      LEFT JOIN divisions d ON u.division_id = d.id
      LEFT JOIN departments dept ON u.department_id = dept.id
      WHERE u.id = ?
    `, [id], (err, worker) => {
      if (err) {
        console.error('Error fetching worker:', err);
        return res.status(500).json({ error: 'Failed to fetch worker' });
      }
      
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      const transformedWorker = {
        id: worker.id,
        employeeId: worker.employee_id,
        roleCode: worker.role_code,
        fullName: worker.full_name,
        roleDescription: worker.role_description,
        divisionId: worker.division_id,
        departmentId: worker.department_id,
        procurementTeam: worker.procurement_team,
        password: '******',
        availableWorkDays: worker.available_work_days?.toString(),
        email: worker.email,
        divisionName: worker.division_name,
        departmentName: worker.department_name
      };
      
      res.json(transformedWorker);
    });
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

// Create new worker
router.post('/', [
  authenticateToken,
  authorizeRoles(1, 5, 9), // Manager, Admin, Technical
  body('employeeId').isLength({ min: 4, max: 4 }).withMessage('Employee ID must be 4 digits'),
  body('roleCode').isInt({ min: 1, max: 9 }).withMessage('Invalid role code'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('password').isLength({ min: 6, max: 6 }).withMessage('Password must be 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employeeId,
      roleCode,
      fullName,
      roleDescription,
      divisionId,
      departmentId,
      procurementTeam,
      password,
      availableWorkDays,
      email
    } = req.body;

    const db = getDatabase();

    // Check if employee ID already exists
    db.get('SELECT id FROM users WHERE employee_id = ?', [employeeId], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

      // Insert new worker
      db.run(`
        INSERT INTO users (
          employee_id, full_name, role_code, role_description,
          division_id, department_id, procurement_team,
          password_hash, available_work_days, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        employeeId,
        fullName,
        roleCode,
        roleDescription || null,
        divisionId || null,
        departmentId || null,
        procurementTeam || null,
        passwordHash,
        availableWorkDays ? parseInt(availableWorkDays) : null,
        email || null
      ], function(err) {
        if (err) {
          console.error('Error creating worker:', err);
          return res.status(500).json({ error: 'Failed to create worker' });
        }

        // Get the created worker with joined data
        db.get(`
          SELECT 
            u.*,
            d.name as division_name,
            dept.name as department_name
          FROM users u
          LEFT JOIN divisions d ON u.division_id = d.id
          LEFT JOIN departments dept ON u.department_id = dept.id
          WHERE u.id = ?
        `, [this.lastID], (err, newWorker) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch created worker' });
          }

          const transformedWorker = {
            id: newWorker.id,
            employeeId: newWorker.employee_id,
            roleCode: newWorker.role_code,
            fullName: newWorker.full_name,
            roleDescription: newWorker.role_description,
            divisionId: newWorker.division_id,
            departmentId: newWorker.department_id,
            procurementTeam: newWorker.procurement_team,
            password: '******',
            availableWorkDays: newWorker.available_work_days?.toString(),
            email: newWorker.email,
            divisionName: newWorker.division_name,
            departmentName: newWorker.department_name
          };

          res.status(201).json(transformedWorker);
        });
      });
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// Update worker
router.put('/:id', [
  authenticateToken,
  authorizeRoles(1, 5, 9), // Manager, Admin, Technical
  body('employeeId').optional().isLength({ min: 4, max: 4 }).withMessage('Employee ID must be 4 digits'),
  body('roleCode').optional().isInt({ min: 1, max: 9 }).withMessage('Invalid role code'),
  body('password').optional().isLength({ min: 6, max: 6 }).withMessage('Password must be 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workerId = req.params.id;
    const {
      employeeId,
      roleCode,
      fullName,
      roleDescription,
      divisionId,
      departmentId,
      procurementTeam,
      password,
      availableWorkDays,
      email
    } = req.body;

    const db = getDatabase();

    // Check if employee ID already exists (excluding current worker)
    if (employeeId) {
      db.get('SELECT id FROM users WHERE employee_id = ? AND id != ?', [employeeId, workerId], async (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
          return res.status(400).json({ error: 'Employee ID already exists' });
        }

        await updateWorker();
      });
    } else {
      await updateWorker();
    }

    async function updateWorker() {
      let passwordHash = null;
      if (password && password !== '******') {
        passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      }

      // Build update query dynamically
      const updateFields = [];
      const values = [];

      if (employeeId !== undefined) {
        updateFields.push('employee_id = ?');
        values.push(employeeId);
      }
      if (roleCode !== undefined) {
        updateFields.push('role_code = ?');
        values.push(roleCode);
      }
      if (fullName !== undefined) {
        updateFields.push('full_name = ?');
        values.push(fullName);
      }
      if (roleDescription !== undefined) {
        updateFields.push('role_description = ?');
        values.push(roleDescription || null);
      }
      if (divisionId !== undefined) {
        updateFields.push('division_id = ?');
        values.push(divisionId || null);
      }
      if (departmentId !== undefined) {
        updateFields.push('department_id = ?');
        values.push(departmentId || null);
      }
      if (procurementTeam !== undefined) {
        updateFields.push('procurement_team = ?');
        values.push(procurementTeam || null);
      }
      if (passwordHash) {
        updateFields.push('password_hash = ?');
        values.push(passwordHash);
      }
      if (availableWorkDays !== undefined) {
        updateFields.push('available_work_days = ?');
        values.push(availableWorkDays ? parseInt(availableWorkDays) : null);
      }
      if (email !== undefined) {
        updateFields.push('email = ?');
        values.push(email || null);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(workerId);

      if (updateFields.length === 1) { // Only timestamp update
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

      db.run(updateQuery, values, function(err) {
        if (err) {
          console.error('Error updating worker:', err);
          return res.status(500).json({ error: 'Failed to update worker' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Worker not found' });
        }

        // Get the updated worker with joined data
        db.get(`
          SELECT 
            u.*,
            d.name as division_name,
            dept.name as department_name
          FROM users u
          LEFT JOIN divisions d ON u.division_id = d.id
          LEFT JOIN departments dept ON u.department_id = dept.id
          WHERE u.id = ?
        `, [workerId], (err, updatedWorker) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch updated worker' });
          }

          const transformedWorker = {
            id: updatedWorker.id,
            employeeId: updatedWorker.employee_id,
            roleCode: updatedWorker.role_code,
            fullName: updatedWorker.full_name,
            roleDescription: updatedWorker.role_description,
            divisionId: updatedWorker.division_id,
            departmentId: updatedWorker.department_id,
            procurementTeam: updatedWorker.procurement_team,
            password: '******',
            availableWorkDays: updatedWorker.available_work_days?.toString(),
            email: updatedWorker.email,
            divisionName: updatedWorker.division_name,
            departmentName: updatedWorker.department_name
          };

          res.json(transformedWorker);
        });
      });
    }
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// Delete worker
router.delete('/:id', [
  authenticateToken,
  authorizeRoles(1, 5, 9) // Manager, Admin, Technical
], (req, res) => {
  const db = getDatabase();
  const workerId = req.params.id;

  try {
    // Check if worker is assigned to any active tasks
    // For now, we'll allow deletion but in production you might want to prevent it
    
    db.run('DELETE FROM users WHERE id = ?', [workerId], function(err) {
      if (err) {
        console.error('Error deleting worker:', err);
        return res.status(500).json({ error: 'Failed to delete worker' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      res.json({ message: 'Worker deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// Get organizational roles
router.get('/organizational-roles', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM organizational_roles ORDER BY role_code', (err, roles) => {
    if (err) {
      console.error('Error fetching organizational roles:', err);
      return res.status(500).json({ error: 'Failed to fetch organizational roles' });
    }
    
    res.json(roles);
  });
});

// Get divisions
router.get('/divisions', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM divisions ORDER BY name', (err, divisions) => {
    if (err) {
      console.error('Error fetching divisions:', err);
      return res.status(500).json({ error: 'Failed to fetch divisions' });
    }
    
    res.json(divisions);
  });
});

// Get departments
router.get('/departments', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM departments ORDER BY name', (err, departments) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Failed to fetch departments' });
    }
    
    res.json(departments);
  });
});

// Get procurement teams
router.get('/procurement-teams', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM procurement_teams ORDER BY name', (err, teams) => {
    if (err) {
      console.error('Error fetching procurement teams:', err);
      return res.status(500).json({ error: 'Failed to fetch procurement teams' });
    }
    
    res.json(teams);
  });
});

export default router;