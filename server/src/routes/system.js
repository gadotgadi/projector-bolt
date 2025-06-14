const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');

// Mock data for system tables
let activityPool = [
  { id: 1, name: 'בדיקת הצעות מחיר', toolsAndResources: 'מערכת השוואת מחירים' },
  { id: 2, name: 'הכנת מפרט טכני', toolsAndResources: 'תבניות מפרט' },
  { id: 3, name: 'פרסום מכרז', toolsAndResources: 'אתר מכרזים' },
  { id: 4, name: 'הערכת הצעות', toolsAndResources: 'מערכת הערכה' },
  { id: 5, name: 'בחירת זוכה', toolsAndResources: 'ועדת בחירה' },
  { id: 6, name: 'חתימה על הסכם', toolsAndResources: 'מערכת חתימות' },
  { id: 7, name: 'בקרת איכות', toolsAndResources: 'רשימת בדיקות' },
  { id: 8, name: 'אישור תשלום', toolsAndResources: 'מערכת כספים' },
  { id: 9, name: 'מעקב ביצוע', toolsAndResources: 'מערכת מעקב' },
  { id: 10, name: 'סגירת פרויקט', toolsAndResources: 'דוח סיכום' }
];

let domains = [
  { id: 1, description: 'רכש טכנולוגיה ומחשוב' },
  { id: 2, description: 'רכש שירותים מקצועיים' },
  { id: 3, description: 'רכש ציוד משרדי' }
];

let divisions = [
  { id: 1, name: 'אגף תפעול', isInternal: true },
  { id: 2, name: 'אגף שיווק', isInternal: true },
  { id: 3, name: 'לקוח חיצוני א', isInternal: false }
];

let departments = [
  { id: 1, name: 'מחלקת הנדסה', divisionId: 1 },
  { id: 2, name: 'מחלקת איכות', divisionId: 1 },
  { id: 3, name: 'מחלקת שירות לקוחות', divisionId: 2 }
];

let procurementTeams = [
  { id: 1, name: 'צוות רכש א' },
  { id: 2, name: 'צוות רכש ב' },
  { id: 3, name: 'צוות רכש מיוחד' }
];

// Activity Pool routes
router.get('/activity-pool', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  res.json(activityPool);
});

router.post('/activity-pool', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const { name, toolsAndResources } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newActivity = {
    id: Math.max(...activityPool.map(a => a.id), 0) + 1,
    name,
    toolsAndResources
  };
  
  activityPool.push(newActivity);
  res.status(201).json(newActivity);
});

router.put('/activity-pool/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, toolsAndResources } = req.body;
  
  const activityIndex = activityPool.findIndex(a => a.id === id);
  if (activityIndex === -1) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  activityPool[activityIndex] = { ...activityPool[activityIndex], name, toolsAndResources };
  res.json(activityPool[activityIndex]);
});

router.delete('/activity-pool/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const activityIndex = activityPool.findIndex(a => a.id === id);
  
  if (activityIndex === -1) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
  activityPool.splice(activityIndex, 1);
  res.status(204).send();
});

// Domains routes
router.get('/domains', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  res.json(domains);
});

router.post('/domains', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  
  const newDomain = {
    id: Math.max(...domains.map(d => d.id), 0) + 1,
    description
  };
  
  domains.push(newDomain);
  res.status(201).json(newDomain);
});

router.put('/domains/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const { description } = req.body;
  
  const domainIndex = domains.findIndex(d => d.id === id);
  if (domainIndex === -1) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  
  domains[domainIndex] = { ...domains[domainIndex], description };
  res.json(domains[domainIndex]);
});

router.delete('/domains/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const domainIndex = domains.findIndex(d => d.id === id);
  
  if (domainIndex === -1) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  domains.splice(domainIndex, 1);
  res.status(204).send();
});

// Divisions routes
router.get('/divisions', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  res.json(divisions);
});

router.post('/divisions', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const { name, isInternal } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newDivision = {
    id: Math.max(...divisions.map(d => d.id), 0) + 1,
    name,
    isInternal: Boolean(isInternal)
  };
  
  divisions.push(newDivision);
  res.status(201).json(newDivision);
});

router.put('/divisions/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, isInternal } = req.body;
  
  const divisionIndex = divisions.findIndex(d => d.id === id);
  if (divisionIndex === -1) {
    return res.status(404).json({ error: 'Division not found' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  divisions[divisionIndex] = { ...divisions[divisionIndex], name, isInternal: Boolean(isInternal) };
  res.json(divisions[divisionIndex]);
});

router.delete('/divisions/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const divisionIndex = divisions.findIndex(d => d.id === id);
  
  if (divisionIndex === -1) {
    return res.status(404).json({ error: 'Division not found' });
  }
  
  divisions.splice(divisionIndex, 1);
  res.status(204).send();
});

// Departments routes
router.get('/departments', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  res.json(departments);
});

router.post('/departments', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const { name, divisionId } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newDepartment = {
    id: Math.max(...departments.map(d => d.id), 0) + 1,
    name,
    divisionId: divisionId ? parseInt(divisionId) : undefined
  };
  
  departments.push(newDepartment);
  res.status(201).json(newDepartment);
});

router.put('/departments/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, divisionId } = req.body;
  
  const departmentIndex = departments.findIndex(d => d.id === id);
  if (departmentIndex === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  departments[departmentIndex] = { 
    ...departments[departmentIndex], 
    name, 
    divisionId: divisionId ? parseInt(divisionId) : undefined 
  };
  res.json(departments[departmentIndex]);
});

router.delete('/departments/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const departmentIndex = departments.findIndex(d => d.id === id);
  
  if (departmentIndex === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }
  
  departments.splice(departmentIndex, 1);
  res.status(204).send();
});

// Procurement Teams routes
router.get('/procurement-teams', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  res.json(procurementTeams);
});

router.post('/procurement-teams', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newTeam = {
    id: Math.max(...procurementTeams.map(t => t.id), 0) + 1,
    name
  };
  
  procurementTeams.push(newTeam);
  res.status(201).json(newTeam);
});

router.put('/procurement-teams/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  
  const teamIndex = procurementTeams.findIndex(t => t.id === id);
  if (teamIndex === -1) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  procurementTeams[teamIndex] = { ...procurementTeams[teamIndex], name };
  res.json(procurementTeams[teamIndex]);
});

router.delete('/procurement-teams/:id', authorizeRoles(['admin', 'technical_maintainer']), (req, res) => {
  const id = parseInt(req.params.id);
  const teamIndex = procurementTeams.findIndex(t => t.id === id);
  
  if (teamIndex === -1) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  procurementTeams.splice(teamIndex, 1);
  res.status(204).send();
});

module.exports = router;