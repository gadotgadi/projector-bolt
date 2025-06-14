const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all engagement types with their processes
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      et.id,
      et.name,
      GROUP_CONCAT(
        json_object(
          'engagementTypeId', etp.engagement_type_id,
          'stationId', etp.station_id,
          'activityId', etp.activity_id
        )
      ) as processes
    FROM engagement_types et
    LEFT JOIN engagement_type_processes etp ON et.id = etp.engagement_type_id
    GROUP BY et.id, et.name
    ORDER BY et.id
  `;
  
  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const engagementTypes = results.map(row => ({
      id: row.id,
      name: row.name,
      processes: row.processes ? JSON.parse(`[${row.processes}]`) : []
    }));
    
    res.json(engagementTypes);
  });
});

// Create new engagement type
router.post('/', [
  authenticateToken,
  authorizeRoles(1, 2, 9), // Manager, Team Leader, Technical
  body('name').notEmpty().withMessage('Name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  const { name } = req.body;
  
  db.run(
    'INSERT INTO engagement_types (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Engagement type name already exists' });
        }
        return res.status(500).json({ error: 'Failed to create engagement type' });
      }
      
      res.status(201).json({
        id: this.lastID,
        name,
        processes: []
      });
    }
  );
});

// Update engagement type processes
router.put('/:id/processes', [
  authenticateToken,
  authorizeRoles(1, 2, 9), // Manager, Team Leader, Technical
  body('processes').isArray().withMessage('Processes must be an array')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  const engagementTypeId = req.params.id;
  const { processes } = req.body;
  
  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Delete existing processes
    db.run(
      'DELETE FROM engagement_type_processes WHERE engagement_type_id = ?',
      [engagementTypeId],
      (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to clear existing processes' });
        }
        
        // Insert new processes
        if (processes.length > 0) {
          const insertQuery = `
            INSERT INTO engagement_type_processes (engagement_type_id, station_id, activity_id)
            VALUES (?, ?, ?)
          `;
          
          let completed = 0;
          let hasError = false;
          
          processes.forEach(process => {
            db.run(insertQuery, [
              engagementTypeId,
              process.stationId,
              process.activityId
            ], (err) => {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to insert process' });
              }
              
              completed++;
              if (completed === processes.length && !hasError) {
                db.run('COMMIT');
                res.json({ message: 'Processes updated successfully' });
              }
            });
          });
        } else {
          db.run('COMMIT');
          res.json({ message: 'Processes cleared successfully' });
        }
      }
    );
  });
});

// Delete engagement type
router.delete('/:id', [
  authenticateToken,
  authorizeRoles(1, 9) // Manager, Technical only
], (req, res) => {
  const db = getDatabase();
  const engagementTypeId = req.params.id;
  
  // Check if engagement type is used in any programs
  db.get(
    'SELECT COUNT(*) as count FROM programs WHERE engagement_type_id = ?',
    [engagementTypeId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete engagement type that is used in programs' 
        });
      }
      
      // Delete processes first
      db.run(
        'DELETE FROM engagement_type_processes WHERE engagement_type_id = ?',
        [engagementTypeId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete processes' });
          }
          
          // Delete engagement type
          db.run(
            'DELETE FROM engagement_types WHERE id = ?',
            [engagementTypeId],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to delete engagement type' });
              }
              
              if (this.changes === 0) {
                return res.status(404).json({ error: 'Engagement type not found' });
              }
              
              res.json({ message: 'Engagement type deleted successfully' });
            }
          );
        }
      );
    }
  );
});

module.exports = router;