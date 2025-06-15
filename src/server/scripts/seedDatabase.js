import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    console.log('Seeding database with initial data...');
    
    db.serialize(async () => {
      try {
        // Check if data already exists
        db.get('SELECT COUNT(*) as count FROM organizational_roles', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (row.count > 0) {
            console.log('Database already seeded, skipping...');
            resolve();
            return;
          }
          
          // Seed organizational roles
          const roles = [
            { role_code: 0, description: 'מנהלן מערכת', permissions: 'מלא' },
            { role_code: 1, description: 'מנהל רכש', permissions: 'ניהול רכש' },
            { role_code: 2, description: 'ראש צוות', permissions: 'ניהול צוות' },
            { role_code: 3, description: 'קניין', permissions: 'ביצוע רכש' },
            { role_code: 4, description: 'גורם דורש', permissions: 'הגשת דרישות' },
            { role_code: 5, description: 'מנהלן מערכת', permissions: 'מלא' },
            { role_code: 9, description: 'גורם טכני', permissions: 'תחזוקה טכנית' }
          ];

          roles.forEach(role => {
            db.run(
              'INSERT OR IGNORE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)',
              [role.role_code, role.description, role.permissions]
            );
          });

          // Seed divisions
          const divisions = [
            { name: 'לוגיסטיקה', is_internal: 1 },
            { name: 'טכנולוגיה', is_internal: 1 },
            { name: 'מחקר ופיתוח', is_internal: 1 },
            { name: 'משאבי אנוש', is_internal: 1 }
          ];

          divisions.forEach(division => {
            db.run(
              'INSERT OR IGNORE INTO divisions (name, is_internal) VALUES (?, ?)',
              [division.name, division.is_internal]
            );
          });

          // Seed departments
          const departments = [
            { name: 'רכש וחוזים', division_id: 1 },
            { name: 'תפעול ותחזוקה', division_id: 1 },
            { name: 'מערכות מידע', division_id: 2 },
            { name: 'פיתוח תוכנה', division_id: 2 }
          ];

          departments.forEach(dept => {
            db.run(
              'INSERT OR IGNORE INTO departments (name, division_id) VALUES (?, ?)',
              [dept.name, dept.division_id]
            );
          });

          // Seed procurement teams
          const teams = [
            { name: 'יעודי' },
            { name: 'טכנולוגי' },
            { name: 'לוגיסטי' },
            { name: 'מחשוב' },
            { name: 'הנדסי' },
            { name: 'ביטחוני' }
          ];

          teams.forEach(team => {
            db.run(
              'INSERT OR IGNORE INTO procurement_teams (name) VALUES (?)',
              [team.name]
            );
          });

          // Seed activity pool
          const activities = [
            { name: 'בדיקת הצעות מחיר', tools_and_resources: 'מערכת השוואת מחירים' },
            { name: 'הכנת מפרט טכני', tools_and_resources: 'תבניות מפרט' },
            { name: 'פרסום מכרז', tools_and_resources: 'מערכת פרסום' },
            { name: 'הערכת הצעות', tools_and_resources: 'מטריצת הערכה' },
            { name: 'בחירת זוכה', tools_and_resources: 'ועדת הערכה' },
            { name: 'חתימה על הסכם', tools_and_resources: 'מערכת חתימות' },
            { name: 'בקרת איכות', tools_and_resources: 'רשימת בדיקות' },
            { name: 'אישור תשלום', tools_and_resources: 'מערכת כספים' },
            { name: 'מעקב ביצוע', tools_and_resources: 'מערכת מעקב' },
            { name: 'סגירת פרויקט', tools_and_resources: 'דוח סיכום' },
            { name: 'דו"ח סיכום', tools_and_resources: 'תבנית דוח' }
          ];

          activities.forEach(activity => {
            db.run(
              'INSERT OR IGNORE INTO activity_pool (name, tools_and_resources) VALUES (?, ?)',
              [activity.name, activity.tools_and_resources]
            );
          });

          // Seed domains
          const domains = [
            { description: 'רכש לוגיסטי' },
            { description: 'רכש טכנולוגי' },
            { description: 'שירותים מקצועיים' },
            { description: 'תחזוקה ותפעול' }
          ];

          domains.forEach(domain => {
            db.run(
              'INSERT OR IGNORE INTO domains (description) VALUES (?)',
              [domain.description]
            );
          });

          // Create default users with proper password hashing
          const defaultPassword = '123456';
          console.log('🔍 Creating default users with password:', defaultPassword);
          
          // Hash the password synchronously to ensure it's ready
          const hashedPassword = bcrypt.hashSync(defaultPassword, 12);
          console.log('🔍 Hashed password created, length:', hashedPassword.length);

          const defaultUsers = [
            {
              employee_id: '9999',
              role_code: 0,
              full_name: 'מנהל מערכת',
              role_description: 'מנהלן מערכת',
              password: hashedPassword
            },
            {
              employee_id: '1001',
              role_code: 1,
              full_name: 'מנהל רכש',
              role_description: 'מנהל רכש ראשי',
              password: hashedPassword
            }
          ];

          // Insert users one by one to ensure they're created
          let usersCreated = 0;
          defaultUsers.forEach((user, index) => {
            db.run(
              `INSERT OR REPLACE INTO workers 
               (employee_id, role_code, full_name, role_description, password) 
               VALUES (?, ?, ?, ?, ?)`,
              [user.employee_id, user.role_code, user.full_name, user.role_description, user.password],
              function(err) {
                if (err) {
                  console.error('❌ Error creating user:', user.employee_id, err);
                } else {
                  console.log('✅ Created user:', user.employee_id, 'with ID:', this.lastID);
                }
                
                usersCreated++;
                if (usersCreated === defaultUsers.length) {
                  // Verify users were created
                  db.all('SELECT employee_id, full_name, role_code FROM workers', (err, rows) => {
                    if (err) {
                      console.error('❌ Error verifying users:', err);
                    } else {
                      console.log('✅ Users in database after seeding:', rows);
                    }
                  });
                  
                  // Seed complexity estimates
                  db.run(
                    'INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) VALUES (1, 5, 10, 20)'
                  );

                  console.log('✅ Database seeded successfully!');
                  console.log('Default users created:');
                  console.log('- Admin: 9999 / 123456');
                  console.log('- Manager: 1001 / 123456');
                  
                  resolve();
                }
              }
            );
          });
        });
      } catch (error) {
        console.error('❌ Error seeding database:', error);
        reject(error);
      }
    });
  });
}