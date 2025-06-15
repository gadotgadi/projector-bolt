import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable or default path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/procurement.db');

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    console.log('Initializing database at:', DB_PATH);
    dbInstance = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('Connected to SQLite database at:', DB_PATH);
    });

    // Enable foreign keys
    dbInstance.run('PRAGMA foreign_keys = ON');
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
    dbInstance = null;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, closing database...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing database...');
  closeDatabase();
  process.exit(0);
});

export async function initializeDatabase() {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    console.log('Creating database tables...');
    
    db.serialize(() => {
      // Create organizational_roles table
      db.run(`
        CREATE TABLE IF NOT EXISTS organizational_roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role_code INTEGER UNIQUE NOT NULL,
          description TEXT NOT NULL,
          permissions TEXT
        )
      `);

      // Create divisions table
      db.run(`
        CREATE TABLE IF NOT EXISTS divisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT 1
        )
      `);

      // Create departments table
      db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          division_id INTEGER,
          FOREIGN KEY (division_id) REFERENCES divisions(id)
        )
      `);

      // Create procurement_teams table
      db.run(`
        CREATE TABLE IF NOT EXISTS procurement_teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        )
      `);

      // Create workers table
      db.run(`
        CREATE TABLE IF NOT EXISTS workers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT UNIQUE NOT NULL,
          role_code INTEGER NOT NULL,
          full_name TEXT NOT NULL,
          role_description TEXT,
          division_id INTEGER,
          department_id INTEGER,
          procurement_team TEXT,
          password TEXT NOT NULL,
          available_work_days TEXT,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_code) REFERENCES organizational_roles(role_code),
          FOREIGN KEY (division_id) REFERENCES divisions(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
        )
      `);

      // Create activity_pool table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_pool (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          tools_and_resources TEXT
        )
      `);

      // Create domains table
      db.run(`
        CREATE TABLE IF NOT EXISTS domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL
        )
      `);

      // Create programs table (main tasks)
      db.run(`
        CREATE TABLE IF NOT EXISTS programs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER UNIQUE NOT NULL,
          work_year INTEGER NOT NULL,
          required_quarter DATE,
          title TEXT NOT NULL,
          description TEXT,
          requester_id INTEGER,
          requester_name TEXT NOT NULL,
          division_id INTEGER,
          division_name TEXT NOT NULL,
          department_id INTEGER,
          department_name TEXT,
          domain_id INTEGER,
          domain_name TEXT,
          estimated_amount REAL,
          currency TEXT,
          supplier_list TEXT,
          justification TEXT,
          planning_source TEXT NOT NULL DEFAULT 'annual_planning',
          complexity INTEGER,
          engagement_type_id INTEGER,
          engagement_type_name TEXT,
          status TEXT NOT NULL DEFAULT 'Open',
          assigned_officer_id INTEGER,
          assigned_officer_name TEXT,
          team_id INTEGER,
          team_name TEXT,
          start_date DATE,
          planning_notes TEXT,
          officer_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (division_id) REFERENCES divisions(id),
          FOREIGN KEY (department_id) REFERENCES departments(id),
          FOREIGN KEY (domain_id) REFERENCES domains(id)
        )
      `);

      // Create program_tasks table (stations)
      db.run(`
        CREATE TABLE IF NOT EXISTS program_tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          program_id INTEGER NOT NULL,
          station_id INTEGER NOT NULL,
          activity_id INTEGER,
          assigned_officer_id INTEGER,
          assigned_officer_name TEXT,
          completion_date DATE,
          reporting_user_id INTEGER,
          reporting_user_name TEXT,
          reference TEXT,
          notes TEXT,
          is_last_station BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
          FOREIGN KEY (activity_id) REFERENCES activity_pool(id),
          UNIQUE(program_id, station_id)
        )
      `);

      // Create complexity_estimates table
      db.run(`
        CREATE TABLE IF NOT EXISTS complexity_estimates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estimate_level_1 INTEGER NOT NULL DEFAULT 5,
          estimate_level_2 INTEGER NOT NULL DEFAULT 10,
          estimate_level_3 INTEGER NOT NULL DEFAULT 20,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create acceptance_options table
      db.run(`
        CREATE TABLE IF NOT EXISTS acceptance_options (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year_id INTEGER NOT NULL,
          upload_code TEXT NOT NULL,
          upload_code_description TEXT NOT NULL,
          broad_meaning TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(year_id)
        )
      `);

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_workers_employee_id ON workers(employee_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_workers_role_code ON workers(role_code)');
      db.run('CREATE INDEX IF NOT EXISTS idx_programs_task_id ON programs(task_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_program_tasks_program_id ON program_tasks(program_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_program_tasks_station_id ON program_tasks(station_id)');

      console.log('Database tables and indexes created successfully');
      resolve();
    });

    db.on('error', (err) => {
      console.error('Database error:', err);
      reject(err);
    });
  });
}