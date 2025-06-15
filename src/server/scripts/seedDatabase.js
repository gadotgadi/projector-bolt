import bcrypt from 'bcryptjs';
import { getDatabase, initializeDatabase, closeDatabase } from '../config/database.js';

async function seedDatabase() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('Seeding database with initial data...');
    
    // Seed organizational roles first
    const roles = [
      { roleCode: 0, description: 'מנהלן מערכת', permissions: 'הרשאות מלאות לניהול המערכת' },
      { roleCode: 1, description: 'מנהל רכש', permissions: 'הרשאות מלאות לניהול כל תהליכי הרכש' },
      { roleCode: 2, description: 'ראש צוות', permissions: 'ניהול צוות קניינים ומעקב משימות' },
      { roleCode: 3, description: 'קניין', permissions: 'ביצוע פעילויות רכש ומעקב משימות' },
      { roleCode: 4, description: 'גורם דורש', permissions: 'הגשת בקשות רכש ומעקב אחר סטטוס' },
      { roleCode: 5, description: 'מנהלן מערכת', permissions: 'ניהול הגדרות מערכת וטבלאות עזר' },
      { roleCode: 9, description: 'גורם טכני', permissions: 'תחזוקת תשתיות המערכת' }
    ];
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)');
        for (const role of roles) {
          stmt.run([role.roleCode, role.description, role.permissions]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Seed divisions
    const divisions = [
      { name: 'אגף תפעול', isInternal: true },
      { name: 'אגף שיווק', isInternal: true },
      { name: 'לקוח חיצוני א', isInternal: false }
    ];
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO divisions (name, is_internal) VALUES (?, ?)');
        for (const division of divisions) {
          stmt.run([division.name, division.isInternal]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Seed departments (after divisions)
    const departments = [
      { name: 'מחלקת הנדסה', divisionId: 1 },
      { name: 'מחלקת איכות', divisionId: 1 },
      { name: 'מחלקת שירות לקוחות', divisionId: 2 }
    ];
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO departments (name, division_id) VALUES (?, ?)');
        for (const dept of departments) {
          stmt.run([dept.name, dept.divisionId]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Seed procurement teams
    const teams = [
      'יעודי', 'טכנולוגי', 'לוגיסטי', 'מחשוב', 'הנדסי', 'ביטחוני'
    ];
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO procurement_teams (name) VALUES (?)');
        for (const team of teams) {
          stmt.run([team]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Seed domains
    const domains = [
      'רכש טכנולוגיה ומחשוב',
      'רכש שירותים מקצועיים',
      'רכש ציוד משרדי'
    ];
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO domains (description) VALUES (?)');
        for (const domain of domains) {
          stmt.run([domain]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
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
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO activity_pool (name, tools_and_resources) VALUES (?, ?)');
        for (const activity of activities) {
          stmt.run([activity.name, activity.tools]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Seed engagement types
    const engagementTypes = [
      'מכרז פומבי',
      'מכרז מוגבל',
      'מכרז פתוח מוגבל',
      'רכש השוואתי'
    ];
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO engagement_types (name) VALUES (?)');
        for (const type of engagementTypes) {
          stmt.run([type]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // Seed complexity estimates (single record)
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) 
        VALUES (1, 5, 10, 20)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Seed acceptance options
    const acceptanceOptions = [
      {
        yearId: 2024,
        uploadCode: 'Finish',
        uploadCodeDescription: 'הסתיים',
        broadMeaning: 'שנת 2024 הסתיימה ולא ניתן להעלות דרישות חדשות'
      },
      {
        yearId: 2025,
        uploadCode: 'Plan',
        uploadCodeDescription: 'מתוכנן',
        broadMeaning: 'פתוח לקליטת דרישות חדשות לשנת 2025'
      }
    ];

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO acceptance_options (year_id, upload_code, upload_code_description, broad_meaning) 
          VALUES (?, ?, ?, ?)
        `);
        for (const option of acceptanceOptions) {
          stmt.run([option.yearId, option.uploadCode, option.uploadCodeDescription, option.broadMeaning]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Create default admin user (after organizational_roles is populated)
    const adminPassword = await bcrypt.hash('123456', 12);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO users (
          employee_id, full_name, role_code, role_description, 
          password_hash, email
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        ['9999', 'מנהל מערכת', 9, 'גורם טכני', adminPassword, 'admin@system.com'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Create sample procurement manager (after organizational_roles is populated)
    const managerPassword = await bcrypt.hash('123456', 12);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO users (
          employee_id, full_name, role_code, role_description, 
          password_hash, procurement_team, available_work_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['1001', 'אברהם מנהל', 1, 'מנהל רכש', managerPassword, 'יעודי', 200],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
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