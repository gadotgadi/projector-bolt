const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

// Mock data - in production this would come from a database
let workers = [
  {
    id: 1,
    employeeId: '1001',
    roleCode: 1,
    fullName: 'אבי כהן',
    roleDescription: 'מנהל רכש',
    divisionId: null,
    departmentId: null,
    procurementTeam: null,
    password: '123456',
    availableWorkDays: null,
    email: 'avi@company.com'
  },
  {
    id: 2,
    employeeId: '1002',
    roleCode: 2,
    fullName: 'שרה לוי',
    roleDescription: 'קניין בכיר',
    divisionId: null,
    departmentId: null,
    procurementTeam: 'צוות רכש א',
    password: '123456',
    availableWorkDays: '20',
    email: null
  }
];

let nextId = 3;

// Get all workers
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'שגיאה בטעינת רשימת העובדים' });
  }
});

// Get worker by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const worker = workers.find(w => w.id === parseInt(req.params.id));
    if (!worker) {
      return res.status(404).json({ error: 'עובד לא נמצא' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'שגיאה בטעינת פרטי העובד' });
  }
});

// Create new worker
router.post('/', authenticateToken, requireRole(['admin', 'technical_maintainer']), (req, res) => {
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

    // Validation
    if (!employeeId || !roleCode || !fullName || !password) {
      return res.status(400).json({ error: 'שדות חובה חסרים' });
    }

    // Check if employee ID already exists
    const existingWorker = workers.find(w => w.employeeId === employeeId);
    if (existingWorker) {
      return res.status(400).json({ error: 'קוד עובד כבר קיים במערכת' });
    }

    // Validate employee ID format (4 digits)
    if (!/^\d{4}$/.test(employeeId)) {
      return res.status(400).json({ error: 'קוד עובד חייב להיות בן 4 ספרות' });
    }

    // Validate role code
    if (![1, 2, 3, 4, 5, 9].includes(roleCode)) {
      return res.status(400).json({ error: 'קוד תפקיד לא תקין' });
    }

    // Validate password length
    if (password.length !== 6) {
      return res.status(400).json({ error: 'סיסמה חייבת להיות בת 6 תווים' });
    }

    const newWorker = {
      id: nextId++,
      employeeId,
      roleCode,
      fullName,
      roleDescription: roleDescription || null,
      divisionId: divisionId || null,
      departmentId: departmentId || null,
      procurementTeam: procurementTeam || null,
      password,
      availableWorkDays: availableWorkDays || null,
      email: email || null
    };

    workers.push(newWorker);
    res.status(201).json(newWorker);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'שגיאה ביצירת העובד' });
  }
});

// Update worker
router.put('/:id', authenticateToken, requireRole(['admin', 'technical_maintainer']), (req, res) => {
  try {
    const workerId = parseInt(req.params.id);
    const workerIndex = workers.findIndex(w => w.id === workerId);
    
    if (workerIndex === -1) {
      return res.status(404).json({ error: 'עובד לא נמצא' });
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

    // Check if employee ID already exists (excluding current worker)
    if (employeeId) {
      const existingWorker = workers.find(w => w.employeeId === employeeId && w.id !== workerId);
      if (existingWorker) {
        return res.status(400).json({ error: 'קוד עובד כבר קיים במערכת' });
      }

      // Validate employee ID format
      if (!/^\d{4}$/.test(employeeId)) {
        return res.status(400).json({ error: 'קוד עובד חייב להיות בן 4 ספרות' });
      }
    }

    // Validate role code if provided
    if (roleCode && ![1, 2, 3, 4, 5, 9].includes(roleCode)) {
      return res.status(400).json({ error: 'קוד תפקיד לא תקין' });
    }

    // Validate password length if provided
    if (password && password.length !== 6) {
      return res.status(400).json({ error: 'סיסמה חייבת להיות בת 6 תווים' });
    }

    // Update worker
    const updatedWorker = {
      ...workers[workerIndex],
      ...(employeeId && { employeeId }),
      ...(roleCode && { roleCode }),
      ...(fullName && { fullName }),
      ...(roleDescription !== undefined && { roleDescription }),
      ...(divisionId !== undefined && { divisionId }),
      ...(departmentId !== undefined && { departmentId }),
      ...(procurementTeam !== undefined && { procurementTeam }),
      ...(password && { password }),
      ...(availableWorkDays !== undefined && { availableWorkDays }),
      ...(email !== undefined && { email })
    };

    workers[workerIndex] = updatedWorker;
    res.json(updatedWorker);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'שגיאה בעדכון העובד' });
  }
});

// Delete worker
router.delete('/:id', authenticateToken, requireRole(['admin', 'technical_maintainer']), (req, res) => {
  try {
    const workerId = parseInt(req.params.id);
    const workerIndex = workers.findIndex(w => w.id === workerId);
    
    if (workerIndex === -1) {
      return res.status(404).json({ error: 'עובד לא נמצא' });
    }

    // Check if worker is assigned to any active tasks
    // In a real application, you would check the database for task assignments
    // For now, we'll allow deletion but in production you might want to prevent it
    
    workers.splice(workerIndex, 1);
    res.json({ message: 'העובד נמחק בהצלחה' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'שגיאה במחיקת העובד' });
  }
});

// Get workers by role
router.get('/role/:roleCode', authenticateToken, (req, res) => {
  try {
    const roleCode = parseInt(req.params.roleCode);
    const filteredWorkers = workers.filter(w => w.roleCode === roleCode);
    res.json(filteredWorkers);
  } catch (error) {
    console.error('Error fetching workers by role:', error);
    res.status(500).json({ error: 'שגיאה בטעינת עובדים לפי תפקיד' });
  }
});

// Get workers by procurement team
router.get('/team/:teamName', authenticateToken, (req, res) => {
  try {
    const teamName = req.params.teamName;
    const filteredWorkers = workers.filter(w => w.procurementTeam === teamName);
    res.json(filteredWorkers);
  } catch (error) {
    console.error('Error fetching workers by team:', error);
    res.status(500).json({ error: 'שגיאה בטעינת עובדי הצוות' });
  }
});

module.exports = router;