import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ===== ACTIVITY POOL ROUTES =====

// Get all activities
router.get('/activity-pool', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM activity_pool ORDER BY name', (err, activities) => {
    if (err) {
      console.error('Error fetching activities:', err);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
    
    res.json(activities);
  });
});

// Create activity
router.post('/activity-pool', [
  authenticateToken,
  authorizeRoles(0, 9),
  body('name').notEmpty().withMessage('Activity name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, toolsAndResources } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO activity_pool (name, tools_and_resources) VALUES (?, ?)',
    [name, toolsAndResources || null],
    function(err) {
      if (err) {
        console.error('Error creating activity:', err);
        return res.status(500).json({ error: 'Failed to create activity' });
      }

      db.get('SELECT * FROM activity_pool WHERE id = ?', [this.lastID], (err, activity) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created activity' });
        }
        res.status(201).json(activity);
      });
    }
  );
});

// Update activity
router.put('/activity-pool/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const { name, toolsAndResources } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE activity_pool SET name = ?, tools_and_resources = ? WHERE id = ?',
    [name, toolsAndResources || null, id],
    function(err) {
      if (err) {
        console.error('Error updating activity:', err);
        return res.status(500).json({ error: 'Failed to update activity' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }

      db.get('SELECT * FROM activity_pool WHERE id = ?', [id], (err, activity) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated activity' });
        }
        res.json(activity);
      });
    }
  );
});

// Delete activity
router.delete('/activity-pool/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM activity_pool WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).json({ error: 'Failed to delete activity' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  });
});

// ===== DOMAINS ROUTES =====

// Get all domains
router.get('/domains', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM domains ORDER BY description', (err, domains) => {
    if (err) {
      console.error('Error fetching domains:', err);
      return res.status(500).json({ error: 'Failed to fetch domains' });
    }
    
    res.json(domains);
  });
});

// Create domain
router.post('/domains', [
  authenticateToken,
  authorizeRoles(0, 9),
  body('description').notEmpty().withMessage('Domain description is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { description } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO domains (description) VALUES (?)',
    [description],
    function(err) {
      if (err) {
        console.error('Error creating domain:', err);
        return res.status(500).json({ error: 'Failed to create domain' });
      }

      db.get('SELECT * FROM domains WHERE id = ?', [this.lastID], (err, domain) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created domain' });
        }
        res.status(201).json(domain);
      });
    }
  );
});

// Update domain
router.put('/domains/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE domains SET description = ? WHERE id = ?',
    [description, id],
    function(err) {
      if (err) {
        console.error('Error updating domain:', err);
        return res.status(500).json({ error: 'Failed to update domain' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Domain not found' });
      }

      db.get('SELECT * FROM domains WHERE id = ?', [id], (err, domain) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated domain' });
        }
        res.json(domain);
      });
    }
  );
});

// Delete domain
router.delete('/domains/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM domains WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting domain:', err);
      return res.status(500).json({ error: 'Failed to delete domain' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json({ message: 'Domain deleted successfully' });
  });
});

// ===== DIVISIONS ROUTES =====

// Get all divisions
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

// Create division
router.post('/divisions', [
  authenticateToken,
  authorizeRoles(0, 9),
  body('name').notEmpty().withMessage('Division name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, isInternal } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO divisions (name, is_internal) VALUES (?, ?)',
    [name, isInternal ? 1 : 0],
    function(err) {
      if (err) {
        console.error('Error creating division:', err);
        return res.status(500).json({ error: 'Failed to create division' });
      }

      db.get('SELECT * FROM divisions WHERE id = ?', [this.lastID], (err, division) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created division' });
        }
        res.status(201).json(division);
      });
    }
  );
});

// Update division
router.put('/divisions/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const { name, isInternal } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE divisions SET name = ?, is_internal = ? WHERE id = ?',
    [name, isInternal ? 1 : 0, id],
    function(err) {
      if (err) {
        console.error('Error updating division:', err);
        return res.status(500).json({ error: 'Failed to update division' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Division not found' });
      }

      db.get('SELECT * FROM divisions WHERE id = ?', [id], (err, division) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated division' });
        }
        res.json(division);
      });
    }
  );
});

// Delete division
router.delete('/divisions/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM divisions WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting division:', err);
      return res.status(500).json({ error: 'Failed to delete division' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Division not found' });
    }

    res.json({ message: 'Division deleted successfully' });
  });
});

// ===== DEPARTMENTS ROUTES =====

// Get all departments
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

// Create department
router.post('/departments', [
  authenticateToken,
  authorizeRoles(0, 9),
  body('name').notEmpty().withMessage('Department name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, divisionId } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO departments (name, division_id) VALUES (?, ?)',
    [name, divisionId || null],
    function(err) {
      if (err) {
        console.error('Error creating department:', err);
        return res.status(500).json({ error: 'Failed to create department' });
      }

      db.get('SELECT * FROM departments WHERE id = ?', [this.lastID], (err, department) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created department' });
        }
        res.status(201).json(department);
      });
    }
  );
});

// Update department
router.put('/departments/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const { name, divisionId } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE departments SET name = ?, division_id = ? WHERE id = ?',
    [name, divisionId || null, id],
    function(err) {
      if (err) {
        console.error('Error updating department:', err);
        return res.status(500).json({ error: 'Failed to update department' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }

      db.get('SELECT * FROM departments WHERE id = ?', [id], (err, department) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated department' });
        }
        res.json(department);
      });
    }
  );
});

// Delete department
router.delete('/departments/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM departments WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting department:', err);
      return res.status(500).json({ error: 'Failed to delete department' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  });
});

// ===== PROCUREMENT TEAMS ROUTES =====

// Get all procurement teams
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

// Create procurement team
router.post('/procurement-teams', [
  authenticateToken,
  authorizeRoles(0, 9),
  body('name').notEmpty().withMessage('Team name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO procurement_teams (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        console.error('Error creating procurement team:', err);
        return res.status(500).json({ error: 'Failed to create procurement team' });
      }

      db.get('SELECT * FROM procurement_teams WHERE id = ?', [this.lastID], (err, team) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created team' });
        }
        res.status(201).json(team);
      });
    }
  );
});

// Update procurement team
router.put('/procurement-teams/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE procurement_teams SET name = ? WHERE id = ?',
    [name, id],
    function(err) {
      if (err) {
        console.error('Error updating procurement team:', err);
        return res.status(500).json({ error: 'Failed to update procurement team' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Procurement team not found' });
      }

      db.get('SELECT * FROM procurement_teams WHERE id = ?', [id], (err, team) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated team' });
        }
        res.json(team);
      });
    }
  );
});

// Delete procurement team
router.delete('/procurement-teams/:id', [
  authenticateToken,
  authorizeRoles(0, 9)
], (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM procurement_teams WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting procurement team:', err);
      return res.status(500).json({ error: 'Failed to delete procurement team' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Procurement team not found' });
    }

    res.json({ message: 'Procurement team deleted successfully' });
  });
});

export default router;