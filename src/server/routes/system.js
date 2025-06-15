import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { seedDatabase } from '../scripts/seedDatabase.js';

const router = express.Router();

// Seed database endpoint - publicly available without authentication
router.post('/seed_db', async (req, res) => {
  try {
    console.log('🌱 Manual database seeding requested (public endpoint)');
    
    await seedDatabase();
    
    console.log('✅ Manual database seeding completed successfully');
    res.json({ 
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual database seeding failed:', error);
    res.status(500).json({ 
      error: 'Database seeding failed',
      message: error.message
    });
  }
});

// Activity Pool routes
router.get('/activity-pool', authenticateToken, requireRole([0, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM activity_pool ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching activity pool:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.post('/activity-pool', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { name, toolsAndResources } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO activity_pool (name, tools_and_resources) VALUES (?, ?)',
    [name, toolsAndResources],
    function(err) {
      if (err) {
        console.error('Error creating activity:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT * FROM activity_pool WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created activity:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

router.put('/activity-pool/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const { name, toolsAndResources } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE activity_pool SET name = ?, tools_and_resources = ? WHERE id = ?',
    [name, toolsAndResources, id],
    function(err) {
      if (err) {
        console.error('Error updating activity:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }

      db.get('SELECT * FROM activity_pool WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated activity:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

router.delete('/activity-pool/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM activity_pool WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  });
});

// Domains routes
router.get('/domains', authenticateToken, requireRole([0, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM domains ORDER BY description', (err, rows) => {
    if (err) {
      console.error('Error fetching domains:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.post('/domains', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { description } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO domains (description) VALUES (?)',
    [description],
    function(err) {
      if (err) {
        console.error('Error creating domain:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT * FROM domains WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created domain:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

router.put('/domains/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE domains SET description = ? WHERE id = ?',
    [description, id],
    function(err) {
      if (err) {
        console.error('Error updating domain:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Domain not found' });
      }

      db.get('SELECT * FROM domains WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated domain:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

router.delete('/domains/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM domains WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting domain:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json({ message: 'Domain deleted successfully' });
  });
});

// Divisions routes
router.get('/divisions', authenticateToken, requireRole([0, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM divisions ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching divisions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.post('/divisions', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { name, isInternal } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO divisions (name, is_internal) VALUES (?, ?)',
    [name, isInternal],
    function(err) {
      if (err) {
        console.error('Error creating division:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT * FROM divisions WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created division:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

router.put('/divisions/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const { name, isInternal } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE divisions SET name = ?, is_internal = ? WHERE id = ?',
    [name, isInternal, id],
    function(err) {
      if (err) {
        console.error('Error updating division:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Division not found' });
      }

      db.get('SELECT * FROM divisions WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated division:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

router.delete('/divisions/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM divisions WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting division:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Division not found' });
    }

    res.json({ message: 'Division deleted successfully' });
  });
});

// Departments routes
router.get('/departments', authenticateToken, requireRole([0, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT d.*, div.name as divisionName 
     FROM departments d 
     LEFT JOIN divisions div ON d.division_id = div.id 
     ORDER BY d.name`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching departments:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

router.post('/departments', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { name, divisionId } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO departments (name, division_id) VALUES (?, ?)',
    [name, divisionId],
    function(err) {
      if (err) {
        console.error('Error creating department:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.get(
        `SELECT d.*, div.name as divisionName 
         FROM departments d 
         LEFT JOIN divisions div ON d.division_id = div.id 
         WHERE d.id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching created department:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

router.put('/departments/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const { name, divisionId } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE departments SET name = ?, division_id = ? WHERE id = ?',
    [name, divisionId, id],
    function(err) {
      if (err) {
        console.error('Error updating department:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }

      db.get(
        `SELECT d.*, div.name as divisionName 
         FROM departments d 
         LEFT JOIN divisions div ON d.division_id = div.id 
         WHERE d.id = ?`,
        [id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated department:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(row);
        }
      );
    }
  );
});

router.delete('/departments/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM departments WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting department:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  });
});

// Procurement Teams routes
router.get('/procurement-teams', authenticateToken, requireRole([0, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM procurement_teams ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching procurement teams:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.post('/procurement-teams', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { name } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO procurement_teams (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        console.error('Error creating procurement team:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT * FROM procurement_teams WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created procurement team:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

router.put('/procurement-teams/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const db = getDatabase();

  db.run(
    'UPDATE procurement_teams SET name = ? WHERE id = ?',
    [name, id],
    function(err) {
      if (err) {
        console.error('Error updating procurement team:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Procurement team not found' });
      }

      db.get('SELECT * FROM procurement_teams WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated procurement team:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

router.delete('/procurement-teams/:id', authenticateToken, requireRole([0, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM procurement_teams WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting procurement team:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Procurement team not found' });
    }

    res.json({ message: 'Procurement team deleted successfully' });
  });
});

export default router;