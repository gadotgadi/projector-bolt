import bcrypt from 'bcryptjs';
import { getDatabase, initializeDatabase, closeDatabase } from '../config/database.js';

async function seedDatabase() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('Seeding database with initial data...');
    
    // Seed organizational roles
    const roles = [
      { roleCode: 1, description: 'מנהל רכש', permissions: 'הרשאות מלאות לניהול כל תהליכי הרכש' },
      { roleCode: 2, description: 'ראש צוות', permissions: 'ניהול צוות קניינים ומעקב משימות' },
      { roleCode: 3, description: 'קניין', permissions: 'ביצוע פעילויות רכש ומעקב משימות' },
      { roleCode: 4, description: 'גורם דורש', permissions: 'הגשת בקשות רכש ומעקב אחר סטטוס' },
      { roleCode: 5, description: 'מנהלן מערכת', permissions: 'ניהול הגדרות מערכת וטבלאות עזר' },
      { roleCode: 9, description: 'גורם טכני', permissions: 'תחזוקת תשתיות המערכת' }
    ];
    
    for (const role of roles) {
      db.run(
        'INSERT OR IGNORE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)',
        [role.roleCode, role.description, role.permissions]
      );
    }
    
    // Seed divisions
    const divisions = [
      { name: 'אגף תפעול', isInternal: true },
      { name: 'אגף שיווק', isInternal: true },
      { name: 'לקוח חיצוני א', isInternal: false }
    ];
    
    for (const division of divisions) {
      db.run(
        'INSERT OR IGNORE INTO divisions (name, is_internal) VALUES (?, ?)',
        [division.name, division.isInternal]
      );
    }
    
    // Seed departments
    const departments = [
      { name: 'מחלקת הנדסה', divisionId: 1 },
      { name: 'מחלקת איכות', divisionId: 1 },
      { name: 'מחלקת שירות לקוחות', divisionId: 2 }
    ];
    
    for (const dept of departments) {
      db.run(
        'INSERT OR IGNORE INTO departments (name, division_id) VALUES (?, ?)',
        [dept.name, dept.divisionId]
      );
    }
    
    // Seed procurement teams
    const teams = [
      'יעודי', 'טכנולוגי', 'לוגיסטי', 'מחשוב', 'הנדסי', 'ביטחוני'
    ];
    
    for (const team of teams) {
      db.run('INSERT OR IGNORE INTO procurement_teams (name) VALUES (?)', [team]);
    }
    
    // Seed domains
    const domains = [
      'רכש טכנולוגיה ומחשוב',
      'רכש שירותים מקצועיים',
      'רכש ציוד משרדי'
    ];
    
    for (const domain of domains) {
      db.run('INSERT OR IGNORE INTO domains (description) VALUES (?)', [domain]);
    }
    
    // Seed activity pool
    const activities = [
      { name: 'בדיקת הצעות מחיר', tools: 'מערכת השוואת מחירים' },
      { name: 'הכנת מפרט טכני', tools: 'תבניות מפרט, ייעוץ טכני' },
      { name: 'פרסום מכרז', tools: 'מערכת פרסום, אתר החברה' },
      { name: 'הערכת הצעות', tools: 'מטריצת הערכה, ועדת בחינה' },
      { name: 'בחירת זוכה', tools: 'פרוטוקול החלטה' },
      { name: 'חתימה על הסכם', tools: 'מערכת ניהול חוזים' },
      { name: 'בקרת איכות', tools: 'רשימת בדיקות איכות' },
      { name: 'אישור תשלום', tools: 'מערכת כספים' },
      { name: 'מעקב ביצוע', tools: 'מערכת מעקב פרויקטים' },
      { name: 'סגירת פרויקט', tools: 'דוח סיכום' },
      { name: 'דוח סיכום', tools: 'תבנית דוח' }
    ];
    
    for (const activity of activities) {
      db.run(
        'INSERT OR IGNORE INTO activity_pool (name, tools_and_resources) VALUES (?, ?)',
        [activity.name, activity.tools]
      );
    }
    
    // Seed engagement types
    const engagementTypes = [
      'מכרז פומבי',
      'מכרז מוגבל',
      'מכרז פתוח מוגבל',
      'רכש השוואתי'
    ];
    
    for (const type of engagementTypes) {
      db.run('INSERT OR IGNORE INTO engagement_types (name) VALUES (?)', [type]);
    }
    
    // Create default admin user
    const adminPassword = await bcrypt.hash('123456', 12);
    db.run(
      `INSERT OR IGNORE INTO users (
        employee_id, full_name, role_code, role_description, 
        password_hash, email
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      ['9999', 'מנהל מערכת', 9, 'גורם טכני', adminPassword, 'admin@system.com']
    );
    
    // Create sample procurement manager
    const managerPassword = await bcrypt.hash('123456', 12);
    db.run(
      `INSERT OR IGNORE INTO users (
        employee_id, full_name, role_code, role_description, 
        password_hash, procurement_team, available_work_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['1001', 'אברהם מנהל', 1, 'מנהל רכש', managerPassword, 'יעודי', 200]
    );
    
    console.log('Database seeded successfully!');
    console.log('Default users created:');
    console.log('- Admin: 9999 / 123456');
    console.log('- Manager: 1001 / 123456');
    
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

export { seedDatabase };