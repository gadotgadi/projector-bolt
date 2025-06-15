import { getDatabase, closeDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

export async function resetDatabase() {
  console.log('🔧 Resetting database...');
  
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Clear existing users
        db.run('DELETE FROM workers', (err) => {
          if (err) {
            console.error('❌ Error clearing workers:', err);
            reject(err);
            return;
          }
          console.log('✅ Cleared existing workers');
        });

        // Create fresh default users
        const defaultPassword = '123456';
        console.log('🔍 Creating users with password:', defaultPassword);
        
        const hashedPassword = bcrypt.hashSync(defaultPassword, 12);
        console.log('🔍 Hashed password length:', hashedPassword.length);

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

        let usersCreated = 0;
        defaultUsers.forEach((user, index) => {
          db.run(
            `INSERT INTO workers 
             (employee_id, role_code, full_name, role_description, password) 
             VALUES (?, ?, ?, ?, ?)`,
            [user.employee_id, user.role_code, user.full_name, user.role_description, user.password],
            function(err) {
              if (err) {
                console.error('❌ Error creating user:', user.employee_id, err);
                reject(err);
                return;
              }
              
              console.log('✅ Created user:', user.employee_id, 'with ID:', this.lastID);
              
              usersCreated++;
              if (usersCreated === defaultUsers.length) {
                // Verify users were created
                db.all('SELECT employee_id, full_name, role_code FROM workers', (err, rows) => {
                  if (err) {
                    console.error('❌ Error verifying users:', err);
                    reject(err);
                    return;
                  }
                  
                  console.log('✅ Users in database after reset:', rows);
                  console.log('✅ Database reset completed successfully!');
                  console.log('Default login credentials:');
                  console.log('- Admin: 9999 / 123456');
                  console.log('- Manager: 1001 / 123456');
                  
                  resolve();
                });
              }
            }
          );
        });
      } catch (error) {
        console.error('❌ Error resetting database:', error);
        reject(error);
      }
    });
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase()
    .then(() => {
      console.log('✅ Database reset completed');
      closeDatabase();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database reset failed:', error);
      closeDatabase();
      process.exit(1);
    });
}