import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ===== COMPLEXITY ESTIMATES ROUTES =====

// Get complexity estimates
router.get('/complexity-estimates', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.get('SELECT * FROM complexity_estimates ORDER BY id DESC LIMIT 1', (err, estimates) => {
    if (err) {
      console.error('Error fetching complexity estimates:', err);
      return res.status(500).json({ error: 'Failed to fetch complexity estimates' });
    }
    
    // If no estimates exist, return default values
    if (!estimates) {
      estimates = {
        id: 1,
        estimate_level_1: 5,
        estimate_level_2: 10,
        estimate_level_3: 20
      };
    }
    
    res.json({
      estimateLevel1: estimates.estimate_level_1,
      estimateLevel2: estimates.estimate_level_2,
      estimateLevel3: estimates.estimate_level_3
    });
  });
});

// Update complexity estimates
router.put('/complexity-estimates', [
  authenticateToken,
  authorizeRoles(0, 1), // Admin and Procurement Manager
  body('estimateLevel1').isInt({ min: 1, max: 365 }).withMessage('Level 1 estimate must be between 1-365'),
  body('estimateLevel2').isInt({ min: 1, max: 365 }).withMessage('Level 2 estimate must be between 1-365'),
  body('estimateLevel3').isInt({ min: 1, max: 365 }).withMessage('Level 3 estimate must be between 1-365')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { estimateLevel1, estimateLevel2, estimateLevel3 } = req.body;
  const db = getDatabase();

  // First check if record exists
  db.get('SELECT id FROM complexity_estimates LIMIT 1', (err, existing) => {
    if (err) {
      console.error('Error checking complexity estimates:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      // Update existing record
      db.run(
        'UPDATE complexity_estimates SET estimate_level_1 = ?, estimate_level_2 = ?, estimate_level_3 = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [estimateLevel1, estimateLevel2, estimateLevel3, existing.id],
        function(err) {
          if (err) {
            console.error('Error updating complexity estimates:', err);
            return res.status(500).json({ error: 'Failed to update complexity estimates' });
          }

          res.json({
            estimateLevel1,
            estimateLevel2,
            estimateLevel3
          });
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
            return res.status(500).json({ error: 'Failed to create complexity estimates' });
          }

          res.json({
            estimateLevel1,
            estimateLevel2,
            estimateLevel3
          });
        }
      );
    }
  });
});

// ===== ACCEPTANCE OPTIONS ROUTES =====

// Get all acceptance options
router.get('/acceptance-options', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM acceptance_options ORDER BY year_id DESC', (err, options) => {
    if (err) {
      console.error('Error fetching acceptance options:', err);
      return res.status(500).json({ error: 'Failed to fetch acceptance options' });
    }
    
    // Transform to match frontend format
    const transformedOptions = options.map(option => ({
      id: option.id,
      yearId: option.year_id,
      uploadCode: option.upload_code,
      uploadCodeDescription: option.upload_code_description,
      broadMeaning: option.broad_meaning
    }));
    
    res.json(transformedOptions);
  });
});

// Create acceptance option
router.post('/acceptance-options', [
  authenticateToken,
  authorizeRoles(0, 1), // Admin and Procurement Manager
  body('yearId').isInt({ min: 2020, max: 2050 }).withMessage('Year must be between 2020-2050'),
  body('uploadCode').isIn(['Plan', 'Late', 'Block', 'Finish']).withMessage('Invalid upload code')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { yearId, uploadCode, broadMeaning } = req.body;
  const db = getDatabase();

  // Check if year already exists
  db.get('SELECT id FROM acceptance_options WHERE year_id = ?', [yearId], (err, existing) => {
    if (err) {
      console.error('Error checking existing year:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      return res.status(400).json({ error: `Year ${yearId} already exists` });
    }

    // Get upload code description
    const uploadCodeDescriptions = {
      'Plan': 'מתוכנן',
      'Late': 'מאחר',
      'Block': 'חסום',
      'Finish': 'הסתיים'
    };

    const uploadCodeDescription = uploadCodeDescriptions[uploadCode];

    db.run(
      'INSERT INTO acceptance_options (year_id, upload_code, upload_code_description, broad_meaning) VALUES (?, ?, ?, ?)',
      [yearId, uploadCode, uploadCodeDescription, broadMeaning || null],
      function(err) {
        if (err) {
          console.error('Error creating acceptance option:', err);
          return res.status(500).json({ error: 'Failed to create acceptance option' });
        }

        db.get('SELECT * FROM acceptance_options WHERE id = ?', [this.lastID], (err, option) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch created option' });
          }

          const transformedOption = {
            id: option.id,
            yearId: option.year_id,
            uploadCode: option.upload_code,
            uploadCodeDescription: option.upload_code_description,
            broadMeaning: option.broad_meaning
          };

          res.status(201).json(transformedOption);
        });
      }
    );
  });
});

// Update acceptance option
router.put('/acceptance-options/:id', [
  authenticateToken,
  authorizeRoles(0, 1), // Admin and Procurement Manager
  body('yearId').isInt({ min: 2020, max: 2050 }).withMessage('Year must be between 2020-2050'),
  body('uploadCode').isIn(['Plan', 'Late', 'Block', 'Finish']).withMessage('Invalid upload code')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { yearId, uploadCode, broadMeaning } = req.body;
  const db = getDatabase();

  // Check if year already exists for different record
  db.get('SELECT id FROM acceptance_options WHERE year_id = ? AND id != ?', [yearId, id], (err, existing) => {
    if (err) {
      console.error('Error checking existing year:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      return res.status(400).json({ error: `Year ${yearId} already exists` });
    }

    // Get upload code description
    const uploadCodeDescriptions = {
      'Plan': 'מתוכנן',
      'Late': 'מאחר',
      'Block': 'חסום',
      'Finish': 'הסתיים'
    };

    const uploadCodeDescription = uploadCodeDescriptions[uploadCode];

    db.run(
      'UPDATE acceptance_options SET year_id = ?, upload_code = ?, upload_code_description = ?, broad_meaning = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [yearId, uploadCode, uploadCodeDescription, broadMeaning || null, id],
      function(err) {
        if (err) {
          console.error('Error updating acceptance option:', err);
          return res.status(500).json({ error: 'Failed to update acceptance option' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Acceptance option not found' });
        }

        db.get('SELECT * FROM acceptance_options WHERE id = ?', [id], (err, option) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch updated option' });
          }

          const transformedOption = {
            id: option.id,
            yearId: option.year_id,
            uploadCode: option.upload_code,
            uploadCodeDescription: option.upload_code_description,
            broadMeaning: option.broad_meaning
          };

          res.json(transformedOption);
        });
      }
    );
  });
});

// Delete acceptance option
router.delete('/acceptance-options/:id', [
  authenticateToken,
  authorizeRoles(0, 1) // Admin and Procurement Manager
], (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM acceptance_options WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting acceptance option:', err);
      return res.status(500).json({ error: 'Failed to delete acceptance option' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Acceptance option not found' });
    }

    res.json({ message: 'Acceptance option deleted successfully' });
  });
});

export default router;