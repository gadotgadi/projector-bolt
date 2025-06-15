var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/server/config/database.js
import sqlite3 from "file:///home/project/node_modules/sqlite3/lib/sqlite3.js";
import path from "path";
import fs from "fs";
function getDatabase() {
  if (!db) {
    console.log("Initializing database at:", DB_PATH);
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        throw err;
      }
      console.log("Connected to SQLite database at:", DB_PATH);
    });
    db.run("PRAGMA foreign_keys = ON");
  }
  return db;
}
async function initializeDatabase() {
  const db2 = getDatabase();
  return new Promise((resolve, reject) => {
    db2.serialize(() => {
      console.log("Creating database tables...");
      db2.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          role_code INTEGER NOT NULL,
          role_description TEXT,
          division_id INTEGER,
          department_id INTEGER,
          procurement_team TEXT,
          password_hash TEXT NOT NULL,
          available_work_days INTEGER,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS organizational_roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role_code INTEGER UNIQUE NOT NULL,
          description TEXT NOT NULL,
          permissions TEXT
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS divisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT 1
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          division_id INTEGER,
          FOREIGN KEY (division_id) REFERENCES divisions(id)
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS procurement_teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS activity_pool (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          tools_and_resources TEXT
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS engagement_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS engagement_type_processes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          engagement_type_id INTEGER NOT NULL,
          station_id INTEGER NOT NULL,
          activity_id INTEGER NOT NULL,
          FOREIGN KEY (engagement_type_id) REFERENCES engagement_types(id),
          FOREIGN KEY (activity_id) REFERENCES activity_pool(id),
          UNIQUE(engagement_type_id, station_id)
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS programs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER UNIQUE NOT NULL,
          work_year INTEGER NOT NULL,
          required_quarter DATE NOT NULL,
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
          estimated_amount DECIMAL(15,2),
          currency TEXT,
          supplier_list TEXT,
          justification TEXT,
          planning_source TEXT NOT NULL,
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
          FOREIGN KEY (engagement_type_id) REFERENCES engagement_types(id)
        )
      `);
      db2.run(`
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
          FOREIGN KEY (program_id) REFERENCES programs(id),
          FOREIGN KEY (activity_id) REFERENCES activity_pool(id),
          UNIQUE(program_id, station_id)
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error("Error creating system_settings table:", err);
          reject(err);
          return;
        }
        db2.run("CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status)");
        db2.run("CREATE INDEX IF NOT EXISTS idx_programs_work_year ON programs(work_year)");
        db2.run("CREATE INDEX IF NOT EXISTS idx_program_tasks_program_id ON program_tasks(program_id)");
        db2.run("CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)", (err2) => {
          if (err2) {
            console.error("Error creating indexes:", err2);
            reject(err2);
            return;
          }
          console.log("Database tables and indexes created successfully");
          resolve();
        });
      });
    });
  });
}
var DB_PATH, dataDir, db;
var init_database = __esm({
  "src/server/config/database.js"() {
    DB_PATH = process.env.DB_PATH || "./data/procurement.db";
    dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      console.log("Creating data directory:", dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = null;
  }
});

// src/server/middleware/auth.js
import jwt from "file:///home/project/node_modules/jsonwebtoken/index.js";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.roleCode)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
var init_auth = __esm({
  "src/server/middleware/auth.js"() {
    init_database();
  }
});

// src/server/routes/auth.js
import express from "file:///home/project/node_modules/express/index.js";
import bcrypt from "file:///home/project/node_modules/bcryptjs/index.js";
import jwt2 from "file:///home/project/node_modules/jsonwebtoken/index.js";
import { body, validationResult } from "file:///home/project/node_modules/express-validator/lib/index.js";
var router, auth_default;
var init_auth2 = __esm({
  "src/server/routes/auth.js"() {
    init_database();
    init_auth();
    router = express.Router();
    router.post("/login", [
      body("employeeId").isLength({ min: 4, max: 4 }).withMessage("Employee ID must be 4 digits"),
      body("password").isLength({ min: 6, max: 6 }).withMessage("Password must be 6 characters")
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const { employeeId, password } = req.body;
        const db2 = getDatabase();
        db2.get(
          "SELECT * FROM users WHERE employee_id = ?",
          [employeeId],
          async (err, user) => {
            if (err) {
              return res.status(500).json({ error: "Database error" });
            }
            if (!user) {
              return res.status(401).json({ error: "Invalid credentials" });
            }
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
              return res.status(401).json({ error: "Invalid credentials" });
            }
            const token = jwt2.sign(
              {
                id: user.id,
                employeeId: user.employee_id,
                roleCode: user.role_code
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
            );
            res.json({
              token,
              user: {
                id: user.id,
                employeeId: user.employee_id,
                fullName: user.full_name,
                roleCode: user.role_code,
                roleDescription: user.role_description,
                procurementTeam: user.procurement_team
              }
            });
          }
        );
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router.get("/me", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.get(
        "SELECT id, employee_id, full_name, role_code, role_description, procurement_team, email FROM users WHERE id = ?",
        [req.user.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: "Database error" });
          }
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          res.json({
            id: user.id,
            employeeId: user.employee_id,
            fullName: user.full_name,
            roleCode: user.role_code,
            roleDescription: user.role_description,
            procurementTeam: user.procurement_team,
            email: user.email
          });
        }
      );
    });
    auth_default = router;
  }
});

