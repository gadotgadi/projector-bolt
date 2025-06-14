const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get all activity pool items
router.get('/', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  
  try {
    const activities = db.prepare('SELECT * FROM activity_pool ORDER BY id').all();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity pool:', error);
    res.status(500).json({ error: 'Failed to fetch activity pool' });
  }
});

// Get activity pool item by ID
router.get('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  
  try {
    const activity = db.prepare('SELECT * FROM activity_pool WHERE id = ?').get(id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Create new activity pool item
router.post('/', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const { name, toolsAndResources } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Activity name is required' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO activity_pool (name, tools_and_resources) VALUES (?, ?)');
    const result = stmt.run(name.trim(), toolsAndResources || null);
    
    const newActivity = db.prepare('SELECT * FROM activity_pool WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity pool item
router.put('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { name, toolsAndResources } = req.body;
  
  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Activity name is required' });
  }
  
  try {
    const stmt = db.prepare('UPDATE activity_pool SET name = ?, tools_and_resources = ? WHERE id = ?');
    const result = stmt.run(name.trim(), toolsAndResources || null, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    const updatedActivity = db.prepare('SELECT * FROM activity_pool WHERE id = ?').get(id);
    
    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity pool item
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  
  try {
    // Check if activity is used in any engagement type processes
    const usageCheck = db.prepare('SELECT COUNT(*) as count FROM engagement_type_processes WHERE activity_id = ?').get(id);
    
    if (usageCheck.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete activity that is used in engagement type processes' 
      });
    }
    
    const stmt = db.prepare('DELETE FROM activity_pool WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;