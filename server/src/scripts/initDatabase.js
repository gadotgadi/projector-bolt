const { initializeDatabase, closeDatabase } = require('../config/database');

async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

if (require.main === module) {
  main();
}