// src/server/routes/workers.js
import express2 from "file:///home/project/node_modules/express/index.js";
import bcrypt2 from "file:///home/project/node_modules/bcryptjs/index.js";
import { body as body2, validationResult as validationResult2 } from "file:///home/project/node_modules/express-validator/lib/index.js";
var router2, workers_default;
var init_workers = __esm({
  "src/server/routes/workers.js"() {
    init_database();
    init_auth();
    router2 = express2.Router();
    router2.get("/organizational-roles", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM organizational_roles ORDER BY role_code", (err, roles) => {
        if (err) {
          console.error("Error fetching organizational roles:", err);
          return res.status(500).json({ error: "Failed to fetch organizational roles" });
        }
        console.log("Fetched organizational roles:", roles);
        res.json(roles);
      });
    });
    router2.get("/divisions", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM divisions ORDER BY name", (err, divisions) => {
        if (err) {
          console.error("Error fetching divisions:", err);
          return res.status(500).json({ error: "Failed to fetch divisions" });
        }
        res.json(divisions);
      });
    });
    router2.get("/departments", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM departments ORDER BY name", (err, departments) => {
        if (err) {
          console.error("Error fetching departments:", err);
          return res.status(500).json({ error: "Failed to fetch departments" });
        }
        res.json(departments);
      });
    });
    router2.get("/procurement-teams", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM procurement_teams ORDER BY name", (err, teams) => {
        if (err) {
          console.error("Error fetching procurement teams:", err);
          return res.status(500).json({ error: "Failed to fetch procurement teams" });
        }
        res.json(teams);
      });
    });
    router2.get("/", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      try {
        db2.all(`
      SELECT 
        u.*,
        d.name as division_name,
        dept.name as department_name
      FROM users u
      LEFT JOIN divisions d ON u.division_id = d.id
      LEFT JOIN departments dept ON u.department_id = dept.id
      ORDER BY u.full_name
    `, (err, workers) => {
          if (err) {
            console.error("Error fetching workers:", err);
            return res.status(500).json({ error: "Failed to fetch workers" });
          }
          const transformedWorkers = workers.map((worker) => ({
            id: worker.id,
            employeeId: worker.employee_id,
            roleCode: worker.role_code,
            fullName: worker.full_name,
            roleDescription: worker.role_description,
            divisionId: worker.division_id,
            departmentId: worker.department_id,
            procurementTeam: worker.procurement_team,
            password: "******",
            // Don't send actual password
            availableWorkDays: worker.available_work_days?.toString(),
            email: worker.email,
            divisionName: worker.division_name,
            departmentName: worker.department_name
          }));
          res.json(transformedWorkers);
        });
      } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({ error: "Failed to fetch workers" });
      }
    });
    router2.get("/:id", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      const { id } = req.params;
      try {
        db2.get(`
      SELECT 
        u.*,
        d.name as division_name,
        dept.name as department_name
      FROM users u
      LEFT JOIN divisions d ON u.division_id = d.id
      LEFT JOIN departments dept ON u.department_id = dept.id
      WHERE u.id = ?
    `, [id], (err, worker) => {
          if (err) {
            console.error("Error fetching worker:", err);
            return res.status(500).json({ error: "Failed to fetch worker" });
          }
          if (!worker) {
            return res.status(404).json({ error: "Worker not found" });
          }
          const transformedWorker = {
            id: worker.id,
            employeeId: worker.employee_id,
            roleCode: worker.role_code,
            fullName: worker.full_name,
            roleDescription: worker.role_description,
            divisionId: worker.division_id,
            departmentId: worker.department_id,
            procurementTeam: worker.procurement_team,
            password: "******",
            availableWorkDays: worker.available_work_days?.toString(),
            email: worker.email,
            divisionName: worker.division_name,
            departmentName: worker.department_name
          };
          res.json(transformedWorker);
        });
      } catch (error) {
        console.error("Error fetching worker:", error);
        res.status(500).json({ error: "Failed to fetch worker" });
      }
    });
    router2.post("/", [
      authenticateToken,
      authorizeRoles(1, 5, 9),
      // Manager, Admin, Technical
      body2("employeeId").isLength({ min: 4, max: 4 }).withMessage("Employee ID must be 4 digits"),
      body2("roleCode").isInt({ min: 1, max: 9 }).withMessage("Invalid role code"),
      body2("fullName").notEmpty().withMessage("Full name is required"),
      body2("password").isLength({ min: 6, max: 6 }).withMessage("Password must be 6 characters")
    ], async (req, res) => {
      try {
        const errors = validationResult2(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
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
        console.log("Creating worker with data:", {
          employeeId,
          roleCode,
          fullName,
          roleDescription,
          divisionId,
          departmentId,
          procurementTeam,
          availableWorkDays,
          email
        });
        const db2 = getDatabase();
        db2.get("SELECT id FROM users WHERE employee_id = ?", [employeeId], async (err, existingUser) => {
          if (err) {
            console.error("Database error checking existing user:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (existingUser) {
            return res.status(400).json({ error: "Employee ID already exists" });
          }
          const passwordHash = await bcrypt2.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
          db2.run(`
        INSERT INTO users (
          employee_id, full_name, role_code, role_description,
          division_id, department_id, procurement_team,
          password_hash, available_work_days, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
            employeeId,
            fullName,
            roleCode,
            roleDescription || null,
            divisionId || null,
            departmentId || null,
            procurementTeam || null,
            passwordHash,
            availableWorkDays ? parseInt(availableWorkDays) : null,
            email || null
          ], function(err2) {
            if (err2) {
              console.error("Error creating worker:", err2);
              return res.status(500).json({ error: "Failed to create worker" });
            }
            console.log("Worker created with ID:", this.lastID);
            db2.get(`
          SELECT 
            u.*,
            d.name as division_name,
            dept.name as department_name
          FROM users u
          LEFT JOIN divisions d ON u.division_id = d.id
          LEFT JOIN departments dept ON u.department_id = dept.id
          WHERE u.id = ?
        `, [this.lastID], (err3, newWorker) => {
              if (err3) {
                console.error("Error fetching created worker:", err3);
                return res.status(500).json({ error: "Failed to fetch created worker" });
              }
              const transformedWorker = {
                id: newWorker.id,
                employeeId: newWorker.employee_id,
                roleCode: newWorker.role_code,
                fullName: newWorker.full_name,
                roleDescription: newWorker.role_description,
                divisionId: newWorker.division_id,
                departmentId: newWorker.department_id,
                procurementTeam: newWorker.procurement_team,
                password: "******",
                availableWorkDays: newWorker.available_work_days?.toString(),
                email: newWorker.email,
                divisionName: newWorker.division_name,
                departmentName: newWorker.department_name
              };
              console.log("Returning created worker:", transformedWorker);
              res.status(201).json(transformedWorker);
            });
          });
        });
      } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ error: "Failed to create worker" });
      }
    });
    router2.put("/:id", [
      authenticateToken,
      authorizeRoles(1, 5, 9),
      // Manager, Admin, Technical
      body2("employeeId").optional().isLength({ min: 4, max: 4 }).withMessage("Employee ID must be 4 digits"),
      body2("roleCode").optional().isInt({ min: 1, max: 9 }).withMessage("Invalid role code"),
      body2("password").optional().isLength({ min: 6, max: 6 }).withMessage("Password must be 6 characters")
    ], async (req, res) => {
      try {
        const errors = validationResult2(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const workerId = req.params.id;
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
        const db2 = getDatabase();
        if (employeeId) {
          db2.get("SELECT id FROM users WHERE employee_id = ? AND id != ?", [employeeId, workerId], async (err, existingUser) => {
            if (err) {
              return res.status(500).json({ error: "Database error" });
            }
            if (existingUser) {
              return res.status(400).json({ error: "Employee ID already exists" });
            }
            await updateWorker();
          });
        } else {
          await updateWorker();
        }
        async function updateWorker() {
          let passwordHash = null;
          if (password && password !== "******") {
            passwordHash = await bcrypt2.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
          }
          const updateFields = [];
          const values = [];
          if (employeeId !== void 0) {
            updateFields.push("employee_id = ?");
            values.push(employeeId);
          }
          if (roleCode !== void 0) {
            updateFields.push("role_code = ?");
            values.push(roleCode);
          }
          if (fullName !== void 0) {
            updateFields.push("full_name = ?");
            values.push(fullName);
          }
          if (roleDescription !== void 0) {
            updateFields.push("role_description = ?");
            values.push(roleDescription || null);
          }
          if (divisionId !== void 0) {
            updateFields.push("division_id = ?");
            values.push(divisionId || null);
          }
          if (departmentId !== void 0) {
            updateFields.push("department_id = ?");
            values.push(departmentId || null);
          }
          if (procurementTeam !== void 0) {
            updateFields.push("procurement_team = ?");
            values.push(procurementTeam || null);
          }
          if (passwordHash) {
            updateFields.push("password_hash = ?");
            values.push(passwordHash);
          }
          if (availableWorkDays !== void 0) {
            updateFields.push("available_work_days = ?");
            values.push(availableWorkDays ? parseInt(availableWorkDays) : null);
          }
          if (email !== void 0) {
            updateFields.push("email = ?");
            values.push(email || null);
          }
          updateFields.push("updated_at = CURRENT_TIMESTAMP");
          values.push(workerId);
          if (updateFields.length === 1) {
            return res.status(400).json({ error: "No fields to update" });
          }
          const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
          db2.run(updateQuery, values, function(err) {
            if (err) {
              console.error("Error updating worker:", err);
              return res.status(500).json({ error: "Failed to update worker" });
            }
            if (this.changes === 0) {
              return res.status(404).json({ error: "Worker not found" });
            }
            db2.get(`
          SELECT 
            u.*,
            d.name as division_name,
            dept.name as department_name
          FROM users u
          LEFT JOIN divisions d ON u.division_id = d.id
          LEFT JOIN departments dept ON u.department_id = dept.id
          WHERE u.id = ?
        `, [workerId], (err2, updatedWorker) => {
              if (err2) {
                return res.status(500).json({ error: "Failed to fetch updated worker" });
              }
              const transformedWorker = {
                id: updatedWorker.id,
                employeeId: updatedWorker.employee_id,
                roleCode: updatedWorker.role_code,
                fullName: updatedWorker.full_name,
                roleDescription: updatedWorker.role_description,
                divisionId: updatedWorker.division_id,
                departmentId: updatedWorker.department_id,
                procurementTeam: updatedWorker.procurement_team,
                password: "******",
                availableWorkDays: updatedWorker.available_work_days?.toString(),
                email: updatedWorker.email,
                divisionName: updatedWorker.division_name,
                departmentName: updatedWorker.department_name
              };
              res.json(transformedWorker);
            });
          });
        }
      } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ error: "Failed to update worker" });
      }
    });
    router2.delete("/:id", [
      authenticateToken,
      authorizeRoles(1, 5, 9)
      // Manager, Admin, Technical
    ], (req, res) => {
      const db2 = getDatabase();
      const workerId = req.params.id;
      try {
        db2.run("DELETE FROM users WHERE id = ?", [workerId], function(err) {
          if (err) {
            console.error("Error deleting worker:", err);
            return res.status(500).json({ error: "Failed to delete worker" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Worker not found" });
          }
          res.json({ message: "Worker deleted successfully" });
        });
      } catch (error) {
        console.error("Error deleting worker:", error);
        res.status(500).json({ error: "Failed to delete worker" });
      }
    });
    workers_default = router2;
  }
});

// src/server/scripts/seedDatabase.js
var seedDatabase_exports = {};
__export(seedDatabase_exports, {
  seedDatabase: () => seedDatabase
});
import bcrypt3 from "file:///home/project/node_modules/bcryptjs/index.js";
async function seedDatabase() {
  try {
    await initializeDatabase();
    const db2 = getDatabase();
    console.log("Seeding database with initial data...");
    const roles = [
      { roleCode: 1, description: "\u05DE\u05E0\u05D4\u05DC \u05E8\u05DB\u05E9", permissions: "\u05D4\u05E8\u05E9\u05D0\u05D5\u05EA \u05DE\u05DC\u05D0\u05D5\u05EA \u05DC\u05E0\u05D9\u05D4\u05D5\u05DC \u05DB\u05DC \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9 \u05D4\u05E8\u05DB\u05E9" },
      { roleCode: 2, description: "\u05E8\u05D0\u05E9 \u05E6\u05D5\u05D5\u05EA", permissions: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E6\u05D5\u05D5\u05EA \u05E7\u05E0\u05D9\u05D9\u05E0\u05D9\u05DD \u05D5\u05DE\u05E2\u05E7\u05D1 \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA" },
      { roleCode: 3, description: "\u05E7\u05E0\u05D9\u05D9\u05DF", permissions: "\u05D1\u05D9\u05E6\u05D5\u05E2 \u05E4\u05E2\u05D9\u05DC\u05D5\u05D9\u05D5\u05EA \u05E8\u05DB\u05E9 \u05D5\u05DE\u05E2\u05E7\u05D1 \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA" },
      { roleCode: 4, description: "\u05D2\u05D5\u05E8\u05DD \u05D3\u05D5\u05E8\u05E9", permissions: "\u05D4\u05D2\u05E9\u05EA \u05D1\u05E7\u05E9\u05D5\u05EA \u05E8\u05DB\u05E9 \u05D5\u05DE\u05E2\u05E7\u05D1 \u05D0\u05D7\u05E8 \u05E1\u05D8\u05D8\u05D5\u05E1" },
      { roleCode: 5, description: "\u05DE\u05E0\u05D4\u05DC\u05DF \u05DE\u05E2\u05E8\u05DB\u05EA", permissions: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05DE\u05E2\u05E8\u05DB\u05EA \u05D5\u05D8\u05D1\u05DC\u05D0\u05D5\u05EA \u05E2\u05D6\u05E8" },
      { roleCode: 9, description: "\u05D2\u05D5\u05E8\u05DD \u05D8\u05DB\u05E0\u05D9", permissions: "\u05EA\u05D7\u05D6\u05D5\u05E7\u05EA \u05EA\u05E9\u05EA\u05D9\u05D5\u05EA \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA" }
    ];
    for (const role of roles) {
      db2.run(
        "INSERT OR IGNORE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)",
        [role.roleCode, role.description, role.permissions]
      );
    }
    const divisions = [
      { name: "\u05D0\u05D2\u05E3 \u05EA\u05E4\u05E2\u05D5\u05DC", isInternal: true },
      { name: "\u05D0\u05D2\u05E3 \u05E9\u05D9\u05D5\u05D5\u05E7", isInternal: true },
      { name: "\u05DC\u05E7\u05D5\u05D7 \u05D7\u05D9\u05E6\u05D5\u05E0\u05D9 \u05D0", isInternal: false }
    ];
    for (const division of divisions) {
      db2.run(
        "INSERT OR IGNORE INTO divisions (name, is_internal) VALUES (?, ?)",
        [division.name, division.isInternal]
      );
    }
    const departments = [
      { name: "\u05DE\u05D7\u05DC\u05E7\u05EA \u05D4\u05E0\u05D3\u05E1\u05D4", divisionId: 1 },
      { name: "\u05DE\u05D7\u05DC\u05E7\u05EA \u05D0\u05D9\u05DB\u05D5\u05EA", divisionId: 1 },
      { name: "\u05DE\u05D7\u05DC\u05E7\u05EA \u05E9\u05D9\u05E8\u05D5\u05EA \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA", divisionId: 2 }
    ];
    for (const dept of departments) {
      db2.run(
        "INSERT OR IGNORE INTO departments (name, division_id) VALUES (?, ?)",
        [dept.name, dept.divisionId]
      );
    }
    const teams = [
      "\u05D9\u05E2\u05D5\u05D3\u05D9",
      "\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9",
      "\u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9",
      "\u05DE\u05D7\u05E9\u05D5\u05D1",
      "\u05D4\u05E0\u05D3\u05E1\u05D9",
      "\u05D1\u05D9\u05D8\u05D7\u05D5\u05E0\u05D9"
    ];
    for (const team of teams) {
      db2.run("INSERT OR IGNORE INTO procurement_teams (name) VALUES (?)", [team]);
    }
    const domains = [
      "\u05E8\u05DB\u05E9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D5\u05DE\u05D7\u05E9\u05D5\u05D1",
      "\u05E8\u05DB\u05E9 \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9\u05D9\u05DD",
      "\u05E8\u05DB\u05E9 \u05E6\u05D9\u05D5\u05D3 \u05DE\u05E9\u05E8\u05D3\u05D9"
    ];
    for (const domain of domains) {
      db2.run("INSERT OR IGNORE INTO domains (description) VALUES (?)", [domain]);
    }
    const activities = [
      { name: "\u05D1\u05D3\u05D9\u05E7\u05EA \u05D4\u05E6\u05E2\u05D5\u05EA \u05DE\u05D7\u05D9\u05E8", tools: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D7\u05D9\u05E8\u05D9\u05DD" },
      { name: "\u05D4\u05DB\u05E0\u05EA \u05DE\u05E4\u05E8\u05D8 \u05D8\u05DB\u05E0\u05D9", tools: "\u05EA\u05D1\u05E0\u05D9\u05D5\u05EA \u05DE\u05E4\u05E8\u05D8, \u05D9\u05D9\u05E2\u05D5\u05E5 \u05D8\u05DB\u05E0\u05D9" },
      { name: "\u05E4\u05E8\u05E1\u05D5\u05DD \u05DE\u05DB\u05E8\u05D6", tools: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05E4\u05E8\u05E1\u05D5\u05DD, \u05D0\u05EA\u05E8 \u05D4\u05D7\u05D1\u05E8\u05D4" },
      { name: "\u05D4\u05E2\u05E8\u05DB\u05EA \u05D4\u05E6\u05E2\u05D5\u05EA", tools: "\u05DE\u05D8\u05E8\u05D9\u05E6\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4, \u05D5\u05E2\u05D3\u05EA \u05D1\u05D7\u05D9\u05E0\u05D4" },
      { name: "\u05D1\u05D7\u05D9\u05E8\u05EA \u05D6\u05D5\u05DB\u05D4", tools: "\u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC \u05D4\u05D7\u05DC\u05D8\u05D4" },
      { name: "\u05D7\u05EA\u05D9\u05DE\u05D4 \u05E2\u05DC \u05D4\u05E1\u05DB\u05DD", tools: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC \u05D7\u05D5\u05D6\u05D9\u05DD" },
      { name: "\u05D1\u05E7\u05E8\u05EA \u05D0\u05D9\u05DB\u05D5\u05EA", tools: "\u05E8\u05E9\u05D9\u05DE\u05EA \u05D1\u05D3\u05D9\u05E7\u05D5\u05EA \u05D0\u05D9\u05DB\u05D5\u05EA" },
      { name: "\u05D0\u05D9\u05E9\u05D5\u05E8 \u05EA\u05E9\u05DC\u05D5\u05DD", tools: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05DB\u05E1\u05E4\u05D9\u05DD" },
      { name: "\u05DE\u05E2\u05E7\u05D1 \u05D1\u05D9\u05E6\u05D5\u05E2", tools: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05DE\u05E2\u05E7\u05D1 \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD" },
      { name: "\u05E1\u05D2\u05D9\u05E8\u05EA \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8", tools: "\u05D3\u05D5\u05D7 \u05E1\u05D9\u05DB\u05D5\u05DD" },
      { name: "\u05D3\u05D5\u05D7 \u05E1\u05D9\u05DB\u05D5\u05DD", tools: "\u05EA\u05D1\u05E0\u05D9\u05EA \u05D3\u05D5\u05D7" }
    ];
    for (const activity of activities) {
      db2.run(
        "INSERT OR IGNORE INTO activity_pool (name, tools_and_resources) VALUES (?, ?)",
        [activity.name, activity.tools]
      );
    }
    const engagementTypes = [
      "\u05DE\u05DB\u05E8\u05D6 \u05E4\u05D5\u05DE\u05D1\u05D9",
      "\u05DE\u05DB\u05E8\u05D6 \u05DE\u05D5\u05D2\u05D1\u05DC",
      "\u05DE\u05DB\u05E8\u05D6 \u05E4\u05EA\u05D5\u05D7 \u05DE\u05D5\u05D2\u05D1\u05DC",
      "\u05E8\u05DB\u05E9 \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA\u05D9"
    ];
    for (const type of engagementTypes) {
      db2.run("INSERT OR IGNORE INTO engagement_types (name) VALUES (?)", [type]);
    }
    const adminPassword = await bcrypt3.hash("123456", 12);
    db2.run(
      `INSERT OR IGNORE INTO users (
        employee_id, full_name, role_code, role_description, 
        password_hash, email
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      ["9999", "\u05DE\u05E0\u05D4\u05DC \u05DE\u05E2\u05E8\u05DB\u05EA", 9, "\u05D2\u05D5\u05E8\u05DD \u05D8\u05DB\u05E0\u05D9", adminPassword, "admin@system.com"]
    );
    const managerPassword = await bcrypt3.hash("123456", 12);
    db2.run(
      `INSERT OR IGNORE INTO users (
        employee_id, full_name, role_code, role_description, 
        password_hash, procurement_team, available_work_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["1001", "\u05D0\u05D1\u05E8\u05D4\u05DD \u05DE\u05E0\u05D4\u05DC", 1, "\u05DE\u05E0\u05D4\u05DC \u05E8\u05DB\u05E9", managerPassword, "\u05D9\u05E2\u05D5\u05D3\u05D9", 200]
    );
    console.log("Database seeded successfully!");
    console.log("Default users created:");
    console.log("- Admin: 9999 / 123456");
    console.log("- Manager: 1001 / 123456");
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
}
var init_seedDatabase = __esm({
  "src/server/scripts/seedDatabase.js"() {
    init_database();
  }
});

// src/server/express-app.js
var express_app_exports = {};
__export(express_app_exports, {
  createExpressApp: () => createExpressApp
});
import express3 from "file:///home/project/node_modules/express/index.js";
import cors from "file:///home/project/node_modules/cors/lib/index.js";
import helmet from "file:///home/project/node_modules/helmet/index.mjs";
import morgan from "file:///home/project/node_modules/morgan/index.js";
import compression from "file:///home/project/node_modules/compression/index.js";
import rateLimit from "file:///home/project/node_modules/express-rate-limit/dist/index.mjs";
async function createExpressApp() {
  if (expressApp) {
    return expressApp;
  }
  const app = express3();
  app.use(helmet({
    contentSecurityPolicy: false
    // Disable CSP for development
  }));
  app.use(compression());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 1e3,
    // Increased limit for development
    message: { error: "Too many requests from this IP, please try again later." }
  });
  app.use(limiter);
  app.use(cors({
    origin: true,
    // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.use(express3.json({ limit: "10mb" }));
  app.use(express3.urlencoded({ extended: true, limit: "10mb" }));
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }
  if (!isInitialized) {
    try {
      await initializeDatabase();
      console.log("\u2705 Database initialized successfully");
      const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seedDatabase(), seedDatabase_exports));
      await seedDatabase2();
      console.log("\u2705 Database seeded successfully");
      isInitialized = true;
    } catch (error) {
      console.error("\u274C Failed to initialize database:", error);
    }
  }
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    });
  });
  app.use("/auth", auth_default);
  app.use("/workers", workers_default);
  app.use((err, req, res, next) => {
    console.error("API Error:", err);
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
    });
  });
  app.use("*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
  expressApp = app;
  console.log("\u2705 Express app created and configured");
  return app;
}
var expressApp, isInitialized;
var init_express_app = __esm({
  "src/server/express-app.js"() {
    init_database();
    init_auth2();
    init_workers();
    process.env.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
    process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "12";
    process.env.DB_PATH = process.env.DB_PATH || "./src/server/data/procurement.db";
    expressApp = null;
    isInitialized = false;
  }
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path2 from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Custom plugin to integrate Express server
    {
      name: "express-integration",
      configureServer(server) {
        server.middlewares.use("/api", async (req, res, next) => {
          try {
            const { createExpressApp: createExpressApp2 } = await Promise.resolve().then(() => (init_express_app(), express_app_exports));
            const expressApp2 = await createExpressApp2();
            expressApp2(req, res, next);
          } catch (error) {
            console.error("Express middleware error:", error);
            next(error);
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9leHByZXNzLWFwcC5qcyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2NvbmZpZy9kYXRhYmFzZS5qc1wiO2ltcG9ydCBzcWxpdGUzIGZyb20gJ3NxbGl0ZTMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBEQl9QQVRIID0gcHJvY2Vzcy5lbnYuREJfUEFUSCB8fCAnLi9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxuLy8gRW5zdXJlIGRhdGEgZGlyZWN0b3J5IGV4aXN0c1xuY29uc3QgZGF0YURpciA9IHBhdGguZGlybmFtZShEQl9QQVRIKTtcbmlmICghZnMuZXhpc3RzU3luYyhkYXRhRGlyKSkge1xuICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgZGF0YSBkaXJlY3Rvcnk6JywgZGF0YURpcik7XG4gIGZzLm1rZGlyU3luYyhkYXRhRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbn1cblxubGV0IGRiID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0RGF0YWJhc2UoKSB7XG4gIGlmICghZGIpIHtcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIGRhdGFiYXNlIGF0OicsIERCX1BBVEgpO1xuICAgIGRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2UoREJfUEFUSCwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBvcGVuaW5nIGRhdGFiYXNlOicsIGVycik7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gU1FMaXRlIGRhdGFiYXNlIGF0OicsIERCX1BBVEgpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIEVuYWJsZSBmb3JlaWduIGtleXNcbiAgICBkYi5ydW4oJ1BSQUdNQSBmb3JlaWduX2tleXMgPSBPTicpO1xuICB9XG4gIHJldHVybiBkYjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFiYXNlKCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgZGF0YWJhc2UgdGFibGVzLi4uJyk7XG4gICAgICBcbiAgICAgIC8vIFVzZXJzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyB1c2VycyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVtcGxveWVlX2lkIFRFWFQgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGZ1bGxfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBwcm9jdXJlbWVudF90ZWFtIFRFWFQsXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGF2YWlsYWJsZV93b3JrX2RheXMgSU5URUdFUixcbiAgICAgICAgICBlbWFpbCBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIE9yZ2FuaXphdGlvbmFsIHJvbGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBvcmdhbml6YXRpb25hbF9yb2xlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHBlcm1pc3Npb25zIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIERpdmlzaW9ucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZGl2aXNpb25zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGlzX2ludGVybmFsIEJPT0xFQU4gREVGQVVMVCAxXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEZXBhcnRtZW50cyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZGVwYXJ0bWVudHMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGl2aXNpb25faWQpIFJFRkVSRU5DRVMgZGl2aXNpb25zKGlkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gUHJvY3VyZW1lbnQgdGVhbXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2N1cmVtZW50X3RlYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEb21haW5zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkb21haW5zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQWN0aXZpdHkgcG9vbCB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgYWN0aXZpdHlfcG9vbCAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICB0b29sc19hbmRfcmVzb3VyY2VzIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEVuZ2FnZW1lbnQgdHlwZXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGVuZ2FnZW1lbnRfdHlwZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEVuZ2FnZW1lbnQgdHlwZSBwcm9jZXNzZXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGVuZ2FnZW1lbnRfdHlwZV9wcm9jZXNzZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbmdhZ2VtZW50X3R5cGVfaWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBzdGF0aW9uX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgYWN0aXZpdHlfaWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUoZW5nYWdlbWVudF90eXBlX2lkLCBzdGF0aW9uX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gUHJvZ3JhbXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgdGFza19pZCBJTlRFR0VSIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICB3b3JrX3llYXIgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICByZXF1aXJlZF9xdWFydGVyIERBVEUgTk9UIE5VTEwsXG4gICAgICAgICAgdGl0bGUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhULFxuICAgICAgICAgIHJlcXVlc3Rlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIHJlcXVlc3Rlcl9uYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkaXZpc2lvbl9uYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVwYXJ0bWVudF9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfbmFtZSBURVhULFxuICAgICAgICAgIGRvbWFpbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRvbWFpbl9uYW1lIFRFWFQsXG4gICAgICAgICAgZXN0aW1hdGVkX2Ftb3VudCBERUNJTUFMKDE1LDIpLFxuICAgICAgICAgIGN1cnJlbmN5IFRFWFQsXG4gICAgICAgICAgc3VwcGxpZXJfbGlzdCBURVhULFxuICAgICAgICAgIGp1c3RpZmljYXRpb24gVEVYVCxcbiAgICAgICAgICBwbGFubmluZ19zb3VyY2UgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBjb21wbGV4aXR5IElOVEVHRVIsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGF0dXMgVEVYVCBOT1QgTlVMTCBERUZBVUxUICdPcGVuJyxcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgdGVhbV9pZCBJTlRFR0VSLFxuICAgICAgICAgIHRlYW1fbmFtZSBURVhULFxuICAgICAgICAgIHN0YXJ0X2RhdGUgREFURSxcbiAgICAgICAgICBwbGFubmluZ19ub3RlcyBURVhULFxuICAgICAgICAgIG9mZmljZXJfbm90ZXMgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChlbmdhZ2VtZW50X3R5cGVfaWQpIFJFRkVSRU5DRVMgZW5nYWdlbWVudF90eXBlcyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW0gdGFza3MgKHN0YXRpb25zKSB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvZ3JhbV90YXNrcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHByb2dyYW1faWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBzdGF0aW9uX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgYWN0aXZpdHlfaWQgSU5URUdFUixcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgY29tcGxldGlvbl9kYXRlIERBVEUsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXBvcnRpbmdfdXNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgcmVmZXJlbmNlIFRFWFQsXG4gICAgICAgICAgbm90ZXMgVEVYVCxcbiAgICAgICAgICBpc19sYXN0X3N0YXRpb24gQk9PTEVBTiBERUZBVUxUIDAsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAocHJvZ3JhbV9pZCkgUkVGRVJFTkNFUyBwcm9ncmFtcyhpZCksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGFjdGl2aXR5X2lkKSBSRUZFUkVOQ0VTIGFjdGl2aXR5X3Bvb2woaWQpLFxuICAgICAgICAgIFVOSVFVRShwcm9ncmFtX2lkLCBzdGF0aW9uX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gU3lzdGVtIHNldHRpbmdzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBzeXN0ZW1fc2V0dGluZ3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBzZXR0aW5nX2tleSBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBzZXR0aW5nX3ZhbHVlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCwgKGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgc3lzdGVtX3NldHRpbmdzIHRhYmxlOicsIGVycik7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGluZGV4ZXMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc19zdGF0dXMgT04gcHJvZ3JhbXMoc3RhdHVzKScpO1xuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc193b3JrX3llYXIgT04gcHJvZ3JhbXMod29ya195ZWFyKScpO1xuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtX3Rhc2tzX3Byb2dyYW1faWQgT04gcHJvZ3JhbV90YXNrcyhwcm9ncmFtX2lkKScpO1xuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF91c2Vyc19lbXBsb3llZV9pZCBPTiB1c2VycyhlbXBsb3llZV9pZCknLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgaW5kZXhlczonLCBlcnIpO1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSB0YWJsZXMgYW5kIGluZGV4ZXMgY3JlYXRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjbG9zZURhdGFiYXNlKCkge1xuICBpZiAoZGIpIHtcbiAgICBkYi5jbG9zZSgoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNsb3NpbmcgZGF0YWJhc2U6JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBjb25uZWN0aW9uIGNsb3NlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRiID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQge1xuICBnZXREYXRhYmFzZSxcbiAgaW5pdGlhbGl6ZURhdGFiYXNlLFxuICBjbG9zZURhdGFiYXNlXG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2ltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcblxuZnVuY3Rpb24gYXV0aGVudGljYXRlVG9rZW4ocmVxLCByZXMsIG5leHQpIHtcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzWydhdXRob3JpemF0aW9uJ107XG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlciAmJiBhdXRoSGVhZGVyLnNwbGl0KCcgJylbMV07XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQWNjZXNzIHRva2VuIHJlcXVpcmVkJyB9KTtcbiAgfVxuXG4gIGp3dC52ZXJpZnkodG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsIChlcnIsIHVzZXIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicgfSk7XG4gICAgfVxuICAgIHJlcS51c2VyID0gdXNlcjtcbiAgICBuZXh0KCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhdXRob3JpemVSb2xlcyguLi5yb2xlcykge1xuICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgaWYgKCFyZXEudXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyb2xlcy5pbmNsdWRlcyhyZXEudXNlci5yb2xlQ29kZSkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9KTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlVXNlckV4aXN0cyhyZXEsIHJlcywgbmV4dCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHVzZXJJZCA9IHJlcS51c2VyLmlkO1xuXG4gIGRiLmdldChcbiAgICAnU0VMRUNUIGlkLCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLFxuICAgIFt1c2VySWRdLFxuICAgIChlcnIsIHVzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVxLnVzZXIuY3VycmVudFVzZXIgPSB1c2VyO1xuICAgICAgbmV4dCgpO1xuICAgIH1cbiAgKTtcbn1cblxuZXhwb3J0IHtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzLFxuICB2YWxpZGF0ZVVzZXJFeGlzdHNcbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9hdXRoLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIExvZ2luIGVuZHBvaW50XG5yb3V0ZXIucG9zdCgnL2xvZ2luJywgW1xuICBib2R5KCdlbXBsb3llZUlkJykuaXNMZW5ndGgoeyBtaW46IDQsIG1heDogNCB9KS53aXRoTWVzc2FnZSgnRW1wbG95ZWUgSUQgbXVzdCBiZSA0IGRpZ2l0cycpLFxuICBib2R5KCdwYXNzd29yZCcpLmlzTGVuZ3RoKHsgbWluOiA2LCBtYXg6IDYgfSkud2l0aE1lc3NhZ2UoJ1Bhc3N3b3JkIG11c3QgYmUgNiBjaGFyYWN0ZXJzJylcbl0sIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBlbXBsb3llZUlkLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgZGIuZ2V0KFxuICAgICAgJ1NFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgZW1wbG95ZWVfaWQgPSA/JyxcbiAgICAgIFtlbXBsb3llZUlkXSxcbiAgICAgIGFzeW5jIChlcnIsIHVzZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzVmFsaWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkX2hhc2gpO1xuICAgICAgICBpZiAoIWlzVmFsaWRQYXNzd29yZCkge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2tlbiA9IGp3dC5zaWduKFxuICAgICAgICAgIHsgXG4gICAgICAgICAgICBpZDogdXNlci5pZCwgXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlIFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCxcbiAgICAgICAgICB7IGV4cGlyZXNJbjogcHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gfHwgJzI0aCcgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJlcy5qc29uKHtcbiAgICAgICAgICB0b2tlbixcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IHVzZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogdXNlci5wcm9jdXJlbWVudF90ZWFtXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0xvZ2luIGVycm9yOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCBjdXJyZW50IHVzZXIgaW5mb1xucm91dGVyLmdldCgnL21lJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5nZXQoXG4gICAgJ1NFTEVDVCBpZCwgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBwcm9jdXJlbWVudF90ZWFtLCBlbWFpbCBGUk9NIHVzZXJzIFdIRVJFIGlkID0gPycsXG4gICAgW3JlcS51c2VyLmlkXSxcbiAgICAoZXJyLCB1c2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdVc2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHtcbiAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgICByb2xlRGVzY3JpcHRpb246IHVzZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsXG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvd29ya2Vycy5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgeyBib2R5LCB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGF1dGhvcml6ZVJvbGVzIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gR2V0IG9yZ2FuaXphdGlvbmFsIHJvbGVzXG5yb3V0ZXIuZ2V0KCcvb3JnYW5pemF0aW9uYWwtcm9sZXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBvcmdhbml6YXRpb25hbF9yb2xlcyBPUkRFUiBCWSByb2xlX2NvZGUnLCAoZXJyLCByb2xlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIG9yZ2FuaXphdGlvbmFsIHJvbGVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBvcmdhbml6YXRpb25hbCByb2xlcycgfSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKCdGZXRjaGVkIG9yZ2FuaXphdGlvbmFsIHJvbGVzOicsIHJvbGVzKTtcbiAgICByZXMuanNvbihyb2xlcyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBkaXZpc2lvbnNcbnJvdXRlci5nZXQoJy9kaXZpc2lvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgT1JERVIgQlkgbmFtZScsIChlcnIsIGRpdmlzaW9ucykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGl2aXNpb25zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24oZGl2aXNpb25zKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRlcGFydG1lbnRzXG5yb3V0ZXIuZ2V0KCcvZGVwYXJ0bWVudHMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkZXBhcnRtZW50cyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGVwYXJ0bWVudHMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkZXBhcnRtZW50czonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGVwYXJ0bWVudHMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkZXBhcnRtZW50cyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBwcm9jdXJlbWVudCB0ZWFtc1xucm91dGVyLmdldCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgT1JERVIgQlkgbmFtZScsIChlcnIsIHRlYW1zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHByb2N1cmVtZW50IHRlYW1zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24odGVhbXMpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgYWxsIHdvcmtlcnNcbnJvdXRlci5nZXQoJy8nLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIHRyeSB7XG4gICAgZGIuYWxsKGBcbiAgICAgIFNFTEVDVCBcbiAgICAgICAgdS4qLFxuICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgRlJPTSB1c2VycyB1XG4gICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdS5kaXZpc2lvbl9pZCA9IGQuaWRcbiAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgIE9SREVSIEJZIHUuZnVsbF9uYW1lXG4gICAgYCwgKGVyciwgd29ya2VycykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXJzOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcnMnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUcmFuc2Zvcm0gdG8gbWF0Y2ggZnJvbnRlbmQgZXhwZWN0YXRpb25zXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlcnMgPSB3b3JrZXJzLm1hcCh3b3JrZXIgPT4gKHtcbiAgICAgICAgaWQ6IHdvcmtlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogd29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICByb2xlQ29kZTogd29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgZnVsbE5hbWU6IHdvcmtlci5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogd29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgIGRpdmlzaW9uSWQ6IHdvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGVwYXJ0bWVudElkOiB3b3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB3b3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLCAvLyBEb24ndCBzZW5kIGFjdHVhbCBwYXNzd29yZFxuICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogd29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgIGVtYWlsOiB3b3JrZXIuZW1haWwsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogd29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcGFydG1lbnROYW1lOiB3b3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICB9KSk7XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2Vycyk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyczonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB3b3JrZXJzJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCB3b3JrZXIgYnkgSURcbnJvdXRlci5nZXQoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgXG4gIHRyeSB7XG4gICAgZGIuZ2V0KGBcbiAgICAgIFNFTEVDVCBcbiAgICAgICAgdS4qLFxuICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgRlJPTSB1c2VycyB1XG4gICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdS5kaXZpc2lvbl9pZCA9IGQuaWRcbiAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgIFdIRVJFIHUuaWQgPSA/XG4gICAgYCwgW2lkXSwgKGVyciwgd29ya2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB3b3JrZXInIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXdvcmtlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlciA9IHtcbiAgICAgICAgaWQ6IHdvcmtlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogd29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICByb2xlQ29kZTogd29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgZnVsbE5hbWU6IHdvcmtlci5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogd29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgIGRpdmlzaW9uSWQ6IHdvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGVwYXJ0bWVudElkOiB3b3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB3b3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogd29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgIGVtYWlsOiB3b3JrZXIuZW1haWwsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogd29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcGFydG1lbnROYW1lOiB3b3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICB9O1xuICAgICAgXG4gICAgICByZXMuanNvbih0cmFuc2Zvcm1lZFdvcmtlcik7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBDcmVhdGUgbmV3IHdvcmtlclxucm91dGVyLnBvc3QoJy8nLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygxLCA1LCA5KSwgLy8gTWFuYWdlciwgQWRtaW4sIFRlY2huaWNhbFxuICBib2R5KCdlbXBsb3llZUlkJykuaXNMZW5ndGgoeyBtaW46IDQsIG1heDogNCB9KS53aXRoTWVzc2FnZSgnRW1wbG95ZWUgSUQgbXVzdCBiZSA0IGRpZ2l0cycpLFxuICBib2R5KCdyb2xlQ29kZScpLmlzSW50KHsgbWluOiAxLCBtYXg6IDkgfSkud2l0aE1lc3NhZ2UoJ0ludmFsaWQgcm9sZSBjb2RlJyksXG4gIGJvZHkoJ2Z1bGxOYW1lJykubm90RW1wdHkoKS53aXRoTWVzc2FnZSgnRnVsbCBuYW1lIGlzIHJlcXVpcmVkJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykuaXNMZW5ndGgoeyBtaW46IDYsIG1heDogNiB9KS53aXRoTWVzc2FnZSgnUGFzc3dvcmQgbXVzdCBiZSA2IGNoYXJhY3RlcnMnKVxuXSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgd29ya2VyIHdpdGggZGF0YTonLCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBhdmFpbGFibGVXb3JrRGF5cyxcbiAgICAgIGVtYWlsXG4gICAgfSk7XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBDaGVjayBpZiBlbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0c1xuICAgIGRiLmdldCgnU0VMRUNUIGlkIEZST00gdXNlcnMgV0hFUkUgZW1wbG95ZWVfaWQgPSA/JywgW2VtcGxveWVlSWRdLCBhc3luYyAoZXJyLCBleGlzdGluZ1VzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRGF0YWJhc2UgZXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgdXNlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0aW5nVXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gSGFzaCBwYXNzd29yZFxuICAgICAgY29uc3QgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIHBhcnNlSW50KHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMpIHx8IDEyKTtcblxuICAgICAgLy8gSW5zZXJ0IG5ldyB3b3JrZXJcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIElOU0VSVCBJTlRPIHVzZXJzIChcbiAgICAgICAgICBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUsIHJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgZGl2aXNpb25faWQsIGRlcGFydG1lbnRfaWQsIHByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCwgYXZhaWxhYmxlX3dvcmtfZGF5cywgZW1haWxcbiAgICAgICAgKSBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8sID8sID8sID8pXG4gICAgICBgLCBbXG4gICAgICAgIGVtcGxveWVlSWQsXG4gICAgICAgIGZ1bGxOYW1lLFxuICAgICAgICByb2xlQ29kZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uIHx8IG51bGwsXG4gICAgICAgIGRpdmlzaW9uSWQgfHwgbnVsbCxcbiAgICAgICAgZGVwYXJ0bWVudElkIHx8IG51bGwsXG4gICAgICAgIHByb2N1cmVtZW50VGVhbSB8fCBudWxsLFxuICAgICAgICBwYXNzd29yZEhhc2gsXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzID8gcGFyc2VJbnQoYXZhaWxhYmxlV29ya0RheXMpIDogbnVsbCxcbiAgICAgICAgZW1haWwgfHwgbnVsbFxuICAgICAgXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgd29ya2VyJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3JrZXIgY3JlYXRlZCB3aXRoIElEOicsIHRoaXMubGFzdElEKTtcblxuICAgICAgICAvLyBHZXQgdGhlIGNyZWF0ZWQgd29ya2VyIHdpdGggam9pbmVkIGRhdGFcbiAgICAgICAgZGIuZ2V0KGBcbiAgICAgICAgICBTRUxFQ1QgXG4gICAgICAgICAgICB1LiosXG4gICAgICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSxcbiAgICAgICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWVcbiAgICAgICAgICBGUk9NIHVzZXJzIHVcbiAgICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdS5kaXZpc2lvbl9pZCA9IGQuaWRcbiAgICAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB1LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkXG4gICAgICAgICAgV0hFUkUgdS5pZCA9ID9cbiAgICAgICAgYCwgW3RoaXMubGFzdElEXSwgKGVyciwgbmV3V29ya2VyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgd29ya2VyJyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlciA9IHtcbiAgICAgICAgICAgIGlkOiBuZXdXb3JrZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiBuZXdXb3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogbmV3V29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiBuZXdXb3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiBuZXdXb3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGRpdmlzaW9uSWQ6IG5ld1dvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgICAgIGRlcGFydG1lbnRJZDogbmV3V29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IG5ld1dvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IG5ld1dvcmtlci5hdmFpbGFibGVfd29ya19kYXlzPy50b1N0cmluZygpLFxuICAgICAgICAgICAgZW1haWw6IG5ld1dvcmtlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogbmV3V29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogbmV3V29ya2VyLmRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnUmV0dXJuaW5nIGNyZWF0ZWQgd29ya2VyOicsIHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih0cmFuc2Zvcm1lZFdvcmtlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gVXBkYXRlIHdvcmtlclxucm91dGVyLnB1dCgnLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpLCAvLyBNYW5hZ2VyLCBBZG1pbiwgVGVjaG5pY2FsXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5vcHRpb25hbCgpLmlzTGVuZ3RoKHsgbWluOiA0LCBtYXg6IDQgfSkud2l0aE1lc3NhZ2UoJ0VtcGxveWVlIElEIG11c3QgYmUgNCBkaWdpdHMnKSxcbiAgYm9keSgncm9sZUNvZGUnKS5vcHRpb25hbCgpLmlzSW50KHsgbWluOiAxLCBtYXg6IDkgfSkud2l0aE1lc3NhZ2UoJ0ludmFsaWQgcm9sZSBjb2RlJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykub3B0aW9uYWwoKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtlcklkID0gcmVxLnBhcmFtcy5pZDtcbiAgICBjb25zdCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBDaGVjayBpZiBlbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cyAoZXhjbHVkaW5nIGN1cnJlbnQgd29ya2VyKVxuICAgIGlmIChlbXBsb3llZUlkKSB7XG4gICAgICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIHVzZXJzIFdIRVJFIGVtcGxveWVlX2lkID0gPyBBTkQgaWQgIT0gPycsIFtlbXBsb3llZUlkLCB3b3JrZXJJZF0sIGFzeW5jIChlcnIsIGV4aXN0aW5nVXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB1cGRhdGVXb3JrZXIoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB1cGRhdGVXb3JrZXIoKTtcbiAgICB9XG5cbiAgICBhc3luYyBmdW5jdGlvbiB1cGRhdGVXb3JrZXIoKSB7XG4gICAgICBsZXQgcGFzc3dvcmRIYXNoID0gbnVsbDtcbiAgICAgIGlmIChwYXNzd29yZCAmJiBwYXNzd29yZCAhPT0gJyoqKioqKicpIHtcbiAgICAgICAgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIHBhcnNlSW50KHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMpIHx8IDEyKTtcbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgdXBkYXRlIHF1ZXJ5IGR5bmFtaWNhbGx5XG4gICAgICBjb25zdCB1cGRhdGVGaWVsZHMgPSBbXTtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuXG4gICAgICBpZiAoZW1wbG95ZWVJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdlbXBsb3llZV9pZCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goZW1wbG95ZWVJZCk7XG4gICAgICB9XG4gICAgICBpZiAocm9sZUNvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncm9sZV9jb2RlID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChyb2xlQ29kZSk7XG4gICAgICB9XG4gICAgICBpZiAoZnVsbE5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnZnVsbF9uYW1lID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChmdWxsTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAocm9sZURlc2NyaXB0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3JvbGVfZGVzY3JpcHRpb24gPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHJvbGVEZXNjcmlwdGlvbiB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChkaXZpc2lvbklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2RpdmlzaW9uX2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChkaXZpc2lvbklkIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGRlcGFydG1lbnRJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdkZXBhcnRtZW50X2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChkZXBhcnRtZW50SWQgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBpZiAocHJvY3VyZW1lbnRUZWFtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3Byb2N1cmVtZW50X3RlYW0gPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHByb2N1cmVtZW50VGVhbSB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXNzd29yZEhhc2gpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3Bhc3N3b3JkX2hhc2ggPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHBhc3N3b3JkSGFzaCk7XG4gICAgICB9XG4gICAgICBpZiAoYXZhaWxhYmxlV29ya0RheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnYXZhaWxhYmxlX3dvcmtfZGF5cyA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goYXZhaWxhYmxlV29ya0RheXMgPyBwYXJzZUludChhdmFpbGFibGVXb3JrRGF5cykgOiBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbWFpbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdlbWFpbCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goZW1haWwgfHwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCd1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAnKTtcbiAgICAgIHZhbHVlcy5wdXNoKHdvcmtlcklkKTtcblxuICAgICAgaWYgKHVwZGF0ZUZpZWxkcy5sZW5ndGggPT09IDEpIHsgLy8gT25seSB0aW1lc3RhbXAgdXBkYXRlXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnTm8gZmllbGRzIHRvIHVwZGF0ZScgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVwZGF0ZVF1ZXJ5ID0gYFVQREFURSB1c2VycyBTRVQgJHt1cGRhdGVGaWVsZHMuam9pbignLCAnKX0gV0hFUkUgaWQgPSA/YDtcblxuICAgICAgZGIucnVuKHVwZGF0ZVF1ZXJ5LCB2YWx1ZXMsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIHdvcmtlcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCB0aGUgdXBkYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoYFxuICAgICAgICAgIFNFTEVDVCBcbiAgICAgICAgICAgIHUuKixcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIEZST00gdXNlcnMgdVxuICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgICAgICBXSEVSRSB1LmlkID0gP1xuICAgICAgICBgLCBbd29ya2VySWRdLCAoZXJyLCB1cGRhdGVkV29ya2VyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCB3b3JrZXInIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICAgICAgaWQ6IHVwZGF0ZWRXb3JrZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1cGRhdGVkV29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVwZGF0ZWRXb3JrZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHVwZGF0ZWRXb3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1cGRhdGVkV29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBkaXZpc2lvbklkOiB1cGRhdGVkV29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiB1cGRhdGVkV29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVwZGF0ZWRXb3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiAnKioqKioqJyxcbiAgICAgICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB1cGRhdGVkV29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBlbWFpbDogdXBkYXRlZFdvcmtlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogdXBkYXRlZFdvcmtlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHVwZGF0ZWRXb3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gRGVsZXRlIHdvcmtlclxucm91dGVyLmRlbGV0ZSgnLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpIC8vIE1hbmFnZXIsIEFkbWluLCBUZWNobmljYWxcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHdvcmtlcklkID0gcmVxLnBhcmFtcy5pZDtcblxuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIHdvcmtlciBpcyBhc3NpZ25lZCB0byBhbnkgYWN0aXZlIHRhc2tzXG4gICAgLy8gRm9yIG5vdywgd2UnbGwgYWxsb3cgZGVsZXRpb24gYnV0IGluIHByb2R1Y3Rpb24geW91IG1pZ2h0IHdhbnQgdG8gcHJldmVudCBpdFxuICAgIFxuICAgIGRiLnJ1bignREVMRVRFIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JywgW3dvcmtlcklkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgd29ya2VyJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdXb3JrZXIgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgd29ya2VyJyB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7aW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSwgaW5pdGlhbGl6ZURhdGFiYXNlLCBjbG9zZURhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gc2VlZERhdGFiYXNlKCkge1xuICB0cnkge1xuICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnU2VlZGluZyBkYXRhYmFzZSB3aXRoIGluaXRpYWwgZGF0YS4uLicpO1xuICAgIFxuICAgIC8vIFNlZWQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbiAgICBjb25zdCByb2xlcyA9IFtcbiAgICAgIHsgcm9sZUNvZGU6IDEsIGRlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUU4XHUwNUU5XHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNURCXHUwNURDIFx1MDVFQVx1MDVENFx1MDVEQ1x1MDVEOVx1MDVEQlx1MDVEOSBcdTA1RDRcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICB7IHJvbGVDb2RlOiAyLCBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEMFx1MDVFOSBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNUUwXHUwNUQ5XHUwNUREIFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiAzLCBkZXNjcmlwdGlvbjogJ1x1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVERicsIHBlcm1pc3Npb25zOiAnXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyIFx1MDVFNFx1MDVFMlx1MDVEOVx1MDVEQ1x1MDVENVx1MDVEOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVERVx1MDVFOVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEMVx1MDVFN1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMFx1MDVEN1x1MDVFOCBcdTA1RTFcdTA1RDhcdTA1RDhcdTA1RDVcdTA1RTEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDJcdTA1RDNcdTA1RThcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENVx1MDVEOFx1MDVEMVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RTJcdTA1RDZcdTA1RTgnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVFQSBcdTA1RUFcdTA1RTlcdTA1RUFcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUQ0XHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICBbcm9sZS5yb2xlQ29kZSwgcm9sZS5kZXNjcmlwdGlvbiwgcm9sZS5wZXJtaXNzaW9uc11cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZGl2aXNpb25zXG4gICAgY29uc3QgZGl2aXNpb25zID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQwXHUwNUQyXHUwNUUzIFx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycsIGlzSW50ZXJuYWw6IHRydWUgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RTlcdTA1RDlcdTA1RDVcdTA1RDVcdTA1RTcnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDcgXHUwNUQ3XHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUwXHUwNUQ5IFx1MDVEMCcsIGlzSW50ZXJuYWw6IGZhbHNlIH1cbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZGl2aXNpb24gb2YgZGl2aXNpb25zKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgIFtkaXZpc2lvbi5uYW1lLCBkaXZpc2lvbi5pc0ludGVybmFsXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBkZXBhcnRtZW50c1xuICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVENCcsIGRpdmlzaW9uSWQ6IDEgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQScsIGRpdmlzaW9uSWQ6IDIgfVxuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCBkZXB0IG9mIGRlcGFydG1lbnRzKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2RlcHQubmFtZSwgZGVwdC5kaXZpc2lvbklkXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBwcm9jdXJlbWVudCB0ZWFtc1xuICAgIGNvbnN0IHRlYW1zID0gW1xuICAgICAgJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScsICdcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknLCAnXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JywgJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsICdcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDknLCAnXHUwNUQxXHUwNUQ5XHUwNUQ4XHUwNUQ3XHUwNUQ1XHUwNUUwXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0ZWFtIG9mIHRlYW1zKSB7XG4gICAgICBkYi5ydW4oJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsIFt0ZWFtXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZG9tYWluc1xuICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCBcdTA1RDVcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLFxuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDlcdTA1REQgXHUwNURFXHUwNUU3XHUwNUU2XHUwNUQ1XHUwNUUyXHUwNUQ5XHUwNUQ5XHUwNUREJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVERVx1MDVFOVx1MDVFOFx1MDVEM1x1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZG9tYWluIG9mIGRvbWFpbnMpIHtcbiAgICAgIGRiLnJ1bignSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJywgW2RvbWFpbl0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTlcdTA1RDVcdTA1RDVcdTA1RDBcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNURCXHUwNUUwXHUwNUVBIFx1MDVERVx1MDVFNFx1MDVFOFx1MDVEOCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCB0b29sczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDgsIFx1MDVEOVx1MDVEOVx1MDVFMlx1MDVENVx1MDVFNSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQgXHUwNURFXHUwNURCXHUwNUU4XHUwNUQ2JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNURELCBcdTA1RDBcdTA1RUFcdTA1RTggXHUwNUQ0XHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNURFXHUwNUQ4XHUwNUU4XHUwNUQ5XHUwNUU2XHUwNUVBIFx1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENCwgXHUwNUQ1XHUwNUUyXHUwNUQzXHUwNUVBIFx1MDVEMVx1MDVEN1x1MDVEOVx1MDVFMFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RDZcdTA1RDVcdTA1REJcdTA1RDQnLCB0b29sczogJ1x1MDVFNFx1MDVFOFx1MDVENVx1MDVEOFx1MDVENVx1MDVFN1x1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDdcdTA1RENcdTA1RDhcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDdcdTA1RUFcdTA1RDlcdTA1REVcdTA1RDQgXHUwNUUyXHUwNURDIFx1MDVENFx1MDVFMVx1MDVEQlx1MDVERCcsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDdcdTA1RDVcdTA1RDZcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RTdcdTA1RThcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgdG9vbHM6ICdcdTA1RThcdTA1RTlcdTA1RDlcdTA1REVcdTA1RUEgXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUQ1XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1REJcdTA1RTFcdTA1RTRcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVFNFx1MDVFOFx1MDVENVx1MDVEOVx1MDVFN1x1MDVEOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sczogJ1x1MDVEM1x1MDVENVx1MDVENyBcdTA1RTFcdTA1RDlcdTA1REJcdTA1RDVcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGFjdGl2aXR5IG9mIGFjdGl2aXRpZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2FjdGl2aXR5Lm5hbWUsIGFjdGl2aXR5LnRvb2xzXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBlbmdhZ2VtZW50IHR5cGVzXG4gICAgY29uc3QgZW5nYWdlbWVudFR5cGVzID0gW1xuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RDVcdTA1REVcdTA1RDFcdTA1RDknLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1REVcdTA1RDVcdTA1RDJcdTA1RDFcdTA1REMnLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0eXBlIG9mIGVuZ2FnZW1lbnRUeXBlcykge1xuICAgICAgZGIucnVuKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZW5nYWdlbWVudF90eXBlcyAobmFtZSkgVkFMVUVTICg/KScsIFt0eXBlXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IGFkbWluIHVzZXJcbiAgICBjb25zdCBhZG1pblBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgcGFzc3dvcmRfaGFzaCwgZW1haWxcbiAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICBbJzk5OTknLCAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScsIDksICdcdTA1RDJcdTA1RDVcdTA1RThcdTA1REQgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgYWRtaW5QYXNzd29yZCwgJ2FkbWluQHN5c3RlbS5jb20nXVxuICAgICk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIHNhbXBsZSBwcm9jdXJlbWVudCBtYW5hZ2VyXG4gICAgY29uc3QgbWFuYWdlclBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgcGFzc3dvcmRfaGFzaCwgcHJvY3VyZW1lbnRfdGVhbSwgYXZhaWxhYmxlX3dvcmtfZGF5c1xuICAgICAgKSBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8pYCxcbiAgICAgIFsnMTAwMScsICdcdTA1RDBcdTA1RDFcdTA1RThcdTA1RDRcdTA1REQgXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDJywgMSwgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBtYW5hZ2VyUGFzc3dvcmQsICdcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RDNcdTA1RDknLCAyMDBdXG4gICAgKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseSEnKTtcbiAgICBjb25zb2xlLmxvZygnRGVmYXVsdCB1c2VycyBjcmVhdGVkOicpO1xuICAgIGNvbnNvbGUubG9nKCctIEFkbWluOiA5OTk5IC8gMTIzNDU2Jyk7XG4gICAgY29uc29sZS5sb2coJy0gTWFuYWdlcjogMTAwMSAvIDEyMzQ1NicpO1xuICAgIFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZWVkIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgc2VlZERhdGFiYXNlIH07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9leHByZXNzLWFwcC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0IG1vcmdhbiBmcm9tICdtb3JnYW4nO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcbmltcG9ydCByYXRlTGltaXQgZnJvbSAnZXhwcmVzcy1yYXRlLWxpbWl0JztcbmltcG9ydCB7IGluaXRpYWxpemVEYXRhYmFzZSB9IGZyb20gJy4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCBhdXRoUm91dGVzIGZyb20gJy4vcm91dGVzL2F1dGguanMnO1xuaW1wb3J0IHdvcmtlcnNSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvd29ya2Vycy5qcyc7XG5cbi8vIEVudmlyb25tZW50IHZhcmlhYmxlc1xucHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQgfHwgJ3lvdXItc3VwZXItc2VjcmV0LWp3dC1rZXktY2hhbmdlLXRoaXMtaW4tcHJvZHVjdGlvbic7XG5wcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiA9IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOIHx8ICcyNGgnO1xucHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyA9IHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMgfHwgJzEyJztcbnByb2Nlc3MuZW52LkRCX1BBVEggPSBwcm9jZXNzLmVudi5EQl9QQVRIIHx8ICcuL3NyYy9zZXJ2ZXIvZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbmxldCBleHByZXNzQXBwID0gbnVsbDtcbmxldCBpc0luaXRpYWxpemVkID0gZmFsc2U7XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUV4cHJlc3NBcHAoKSB7XG4gIGlmIChleHByZXNzQXBwKSB7XG4gICAgcmV0dXJuIGV4cHJlc3NBcHA7XG4gIH1cblxuICBjb25zdCBhcHAgPSBleHByZXNzKCk7XG5cbiAgLy8gU2VjdXJpdHkgbWlkZGxld2FyZVxuICBhcHAudXNlKGhlbG1ldCh7XG4gICAgY29udGVudFNlY3VyaXR5UG9saWN5OiBmYWxzZSwgLy8gRGlzYWJsZSBDU1AgZm9yIGRldmVsb3BtZW50XG4gIH0pKTtcbiAgYXBwLnVzZShjb21wcmVzc2lvbigpKTtcblxuICAvLyBSYXRlIGxpbWl0aW5nXG4gIGNvbnN0IGxpbWl0ZXIgPSByYXRlTGltaXQoe1xuICAgIHdpbmRvd01zOiAxNSAqIDYwICogMTAwMCwgLy8gMTUgbWludXRlc1xuICAgIG1heDogMTAwMCwgLy8gSW5jcmVhc2VkIGxpbWl0IGZvciBkZXZlbG9wbWVudFxuICAgIG1lc3NhZ2U6IHsgZXJyb3I6ICdUb28gbWFueSByZXF1ZXN0cyBmcm9tIHRoaXMgSVAsIHBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJyB9XG4gIH0pO1xuICBhcHAudXNlKGxpbWl0ZXIpO1xuXG4gIC8vIENPUlMgY29uZmlndXJhdGlvblxuICBhcHAudXNlKGNvcnMoe1xuICAgIG9yaWdpbjogdHJ1ZSwgLy8gQWxsb3cgYWxsIG9yaWdpbnMgaW4gZGV2ZWxvcG1lbnRcbiAgICBjcmVkZW50aWFsczogdHJ1ZSxcbiAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnT1BUSU9OUyddLFxuICAgIGFsbG93ZWRIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ11cbiAgfSkpO1xuXG4gIC8vIEJvZHkgcGFyc2luZyBtaWRkbGV3YXJlXG4gIGFwcC51c2UoZXhwcmVzcy5qc29uKHsgbGltaXQ6ICcxMG1iJyB9KSk7XG4gIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUsIGxpbWl0OiAnMTBtYicgfSkpO1xuXG4gIC8vIExvZ2dpbmdcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICBhcHAudXNlKG1vcmdhbignZGV2JykpO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBkYXRhYmFzZSBvbmx5IG9uY2VcbiAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBEYXRhYmFzZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIFxuICAgICAgLy8gU2VlZCBkYXRhYmFzZVxuICAgICAgY29uc3QgeyBzZWVkRGF0YWJhc2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zY3JpcHRzL3NlZWREYXRhYmFzZS5qcycpO1xuICAgICAgYXdhaXQgc2VlZERhdGFiYXNlKCk7XG4gICAgICBjb25zb2xlLmxvZygnXHUyNzA1IERhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIFxuICAgICAgaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBGYWlsZWQgdG8gaW5pdGlhbGl6ZSBkYXRhYmFzZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLy8gSGVhbHRoIGNoZWNrIGVuZHBvaW50XG4gIGFwcC5nZXQoJy9oZWFsdGgnLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuanNvbih7IFxuICAgICAgc3RhdHVzOiAnT0snLCBcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBBUEkgUm91dGVzXG4gIGFwcC51c2UoJy9hdXRoJywgYXV0aFJvdXRlcyk7XG4gIGFwcC51c2UoJy93b3JrZXJzJywgd29ya2Vyc1JvdXRlcyk7XG5cbiAgLy8gRXJyb3IgaGFuZGxpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKChlcnIsIHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgY29uc29sZS5lcnJvcignQVBJIEVycm9yOicsIGVycik7XG4gICAgXG4gICAgaWYgKGVyci50eXBlID09PSAnZW50aXR5LnBhcnNlLmZhaWxlZCcpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnSW52YWxpZCBKU09OIGZvcm1hdCcgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5zdGF0dXMoZXJyLnN0YXR1cyB8fCA1MDApLmpzb24oe1xuICAgICAgZXJyb3I6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgXG4gICAgICAgID8gJ0ludGVybmFsIHNlcnZlciBlcnJvcicgXG4gICAgICAgIDogZXJyLm1lc3NhZ2VcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gNDA0IGhhbmRsZXIgZm9yIEFQSSByb3V0ZXNcbiAgYXBwLnVzZSgnKicsIChyZXEsIHJlcykgPT4ge1xuICAgIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBUEkgcm91dGUgbm90IGZvdW5kJyB9KTtcbiAgfSk7XG5cbiAgZXhwcmVzc0FwcCA9IGFwcDtcbiAgY29uc29sZS5sb2coJ1x1MjcwNSBFeHByZXNzIGFwcCBjcmVhdGVkIGFuZCBjb25maWd1cmVkJyk7XG4gIHJldHVybiBhcHA7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZUV4cHJlc3NBcHAgfTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgbWlkZGxld2FyZU1vZGU6IGZhbHNlLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gICAgLy8gQ3VzdG9tIHBsdWdpbiB0byBpbnRlZ3JhdGUgRXhwcmVzcyBzZXJ2ZXJcbiAgICB7XG4gICAgICBuYW1lOiAnZXhwcmVzcy1pbnRlZ3JhdGlvbicsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIC8vIEltcG9ydCBhbmQgc2V0dXAgRXhwcmVzcyByb3V0ZXNcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaScsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgdGhlIEV4cHJlc3MgYXBwXG4gICAgICAgICAgICBjb25zdCB7IGNyZWF0ZUV4cHJlc3NBcHAgfSA9IGF3YWl0IGltcG9ydCgnLi9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzJyk7XG4gICAgICAgICAgICBjb25zdCBleHByZXNzQXBwID0gYXdhaXQgY3JlYXRlRXhwcmVzc0FwcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBIYW5kbGUgdGhlIHJlcXVlc3Qgd2l0aCBFeHByZXNzXG4gICAgICAgICAgICBleHByZXNzQXBwKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwcmVzcyBtaWRkbGV3YXJlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIG5leHQoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQXlRLE9BQU8sYUFBYTtBQUM3UixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBYWYsU0FBUyxjQUFjO0FBQ3JCLE1BQUksQ0FBQyxJQUFJO0FBQ1AsWUFBUSxJQUFJLDZCQUE2QixPQUFPO0FBQ2hELFNBQUssSUFBSSxRQUFRLFNBQVMsU0FBUyxDQUFDLFFBQVE7QUFDMUMsVUFBSSxLQUFLO0FBQ1AsZ0JBQVEsTUFBTSwyQkFBMkIsR0FBRztBQUM1QyxjQUFNO0FBQUEsTUFDUjtBQUNBLGNBQVEsSUFBSSxvQ0FBb0MsT0FBTztBQUFBLElBQ3pELENBQUM7QUFHRCxPQUFHLElBQUksMEJBQTBCO0FBQUEsRUFDbkM7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxlQUFlLHFCQUFxQjtBQUNsQyxRQUFNQSxNQUFLLFlBQVk7QUFFdkIsU0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDdEMsSUFBQUEsSUFBRyxVQUFVLE1BQU07QUFDakIsY0FBUSxJQUFJLDZCQUE2QjtBQUd6QyxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQWdCTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BT047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FNTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BT047QUFHRCxNQUFBQSxJ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WUFBQUMsWUFBVyxLQUFLLEtBQUssSUFBSTtBQUFBLFVBQzNCLFNBQVMsT0FBTztBQUNkLG9CQUFRLE1BQU0sNkJBQTZCLEtBQUs7QUFDaEQsaUJBQUssS0FBSztBQUFBLFVBQ1o7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0YsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLQyxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbImRiIiwgImVyciIsICJqd3QiLCAiaW5pdF9hdXRoIiwgImRiIiwgImV4cHJlc3MiLCAiYmNyeXB0IiwgImJvZHkiLCAidmFsaWRhdGlvblJlc3VsdCIsICJyb3V0ZXIiLCAiZGIiLCAiZXJyIiwgImJjcnlwdCIsICJkYiIsICJleHByZXNzIiwgInNlZWREYXRhYmFzZSIsICJpbml0X2F1dGgiLCAicGF0aCIsICJjcmVhdGVFeHByZXNzQXBwIiwgImV4cHJlc3NBcHAiLCAicGF0aCJdCn0K
