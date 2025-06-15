import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all programs
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT p.*, 
            d.name as division_name, 
            dept.name as department_name,
            dom.description as domain_name
     FROM programs p 
     LEFT JOIN divisions d ON p.division_id = d.id 
     LEFT JOIN departments dept ON p.department_id = dept.id 
     LEFT JOIN domains dom ON p.domain_id = dom.id
     ORDER BY p.created_at DESC`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching programs:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Transform data to match frontend format
      const programs = rows.map(row => ({
        taskId: row.task_id,
        workYear: row.work_year,
        requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
        title: row.title,
        description: row.description,
        requesterId: row.requester_id,
        requesterName: row.requester_name,
        divisionId: row.division_id,
        divisionName: row.division_name || row.division_name,
        departmentId: row.department_id,
        departmentName: row.department_name || row.department_name,
        domainId: row.domain_id,
        domainName: row.domain_name || row.domain_name,
        estimatedAmount: row.estimated_amount,
        currency: row.currency,
        supplierList: row.supplier_list,
        justification: row.justification,
        planningSource: row.planning_source,
        complexity: row.complexity,
        engagementTypeId: row.engagement_type_id,
        engagementTypeName: row.engagement_type_name,
        status: row.status,
        assignedOfficerId: row.assigned_officer_id,
        assignedOfficerName: row.assigned_officer_name,
        teamId: row.team_id,
        teamName: row.team_name,
        startDate: row.start_date ? new Date(row.start_date) : null,
        planningNotes: row.planning_notes,
        officerNotes: row.officer_notes,
        lastUpdate: new Date(row.updated_at),
        createdAt: new Date(row.created_at)
      }));
      
      res.json(programs);
    }
  );
});

// Get program by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get(
    `SELECT p.*, 
            d.name as division_name, 
            dept.name as department_name,
            dom.description as domain_name
     FROM programs p 
     LEFT JOIN divisions d ON p.division_id = d.id 
     LEFT JOIN departments dept ON p.department_id = dept.id 
     LEFT JOIN domains dom ON p.domain_id = dom.id
     WHERE p.task_id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching program:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Program not found' });
      }
      
      // Transform data to match frontend format
      const program = {
        taskId: row.task_id,
        workYear: row.work_year,
        requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
        title: row.title,
        description: row.description,
        requesterId: row.requester_id,
        requesterName: row.requester_name,
        divisionId: row.division_id,
        divisionName: row.division_name || row.division_name,
        departmentId: row.department_id,
        departmentName: row.department_name || row.department_name,
        domainId: row.domain_id,
        domainName: row.domain_name || row.domain_name,
        estimatedAmount: row.estimated_amount,
        currency: row.currency,
        supplierList: row.supplier_list,
        justification: row.justification,
        planningSource: row.planning_source,
        complexity: row.complexity,
        engagementTypeId: row.engagement_type_id,
        engagementTypeName: row.engagement_type_name,
        status: row.status,
        assignedOfficerId: row.assigned_officer_id,
        assignedOfficerName: row.assigned_officer_name,
        teamId: row.team_id,
        teamName: row.team_name,
        startDate: row.start_date ? new Date(row.start_date) : null,
        planningNotes: row.planning_notes,
        officerNotes: row.officer_notes,
        lastUpdate: new Date(row.updated_at),
        createdAt: new Date(row.created_at)
      };
      
      res.json(program);
    }
  );
});

