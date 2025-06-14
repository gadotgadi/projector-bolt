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
        const db2 = getDatabase();
        db2.get("SELECT id FROM users WHERE employee_id = ?", [employeeId], async (err, existingUser) => {
          if (err) {
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
    router2.get("/organizational-roles", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM organizational_roles ORDER BY role_code", (err, roles) => {
        if (err) {
          console.error("Error fetching organizational roles:", err);
          return res.status(500).json({ error: "Failed to fetch organizational roles" });
        }
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
    max: 100,
    // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests from this IP, please try again later." }
  });
  app.use(limiter);
  app.use(cors({
    origin: true,
    // Allow all origins in development
    credentials: true
  }));
  app.use(express3.json({ limit: "10mb" }));
  app.use(express3.urlencoded({ extended: true, limit: "10mb" }));
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
    const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seedDatabase(), seedDatabase_exports));
    await seedDatabase2();
  } catch (error) {
    console.error("Failed to initialize database:", error);
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
  return app;
}
var expressApp;
var init_express_app = __esm({
  "src/server/express-app.js"() {
    init_database();
    init_auth2();
    init_workers();
    process.env.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
    process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "12";
    process.env.DB_PATH = process.env.DB_PATH || "./data/procurement.db";
    expressApp = null;
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
    port: 8080
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
            const app = await createExpressApp2();
            app(req, res, next);
          } catch (error) {
            console.error("Express middleware error:", error);
            res.statusCode = 500;
            res.end("Internal Server Error");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9leHByZXNzLWFwcC5qcyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2NvbmZpZy9kYXRhYmFzZS5qc1wiO2ltcG9ydCBzcWxpdGUzIGZyb20gJ3NxbGl0ZTMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBEQl9QQVRIID0gcHJvY2Vzcy5lbnYuREJfUEFUSCB8fCAnLi9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxuLy8gRW5zdXJlIGRhdGEgZGlyZWN0b3J5IGV4aXN0c1xuY29uc3QgZGF0YURpciA9IHBhdGguZGlybmFtZShEQl9QQVRIKTtcbmlmICghZnMuZXhpc3RzU3luYyhkYXRhRGlyKSkge1xuICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgZGF0YSBkaXJlY3Rvcnk6JywgZGF0YURpcik7XG4gIGZzLm1rZGlyU3luYyhkYXRhRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbn1cblxubGV0IGRiID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0RGF0YWJhc2UoKSB7XG4gIGlmICghZGIpIHtcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIGRhdGFiYXNlIGF0OicsIERCX1BBVEgpO1xuICAgIGRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2UoREJfUEFUSCwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBvcGVuaW5nIGRhdGFiYXNlOicsIGVycik7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gU1FMaXRlIGRhdGFiYXNlIGF0OicsIERCX1BBVEgpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIEVuYWJsZSBmb3JlaWduIGtleXNcbiAgICBkYi5ydW4oJ1BSQUdNQSBmb3JlaWduX2tleXMgPSBPTicpO1xuICB9XG4gIHJldHVybiBkYjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFiYXNlKCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgZGF0YWJhc2UgdGFibGVzLi4uJyk7XG4gICAgICBcbiAgICAgIC8vIFVzZXJzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyB1c2VycyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVtcGxveWVlX2lkIFRFWFQgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGZ1bGxfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBwcm9jdXJlbWVudF90ZWFtIFRFWFQsXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGF2YWlsYWJsZV93b3JrX2RheXMgSU5URUdFUixcbiAgICAgICAgICBlbWFpbCBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIE9yZ2FuaXphdGlvbmFsIHJvbGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBvcmdhbml6YXRpb25hbF9yb2xlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHBlcm1pc3Npb25zIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIERpdmlzaW9ucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZGl2aXNpb25zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGlzX2ludGVybmFsIEJPT0xFQU4gREVGQVVMVCAxXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEZXBhcnRtZW50cyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZGVwYXJ0bWVudHMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGl2aXNpb25faWQpIFJFRkVSRU5DRVMgZGl2aXNpb25zKGlkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gUHJvY3VyZW1lbnQgdGVhbXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2N1cmVtZW50X3RlYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEb21haW5zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkb21haW5zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQWN0aXZpdHkgcG9vbCB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgYWN0aXZpdHlfcG9vbCAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICB0b29sc19hbmRfcmVzb3VyY2VzIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEVuZ2FnZW1lbnQgdHlwZXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGVuZ2FnZW1lbnRfdHlwZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEVuZ2FnZW1lbnQgdHlwZSBwcm9jZXNzZXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGVuZ2FnZW1lbnRfdHlwZV9wcm9jZXNzZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbmdhZ2VtZW50X3R5cGVfaWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBzdGF0aW9uX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgYWN0aXZpdHlfaWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUoZW5nYWdlbWVudF90eXBlX2lkLCBzdGF0aW9uX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gUHJvZ3JhbXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgdGFza19pZCBJTlRFR0VSIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICB3b3JrX3llYXIgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICByZXF1aXJlZF9xdWFydGVyIERBVEUgTk9UIE5VTEwsXG4gICAgICAgICAgdGl0bGUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhULFxuICAgICAgICAgIHJlcXVlc3Rlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIHJlcXVlc3Rlcl9uYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkaXZpc2lvbl9uYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVwYXJ0bWVudF9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfbmFtZSBURVhULFxuICAgICAgICAgIGRvbWFpbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRvbWFpbl9uYW1lIFRFWFQsXG4gICAgICAgICAgZXN0aW1hdGVkX2Ftb3VudCBERUNJTUFMKDE1LDIpLFxuICAgICAgICAgIGN1cnJlbmN5IFRFWFQsXG4gICAgICAgICAgc3VwcGxpZXJfbGlzdCBURVhULFxuICAgICAgICAgIGp1c3RpZmljYXRpb24gVEVYVCxcbiAgICAgICAgICBwbGFubmluZ19zb3VyY2UgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBjb21wbGV4aXR5IElOVEVHRVIsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGF0dXMgVEVYVCBOT1QgTlVMTCBERUZBVUxUICdPcGVuJyxcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgdGVhbV9pZCBJTlRFR0VSLFxuICAgICAgICAgIHRlYW1fbmFtZSBURVhULFxuICAgICAgICAgIHN0YXJ0X2RhdGUgREFURSxcbiAgICAgICAgICBwbGFubmluZ19ub3RlcyBURVhULFxuICAgICAgICAgIG9mZmljZXJfbm90ZXMgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChlbmdhZ2VtZW50X3R5cGVfaWQpIFJFRkVSRU5DRVMgZW5nYWdlbWVudF90eXBlcyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW0gdGFza3MgKHN0YXRpb25zKSB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvZ3JhbV90YXNrcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHByb2dyYW1faWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBzdGF0aW9uX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgYWN0aXZpdHlfaWQgSU5URUdFUixcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgY29tcGxldGlvbl9kYXRlIERBVEUsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXBvcnRpbmdfdXNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgcmVmZXJlbmNlIFRFWFQsXG4gICAgICAgICAgbm90ZXMgVEVYVCxcbiAgICAgICAgICBpc19sYXN0X3N0YXRpb24gQk9PTEVBTiBERUZBVUxUIDAsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAocHJvZ3JhbV9pZCkgUkVGRVJFTkNFUyBwcm9ncmFtcyhpZCksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGFjdGl2aXR5X2lkKSBSRUZFUkVOQ0VTIGFjdGl2aXR5X3Bvb2woaWQpLFxuICAgICAgICAgIFVOSVFVRShwcm9ncmFtX2lkLCBzdGF0aW9uX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gU3lzdGVtIHNldHRpbmdzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBzeXN0ZW1fc2V0dGluZ3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBzZXR0aW5nX2tleSBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBzZXR0aW5nX3ZhbHVlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCwgKGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgc3lzdGVtX3NldHRpbmdzIHRhYmxlOicsIGVycik7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGluZGV4ZXMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc19zdGF0dXMgT04gcHJvZ3JhbXMoc3RhdHVzKScpO1xuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc193b3JrX3llYXIgT04gcHJvZ3JhbXMod29ya195ZWFyKScpO1xuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtX3Rhc2tzX3Byb2dyYW1faWQgT04gcHJvZ3JhbV90YXNrcyhwcm9ncmFtX2lkKScpO1xuICAgICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF91c2Vyc19lbXBsb3llZV9pZCBPTiB1c2VycyhlbXBsb3llZV9pZCknLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgaW5kZXhlczonLCBlcnIpO1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSB0YWJsZXMgYW5kIGluZGV4ZXMgY3JlYXRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjbG9zZURhdGFiYXNlKCkge1xuICBpZiAoZGIpIHtcbiAgICBkYi5jbG9zZSgoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNsb3NpbmcgZGF0YWJhc2U6JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBjb25uZWN0aW9uIGNsb3NlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRiID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQge1xuICBnZXREYXRhYmFzZSxcbiAgaW5pdGlhbGl6ZURhdGFiYXNlLFxuICBjbG9zZURhdGFiYXNlXG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2ltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcblxuZnVuY3Rpb24gYXV0aGVudGljYXRlVG9rZW4ocmVxLCByZXMsIG5leHQpIHtcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzWydhdXRob3JpemF0aW9uJ107XG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlciAmJiBhdXRoSGVhZGVyLnNwbGl0KCcgJylbMV07XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQWNjZXNzIHRva2VuIHJlcXVpcmVkJyB9KTtcbiAgfVxuXG4gIGp3dC52ZXJpZnkodG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsIChlcnIsIHVzZXIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicgfSk7XG4gICAgfVxuICAgIHJlcS51c2VyID0gdXNlcjtcbiAgICBuZXh0KCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhdXRob3JpemVSb2xlcyguLi5yb2xlcykge1xuICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgaWYgKCFyZXEudXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyb2xlcy5pbmNsdWRlcyhyZXEudXNlci5yb2xlQ29kZSkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9KTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlVXNlckV4aXN0cyhyZXEsIHJlcywgbmV4dCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHVzZXJJZCA9IHJlcS51c2VyLmlkO1xuXG4gIGRiLmdldChcbiAgICAnU0VMRUNUIGlkLCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLFxuICAgIFt1c2VySWRdLFxuICAgIChlcnIsIHVzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVxLnVzZXIuY3VycmVudFVzZXIgPSB1c2VyO1xuICAgICAgbmV4dCgpO1xuICAgIH1cbiAgKTtcbn1cblxuZXhwb3J0IHtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzLFxuICB2YWxpZGF0ZVVzZXJFeGlzdHNcbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9hdXRoLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIExvZ2luIGVuZHBvaW50XG5yb3V0ZXIucG9zdCgnL2xvZ2luJywgW1xuICBib2R5KCdlbXBsb3llZUlkJykuaXNMZW5ndGgoeyBtaW46IDQsIG1heDogNCB9KS53aXRoTWVzc2FnZSgnRW1wbG95ZWUgSUQgbXVzdCBiZSA0IGRpZ2l0cycpLFxuICBib2R5KCdwYXNzd29yZCcpLmlzTGVuZ3RoKHsgbWluOiA2LCBtYXg6IDYgfSkud2l0aE1lc3NhZ2UoJ1Bhc3N3b3JkIG11c3QgYmUgNiBjaGFyYWN0ZXJzJylcbl0sIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBlbXBsb3llZUlkLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgZGIuZ2V0KFxuICAgICAgJ1NFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgZW1wbG95ZWVfaWQgPSA/JyxcbiAgICAgIFtlbXBsb3llZUlkXSxcbiAgICAgIGFzeW5jIChlcnIsIHVzZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzVmFsaWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkX2hhc2gpO1xuICAgICAgICBpZiAoIWlzVmFsaWRQYXNzd29yZCkge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2tlbiA9IGp3dC5zaWduKFxuICAgICAgICAgIHsgXG4gICAgICAgICAgICBpZDogdXNlci5pZCwgXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlIFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCxcbiAgICAgICAgICB7IGV4cGlyZXNJbjogcHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gfHwgJzI0aCcgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJlcy5qc29uKHtcbiAgICAgICAgICB0b2tlbixcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IHVzZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogdXNlci5wcm9jdXJlbWVudF90ZWFtXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0xvZ2luIGVycm9yOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCBjdXJyZW50IHVzZXIgaW5mb1xucm91dGVyLmdldCgnL21lJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5nZXQoXG4gICAgJ1NFTEVDVCBpZCwgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBwcm9jdXJlbWVudF90ZWFtLCBlbWFpbCBGUk9NIHVzZXJzIFdIRVJFIGlkID0gPycsXG4gICAgW3JlcS51c2VyLmlkXSxcbiAgICAoZXJyLCB1c2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdVc2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHtcbiAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgICByb2xlRGVzY3JpcHRpb246IHVzZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsXG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvd29ya2Vycy5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgeyBib2R5LCB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGF1dGhvcml6ZVJvbGVzIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gR2V0IGFsbCB3b3JrZXJzXG5yb3V0ZXIuZ2V0KCcvJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICB0cnkge1xuICAgIGRiLmFsbChgXG4gICAgICBTRUxFQ1QgXG4gICAgICAgIHUuKixcbiAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWVcbiAgICAgIEZST00gdXNlcnMgdVxuICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHUuZGl2aXNpb25faWQgPSBkLmlkXG4gICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB1LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkXG4gICAgICBPUkRFUiBCWSB1LmZ1bGxfbmFtZVxuICAgIGAsIChlcnIsIHdvcmtlcnMpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyczonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB3b3JrZXJzJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVHJhbnNmb3JtIHRvIG1hdGNoIGZyb250ZW5kIGV4cGVjdGF0aW9uc1xuICAgICAgY29uc3QgdHJhbnNmb3JtZWRXb3JrZXJzID0gd29ya2Vycy5tYXAod29ya2VyID0+ICh7XG4gICAgICAgIGlkOiB3b3JrZXIuaWQsXG4gICAgICAgIGVtcGxveWVlSWQ6IHdvcmtlci5lbXBsb3llZV9pZCxcbiAgICAgICAgcm9sZUNvZGU6IHdvcmtlci5yb2xlX2NvZGUsXG4gICAgICAgIGZ1bGxOYW1lOiB3b3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICByb2xlRGVzY3JpcHRpb246IHdvcmtlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICBkaXZpc2lvbklkOiB3b3JrZXIuZGl2aXNpb25faWQsXG4gICAgICAgIGRlcGFydG1lbnRJZDogd29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgIHByb2N1cmVtZW50VGVhbTogd29ya2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgIHBhc3N3b3JkOiAnKioqKioqJywgLy8gRG9uJ3Qgc2VuZCBhY3R1YWwgcGFzc3dvcmRcbiAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IHdvcmtlci5hdmFpbGFibGVfd29ya19kYXlzPy50b1N0cmluZygpLFxuICAgICAgICBlbWFpbDogd29ya2VyLmVtYWlsLFxuICAgICAgICBkaXZpc2lvbk5hbWU6IHdvcmtlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXBhcnRtZW50TmFtZTogd29ya2VyLmRlcGFydG1lbnRfbmFtZVxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICByZXMuanNvbih0cmFuc2Zvcm1lZFdvcmtlcnMpO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHdvcmtlcnM6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggd29ya2VycycgfSk7XG4gIH1cbn0pO1xuXG4vLyBHZXQgd29ya2VyIGJ5IElEXG5yb3V0ZXIuZ2V0KCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIFxuICB0cnkge1xuICAgIGRiLmdldChgXG4gICAgICBTRUxFQ1QgXG4gICAgICAgIHUuKixcbiAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWVcbiAgICAgIEZST00gdXNlcnMgdVxuICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHUuZGl2aXNpb25faWQgPSBkLmlkXG4gICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB1LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkXG4gICAgICBXSEVSRSB1LmlkID0gP1xuICAgIGAsIFtpZF0sIChlcnIsIHdvcmtlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggd29ya2VyJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgdHJhbnNmb3JtZWRXb3JrZXIgPSB7XG4gICAgICAgIGlkOiB3b3JrZXIuaWQsXG4gICAgICAgIGVtcGxveWVlSWQ6IHdvcmtlci5lbXBsb3llZV9pZCxcbiAgICAgICAgcm9sZUNvZGU6IHdvcmtlci5yb2xlX2NvZGUsXG4gICAgICAgIGZ1bGxOYW1lOiB3b3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICByb2xlRGVzY3JpcHRpb246IHdvcmtlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICBkaXZpc2lvbklkOiB3b3JrZXIuZGl2aXNpb25faWQsXG4gICAgICAgIGRlcGFydG1lbnRJZDogd29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgIHByb2N1cmVtZW50VGVhbTogd29ya2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgIHBhc3N3b3JkOiAnKioqKioqJyxcbiAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IHdvcmtlci5hdmFpbGFibGVfd29ya19kYXlzPy50b1N0cmluZygpLFxuICAgICAgICBlbWFpbDogd29ya2VyLmVtYWlsLFxuICAgICAgICBkaXZpc2lvbk5hbWU6IHdvcmtlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXBhcnRtZW50TmFtZTogd29ya2VyLmRlcGFydG1lbnRfbmFtZVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgcmVzLmpzb24odHJhbnNmb3JtZWRXb3JrZXIpO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gQ3JlYXRlIG5ldyB3b3JrZXJcbnJvdXRlci5wb3N0KCcvJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMSwgNSwgOSksIC8vIE1hbmFnZXIsIEFkbWluLCBUZWNobmljYWxcbiAgYm9keSgnZW1wbG95ZWVJZCcpLmlzTGVuZ3RoKHsgbWluOiA0LCBtYXg6IDQgfSkud2l0aE1lc3NhZ2UoJ0VtcGxveWVlIElEIG11c3QgYmUgNCBkaWdpdHMnKSxcbiAgYm9keSgncm9sZUNvZGUnKS5pc0ludCh7IG1pbjogMSwgbWF4OiA5IH0pLndpdGhNZXNzYWdlKCdJbnZhbGlkIHJvbGUgY29kZScpLFxuICBib2R5KCdmdWxsTmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0Z1bGwgbmFtZSBpcyByZXF1aXJlZCcpLFxuICBib2R5KCdwYXNzd29yZCcpLmlzTGVuZ3RoKHsgbWluOiA2LCBtYXg6IDYgfSkud2l0aE1lc3NhZ2UoJ1Bhc3N3b3JkIG11c3QgYmUgNiBjaGFyYWN0ZXJzJylcbl0sIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgZW1wbG95ZWVJZCxcbiAgICAgIHJvbGVDb2RlLFxuICAgICAgZnVsbE5hbWUsXG4gICAgICByb2xlRGVzY3JpcHRpb24sXG4gICAgICBkaXZpc2lvbklkLFxuICAgICAgZGVwYXJ0bWVudElkLFxuICAgICAgcHJvY3VyZW1lbnRUZWFtLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhdmFpbGFibGVXb3JrRGF5cyxcbiAgICAgIGVtYWlsXG4gICAgfSA9IHJlcS5ib2R5O1xuXG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgLy8gQ2hlY2sgaWYgZW1wbG95ZWUgSUQgYWxyZWFkeSBleGlzdHNcbiAgICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIHVzZXJzIFdIRVJFIGVtcGxveWVlX2lkID0gPycsIFtlbXBsb3llZUlkXSwgYXN5bmMgKGVyciwgZXhpc3RpbmdVc2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnRW1wbG95ZWUgSUQgYWxyZWFkeSBleGlzdHMnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBIYXNoIHBhc3N3b3JkXG4gICAgICBjb25zdCBwYXNzd29yZEhhc2ggPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgcGFyc2VJbnQocHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUykgfHwgMTIpO1xuXG4gICAgICAvLyBJbnNlcnQgbmV3IHdvcmtlclxuICAgICAgZGIucnVuKGBcbiAgICAgICAgSU5TRVJUIElOVE8gdXNlcnMgKFxuICAgICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICBkaXZpc2lvbl9pZCwgZGVwYXJ0bWVudF9pZCwgcHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICBwYXNzd29yZF9oYXNoLCBhdmFpbGFibGVfd29ya19kYXlzLCBlbWFpbFxuICAgICAgICApIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPywgPywgPywgPylcbiAgICAgIGAsIFtcbiAgICAgICAgZW1wbG95ZWVJZCxcbiAgICAgICAgZnVsbE5hbWUsXG4gICAgICAgIHJvbGVDb2RlLFxuICAgICAgICByb2xlRGVzY3JpcHRpb24gfHwgbnVsbCxcbiAgICAgICAgZGl2aXNpb25JZCB8fCBudWxsLFxuICAgICAgICBkZXBhcnRtZW50SWQgfHwgbnVsbCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtIHx8IG51bGwsXG4gICAgICAgIHBhc3N3b3JkSGFzaCxcbiAgICAgICAgYXZhaWxhYmxlV29ya0RheXMgPyBwYXJzZUludChhdmFpbGFibGVXb3JrRGF5cykgOiBudWxsLFxuICAgICAgICBlbWFpbCB8fCBudWxsXG4gICAgICBdLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSB3b3JrZXInIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoZSBjcmVhdGVkIHdvcmtlciB3aXRoIGpvaW5lZCBkYXRhXG4gICAgICAgIGRiLmdldChgXG4gICAgICAgICAgU0VMRUNUIFxuICAgICAgICAgICAgdS4qLFxuICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgRlJPTSB1c2VycyB1XG4gICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHUuZGl2aXNpb25faWQgPSBkLmlkXG4gICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgICAgIFdIRVJFIHUuaWQgPSA/XG4gICAgICAgIGAsIFt0aGlzLmxhc3RJRF0sIChlcnIsIG5ld1dvcmtlcikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgd29ya2VyJyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlciA9IHtcbiAgICAgICAgICAgIGlkOiBuZXdXb3JrZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiBuZXdXb3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogbmV3V29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiBuZXdXb3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiBuZXdXb3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGRpdmlzaW9uSWQ6IG5ld1dvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgICAgIGRlcGFydG1lbnRJZDogbmV3V29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IG5ld1dvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IG5ld1dvcmtlci5hdmFpbGFibGVfd29ya19kYXlzPy50b1N0cmluZygpLFxuICAgICAgICAgICAgZW1haWw6IG5ld1dvcmtlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogbmV3V29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogbmV3V29ya2VyLmRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih0cmFuc2Zvcm1lZFdvcmtlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gVXBkYXRlIHdvcmtlclxucm91dGVyLnB1dCgnLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpLCAvLyBNYW5hZ2VyLCBBZG1pbiwgVGVjaG5pY2FsXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5vcHRpb25hbCgpLmlzTGVuZ3RoKHsgbWluOiA0LCBtYXg6IDQgfSkud2l0aE1lc3NhZ2UoJ0VtcGxveWVlIElEIG11c3QgYmUgNCBkaWdpdHMnKSxcbiAgYm9keSgncm9sZUNvZGUnKS5vcHRpb25hbCgpLmlzSW50KHsgbWluOiAxLCBtYXg6IDkgfSkud2l0aE1lc3NhZ2UoJ0ludmFsaWQgcm9sZSBjb2RlJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykub3B0aW9uYWwoKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtlcklkID0gcmVxLnBhcmFtcy5pZDtcbiAgICBjb25zdCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBDaGVjayBpZiBlbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cyAoZXhjbHVkaW5nIGN1cnJlbnQgd29ya2VyKVxuICAgIGlmIChlbXBsb3llZUlkKSB7XG4gICAgICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIHVzZXJzIFdIRVJFIGVtcGxveWVlX2lkID0gPyBBTkQgaWQgIT0gPycsIFtlbXBsb3llZUlkLCB3b3JrZXJJZF0sIGFzeW5jIChlcnIsIGV4aXN0aW5nVXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB1cGRhdGVXb3JrZXIoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB1cGRhdGVXb3JrZXIoKTtcbiAgICB9XG5cbiAgICBhc3luYyBmdW5jdGlvbiB1cGRhdGVXb3JrZXIoKSB7XG4gICAgICBsZXQgcGFzc3dvcmRIYXNoID0gbnVsbDtcbiAgICAgIGlmIChwYXNzd29yZCAmJiBwYXNzd29yZCAhPT0gJyoqKioqKicpIHtcbiAgICAgICAgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIHBhcnNlSW50KHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMpIHx8IDEyKTtcbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgdXBkYXRlIHF1ZXJ5IGR5bmFtaWNhbGx5XG4gICAgICBjb25zdCB1cGRhdGVGaWVsZHMgPSBbXTtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuXG4gICAgICBpZiAoZW1wbG95ZWVJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdlbXBsb3llZV9pZCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goZW1wbG95ZWVJZCk7XG4gICAgICB9XG4gICAgICBpZiAocm9sZUNvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncm9sZV9jb2RlID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChyb2xlQ29kZSk7XG4gICAgICB9XG4gICAgICBpZiAoZnVsbE5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnZnVsbF9uYW1lID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChmdWxsTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAocm9sZURlc2NyaXB0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3JvbGVfZGVzY3JpcHRpb24gPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHJvbGVEZXNjcmlwdGlvbiB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChkaXZpc2lvbklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2RpdmlzaW9uX2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChkaXZpc2lvbklkIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGRlcGFydG1lbnRJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdkZXBhcnRtZW50X2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChkZXBhcnRtZW50SWQgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBpZiAocHJvY3VyZW1lbnRUZWFtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3Byb2N1cmVtZW50X3RlYW0gPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHByb2N1cmVtZW50VGVhbSB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXNzd29yZEhhc2gpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3Bhc3N3b3JkX2hhc2ggPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHBhc3N3b3JkSGFzaCk7XG4gICAgICB9XG4gICAgICBpZiAoYXZhaWxhYmxlV29ya0RheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnYXZhaWxhYmxlX3dvcmtfZGF5cyA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goYXZhaWxhYmxlV29ya0RheXMgPyBwYXJzZUludChhdmFpbGFibGVXb3JrRGF5cykgOiBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbWFpbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdlbWFpbCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goZW1haWwgfHwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCd1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAnKTtcbiAgICAgIHZhbHVlcy5wdXNoKHdvcmtlcklkKTtcblxuICAgICAgaWYgKHVwZGF0ZUZpZWxkcy5sZW5ndGggPT09IDEpIHsgLy8gT25seSB0aW1lc3RhbXAgdXBkYXRlXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnTm8gZmllbGRzIHRvIHVwZGF0ZScgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVwZGF0ZVF1ZXJ5ID0gYFVQREFURSB1c2VycyBTRVQgJHt1cGRhdGVGaWVsZHMuam9pbignLCAnKX0gV0hFUkUgaWQgPSA/YDtcblxuICAgICAgZGIucnVuKHVwZGF0ZVF1ZXJ5LCB2YWx1ZXMsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIHdvcmtlcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCB0aGUgdXBkYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoYFxuICAgICAgICAgIFNFTEVDVCBcbiAgICAgICAgICAgIHUuKixcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIEZST00gdXNlcnMgdVxuICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgICAgICBXSEVSRSB1LmlkID0gP1xuICAgICAgICBgLCBbd29ya2VySWRdLCAoZXJyLCB1cGRhdGVkV29ya2VyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCB3b3JrZXInIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICAgICAgaWQ6IHVwZGF0ZWRXb3JrZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1cGRhdGVkV29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVwZGF0ZWRXb3JrZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHVwZGF0ZWRXb3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1cGRhdGVkV29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBkaXZpc2lvbklkOiB1cGRhdGVkV29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiB1cGRhdGVkV29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVwZGF0ZWRXb3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiAnKioqKioqJyxcbiAgICAgICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB1cGRhdGVkV29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBlbWFpbDogdXBkYXRlZFdvcmtlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogdXBkYXRlZFdvcmtlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHVwZGF0ZWRXb3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gRGVsZXRlIHdvcmtlclxucm91dGVyLmRlbGV0ZSgnLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpIC8vIE1hbmFnZXIsIEFkbWluLCBUZWNobmljYWxcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHdvcmtlcklkID0gcmVxLnBhcmFtcy5pZDtcblxuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIHdvcmtlciBpcyBhc3NpZ25lZCB0byBhbnkgYWN0aXZlIHRhc2tzXG4gICAgLy8gRm9yIG5vdywgd2UnbGwgYWxsb3cgZGVsZXRpb24gYnV0IGluIHByb2R1Y3Rpb24geW91IG1pZ2h0IHdhbnQgdG8gcHJldmVudCBpdFxuICAgIFxuICAgIGRiLnJ1bignREVMRVRFIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JywgW3dvcmtlcklkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgd29ya2VyJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdXb3JrZXIgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgd29ya2VyJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCBvcmdhbml6YXRpb25hbCByb2xlc1xucm91dGVyLmdldCgnL29yZ2FuaXphdGlvbmFsLXJvbGVzJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gb3JnYW5pemF0aW9uYWxfcm9sZXMgT1JERVIgQlkgcm9sZV9jb2RlJywgKGVyciwgcm9sZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBvcmdhbml6YXRpb25hbCByb2xlczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggb3JnYW5pemF0aW9uYWwgcm9sZXMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihyb2xlcyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBkaXZpc2lvbnNcbnJvdXRlci5nZXQoJy9kaXZpc2lvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgT1JERVIgQlkgbmFtZScsIChlcnIsIGRpdmlzaW9ucykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGl2aXNpb25zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24oZGl2aXNpb25zKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRlcGFydG1lbnRzXG5yb3V0ZXIuZ2V0KCcvZGVwYXJ0bWVudHMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkZXBhcnRtZW50cyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGVwYXJ0bWVudHMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkZXBhcnRtZW50czonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGVwYXJ0bWVudHMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkZXBhcnRtZW50cyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBwcm9jdXJlbWVudCB0ZWFtc1xucm91dGVyLmdldCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgT1JERVIgQlkgbmFtZScsIChlcnIsIHRlYW1zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHByb2N1cmVtZW50IHRlYW1zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24odGVhbXMpO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzL3NlZWREYXRhYmFzZS5qc1wiO2ltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UsIGluaXRpYWxpemVEYXRhYmFzZSwgY2xvc2VEYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlZWREYXRhYmFzZSgpIHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ1NlZWRpbmcgZGF0YWJhc2Ugd2l0aCBpbml0aWFsIGRhdGEuLi4nKTtcbiAgICBcbiAgICAvLyBTZWVkIG9yZ2FuaXphdGlvbmFsIHJvbGVzXG4gICAgY29uc3Qgcm9sZXMgPSBbXG4gICAgICB7IHJvbGVDb2RlOiAxLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVFOFx1MDVFOVx1MDVEMFx1MDVENVx1MDVFQSBcdTA1REVcdTA1RENcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNURDXHUwNUUwXHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNURDIFx1MDVEQlx1MDVEQyBcdTA1RUFcdTA1RDRcdTA1RENcdTA1RDlcdTA1REJcdTA1RDkgXHUwNUQ0XHUwNUU4XHUwNURCXHUwNUU5JyB9LFxuICAgICAgeyByb2xlQ29kZTogMiwgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1RDBcdTA1RTkgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBIFx1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVFMFx1MDVEOVx1MDVERCBcdTA1RDVcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNURFXHUwNUU5XHUwNUQ5XHUwNURFXHUwNUQ1XHUwNUVBJyB9LFxuICAgICAgeyByb2xlQ29kZTogMywgZGVzY3JpcHRpb246ICdcdTA1RTdcdTA1RTBcdTA1RDlcdTA1RDlcdTA1REYnLCBwZXJtaXNzaW9uczogJ1x1MDVEMVx1MDVEOVx1MDVFNlx1MDVENVx1MDVFMiBcdTA1RTRcdTA1RTJcdTA1RDlcdTA1RENcdTA1RDVcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA0LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDNcdTA1RDVcdTA1RThcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVEMlx1MDVFOVx1MDVFQSBcdTA1RDFcdTA1RTdcdTA1RTlcdTA1RDVcdTA1RUEgXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RDBcdTA1RDdcdTA1RTggXHUwNUUxXHUwNUQ4XHUwNUQ4XHUwNUQ1XHUwNUUxJyB9LFxuICAgICAgeyByb2xlQ29kZTogNSwgZGVzY3JpcHRpb246ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1RENcdTA1REYgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUQ0XHUwNUQyXHUwNUQzXHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDVcdTA1RDhcdTA1RDFcdTA1RENcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNUUyXHUwNUQ2XHUwNUU4JyB9LFxuICAgICAgeyByb2xlQ29kZTogOSwgZGVzY3JpcHRpb246ICdcdTA1RDJcdTA1RDVcdTA1RThcdTA1REQgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgcGVybWlzc2lvbnM6ICdcdTA1RUFcdTA1RDdcdTA1RDZcdTA1RDVcdTA1RTdcdTA1RUEgXHUwNUVBXHUwNUU5XHUwNUVBXHUwNUQ5XHUwNUQ1XHUwNUVBIFx1MDVENFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScgfVxuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gb3JnYW5pemF0aW9uYWxfcm9sZXMgKHJvbGVfY29kZSwgZGVzY3JpcHRpb24sIHBlcm1pc3Npb25zKSBWQUxVRVMgKD8sID8sID8pJyxcbiAgICAgICAgW3JvbGUucm9sZUNvZGUsIHJvbGUuZGVzY3JpcHRpb24sIHJvbGUucGVybWlzc2lvbnNdXG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWVkIGRpdmlzaW9uc1xuICAgIGNvbnN0IGRpdmlzaW9ucyA9IFtcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RUFcdTA1RTRcdTA1RTJcdTA1RDVcdTA1REMnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDBcdTA1RDJcdTA1RTMgXHUwNUU5XHUwNUQ5XHUwNUQ1XHUwNUQ1XHUwNUU3JywgaXNJbnRlcm5hbDogdHJ1ZSB9LFxuICAgICAgeyBuYW1lOiAnXHUwNURDXHUwNUU3XHUwNUQ1XHUwNUQ3IFx1MDVEN1x1MDVEOVx1MDVFNlx1MDVENVx1MDVFMFx1MDVEOSBcdTA1RDAnLCBpc0ludGVybmFsOiBmYWxzZSB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGRpdmlzaW9uIG9mIGRpdmlzaW9ucykge1xuICAgICAgZGIucnVuKFxuICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknLFxuICAgICAgICBbZGl2aXNpb24ubmFtZSwgZGl2aXNpb24uaXNJbnRlcm5hbF1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZGVwYXJ0bWVudHNcbiAgICBjb25zdCBkZXBhcnRtZW50cyA9IFtcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDQnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgZGl2aXNpb25JZDogMSB9LFxuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVFOVx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDdcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAyIH1cbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZGVwdCBvZiBkZXBhcnRtZW50cykge1xuICAgICAgZGIucnVuKFxuICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRlcGFydG1lbnRzIChuYW1lLCBkaXZpc2lvbl9pZCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgIFtkZXB0Lm5hbWUsIGRlcHQuZGl2aXNpb25JZF1cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgcHJvY3VyZW1lbnQgdGVhbXNcbiAgICBjb25zdCB0ZWFtcyA9IFtcbiAgICAgICdcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RDNcdTA1RDknLCAnXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5JywgJ1x1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOScsICdcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLCAnXHUwNUQ0XHUwNUUwXHUwNUQzXHUwNUUxXHUwNUQ5JywgJ1x1MDVEMVx1MDVEOVx1MDVEOFx1MDVEN1x1MDVENVx1MDVFMFx1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgdGVhbSBvZiB0ZWFtcykge1xuICAgICAgZGIucnVuKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gcHJvY3VyZW1lbnRfdGVhbXMgKG5hbWUpIFZBTFVFUyAoPyknLCBbdGVhbV0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWVkIGRvbWFpbnNcbiAgICBjb25zdCBkb21haW5zID0gW1xuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDlcdTA1RDQgXHUwNUQ1XHUwNURFXHUwNUQ3XHUwNUU5XHUwNUQ1XHUwNUQxJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBXHUwNUQ5XHUwNUREIFx1MDVERVx1MDVFN1x1MDVFNlx1MDVENVx1MDVFMlx1MDVEOVx1MDVEOVx1MDVERCcsXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVFNlx1MDVEOVx1MDVENVx1MDVEMyBcdTA1REVcdTA1RTlcdTA1RThcdTA1RDNcdTA1RDknXG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGRvbWFpbiBvZiBkb21haW5zKSB7XG4gICAgICBkYi5ydW4oJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBkb21haW5zIChkZXNjcmlwdGlvbikgVkFMVUVTICg/KScsIFtkb21haW5dKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBhY3Rpdml0eSBwb29sXG4gICAgY29uc3QgYWN0aXZpdGllcyA9IFtcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEM1x1MDVEOVx1MDVFN1x1MDVFQSBcdTA1RDRcdTA1RTZcdTA1RTJcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBIFx1MDVERVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVEQlx1MDVFMFx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDggXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUU0XHUwNUU4XHUwNUQ4LCBcdTA1RDlcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RTUgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNUREIFx1MDVERVx1MDVEQlx1MDVFOFx1MDVENicsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFNFx1MDVFOFx1MDVFMVx1MDVENVx1MDVERCwgXHUwNUQwXHUwNUVBXHUwNUU4IFx1MDVENFx1MDVEN1x1MDVEMVx1MDVFOFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTZcdTA1RTJcdTA1RDVcdTA1RUEnLCB0b29sczogJ1x1MDVERVx1MDVEOFx1MDVFOFx1MDVEOVx1MDVFNlx1MDVFQSBcdTA1RDRcdTA1RTJcdTA1RThcdTA1REJcdTA1RDQsIFx1MDVENVx1MDVFMlx1MDVEM1x1MDVFQSBcdTA1RDFcdTA1RDdcdTA1RDlcdTA1RTBcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RDdcdTA1RDlcdTA1RThcdTA1RUEgXHUwNUQ2XHUwNUQ1XHUwNURCXHUwNUQ0JywgdG9vbHM6ICdcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDhcdTA1RDVcdTA1RTdcdTA1RDVcdTA1REMgXHUwNUQ0XHUwNUQ3XHUwNURDXHUwNUQ4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ3XHUwNUVBXHUwNUQ5XHUwNURFXHUwNUQ0IFx1MDVFMlx1MDVEQyBcdTA1RDRcdTA1RTFcdTA1REJcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUQ3XHUwNUQ1XHUwNUQ2XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUU3XHUwNUU4XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNUU4XHUwNUU5XHUwNUQ5XHUwNURFXHUwNUVBIFx1MDVEMVx1MDVEM1x1MDVEOVx1MDVFN1x1MDVENVx1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDBcdTA1RDlcdTA1RTlcdTA1RDVcdTA1RTggXHUwNUVBXHUwNUU5XHUwNURDXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURCXHUwNUUxXHUwNUU0XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMVx1MDVEOVx1MDVFNlx1MDVENVx1MDVFMicsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDhcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTFcdTA1RDJcdTA1RDlcdTA1RThcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUQ1XHUwNUQ5XHUwNUU3XHUwNUQ4JywgdG9vbHM6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQzXHUwNUQ1XHUwNUQ3IFx1MDVFMVx1MDVEOVx1MDVEQlx1MDVENVx1MDVERCcsIHRvb2xzOiAnXHUwNUVBXHUwNUQxXHUwNUUwXHUwNUQ5XHUwNUVBIFx1MDVEM1x1MDVENVx1MDVENycgfVxuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCBhY3Rpdml0eSBvZiBhY3Rpdml0aWVzKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gYWN0aXZpdHlfcG9vbCAobmFtZSwgdG9vbHNfYW5kX3Jlc291cmNlcykgVkFMVUVTICg/LCA/KScsXG4gICAgICAgIFthY3Rpdml0eS5uYW1lLCBhY3Rpdml0eS50b29sc11cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZW5nYWdlbWVudCB0eXBlc1xuICAgIGNvbnN0IGVuZ2FnZW1lbnRUeXBlcyA9IFtcbiAgICAgICdcdTA1REVcdTA1REJcdTA1RThcdTA1RDYgXHUwNUU0XHUwNUQ1XHUwNURFXHUwNUQxXHUwNUQ5JyxcbiAgICAgICdcdTA1REVcdTA1REJcdTA1RThcdTA1RDYgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1REVcdTA1REJcdTA1RThcdTA1RDYgXHUwNUU0XHUwNUVBXHUwNUQ1XHUwNUQ3IFx1MDVERVx1MDVENVx1MDVEMlx1MDVEMVx1MDVEQycsXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENFx1MDVFOVx1MDVENVx1MDVENVx1MDVEMFx1MDVFQVx1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgdHlwZSBvZiBlbmdhZ2VtZW50VHlwZXMpIHtcbiAgICAgIGRiLnJ1bignSU5TRVJUIE9SIElHTk9SRSBJTlRPIGVuZ2FnZW1lbnRfdHlwZXMgKG5hbWUpIFZBTFVFUyAoPyknLCBbdHlwZV0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBhZG1pbiB1c2VyXG4gICAgY29uc3QgYWRtaW5QYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKCcxMjM0NTYnLCAxMik7XG4gICAgZGIucnVuKFxuICAgICAgYElOU0VSVCBPUiBJR05PUkUgSU5UTyB1c2VycyAoXG4gICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgXG4gICAgICAgIHBhc3N3b3JkX2hhc2gsIGVtYWlsXG4gICAgICApIFZBTFVFUyAoPywgPywgPywgPywgPywgPylgLFxuICAgICAgWyc5OTk5JywgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCA5LCAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVEOScsIGFkbWluUGFzc3dvcmQsICdhZG1pbkBzeXN0ZW0uY29tJ11cbiAgICApO1xuICAgIFxuICAgIC8vIENyZWF0ZSBzYW1wbGUgcHJvY3VyZW1lbnQgbWFuYWdlclxuICAgIGNvbnN0IG1hbmFnZXJQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKCcxMjM0NTYnLCAxMik7XG4gICAgZGIucnVuKFxuICAgICAgYElOU0VSVCBPUiBJR05PUkUgSU5UTyB1c2VycyAoXG4gICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgXG4gICAgICAgIHBhc3N3b3JkX2hhc2gsIHByb2N1cmVtZW50X3RlYW0sIGF2YWlsYWJsZV93b3JrX2RheXNcbiAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICBbJzEwMDEnLCAnXHUwNUQwXHUwNUQxXHUwNUU4XHUwNUQ0XHUwNUREIFx1MDVERVx1MDVFMFx1MDVENFx1MDVEQycsIDEsICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNUU4XHUwNURCXHUwNUU5JywgbWFuYWdlclBhc3N3b3JkLCAnXHUwNUQ5XHUwNUUyXHUwNUQ1XHUwNUQzXHUwNUQ5JywgMjAwXVxuICAgICk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHkhJyk7XG4gICAgY29uc29sZS5sb2coJ0RlZmF1bHQgdXNlcnMgY3JlYXRlZDonKTtcbiAgICBjb25zb2xlLmxvZygnLSBBZG1pbjogOTk5OSAvIDEyMzQ1NicpO1xuICAgIGNvbnNvbGUubG9nKCctIE1hbmFnZXI6IDEwMDEgLyAxMjM0NTYnKTtcbiAgICBcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VlZCBkYXRhYmFzZTonLCBlcnJvcik7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbmV4cG9ydCB7IHNlZWREYXRhYmFzZSB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCBoZWxtZXQgZnJvbSAnaGVsbWV0JztcbmltcG9ydCBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgcmF0ZUxpbWl0IGZyb20gJ2V4cHJlc3MtcmF0ZS1saW1pdCc7XG5pbXBvcnQgeyBpbml0aWFsaXplRGF0YWJhc2UgfSBmcm9tICcuL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgYXV0aFJvdXRlcyBmcm9tICcuL3JvdXRlcy9hdXRoLmpzJztcbmltcG9ydCB3b3JrZXJzUm91dGVzIGZyb20gJy4vcm91dGVzL3dvcmtlcnMuanMnO1xuXG4vLyBFbnZpcm9ubWVudCB2YXJpYWJsZXNcbnByb2Nlc3MuZW52LkpXVF9TRUNSRVQgPSBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICd5b3VyLXN1cGVyLXNlY3JldC1qd3Qta2V5LWNoYW5nZS10aGlzLWluLXByb2R1Y3Rpb24nO1xucHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gPSBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB8fCAnMjRoJztcbnByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMgPSBwcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTIHx8ICcxMic7XG5wcm9jZXNzLmVudi5EQl9QQVRIID0gcHJvY2Vzcy5lbnYuREJfUEFUSCB8fCAnLi9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxubGV0IGV4cHJlc3NBcHAgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeHByZXNzQXBwKCkge1xuICBpZiAoZXhwcmVzc0FwcCkge1xuICAgIHJldHVybiBleHByZXNzQXBwO1xuICB9XG5cbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4gIC8vIFNlY3VyaXR5IG1pZGRsZXdhcmVcbiAgYXBwLnVzZShoZWxtZXQoe1xuICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeTogZmFsc2UsIC8vIERpc2FibGUgQ1NQIGZvciBkZXZlbG9wbWVudFxuICB9KSk7XG4gIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG5cbiAgLy8gUmF0ZSBsaW1pdGluZ1xuICBjb25zdCBsaW1pdGVyID0gcmF0ZUxpbWl0KHtcbiAgICB3aW5kb3dNczogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcbiAgICBtYXg6IDEwMCwgLy8gbGltaXQgZWFjaCBJUCB0byAxMDAgcmVxdWVzdHMgcGVyIHdpbmRvd01zXG4gICAgbWVzc2FnZTogeyBlcnJvcjogJ1RvbyBtYW55IHJlcXVlc3RzIGZyb20gdGhpcyBJUCwgcGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nIH1cbiAgfSk7XG4gIGFwcC51c2UobGltaXRlcik7XG5cbiAgLy8gQ09SUyBjb25maWd1cmF0aW9uXG4gIGFwcC51c2UoY29ycyh7XG4gICAgb3JpZ2luOiB0cnVlLCAvLyBBbGxvdyBhbGwgb3JpZ2lucyBpbiBkZXZlbG9wbWVudFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlXG4gIH0pKTtcblxuICAvLyBCb2R5IHBhcnNpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKGV4cHJlc3MuanNvbih7IGxpbWl0OiAnMTBtYicgfSkpO1xuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcblxuICAvLyBMb2dnaW5nXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2NvbWJpbmVkJykpO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBkYXRhYmFzZVxuICB0cnkge1xuICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHknKTtcbiAgICBcbiAgICAvLyBTZWVkIGRhdGFiYXNlXG4gICAgY29uc3QgeyBzZWVkRGF0YWJhc2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zY3JpcHRzL3NlZWREYXRhYmFzZS5qcycpO1xuICAgIGF3YWl0IHNlZWREYXRhYmFzZSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgfVxuXG4gIC8vIEhlYWx0aCBjaGVjayBlbmRwb2ludFxuICBhcHAuZ2V0KCcvaGVhbHRoJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLmpzb24oeyBcbiAgICAgIHN0YXR1czogJ09LJywgXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gQVBJIFJvdXRlc1xuICBhcHAudXNlKCcvYXV0aCcsIGF1dGhSb3V0ZXMpO1xuICBhcHAudXNlKCcvd29ya2VycycsIHdvcmtlcnNSb3V0ZXMpO1xuXG4gIC8vIEVycm9yIGhhbmRsaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZSgoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSBFcnJvcjonLCBlcnIpO1xuICAgIFxuICAgIGlmIChlcnIudHlwZSA9PT0gJ2VudGl0eS5wYXJzZS5mYWlsZWQnKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgSlNPTiBmb3JtYXQnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuc3RhdHVzKGVyci5zdGF0dXMgfHwgNTAwKS5qc29uKHtcbiAgICAgIGVycm9yOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nIFxuICAgICAgICA/ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIFxuICAgICAgICA6IGVyci5tZXNzYWdlXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIDQwNCBoYW5kbGVyIGZvciBBUEkgcm91dGVzXG4gIGFwcC51c2UoJyonLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQVBJIHJvdXRlIG5vdCBmb3VuZCcgfSk7XG4gIH0pO1xuXG4gIGV4cHJlc3NBcHAgPSBhcHA7XG4gIHJldHVybiBhcHA7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZUV4cHJlc3NBcHAgfTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBDdXN0b20gcGx1Z2luIHRvIGludGVncmF0ZSBFeHByZXNzIHNlcnZlclxuICAgIHtcbiAgICAgIG5hbWU6ICdleHByZXNzLWludGVncmF0aW9uJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gSW1wb3J0IGFuZCBzZXR1cCBFeHByZXNzIHJvdXRlc1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCB0aGUgRXhwcmVzcyBhcHBcbiAgICAgICAgICAgIGNvbnN0IHsgY3JlYXRlRXhwcmVzc0FwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMnKTtcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGF3YWl0IGNyZWF0ZUV4cHJlc3NBcHAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSByZXF1ZXN0IHdpdGggRXhwcmVzc1xuICAgICAgICAgICAgYXBwKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwcmVzcyBtaWRkbGV3YXJlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBeVEsT0FBTyxhQUFhO0FBQzdSLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFhZixTQUFTLGNBQWM7QUFDckIsTUFBSSxDQUFDLElBQUk7QUFDUCxZQUFRLElBQUksNkJBQTZCLE9BQU87QUFDaEQsU0FBSyxJQUFJLFFBQVEsU0FBUyxTQUFTLENBQUMsUUFBUTtBQUMxQyxVQUFJLEtBQUs7QUFDUCxnQkFBUSxNQUFNLDJCQUEyQixHQUFHO0FBQzVDLGNBQU07QUFBQSxNQUNSO0FBQ0EsY0FBUSxJQUFJLG9DQUFvQyxPQUFPO0FBQUEsSUFDekQsQ0FBQztBQUdELE9BQUcsSUFBSSwwQkFBMEI7QUFBQSxFQUNuQztBQUNBLFNBQU87QUFDVDtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU1BLE1BQUssWUFBWTtBQUV2QixTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxJQUFBQSxJQUFHLFVBQVUsTUFBTTtBQUNqQixjQUFRLElBQUksNkJBQTZCO0FBR3pDLE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BZ0JOO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQU1OO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFB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QUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBO0FBQUEsSUFFaEI7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBRXRCLGVBQU8sWUFBWSxJQUFJLFFBQVEsT0FBTyxLQUFLLEtBQUssU0FBUztBQUN2RCxjQUFJO0FBRUYsa0JBQU0sRUFBRSxrQkFBQUMsa0JBQWlCLElBQUksTUFBTTtBQUNuQyxrQkFBTSxNQUFNLE1BQU1BLGtCQUFpQjtBQUduQyxnQkFBSSxLQUFLLEtBQUssSUFBSTtBQUFBLFVBQ3BCLFNBQVMsT0FBTztBQUNkLG9CQUFRLE1BQU0sNkJBQTZCLEtBQUs7QUFDaEQsZ0JBQUksYUFBYTtBQUNqQixnQkFBSSxJQUFJLHVCQUF1QjtBQUFBLFVBQ2pDO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBS0MsTUFBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJkYiIsICJlcnIiLCAiand0IiwgImluaXRfYXV0aCIsICJkYiIsICJleHByZXNzIiwgImJjcnlwdCIsICJib2R5IiwgInZhbGlkYXRpb25SZXN1bHQiLCAicm91dGVyIiwgImRiIiwgImVyciIsICJiY3J5cHQiLCAiZGIiLCAiZXhwcmVzcyIsICJzZWVkRGF0YWJhc2UiLCAiaW5pdF9hdXRoIiwgInBhdGgiLCAiY3JlYXRlRXhwcmVzc0FwcCIsICJwYXRoIl0KfQo=
