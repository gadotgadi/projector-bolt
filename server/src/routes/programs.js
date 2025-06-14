const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { getDatabase } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all programs with filtering
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { status, workYear, assignedOfficer, domain, complexity } = req.query;
  
  let query = `
    SELECT p.*, 
           GROUP_CONCAT(
             json_object(
               'stationId', pt.station_id,
               'activityId', pt.activity_id,
               'assignedOfficerName', pt.assigned_officer_name,
               'completionDate', pt.completion_date,
               'reference', pt.reference,
               'notes', pt.notes
             )
           ) as stations
    FROM programs p
    LEFT JOIN program_tasks pt ON p.id = pt.program_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }
  
  if (workYear) {
    query += ' AND p.work_year = ?';
    params.push(workYear);
  }
  
  if (assignedOfficer) {
    query += ' AND p.assigned_officer_name = ?';
    params.push(assignedOfficer);
  }
  
  if (domain) {
    query += ' AND p.domain_name = ?';
    params.push(domain);
  }
  
  if (complexity) {
    query += ' AND p.complexity = ?';
    params.push(complexity);
  }
  
  query += ' GROUP BY p.id ORDER BY p.task_id DESC';
  
  db.all(query, params, (err, programs) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Parse stations JSON
    const processedPrograms = programs.map(program => ({
      ...program,
      stations: program.stations ? JSON.parse(`[${program.stations}]`) : []
    }));
    
    res.json(processedPrograms);
  });
});

// Get single program by ID
router.get('/:id', [
  authenticateToken,
  param('id').isInt().withMessage('Program ID must be an integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  const programId = req.params.id;
  
  db.get(
    'SELECT * FROM programs WHERE task_id = ?',
    [programId],
    (err, program) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!program) {
        return res.status(404).json({ error: 'Program not found' });
      }
      
      // Get program tasks
      db.all(
        'SELECT * FROM program_tasks WHERE program_id = ? ORDER BY station_id',
        [program.id],
        (err, tasks) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            ...program,
            stations: tasks
          });
        }
      );
    }
  );
});

// Create new program
router.post('/', [
  authenticateToken,
  body('title').notEmpty().withMessage('Title is required'),
  body('requesterName').notEmpty().withMessage('Requester name is required'),
  body('divisionName').notEmpty().withMessage('Division name is required'),
  body('workYear').isInt().withMessage('Work year must be an integer'),
  body('planningSource').isIn(['annual_planning', 'unplanned', 'carried_over']).withMessage('Invalid planning source')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  
  // Generate new task ID
  db.get('SELECT MAX(task_id) as maxId FROM programs', (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const newTaskId = (result.maxId || 0) + 1;
    const programData = {
      ...req.body,
      task_id: newTaskId,
      status: 'Open'
    };
    
    const insertQuery = `
      INSERT INTO programs (
        task_id, work_year, required_quarter, title, description,
        requester_name, division_name, department_name, domain_name,
        estimated_amount, currency, supplier_list, justification,
        planning_source, complexity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      newTaskId,
      programData.workYear,
      programData.requiredQuarter,
      programData.title,
      programData.description,
      programData.requesterName,
      programData.divisionName,
      programData.departmentName,
      programData.domainName,
      programData.estimatedAmount,
      programData.currency,
      programData.supplierList,
      programData.justification,
      programData.planningSource,
      programData.complexity,
      programData.status
    ];
    
    db.run(insertQuery, values, function(err) {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Failed to create program' });
      }
      
      res.status(201).json({
        id: this.lastID,
        taskId: newTaskId,
        message: 'Program created successfully'
      });
    });
  });
});

// Update program
router.put('/:id', [
  authenticateToken,
  param('id').isInt().withMessage('Program ID must be an integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  const taskId = req.params.id;
  const updateData = req.body;
  
  // Build dynamic update query
  const allowedFields = [
    'title', 'description', 'requester_name', 'division_name', 
    'department_name', 'domain_name', 'estimated_amount', 'currency',
    'supplier_list', 'justification', 'complexity', 'status',
    'assigned_officer_name', 'team_name', 'planning_notes', 'officer_notes'
  ];
  
  const updateFields = [];
  const values = [];
  
  Object.keys(updateData).forEach(key => {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      updateFields.push(`${dbField} = ?`);
      values.push(updateData[key]);
    }
  });
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(taskId);
  
  const updateQuery = `UPDATE programs SET ${updateFields.join(', ')} WHERE task_id = ?`;
  
  db.run(updateQuery, values, function(err) {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Failed to update program' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }
    
    res.json({ message: 'Program updated successfully' });
  });
});

// Update program stations
router.put('/:id/stations', [
  authenticateToken,
  param('id').isInt().withMessage('Program ID must be an integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  const taskId = req.params.id;
  const { stations } = req.body;
  
  // First get the program's internal ID
  db.get('SELECT id FROM programs WHERE task_id = ?', [taskId], (err, program) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    
    // Delete existing stations
    db.run('DELETE FROM program_tasks WHERE program_id = ?', [program.id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to clear existing stations' });
      }
      
      // Insert new stations
      if (stations && stations.length > 0) {
        const insertQuery = `
          INSERT INTO program_tasks (
            program_id, station_id, activity_id, assigned_officer_name,
            completion_date, reference, notes, is_last_station
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        let completed = 0;
        stations.forEach(station => {
          db.run(insertQuery, [
            program.id,
            station.stationId,
            station.activityId,
            station.assignedOfficerName,
            station.completionDate,
            station.reference,
            station.notes,
            station.isLastStation ? 1 : 0
          ], (err) => {
            if (err) {
              console.error('Station insert error:', err);
            }
            
            completed++;
            if (completed === stations.length) {
              res.json({ message: 'Stations updated successfully' });
            }
          });
        });
      } else {
        res.json({ message: 'Stations cleared successfully' });
      }
    });
  });
});

module.exports = router;