// Create new program
router.post('/', authenticateToken, requireRole([1, 4]), (req, res) => {
  const {
    workYear,
    requiredQuarter,
    title,
    description,
    requesterName,
    divisionName,
    departmentName,
    domainName,
    estimatedAmount,
    currency,
    supplierList,
    justification,
    planningSource,
    complexity
  } = req.body;

  const db = getDatabase();

  // Generate new task ID
  db.get('SELECT MAX(task_id) as maxId FROM programs', (err, row) => {
    if (err) {
      console.error('Error getting max task ID:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const newTaskId = (row.maxId || 0) + 1;

    // Convert undefined values to null for SQLite compatibility
    const safeEstimatedAmount = estimatedAmount !== undefined ? estimatedAmount : null;
    const safeCurrency = currency !== undefined ? currency : null;
    const safeComplexity = complexity !== undefined ? complexity : null;

    db.run(
      `INSERT INTO programs 
       (task_id, work_year, required_quarter, title, description, requester_name, 
        division_name, department_name, domain_name, estimated_amount, currency, 
        supplier_list, justification, planning_source, complexity, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTaskId, workYear, requiredQuarter, title, description, requesterName,
       divisionName, departmentName, domainName, safeEstimatedAmount, safeCurrency,
       supplierList, justification, planningSource, safeComplexity, 'Open'],
      function(err) {
        if (err) {
          console.error('Error creating program:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Fetch the created program
        db.get(
          `SELECT p.*, 
                  d.name as division_name, 
                  dept.name as department_name,
                  dom.description as domain_name
           FROM programs p 
           LEFT JOIN divisions d ON p.division_id = d.id 
           LEFT JOIN departments dept ON p.department_id = dept.id 
           LEFT JOIN domains dom ON p.domain_id = dom.id
           WHERE p.task_id = ?`,
          [newTaskId],
          (err, row) => {
            if (err) {
              console.error('Error fetching created program:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            const program = {
              taskId: row.task_id,
              workYear: row.work_year,
              requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
              title: row.title,
              description: row.description,
              requesterId: row.requester_id,
              requesterName: row.requester_name,
              divisionId: row.division_id,
              divisionName: row.division_name || row.division_name,
              departmentId: row.department_id,
              departmentName: row.department_name || row.department_name,
              domainId: row.domain_id,
              domainName: row.domain_name || row.domain_name,
              estimatedAmount: row.estimated_amount,
              currency: row.currency,
              supplierList: row.supplier_list,
              justification: row.justification,
              planningSource: row.planning_source,
              complexity: row.complexity,
              engagementTypeId: row.engagement_type_id,
              engagementTypeName: row.engagement_type_name,
              status: row.status,
              assignedOfficerId: row.assigned_officer_id,
              assignedOfficerName: row.assigned_officer_name,
              teamId: row.team_id,
              teamName: row.team_name,
              startDate: row.start_date ? new Date(row.start_date) : null,
              planningNotes: row.planning_notes,
              officerNotes: row.officer_notes,
              lastUpdate: new Date(row.updated_at),
              createdAt: new Date(row.created_at)
            };

            res.status(201).json(program);
          }
        );
      }
    );
  });
});

// Update program
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = getDatabase();

  // Build dynamic update query
  const fields = [];
  const values = [];

  // Map frontend field names to database column names
  const fieldMapping = {
    workYear: 'work_year',
    requiredQuarter: 'required_quarter',
    title: 'title',
    description: 'description',
    requesterName: 'requester_name',
    divisionName: 'division_name',
    departmentName: 'department_name',
    domainName: 'domain_name',
    estimatedAmount: 'estimated_amount',
    currency: 'currency',
    supplierList: 'supplier_list',
    justification: 'justification',
    planningSource: 'planning_source',
    complexity: 'complexity',
    engagementTypeId: 'engagement_type_id',
    engagementTypeName: 'engagement_type_name',
    status: 'status',
    assignedOfficerId: 'assigned_officer_id',
    assignedOfficerName: 'assigned_officer_name',
    teamId: 'team_id',
    teamName: 'team_name',
    startDate: 'start_date',
    planningNotes: 'planning_notes',
    officerNotes: 'officer_notes'
  };

  Object.keys(updateData).forEach(key => {
    if (fieldMapping[key]) {
      fields.push(`${fieldMapping[key]} = ?`);
      // Convert undefined to null for SQLite compatibility
      const value = updateData[key] !== undefined ? updateData[key] : null;
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  // Add updated_at
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `UPDATE programs SET ${fields.join(', ')} WHERE task_id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      console.error('Error updating program:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Fetch updated program
    db.get(
      `SELECT p.*, 
              d.name as division_name, 
              dept.name as department_name,
              dom.description as domain_name
       FROM programs p 
       LEFT JOIN divisions d ON p.division_id = d.id 
       LEFT JOIN departments dept ON p.department_id = dept.id 
       LEFT JOIN domains dom ON p.domain_id = dom.id
       WHERE p.task_id = ?`,
      [id],
      (err, row) => {
        if (err) {
          console.error('Error fetching updated program:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const program = {
          taskId: row.task_id,
          workYear: row.work_year,
          requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
          title: row.title,
          description: row.description,
          requesterId: row.requester_id,
          requesterName: row.requester_name,
          divisionId: row.division_id,
          divisionName: row.division_name || row.division_name,
          departmentId: row.department_id,
          departmentName: row.department_name || row.department_name,
          domainId: row.domain_id,
          domainName: row.domain_name || row.domain_name,
          estimatedAmount: row.estimated_amount,
          currency: row.currency,
          supplierList: row.supplier_list,
          justification: row.justification,
          planningSource: row.planning_source,
          complexity: row.complexity,
          engagementTypeId: row.engagement_type_id,
          engagementTypeName: row.engagement_type_name,
          status: row.status,
          assignedOfficerId: row.assigned_officer_id,
          assignedOfficerName: row.assigned_officer_name,
          teamId: row.team_id,
          teamName: row.team_name,
          startDate: row.start_date ? new Date(row.start_date) : null,
          planningNotes: row.planning_notes,
          officerNotes: row.officer_notes,
          lastUpdate: new Date(row.updated_at),
          createdAt: new Date(row.created_at)
        };

        res.json(program);
      }
    );
  });
});

// Delete program
router.delete('/:id', authenticateToken, requireRole([0, 1, 9]), (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM programs WHERE task_id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting program:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json({ message: 'Program deleted successfully' });
  });
});

export default router;