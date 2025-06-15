import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get complexity estimates
router.get('/complexity-estimates', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const db = getDatabase();
  
  db.get('SELECT * FROM complexity_estimates ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error fetching complexity estimates:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return default values if no record exists
    const estimates = row || {
      estimateLevel1: 5,
      estimateLevel2: 10,
      estimateLevel3: 20
    };
    
    res.json({
      estimateLevel1: estimates.estimate_level_1,
      estimateLevel2: estimates.estimate_level_2,
      estimateLevel3: estimates.estimate_level_3
    });
  });
});

// Update complexity estimates
router.put('/complexity-estimates', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const { estimateLevel1, estimateLevel2, estimateLevel3 } = req.body;
  const db = getDatabase();

  // First check if a record exists
  db.get('SELECT id FROM complexity_estimates LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error checking complexity estimates:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      // Update existing record
      db.run(
        'UPDATE complexity_estimates SET estimate_level_1 = ?, estimate_level_2 = ?, estimate_level_3 = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [estimateLevel1, estimateLevel2, estimateLevel3, row.id],
        function(err) {
          if (err) {
            console.error('Error updating complexity estimates:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Complexity estimates updated successfully' });
        }
      );
    } else {
      // Insert new record
      db.run(
        'INSERT INTO complexity_estimates (estimate_level_1, estimate_level_2, estimate_level_3) VALUES (?, ?, ?)',
        [estimateLevel1, estimateLevel2, estimateLevel3],
        function(err) {
          if (err) {
            console.error('Error creating complexity estimates:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Complexity estimates created successfully' });
        }
      );
    }
  });
});

// Get acceptance options
router.get('/acceptance-options', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM acceptance_options ORDER BY year_id DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching acceptance options:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Transform data to match frontend format
    const options = rows.map(row => ({
      id: row.id,
      yearId: row.year_id,
      uploadCode: row.upload_code,
      uploadCodeDescription: row.upload_code_description,
      broadMeaning: row.broad_meaning
    }));
    
    res.json(options);
  });
});

// Create acceptance option
router.post('/acceptance-options', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const { yearId, uploadCode, broadMeaning } = req.body;
  const db = getDatabase();

  // Map upload codes to descriptions
  const uploadCodeDescriptions = {
    'Plan': 'מתוכנן',
    'Late': 'מאחר',
    'Block': 'חסום',
    'Finish': 'הסתיים'
  };

  const uploadCodeDescription = uploadCodeDescriptions[uploadCode];

  db.run(
    'INSERT INTO acceptance_options (year_id, upload_code, upload_code_description, broad_meaning) VALUES (?, ?, ?, ?)',
    [yearId, uploadCode, uploadCodeDescription, broadMeaning],
    function(err) {
      if (err) {
        console.error('Error creating acceptance option:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Acceptance option for this year already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT * FROM acceptance_options WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created acceptance option:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        const option = {
          id: row.id,
          yearId: row.year_id,
          uploadCode: row.upload_code,
          uploadCodeDescription: row.upload_code_description,
          broadMeaning: row.broad_meaning
        };
        
        res.status(201).json(option);
      });
    }
  );
});

// Update acceptance option
router.put('/acceptance-options/:id', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const { id } = req.params;
  const { yearId, uploadCode, broadMeaning } = req.body;
  const db = getDatabase();

  // Map upload codes to descriptions
  const uploadCodeDescriptions = {
    'Plan': 'מתוכנן',
    'Late': 'מאחר',
    'Block': 'חסום',
    'Finish': 'הסתיים'
  };

  const uploadCodeDescription = uploadCodeDescriptions[uploadCode];

  db.run(
    'UPDATE acceptance_options SET year_id = ?, upload_code = ?, upload_code_description = ?, broad_meaning = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [yearId, uploadCode, uploadCodeDescription, broadMeaning, id],
    function(err) {
      if (err) {
        console.error('Error updating acceptance option:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Acceptance option for this year already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Acceptance option not found' });
      }

      db.get('SELECT * FROM acceptance_options WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated acceptance option:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        const option = {
          id: row.id,
          yearId: row.year_id,
          uploadCode: row.upload_code,
          uploadCodeDescription: row.upload_code_description,
          broadMeaning: row.broad_meaning
        };
        
        res.json(option);
      });
    }
  );
});

// Delete acceptance option
router.delete('/acceptance-options/:id', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM acceptance_options WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting acceptance option:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Acceptance option not found' });
    }

    res.json({ message: 'Acceptance option deleted successfully' });
  });
});

export default router;