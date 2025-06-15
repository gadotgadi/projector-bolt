import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all workers
router.get('/', authenticateToken, requireRole([0, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT w.*, d.name as divisionName, dept.name as departmentName, or_role.description as roleDescription
     FROM workers w 
     LEFT JOIN divisions d ON w.division_id = d.id 
     LEFT JOIN departments dept ON w.department_id = dept.id 
     LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
     ORDER BY w.full_name`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching workers:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Transform data to match frontend format
      const workers = rows.map(row => ({
        id: row.id,
        employeeId: row.employee_id,
        roleCode: row.role_code,
        fullName: row.full_name,
        roleDescription: row.roleDescription,
        divisionId: row.division_id,
        departmentId: row.department_id,
        procurementTeam: row.procurement_team,
        password: '******', // Never send actual password
        availableWorkDays: row.available_work_days,
        email: row.email,
        divisionName: row.divisionName,
        departmentName: row.departmentName
      }));
      
      res.json(workers);
    }
  );
});

// Create new worker
router.post('/', authenticateToken, requireRole([0, 9]), async (req, res) => {
  try {
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

    // Validate required fields
    if (!employeeId || !roleCode || !fullName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const db = getDatabase();

    db.run(
      `INSERT INTO workers 
       (employee_id, role_code, full_name, role_description, division_id, department_id, 
        procurement_team, password, available_work_days, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, roleCode, fullName, roleDescription, divisionId, departmentId, 
       procurementTeam, hashedPassword, availableWorkDays, email],
      function(err) {
        if (err) {
          console.error('Error creating worker:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Employee ID already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        // Fetch the created worker with joined data
        db.get(
          `SELECT w.*, d.name as divisionName, dept.name as departmentName, or_role.description as roleDescription
           FROM workers w 
           LEFT JOIN divisions d ON w.division_id = d.id 
           LEFT JOIN departments dept ON w.department_id = dept.id 
           LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
           WHERE w.id = ?`,
          [this.lastID],
          (err, row) => {
            if (err) {
              console.error('Error fetching created worker:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            const worker = {
              id: row.id,
              employeeId: row.employee_id,
              roleCode: row.role_code,
              fullName: row.full_name,
              roleDescription: row.roleDescription,
              divisionId: row.division_id,
              departmentId: row.department_id,
              procurementTeam: row.procurement_team,
              password: '******',
              availableWorkDays: row.available_work_days,
              email: row.email,
              divisionName: row.divisionName,
              departmentName: row.departmentName
            };

            res.status(201).json(worker);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update worker
router.put('/:id', authenticateToken, requireRole([0, 9]), async (req, res) => {
  try {
    const { id } = req.params;
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

    // Prepare update query
    let updateQuery = `
      UPDATE workers SET 
        employee_id = ?, role_code = ?, full_name = ?, role_description = ?,
        division_id = ?, department_id = ?, procurement_team = ?, 
        available_work_days = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    `;
    
    let params = [employeeId, roleCode, fullName, roleDescription, divisionId, 
                  departmentId, procurementTeam, availableWorkDays, email];

    // Only update password if provided and not the placeholder
    if (password && password !== '******') {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    db.run(updateQuery, params, function(err) {
      if (err) {
        console.error('Error updating worker:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Employee ID already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      // Fetch updated worker
      db.get(
        `SELECT w.*, d.name as divisionName, dept.name as departmentName, or_role.description as roleDescription
         FROM workers w 
         LEFT JOIN divisions d ON w.division_id = d.id 
         LEFT JOIN departments dept ON w.department_id = dept.id 
         LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
         WHERE w.id = ?`,
        [id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated worker:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          const worker = {
            id: row.id,
            employeeId: row.employee_id,
            roleCode: row.role_code,
            fullName: row.full_name,
            roleDescription: row.roleDescription,
            divisionId: row.division_id,
            departmentId: row.department_id,
            procurementTeam: row.procurement_team,
            password: '******',
            availableWorkDays: row.available_work_days,
            email: row.email,
            divisionName: row.divisionName,
            departmentName: row.departmentName
          };

          res.json(worker);
        }
      );
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete worker
router.delete('/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM workers WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting worker:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ message: 'Worker deleted successfully' });
  });
});

// Get organizational roles
router.get('/organizational-roles', authenticateToken, (req, res) => {
  console.log('🔍 API: Getting organizational roles...');
  const db = getDatabase();
  
  db.all('SELECT * FROM organizational_roles ORDER BY role_code', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching organizational roles:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('✅ Fetched organizational roles from DB:', rows);
    res.json(rows);
  });
});

// Get divisions
router.get('/divisions', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM divisions ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching divisions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get departments
router.get('/departments', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM departments ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get procurement teams
router.get('/procurement-teams', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM procurement_teams ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching procurement teams:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

export default router;