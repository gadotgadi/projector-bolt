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
        CREATE TABLE IF NOT EXISTS complexity_estimates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estimate_level_1 INTEGER NOT NULL DEFAULT 5,
          estimate_level_2 INTEGER NOT NULL DEFAULT 10,
          estimate_level_3 INTEGER NOT NULL DEFAULT 20,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db2.run(`
        CREATE TABLE IF NOT EXISTS acceptance_options (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year_id INTEGER UNIQUE NOT NULL,
          upload_code TEXT NOT NULL CHECK (upload_code IN ('Plan', 'Late', 'Block', 'Finish')),
          upload_code_description TEXT NOT NULL,
          broad_meaning TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        db2.run("CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)");
        db2.run("CREATE INDEX IF NOT EXISTS idx_acceptance_options_year ON acceptance_options(year_id)", (err2) => {
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

// src/server/routes/system.js
import express3 from "file:///home/project/node_modules/express/index.js";
import { body as body3, validationResult as validationResult3 } from "file:///home/project/node_modules/express-validator/lib/index.js";
var router3, system_default;
var init_system = __esm({
  "src/server/routes/system.js"() {
    init_database();
    init_auth();
    router3 = express3.Router();
    router3.get("/activity-pool", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM activity_pool ORDER BY name", (err, activities) => {
        if (err) {
          console.error("Error fetching activities:", err);
          return res.status(500).json({ error: "Failed to fetch activities" });
        }
        res.json(activities);
      });
    });
    router3.post("/activity-pool", [
      authenticateToken,
      authorizeRoles(0, 9),
      body3("name").notEmpty().withMessage("Activity name is required")
    ], (req, res) => {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, toolsAndResources } = req.body;
      const db2 = getDatabase();
      db2.run(
        "INSERT INTO activity_pool (name, tools_and_resources) VALUES (?, ?)",
        [name, toolsAndResources || null],
        function(err) {
          if (err) {
            console.error("Error creating activity:", err);
            return res.status(500).json({ error: "Failed to create activity" });
          }
          db2.get("SELECT * FROM activity_pool WHERE id = ?", [this.lastID], (err2, activity) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch created activity" });
            }
            res.status(201).json(activity);
          });
        }
      );
    });
    router3.put("/activity-pool/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const { name, toolsAndResources } = req.body;
      const db2 = getDatabase();
      db2.run(
        "UPDATE activity_pool SET name = ?, tools_and_resources = ? WHERE id = ?",
        [name, toolsAndResources || null, id],
        function(err) {
          if (err) {
            console.error("Error updating activity:", err);
            return res.status(500).json({ error: "Failed to update activity" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Activity not found" });
          }
          db2.get("SELECT * FROM activity_pool WHERE id = ?", [id], (err2, activity) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch updated activity" });
            }
            res.json(activity);
          });
        }
      );
    });
    router3.delete("/activity-pool/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const db2 = getDatabase();
      db2.run("DELETE FROM activity_pool WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting activity:", err);
          return res.status(500).json({ error: "Failed to delete activity" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Activity not found" });
        }
        res.json({ message: "Activity deleted successfully" });
      });
    });
    router3.get("/domains", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM domains ORDER BY description", (err, domains) => {
        if (err) {
          console.error("Error fetching domains:", err);
          return res.status(500).json({ error: "Failed to fetch domains" });
        }
        res.json(domains);
      });
    });
    router3.post("/domains", [
      authenticateToken,
      authorizeRoles(0, 9),
      body3("description").notEmpty().withMessage("Domain description is required")
    ], (req, res) => {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { description } = req.body;
      const db2 = getDatabase();
      db2.run(
        "INSERT INTO domains (description) VALUES (?)",
        [description],
        function(err) {
          if (err) {
            console.error("Error creating domain:", err);
            return res.status(500).json({ error: "Failed to create domain" });
          }
          db2.get("SELECT * FROM domains WHERE id = ?", [this.lastID], (err2, domain) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch created domain" });
            }
            res.status(201).json(domain);
          });
        }
      );
    });
    router3.put("/domains/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const { description } = req.body;
      const db2 = getDatabase();
      db2.run(
        "UPDATE domains SET description = ? WHERE id = ?",
        [description, id],
        function(err) {
          if (err) {
            console.error("Error updating domain:", err);
            return res.status(500).json({ error: "Failed to update domain" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Domain not found" });
          }
          db2.get("SELECT * FROM domains WHERE id = ?", [id], (err2, domain) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch updated domain" });
            }
            res.json(domain);
          });
        }
      );
    });
    router3.delete("/domains/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const db2 = getDatabase();
      db2.run("DELETE FROM domains WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting domain:", err);
          return res.status(500).json({ error: "Failed to delete domain" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Domain not found" });
        }
        res.json({ message: "Domain deleted successfully" });
      });
    });
    router3.get("/divisions", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM divisions ORDER BY name", (err, divisions) => {
        if (err) {
          console.error("Error fetching divisions:", err);
          return res.status(500).json({ error: "Failed to fetch divisions" });
        }
        res.json(divisions);
      });
    });
    router3.post("/divisions", [
      authenticateToken,
      authorizeRoles(0, 9),
      body3("name").notEmpty().withMessage("Division name is required")
    ], (req, res) => {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, isInternal } = req.body;
      const db2 = getDatabase();
      db2.run(
        "INSERT INTO divisions (name, is_internal) VALUES (?, ?)",
        [name, isInternal ? 1 : 0],
        function(err) {
          if (err) {
            console.error("Error creating division:", err);
            return res.status(500).json({ error: "Failed to create division" });
          }
          db2.get("SELECT * FROM divisions WHERE id = ?", [this.lastID], (err2, division) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch created division" });
            }
            res.status(201).json(division);
          });
        }
      );
    });
    router3.put("/divisions/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const { name, isInternal } = req.body;
      const db2 = getDatabase();
      db2.run(
        "UPDATE divisions SET name = ?, is_internal = ? WHERE id = ?",
        [name, isInternal ? 1 : 0, id],
        function(err) {
          if (err) {
            console.error("Error updating division:", err);
            return res.status(500).json({ error: "Failed to update division" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Division not found" });
          }
          db2.get("SELECT * FROM divisions WHERE id = ?", [id], (err2, division) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch updated division" });
            }
            res.json(division);
          });
        }
      );
    });
    router3.delete("/divisions/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const db2 = getDatabase();
      db2.run("DELETE FROM divisions WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting division:", err);
          return res.status(500).json({ error: "Failed to delete division" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Division not found" });
        }
        res.json({ message: "Division deleted successfully" });
      });
    });
    router3.get("/departments", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM departments ORDER BY name", (err, departments) => {
        if (err) {
          console.error("Error fetching departments:", err);
          return res.status(500).json({ error: "Failed to fetch departments" });
        }
        res.json(departments);
      });
    });
    router3.post("/departments", [
      authenticateToken,
      authorizeRoles(0, 9),
      body3("name").notEmpty().withMessage("Department name is required")
    ], (req, res) => {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, divisionId } = req.body;
      const db2 = getDatabase();
      db2.run(
        "INSERT INTO departments (name, division_id) VALUES (?, ?)",
        [name, divisionId || null],
        function(err) {
          if (err) {
            console.error("Error creating department:", err);
            return res.status(500).json({ error: "Failed to create department" });
          }
          db2.get("SELECT * FROM departments WHERE id = ?", [this.lastID], (err2, department) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch created department" });
            }
            res.status(201).json(department);
          });
        }
      );
    });
    router3.put("/departments/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const { name, divisionId } = req.body;
      const db2 = getDatabase();
      db2.run(
        "UPDATE departments SET name = ?, division_id = ? WHERE id = ?",
        [name, divisionId || null, id],
        function(err) {
          if (err) {
            console.error("Error updating department:", err);
            return res.status(500).json({ error: "Failed to update department" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Department not found" });
          }
          db2.get("SELECT * FROM departments WHERE id = ?", [id], (err2, department) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch updated department" });
            }
            res.json(department);
          });
        }
      );
    });
    router3.delete("/departments/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const db2 = getDatabase();
      db2.run("DELETE FROM departments WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting department:", err);
          return res.status(500).json({ error: "Failed to delete department" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
      });
    });
    router3.get("/procurement-teams", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM procurement_teams ORDER BY name", (err, teams) => {
        if (err) {
          console.error("Error fetching procurement teams:", err);
          return res.status(500).json({ error: "Failed to fetch procurement teams" });
        }
        res.json(teams);
      });
    });
    router3.post("/procurement-teams", [
      authenticateToken,
      authorizeRoles(0, 9),
      body3("name").notEmpty().withMessage("Team name is required")
    ], (req, res) => {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name } = req.body;
      const db2 = getDatabase();
      db2.run(
        "INSERT INTO procurement_teams (name) VALUES (?)",
        [name],
        function(err) {
          if (err) {
            console.error("Error creating procurement team:", err);
            return res.status(500).json({ error: "Failed to create procurement team" });
          }
          db2.get("SELECT * FROM procurement_teams WHERE id = ?", [this.lastID], (err2, team) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch created team" });
            }
            res.status(201).json(team);
          });
        }
      );
    });
    router3.put("/procurement-teams/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const { name } = req.body;
      const db2 = getDatabase();
      db2.run(
        "UPDATE procurement_teams SET name = ? WHERE id = ?",
        [name, id],
        function(err) {
          if (err) {
            console.error("Error updating procurement team:", err);
            return res.status(500).json({ error: "Failed to update procurement team" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Procurement team not found" });
          }
          db2.get("SELECT * FROM procurement_teams WHERE id = ?", [id], (err2, team) => {
            if (err2) {
              return res.status(500).json({ error: "Failed to fetch updated team" });
            }
            res.json(team);
          });
        }
      );
    });
    router3.delete("/procurement-teams/:id", [
      authenticateToken,
      authorizeRoles(0, 9)
    ], (req, res) => {
      const { id } = req.params;
      const db2 = getDatabase();
      db2.run("DELETE FROM procurement_teams WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting procurement team:", err);
          return res.status(500).json({ error: "Failed to delete procurement team" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Procurement team not found" });
        }
        res.json({ message: "Procurement team deleted successfully" });
      });
    });
    system_default = router3;
  }
});

// src/server/routes/planning.js
import express4 from "file:///home/project/node_modules/express/index.js";
import { body as body4, validationResult as validationResult4 } from "file:///home/project/node_modules/express-validator/lib/index.js";
var router4, planning_default;
var init_planning = __esm({
  "src/server/routes/planning.js"() {
    init_database();
    init_auth();
    router4 = express4.Router();
    router4.get("/complexity-estimates", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.get("SELECT * FROM complexity_estimates ORDER BY id DESC LIMIT 1", (err, estimates) => {
        if (err) {
          console.error("Error fetching complexity estimates:", err);
          return res.status(500).json({ error: "Failed to fetch complexity estimates" });
        }
        if (!estimates) {
          estimates = {
            id: 1,
            estimate_level_1: 5,
            estimate_level_2: 10,
            estimate_level_3: 20
          };
        }
        res.json({
          estimateLevel1: estimates.estimate_level_1,
          estimateLevel2: estimates.estimate_level_2,
          estimateLevel3: estimates.estimate_level_3
        });
      });
    });
    router4.put("/complexity-estimates", [
      authenticateToken,
      authorizeRoles(0, 1),
      // Admin and Procurement Manager
      body4("estimateLevel1").isInt({ min: 1, max: 365 }).withMessage("Level 1 estimate must be between 1-365"),
      body4("estimateLevel2").isInt({ min: 1, max: 365 }).withMessage("Level 2 estimate must be between 1-365"),
      body4("estimateLevel3").isInt({ min: 1, max: 365 }).withMessage("Level 3 estimate must be between 1-365")
    ], (req, res) => {
      const errors = validationResult4(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { estimateLevel1, estimateLevel2, estimateLevel3 } = req.body;
      const db2 = getDatabase();
      db2.get("SELECT id FROM complexity_estimates LIMIT 1", (err, existing) => {
        if (err) {
          console.error("Error checking complexity estimates:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (existing) {
          db2.run(
            "UPDATE complexity_estimates SET estimate_level_1 = ?, estimate_level_2 = ?, estimate_level_3 = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [estimateLevel1, estimateLevel2, estimateLevel3, existing.id],
            function(err2) {
              if (err2) {
                console.error("Error updating complexity estimates:", err2);
                return res.status(500).json({ error: "Failed to update complexity estimates" });
              }
              res.json({
                estimateLevel1,
                estimateLevel2,
                estimateLevel3
              });
            }
          );
        } else {
          db2.run(
            "INSERT INTO complexity_estimates (estimate_level_1, estimate_level_2, estimate_level_3) VALUES (?, ?, ?)",
            [estimateLevel1, estimateLevel2, estimateLevel3],
            function(err2) {
              if (err2) {
                console.error("Error creating complexity estimates:", err2);
                return res.status(500).json({ error: "Failed to create complexity estimates" });
              }
              res.json({
                estimateLevel1,
                estimateLevel2,
                estimateLevel3
              });
            }
          );
        }
      });
    });
    router4.get("/acceptance-options", authenticateToken, (req, res) => {
      const db2 = getDatabase();
      db2.all("SELECT * FROM acceptance_options ORDER BY year_id DESC", (err, options) => {
        if (err) {
          console.error("Error fetching acceptance options:", err);
          return res.status(500).json({ error: "Failed to fetch acceptance options" });
        }
        const transformedOptions = options.map((option) => ({
          id: option.id,
          yearId: option.year_id,
          uploadCode: option.upload_code,
          uploadCodeDescription: option.upload_code_description,
          broadMeaning: option.broad_meaning
        }));
        res.json(transformedOptions);
      });
    });
    router4.post("/acceptance-options", [
      authenticateToken,
      authorizeRoles(0, 1),
      // Admin and Procurement Manager
      body4("yearId").isInt({ min: 2020, max: 2050 }).withMessage("Year must be between 2020-2050"),
      body4("uploadCode").isIn(["Plan", "Late", "Block", "Finish"]).withMessage("Invalid upload code")
    ], (req, res) => {
      const errors = validationResult4(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { yearId, uploadCode, broadMeaning } = req.body;
      const db2 = getDatabase();
      db2.get("SELECT id FROM acceptance_options WHERE year_id = ?", [yearId], (err, existing) => {
        if (err) {
          console.error("Error checking existing year:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (existing) {
          return res.status(400).json({ error: `Year ${yearId} already exists` });
        }
        const uploadCodeDescriptions = {
          "Plan": "\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF",
          "Late": "\u05DE\u05D0\u05D7\u05E8",
          "Block": "\u05D7\u05E1\u05D5\u05DD",
          "Finish": "\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD"
        };
        const uploadCodeDescription = uploadCodeDescriptions[uploadCode];
        db2.run(
          "INSERT INTO acceptance_options (year_id, upload_code, upload_code_description, broad_meaning) VALUES (?, ?, ?, ?)",
          [yearId, uploadCode, uploadCodeDescription, broadMeaning || null],
          function(err2) {
            if (err2) {
              console.error("Error creating acceptance option:", err2);
              return res.status(500).json({ error: "Failed to create acceptance option" });
            }
            db2.get("SELECT * FROM acceptance_options WHERE id = ?", [this.lastID], (err3, option) => {
              if (err3) {
                return res.status(500).json({ error: "Failed to fetch created option" });
              }
              const transformedOption = {
                id: option.id,
                yearId: option.year_id,
                uploadCode: option.upload_code,
                uploadCodeDescription: option.upload_code_description,
                broadMeaning: option.broad_meaning
              };
              res.status(201).json(transformedOption);
            });
          }
        );
      });
    });
    router4.put("/acceptance-options/:id", [
      authenticateToken,
      authorizeRoles(0, 1),
      // Admin and Procurement Manager
      body4("yearId").isInt({ min: 2020, max: 2050 }).withMessage("Year must be between 2020-2050"),
      body4("uploadCode").isIn(["Plan", "Late", "Block", "Finish"]).withMessage("Invalid upload code")
    ], (req, res) => {
      const errors = validationResult4(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const { yearId, uploadCode, broadMeaning } = req.body;
      const db2 = getDatabase();
      db2.get("SELECT id FROM acceptance_options WHERE year_id = ? AND id != ?", [yearId, id], (err, existing) => {
        if (err) {
          console.error("Error checking existing year:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (existing) {
          return res.status(400).json({ error: `Year ${yearId} already exists` });
        }
        const uploadCodeDescriptions = {
          "Plan": "\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF",
          "Late": "\u05DE\u05D0\u05D7\u05E8",
          "Block": "\u05D7\u05E1\u05D5\u05DD",
          "Finish": "\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD"
        };
        const uploadCodeDescription = uploadCodeDescriptions[uploadCode];
        db2.run(
          "UPDATE acceptance_options SET year_id = ?, upload_code = ?, upload_code_description = ?, broad_meaning = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [yearId, uploadCode, uploadCodeDescription, broadMeaning || null, id],
          function(err2) {
            if (err2) {
              console.error("Error updating acceptance option:", err2);
              return res.status(500).json({ error: "Failed to update acceptance option" });
            }
            if (this.changes === 0) {
              return res.status(404).json({ error: "Acceptance option not found" });
            }
            db2.get("SELECT * FROM acceptance_options WHERE id = ?", [id], (err3, option) => {
              if (err3) {
                return res.status(500).json({ error: "Failed to fetch updated option" });
              }
              const transformedOption = {
                id: option.id,
                yearId: option.year_id,
                uploadCode: option.upload_code,
                uploadCodeDescription: option.upload_code_description,
                broadMeaning: option.broad_meaning
              };
              res.json(transformedOption);
            });
          }
        );
      });
    });
    router4.delete("/acceptance-options/:id", [
      authenticateToken,
      authorizeRoles(0, 1)
      // Admin and Procurement Manager
    ], (req, res) => {
      const { id } = req.params;
      const db2 = getDatabase();
      db2.run("DELETE FROM acceptance_options WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting acceptance option:", err);
          return res.status(500).json({ error: "Failed to delete acceptance option" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Acceptance option not found" });
        }
        res.json({ message: "Acceptance option deleted successfully" });
      });
    });
    planning_default = router4;
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
      { roleCode: 0, description: "\u05DE\u05E0\u05D4\u05DC\u05DF \u05DE\u05E2\u05E8\u05DB\u05EA", permissions: "\u05D4\u05E8\u05E9\u05D0\u05D5\u05EA \u05DE\u05DC\u05D0\u05D5\u05EA \u05DC\u05E0\u05D9\u05D4\u05D5\u05DC \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA" },
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
    db2.run(`
      INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) 
      VALUES (1, 5, 10, 20)
    `);
    const acceptanceOptions = [
      {
        yearId: 2024,
        uploadCode: "Finish",
        uploadCodeDescription: "\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD",
        broadMeaning: "\u05E9\u05E0\u05EA 2024 \u05D4\u05E1\u05EA\u05D9\u05D9\u05DE\u05D4 \u05D5\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05E2\u05DC\u05D5\u05EA \u05D3\u05E8\u05D9\u05E9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA"
      },
      {
        yearId: 2025,
        uploadCode: "Plan",
        uploadCodeDescription: "\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF",
        broadMeaning: "\u05E4\u05EA\u05D5\u05D7 \u05DC\u05E7\u05DC\u05D9\u05D8\u05EA \u05D3\u05E8\u05D9\u05E9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA \u05DC\u05E9\u05E0\u05EA 2025"
      }
    ];
    for (const option of acceptanceOptions) {
      db2.run(`
        INSERT OR IGNORE INTO acceptance_options (year_id, upload_code, upload_code_description, broad_meaning) 
        VALUES (?, ?, ?, ?)
      `, [option.yearId, option.uploadCode, option.uploadCodeDescription, option.broadMeaning]);
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
import express5 from "file:///home/project/node_modules/express/index.js";
import cors from "file:///home/project/node_modules/cors/lib/index.js";
import helmet from "file:///home/project/node_modules/helmet/index.mjs";
import morgan from "file:///home/project/node_modules/morgan/index.js";
import compression from "file:///home/project/node_modules/compression/index.js";
import rateLimit from "file:///home/project/node_modules/express-rate-limit/dist/index.mjs";
async function createExpressApp() {
  if (expressApp) {
    return expressApp;
  }
  const app = express5();
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
  app.use(express5.json({ limit: "10mb" }));
  app.use(express5.urlencoded({ extended: true, limit: "10mb" }));
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
  app.use("/system", system_default);
  app.use("/planning", planning_default);
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
    init_system();
    init_planning();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3N5c3RlbS5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qcyIsICJzcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzIiwgInNyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtpbXBvcnQgc3FsaXRlMyBmcm9tICdzcWxpdGUzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgREJfUEFUSCA9IHByb2Nlc3MuZW52LkRCX1BBVEggfHwgJy4vZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbi8vIEVuc3VyZSBkYXRhIGRpcmVjdG9yeSBleGlzdHNcbmNvbnN0IGRhdGFEaXIgPSBwYXRoLmRpcm5hbWUoREJfUEFUSCk7XG5pZiAoIWZzLmV4aXN0c1N5bmMoZGF0YURpcikpIHtcbiAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGEgZGlyZWN0b3J5OicsIGRhdGFEaXIpO1xuICBmcy5ta2RpclN5bmMoZGF0YURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG59XG5cbmxldCBkYiA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldERhdGFiYXNlKCkge1xuICBpZiAoIWRiKSB7XG4gICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBkYXRhYmFzZSBhdDonLCBEQl9QQVRIKTtcbiAgICBkYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKERCX1BBVEgsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igb3BlbmluZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIFNRTGl0ZSBkYXRhYmFzZSBhdDonLCBEQl9QQVRIKTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBFbmFibGUgZm9yZWlnbiBrZXlzXG4gICAgZGIucnVuKCdQUkFHTUEgZm9yZWlnbl9rZXlzID0gT04nKTtcbiAgfVxuICByZXR1cm4gZGI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVEYXRhYmFzZSgpIHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGFiYXNlIHRhYmxlcy4uLicpO1xuICAgICAgXG4gICAgICAvLyBVc2VycyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgdXNlcnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbXBsb3llZV9pZCBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBmdWxsX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSBURVhULFxuICAgICAgICAgIHBhc3N3b3JkX2hhc2ggVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBhdmFpbGFibGVfd29ya19kYXlzIElOVEVHRVIsXG4gICAgICAgICAgZW1haWwgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBPcmdhbml6YXRpb25hbCByb2xlcyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgb3JnYW5pemF0aW9uYWxfcm9sZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBwZXJtaXNzaW9ucyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEaXZpc2lvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGVwYXJ0bWVudHMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRlcGFydG1lbnRzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRpdmlzaW9uX2lkKSBSRUZFUkVOQ0VTIGRpdmlzaW9ucyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2N1cmVtZW50IHRlYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9jdXJlbWVudF90ZWFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRG9tYWlucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZG9tYWlucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEFjdGl2aXR5IHBvb2wgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjdGl2aXR5X3Bvb2wgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgdG9vbHNfYW5kX3Jlc291cmNlcyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGUgcHJvY2Vzc2VzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVfcHJvY2Vzc2VzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGVuZ2FnZW1lbnRfdHlwZV9pZCkgUkVGRVJFTkNFUyBlbmdhZ2VtZW50X3R5cGVzKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoYWN0aXZpdHlfaWQpIFJFRkVSRU5DRVMgYWN0aXZpdHlfcG9vbChpZCksXG4gICAgICAgICAgVU5JUVVFKGVuZ2FnZW1lbnRfdHlwZV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHRhc2tfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgd29ya195ZWFyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgcmVxdWlyZWRfcXVhcnRlciBEQVRFIE5PVCBOVUxMLFxuICAgICAgICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICByZXF1ZXN0ZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXF1ZXN0ZXJfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgZGl2aXNpb25fbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X25hbWUgVEVYVCxcbiAgICAgICAgICBkb21haW5faWQgSU5URUdFUixcbiAgICAgICAgICBkb21haW5fbmFtZSBURVhULFxuICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQgREVDSU1BTCgxNSwyKSxcbiAgICAgICAgICBjdXJyZW5jeSBURVhULFxuICAgICAgICAgIHN1cHBsaWVyX2xpc3QgVEVYVCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uIFRFWFQsXG4gICAgICAgICAgcGxhbm5pbmdfc291cmNlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9ncmFtIHRhc2tzIChzdGF0aW9ucykgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1fdGFza3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBwcm9ncmFtX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIGNvbXBsZXRpb25fZGF0ZSBEQVRFLFxuICAgICAgICAgIHJlcG9ydGluZ191c2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfbmFtZSBURVhULFxuICAgICAgICAgIHJlZmVyZW5jZSBURVhULFxuICAgICAgICAgIG5vdGVzIFRFWFQsXG4gICAgICAgICAgaXNfbGFzdF9zdGF0aW9uIEJPT0xFQU4gREVGQVVMVCAwLFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHByb2dyYW1faWQpIFJFRkVSRU5DRVMgcHJvZ3JhbXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUocHJvZ3JhbV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENvbXBsZXhpdHkgZXN0aW1hdGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBjb21wbGV4aXR5X2VzdGltYXRlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVzdGltYXRlX2xldmVsXzEgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDUsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMiBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMTAsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMyBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMjAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBBY2NlcHRhbmNlIG9wdGlvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjY2VwdGFuY2Vfb3B0aW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHllYXJfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgdXBsb2FkX2NvZGUgVEVYVCBOT1QgTlVMTCBDSEVDSyAodXBsb2FkX2NvZGUgSU4gKCdQbGFuJywgJ0xhdGUnLCAnQmxvY2snLCAnRmluaXNoJykpLFxuICAgICAgICAgIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgYnJvYWRfbWVhbmluZyBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFN5c3RlbSBzZXR0aW5ncyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3lzdGVtX3NldHRpbmdzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgc2V0dGluZ19rZXkgVEVYVCBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgc2V0dGluZ192YWx1ZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGAsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHN5c3RlbV9zZXR0aW5ncyB0YWJsZTonLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBpbmRleGVzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfc3RhdHVzIE9OIHByb2dyYW1zKHN0YXR1cyknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfd29ya195ZWFyIE9OIHByb2dyYW1zKHdvcmtfeWVhciknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19wcm9ncmFtX2lkIE9OIHByb2dyYW1fdGFza3MocHJvZ3JhbV9pZCknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfdXNlcnNfZW1wbG95ZWVfaWQgT04gdXNlcnMoZW1wbG95ZWVfaWQpJyk7XG4gICAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X2FjY2VwdGFuY2Vfb3B0aW9uc195ZWFyIE9OIGFjY2VwdGFuY2Vfb3B0aW9ucyh5ZWFyX2lkKScsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBpbmRleGVzOicsIGVycik7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHRhYmxlcyBhbmQgaW5kZXhlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlRGF0YWJhc2UoKSB7XG4gIGlmIChkYikge1xuICAgIGRiLmNsb3NlKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xvc2luZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGIgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIGdldERhdGFiYXNlLFxuICBpbml0aWFsaXplRGF0YWJhc2UsXG4gIGNsb3NlRGF0YWJhc2Vcbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7aW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5mdW5jdGlvbiBhdXRoZW50aWNhdGVUb2tlbihyZXEsIHJlcywgbmV4dCkge1xuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnNbJ2F1dGhvcml6YXRpb24nXTtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyICYmIGF1dGhIZWFkZXIuc3BsaXQoJyAnKVsxXTtcblxuICBpZiAoIXRva2VuKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBY2Nlc3MgdG9rZW4gcmVxdWlyZWQnIH0pO1xuICB9XG5cbiAgand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCwgKGVyciwgdXNlcikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW52YWxpZCBvciBleHBpcmVkIHRva2VuJyB9KTtcbiAgICB9XG4gICAgcmVxLnVzZXIgPSB1c2VyO1xuICAgIG5leHQoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGF1dGhvcml6ZVJvbGVzKC4uLnJvbGVzKSB7XG4gIHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBpZiAoIXJlcS51c2VyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0F1dGhlbnRpY2F0aW9uIHJlcXVpcmVkJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJvbGVzLmluY2x1ZGVzKHJlcS51c2VyLnJvbGVDb2RlKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH0pO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVVc2VyRXhpc3RzKHJlcSwgcmVzLCBuZXh0KSB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3QgdXNlcklkID0gcmVxLnVzZXIuaWQ7XG5cbiAgZGIuZ2V0KFxuICAgICdTRUxFQ1QgaWQsIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSBGUk9NIHVzZXJzIFdIRVJFIGlkID0gPycsXG4gICAgW3VzZXJJZF0sXG4gICAgKGVyciwgdXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXEudXNlci5jdXJyZW50VXNlciA9IHVzZXI7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuICApO1xufVxuXG5leHBvcnQge1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMsXG4gIHZhbGlkYXRlVXNlckV4aXN0c1xufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgYm9keSwgdmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gTG9naW4gZW5kcG9pbnRcbnJvdXRlci5wb3N0KCcvbG9naW4nLCBbXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5pc0xlbmd0aCh7IG1pbjogNCwgbWF4OiA0IH0pLndpdGhNZXNzYWdlKCdFbXBsb3llZSBJRCBtdXN0IGJlIDQgZGlnaXRzJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykuaXNMZW5ndGgoeyBtaW46IDYsIG1heDogNiB9KS53aXRoTWVzc2FnZSgnUGFzc3dvcmQgbXVzdCBiZSA2IGNoYXJhY3RlcnMnKVxuXSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGVtcGxveWVlSWQsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICBkYi5nZXQoXG4gICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSBlbXBsb3llZV9pZCA9ID8nLFxuICAgICAgW2VtcGxveWVlSWRdLFxuICAgICAgYXN5bmMgKGVyciwgdXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNWYWxpZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHVzZXIucGFzc3dvcmRfaGFzaCk7XG4gICAgICAgIGlmICghaXNWYWxpZFBhc3N3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRva2VuID0gand0LnNpZ24oXG4gICAgICAgICAgeyBcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLCBcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUgXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVULFxuICAgICAgICAgIHsgZXhwaXJlc0luOiBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB8fCAnMjRoJyB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xuICB9XG59KTtcblxuLy8gR2V0IGN1cnJlbnQgdXNlciBpbmZvXG5yb3V0ZXIuZ2V0KCcvbWUnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmdldChcbiAgICAnU0VMRUNUIGlkLCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUsIHJvbGVfZGVzY3JpcHRpb24sIHByb2N1cmVtZW50X3RlYW0sIGVtYWlsIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JyxcbiAgICBbcmVxLnVzZXIuaWRdLFxuICAgIChlcnIsIHVzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVzLmpzb24oe1xuICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3dvcmtlcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgYXV0aG9yaXplUm9sZXMgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBHZXQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbnJvdXRlci5nZXQoJy9vcmdhbml6YXRpb25hbC1yb2xlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzIE9SREVSIEJZIHJvbGVfY29kZScsIChlcnIsIHJvbGVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIG9yZ2FuaXphdGlvbmFsIHJvbGVzJyB9KTtcbiAgICB9XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0ZldGNoZWQgb3JnYW5pemF0aW9uYWwgcm9sZXM6Jywgcm9sZXMpO1xuICAgIHJlcy5qc29uKHJvbGVzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRpdmlzaW9uc1xucm91dGVyLmdldCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGl2aXNpb25zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGl2aXNpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkaXZpc2lvbnMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkaXZpc2lvbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgZGVwYXJ0bWVudHNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIE9SREVSIEJZIG5hbWUnLCAoZXJyLCBkZXBhcnRtZW50cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRlcGFydG1lbnRzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkZXBhcnRtZW50cycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRlcGFydG1lbnRzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IHByb2N1cmVtZW50IHRlYW1zXG5yb3V0ZXIuZ2V0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBPUkRFUiBCWSBuYW1lJywgKGVyciwgdGVhbXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBwcm9jdXJlbWVudCB0ZWFtczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggcHJvY3VyZW1lbnQgdGVhbXMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbih0ZWFtcyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBhbGwgd29ya2Vyc1xucm91dGVyLmdldCgnLycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgdHJ5IHtcbiAgICBkYi5hbGwoYFxuICAgICAgU0VMRUNUIFxuICAgICAgICB1LiosXG4gICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICBGUk9NIHVzZXJzIHVcbiAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgT1JERVIgQlkgdS5mdWxsX25hbWVcbiAgICBgLCAoZXJyLCB3b3JrZXJzKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHdvcmtlcnM6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggd29ya2VycycgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFRyYW5zZm9ybSB0byBtYXRjaCBmcm9udGVuZCBleHBlY3RhdGlvbnNcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VycyA9IHdvcmtlcnMubWFwKHdvcmtlciA9PiAoe1xuICAgICAgICBpZDogd29ya2VyLmlkLFxuICAgICAgICBlbXBsb3llZUlkOiB3b3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgIHJvbGVDb2RlOiB3b3JrZXIucm9sZV9jb2RlLFxuICAgICAgICBmdWxsTmFtZTogd29ya2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB3b3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgZGl2aXNpb25JZDogd29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHdvcmtlci5kZXBhcnRtZW50X2lkLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHdvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBwYXNzd29yZDogJyoqKioqKicsIC8vIERvbid0IHNlbmQgYWN0dWFsIHBhc3N3b3JkXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB3b3JrZXIuYXZhaWxhYmxlX3dvcmtfZGF5cz8udG9TdHJpbmcoKSxcbiAgICAgICAgZW1haWw6IHdvcmtlci5lbWFpbCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiB3b3JrZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHdvcmtlci5kZXBhcnRtZW50X25hbWVcbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgcmVzLmpzb24odHJhbnNmb3JtZWRXb3JrZXJzKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXJzOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcnMnIH0pO1xuICB9XG59KTtcblxuLy8gR2V0IHdvcmtlciBieSBJRFxucm91dGVyLmdldCgnLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBcbiAgdHJ5IHtcbiAgICBkYi5nZXQoYFxuICAgICAgU0VMRUNUIFxuICAgICAgICB1LiosXG4gICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICBGUk9NIHVzZXJzIHVcbiAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgV0hFUkUgdS5pZCA9ID9cbiAgICBgLCBbaWRdLCAoZXJyLCB3b3JrZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnV29ya2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICBpZDogd29ya2VyLmlkLFxuICAgICAgICBlbXBsb3llZUlkOiB3b3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgIHJvbGVDb2RlOiB3b3JrZXIucm9sZV9jb2RlLFxuICAgICAgICBmdWxsTmFtZTogd29ya2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB3b3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgZGl2aXNpb25JZDogd29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHdvcmtlci5kZXBhcnRtZW50X2lkLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHdvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB3b3JrZXIuYXZhaWxhYmxlX3dvcmtfZGF5cz8udG9TdHJpbmcoKSxcbiAgICAgICAgZW1haWw6IHdvcmtlci5lbWFpbCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiB3b3JrZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHdvcmtlci5kZXBhcnRtZW50X25hbWVcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXI6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggd29ya2VyJyB9KTtcbiAgfVxufSk7XG5cbi8vIENyZWF0ZSBuZXcgd29ya2VyXG5yb3V0ZXIucG9zdCgnLycsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpLCAvLyBNYW5hZ2VyLCBBZG1pbiwgVGVjaG5pY2FsXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5pc0xlbmd0aCh7IG1pbjogNCwgbWF4OiA0IH0pLndpdGhNZXNzYWdlKCdFbXBsb3llZSBJRCBtdXN0IGJlIDQgZGlnaXRzJyksXG4gIGJvZHkoJ3JvbGVDb2RlJykuaXNJbnQoeyBtaW46IDEsIG1heDogOSB9KS53aXRoTWVzc2FnZSgnSW52YWxpZCByb2xlIGNvZGUnKSxcbiAgYm9keSgnZnVsbE5hbWUnKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdGdWxsIG5hbWUgaXMgcmVxdWlyZWQnKSxcbiAgYm9keSgncGFzc3dvcmQnKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXZhaWxhYmxlV29ya0RheXMsXG4gICAgICBlbWFpbFxuICAgIH0gPSByZXEuYm9keTtcblxuICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyB3b3JrZXIgd2l0aCBkYXRhOicsIHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIC8vIENoZWNrIGlmIGVtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzXG4gICAgZGIuZ2V0KCdTRUxFQ1QgaWQgRlJPTSB1c2VycyBXSEVSRSBlbXBsb3llZV9pZCA9ID8nLCBbZW1wbG95ZWVJZF0sIGFzeW5jIChlcnIsIGV4aXN0aW5nVXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdEYXRhYmFzZSBlcnJvciBjaGVja2luZyBleGlzdGluZyB1c2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnRW1wbG95ZWUgSUQgYWxyZWFkeSBleGlzdHMnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBIYXNoIHBhc3N3b3JkXG4gICAgICBjb25zdCBwYXNzd29yZEhhc2ggPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgcGFyc2VJbnQocHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUykgfHwgMTIpO1xuXG4gICAgICAvLyBJbnNlcnQgbmV3IHdvcmtlclxuICAgICAgZGIucnVuKGBcbiAgICAgICAgSU5TRVJUIElOVE8gdXNlcnMgKFxuICAgICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICBkaXZpc2lvbl9pZCwgZGVwYXJ0bWVudF9pZCwgcHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICBwYXNzd29yZF9oYXNoLCBhdmFpbGFibGVfd29ya19kYXlzLCBlbWFpbFxuICAgICAgICApIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPywgPywgPywgPylcbiAgICAgIGAsIFtcbiAgICAgICAgZW1wbG95ZWVJZCxcbiAgICAgICAgZnVsbE5hbWUsXG4gICAgICAgIHJvbGVDb2RlLFxuICAgICAgICByb2xlRGVzY3JpcHRpb24gfHwgbnVsbCxcbiAgICAgICAgZGl2aXNpb25JZCB8fCBudWxsLFxuICAgICAgICBkZXBhcnRtZW50SWQgfHwgbnVsbCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtIHx8IG51bGwsXG4gICAgICAgIHBhc3N3b3JkSGFzaCxcbiAgICAgICAgYXZhaWxhYmxlV29ya0RheXMgPyBwYXJzZUludChhdmFpbGFibGVXb3JrRGF5cykgOiBudWxsLFxuICAgICAgICBlbWFpbCB8fCBudWxsXG4gICAgICBdLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSB3b3JrZXInIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtlciBjcmVhdGVkIHdpdGggSUQ6JywgdGhpcy5sYXN0SUQpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgY3JlYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoYFxuICAgICAgICAgIFNFTEVDVCBcbiAgICAgICAgICAgIHUuKixcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIEZST00gdXNlcnMgdVxuICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgICAgICBXSEVSRSB1LmlkID0gP1xuICAgICAgICBgLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBuZXdXb3JrZXIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY3JlYXRlZCB3b3JrZXInIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICAgICAgaWQ6IG5ld1dvcmtlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IG5ld1dvcmtlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIHJvbGVDb2RlOiBuZXdXb3JrZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgZnVsbE5hbWU6IG5ld1dvcmtlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IG5ld1dvcmtlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZGl2aXNpb25JZDogbmV3V29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiBuZXdXb3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogbmV3V29ya2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogbmV3V29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBlbWFpbDogbmV3V29ya2VyLmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiBuZXdXb3JrZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgICAgIGRlcGFydG1lbnROYW1lOiBuZXdXb3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdSZXR1cm5pbmcgY3JlYXRlZCB3b3JrZXI6JywgdHJhbnNmb3JtZWRXb3JrZXIpO1xuICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB3b3JrZXI6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gY3JlYXRlIHdvcmtlcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBVcGRhdGUgd29ya2VyXG5yb3V0ZXIucHV0KCcvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMSwgNSwgOSksIC8vIE1hbmFnZXIsIEFkbWluLCBUZWNobmljYWxcbiAgYm9keSgnZW1wbG95ZWVJZCcpLm9wdGlvbmFsKCkuaXNMZW5ndGgoeyBtaW46IDQsIG1heDogNCB9KS53aXRoTWVzc2FnZSgnRW1wbG95ZWUgSUQgbXVzdCBiZSA0IGRpZ2l0cycpLFxuICBib2R5KCdyb2xlQ29kZScpLm9wdGlvbmFsKCkuaXNJbnQoeyBtaW46IDEsIG1heDogOSB9KS53aXRoTWVzc2FnZSgnSW52YWxpZCByb2xlIGNvZGUnKSxcbiAgYm9keSgncGFzc3dvcmQnKS5vcHRpb25hbCgpLmlzTGVuZ3RoKHsgbWluOiA2LCBtYXg6IDYgfSkud2l0aE1lc3NhZ2UoJ1Bhc3N3b3JkIG11c3QgYmUgNiBjaGFyYWN0ZXJzJylcbl0sIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd29ya2VySWQgPSByZXEucGFyYW1zLmlkO1xuICAgIGNvbnN0IHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXZhaWxhYmxlV29ya0RheXMsXG4gICAgICBlbWFpbFxuICAgIH0gPSByZXEuYm9keTtcblxuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIC8vIENoZWNrIGlmIGVtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzIChleGNsdWRpbmcgY3VycmVudCB3b3JrZXIpXG4gICAgaWYgKGVtcGxveWVlSWQpIHtcbiAgICAgIGRiLmdldCgnU0VMRUNUIGlkIEZST00gdXNlcnMgV0hFUkUgZW1wbG95ZWVfaWQgPSA/IEFORCBpZCAhPSA/JywgW2VtcGxveWVlSWQsIHdvcmtlcklkXSwgYXN5bmMgKGVyciwgZXhpc3RpbmdVc2VyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChleGlzdGluZ1VzZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHVwZGF0ZVdvcmtlcigpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHVwZGF0ZVdvcmtlcigpO1xuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVdvcmtlcigpIHtcbiAgICAgIGxldCBwYXNzd29yZEhhc2ggPSBudWxsO1xuICAgICAgaWYgKHBhc3N3b3JkICYmIHBhc3N3b3JkICE9PSAnKioqKioqJykge1xuICAgICAgICBwYXNzd29yZEhhc2ggPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgcGFyc2VJbnQocHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUykgfHwgMTIpO1xuICAgICAgfVxuXG4gICAgICAvLyBCdWlsZCB1cGRhdGUgcXVlcnkgZHluYW1pY2FsbHlcbiAgICAgIGNvbnN0IHVwZGF0ZUZpZWxkcyA9IFtdO1xuICAgICAgY29uc3QgdmFsdWVzID0gW107XG5cbiAgICAgIGlmIChlbXBsb3llZUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2VtcGxveWVlX2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChlbXBsb3llZUlkKTtcbiAgICAgIH1cbiAgICAgIGlmIChyb2xlQ29kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdyb2xlX2NvZGUgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHJvbGVDb2RlKTtcbiAgICAgIH1cbiAgICAgIGlmIChmdWxsTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdmdWxsX25hbWUgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKGZ1bGxOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChyb2xlRGVzY3JpcHRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncm9sZV9kZXNjcmlwdGlvbiA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2gocm9sZURlc2NyaXB0aW9uIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGRpdmlzaW9uSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnZGl2aXNpb25faWQgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKGRpdmlzaW9uSWQgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBpZiAoZGVwYXJ0bWVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2RlcGFydG1lbnRfaWQgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKGRlcGFydG1lbnRJZCB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm9jdXJlbWVudFRlYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncHJvY3VyZW1lbnRfdGVhbSA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2gocHJvY3VyZW1lbnRUZWFtIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKHBhc3N3b3JkSGFzaCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncGFzc3dvcmRfaGFzaCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2gocGFzc3dvcmRIYXNoKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdmFpbGFibGVXb3JrRGF5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdhdmFpbGFibGVfd29ya19kYXlzID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChhdmFpbGFibGVXb3JrRGF5cyA/IHBhcnNlSW50KGF2YWlsYWJsZVdvcmtEYXlzKSA6IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGVtYWlsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2VtYWlsID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChlbWFpbCB8fCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3VwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCcpO1xuICAgICAgdmFsdWVzLnB1c2god29ya2VySWQpO1xuXG4gICAgICBpZiAodXBkYXRlRmllbGRzLmxlbmd0aCA9PT0gMSkgeyAvLyBPbmx5IHRpbWVzdGFtcCB1cGRhdGVcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdObyBmaWVsZHMgdG8gdXBkYXRlJyB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXBkYXRlUXVlcnkgPSBgVVBEQVRFIHVzZXJzIFNFVCAke3VwZGF0ZUZpZWxkcy5qb2luKCcsICcpfSBXSEVSRSBpZCA9ID9gO1xuXG4gICAgICBkYi5ydW4odXBkYXRlUXVlcnksIHZhbHVlcywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgd29ya2VyJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoZSB1cGRhdGVkIHdvcmtlciB3aXRoIGpvaW5lZCBkYXRhXG4gICAgICAgIGRiLmdldChgXG4gICAgICAgICAgU0VMRUNUIFxuICAgICAgICAgICAgdS4qLFxuICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgRlJPTSB1c2VycyB1XG4gICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHUuZGl2aXNpb25faWQgPSBkLmlkXG4gICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgICAgIFdIRVJFIHUuaWQgPSA/XG4gICAgICAgIGAsIFt3b3JrZXJJZF0sIChlcnIsIHVwZGF0ZWRXb3JrZXIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIHdvcmtlcicgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRXb3JrZXIgPSB7XG4gICAgICAgICAgICBpZDogdXBkYXRlZFdvcmtlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVwZGF0ZWRXb3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogdXBkYXRlZFdvcmtlci5yb2xlX2NvZGUsXG4gICAgICAgICAgICBmdWxsTmFtZTogdXBkYXRlZFdvcmtlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IHVwZGF0ZWRXb3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGRpdmlzaW9uSWQ6IHVwZGF0ZWRXb3JrZXIuZGl2aXNpb25faWQsXG4gICAgICAgICAgICBkZXBhcnRtZW50SWQ6IHVwZGF0ZWRXb3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogdXBkYXRlZFdvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IHVwZGF0ZWRXb3JrZXIuYXZhaWxhYmxlX3dvcmtfZGF5cz8udG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGVtYWlsOiB1cGRhdGVkV29ya2VyLmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiB1cGRhdGVkV29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogdXBkYXRlZFdvcmtlci5kZXBhcnRtZW50X25hbWVcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmVzLmpzb24odHJhbnNmb3JtZWRXb3JrZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyB3b3JrZXI6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIHdvcmtlcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBEZWxldGUgd29ya2VyXG5yb3V0ZXIuZGVsZXRlKCcvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMSwgNSwgOSkgLy8gTWFuYWdlciwgQWRtaW4sIFRlY2huaWNhbFxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3Qgd29ya2VySWQgPSByZXEucGFyYW1zLmlkO1xuXG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgaWYgd29ya2VyIGlzIGFzc2lnbmVkIHRvIGFueSBhY3RpdmUgdGFza3NcbiAgICAvLyBGb3Igbm93LCB3ZSdsbCBhbGxvdyBkZWxldGlvbiBidXQgaW4gcHJvZHVjdGlvbiB5b3UgbWlnaHQgd2FudCB0byBwcmV2ZW50IGl0XG4gICAgXG4gICAgZGIucnVuKCdERUxFVEUgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLCBbd29ya2VySWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSB3b3JrZXInIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnV29ya2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ1dvcmtlciBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9zeXN0ZW0uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9zeXN0ZW0uanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgYXV0aG9yaXplUm9sZXMgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyA9PT09PSBBQ1RJVklUWSBQT09MIFJPVVRFUyA9PT09PVxuXG4vLyBHZXQgYWxsIGFjdGl2aXRpZXNcbnJvdXRlci5nZXQoJy9hY3Rpdml0eS1wb29sJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBPUkRFUiBCWSBuYW1lJywgKGVyciwgYWN0aXZpdGllcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGFjdGl2aXRpZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGFjdGl2aXRpZXMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihhY3Rpdml0aWVzKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIGFjdGl2aXR5XG5yb3V0ZXIucG9zdCgnL2FjdGl2aXR5LXBvb2wnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0FjdGl2aXR5IG5hbWUgaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfHwgbnVsbF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBhY3Rpdml0eScgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGFjdGl2aXR5JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihhY3Rpdml0eSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIGFjdGl2aXR5XG5yb3V0ZXIucHV0KCcvYWN0aXZpdHktcG9vbC86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgYWN0aXZpdHlfcG9vbCBTRVQgbmFtZSA9ID8sIHRvb2xzX2FuZF9yZXNvdXJjZXMgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIHx8IG51bGwsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIGFjdGl2aXR5JyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjdGl2aXR5IG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIGFjdGl2aXR5JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihhY3Rpdml0eSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGFjdGl2aXR5XG5yb3V0ZXIuZGVsZXRlKCcvYWN0aXZpdHktcG9vbC86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGFjdGl2aXR5X3Bvb2wgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBhY3Rpdml0eScgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY3Rpdml0eSBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0FjdGl2aXR5IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gPT09PT0gRE9NQUlOUyBST1VURVMgPT09PT1cblxuLy8gR2V0IGFsbCBkb21haW5zXG5yb3V0ZXIuZ2V0KCcvZG9tYWlucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgT1JERVIgQlkgZGVzY3JpcHRpb24nLCAoZXJyLCBkb21haW5zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZG9tYWluczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZG9tYWlucycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRvbWFpbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgZG9tYWluXG5yb3V0ZXIucG9zdCgnL2RvbWFpbnMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnZGVzY3JpcHRpb24nKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdEb21haW4gZGVzY3JpcHRpb24gaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgZGVzY3JpcHRpb24gfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBkb21haW5zIChkZXNjcmlwdGlvbikgVkFMVUVTICg/KScsXG4gICAgW2Rlc2NyaXB0aW9uXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBkb21haW4nIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBkb21haW4pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgZG9tYWluJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihkb21haW4pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBkb21haW5cbnJvdXRlci5wdXQoJy9kb21haW5zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBkZXNjcmlwdGlvbiB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBkb21haW5zIFNFVCBkZXNjcmlwdGlvbiA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbZGVzY3JpcHRpb24sIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBkb21haW4nIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRG9tYWluIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIGRvbWFpbikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCBkb21haW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKGRvbWFpbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGRvbWFpblxucm91dGVyLmRlbGV0ZSgnL2RvbWFpbnMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZGVsZXRlIGRvbWFpbicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEb21haW4gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEb21haW4gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyA9PT09PSBESVZJU0lPTlMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgZGl2aXNpb25zXG5yb3V0ZXIuZ2V0KCcvZGl2aXNpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCBkaXZpc2lvbnMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkaXZpc2lvbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGRpdmlzaW9ucycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRpdmlzaW9ucyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBkaXZpc2lvblxucm91dGVyLnBvc3QoJy9kaXZpc2lvbnMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0RpdmlzaW9uIG5hbWUgaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgbmFtZSwgaXNJbnRlcm5hbCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknLFxuICAgIFtuYW1lLCBpc0ludGVybmFsID8gMSA6IDBdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgZGl2aXNpb24nIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIGRpdmlzaW9uKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGRpdmlzaW9uJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihkaXZpc2lvbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIGRpdmlzaW9uXG5yb3V0ZXIucHV0KCcvZGl2aXNpb25zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lLCBpc0ludGVybmFsIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGRpdmlzaW9ucyBTRVQgbmFtZSA9ID8sIGlzX2ludGVybmFsID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCBpc0ludGVybmFsID8gMSA6IDAsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIGRpdmlzaW9uJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RpdmlzaW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgZGl2aXNpb24pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHVwZGF0ZWQgZGl2aXNpb24nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKGRpdmlzaW9uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBEZWxldGUgZGl2aXNpb25cbnJvdXRlci5kZWxldGUoJy9kaXZpc2lvbnMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBkaXZpc2lvbicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEaXZpc2lvbiBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RpdmlzaW9uIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gPT09PT0gREVQQVJUTUVOVFMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgZGVwYXJ0bWVudHNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIE9SREVSIEJZIG5hbWUnLCAoZXJyLCBkZXBhcnRtZW50cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRlcGFydG1lbnRzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkZXBhcnRtZW50cycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRlcGFydG1lbnRzKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIGRlcGFydG1lbnRcbnJvdXRlci5wb3N0KCcvZGVwYXJ0bWVudHMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0RlcGFydG1lbnQgbmFtZSBpcyByZXF1aXJlZCcpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICB9XG5cbiAgY29uc3QgeyBuYW1lLCBkaXZpc2lvbklkIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgZGl2aXNpb25JZCB8fCBudWxsXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgZGVwYXJ0bWVudCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkZXBhcnRtZW50cyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBkZXBhcnRtZW50KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGRlcGFydG1lbnQnIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKGRlcGFydG1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBkZXBhcnRtZW50XG5yb3V0ZXIucHV0KCcvZGVwYXJ0bWVudHMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUsIGRpdmlzaW9uSWQgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgZGVwYXJ0bWVudHMgU0VUIG5hbWUgPSA/LCBkaXZpc2lvbl9pZCA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgZGl2aXNpb25JZCB8fCBudWxsLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIGRlcGFydG1lbnQnIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGVwYXJ0bWVudCBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGVwYXJ0bWVudHMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgZGVwYXJ0bWVudCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCBkZXBhcnRtZW50JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihkZXBhcnRtZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBEZWxldGUgZGVwYXJ0bWVudFxucm91dGVyLmRlbGV0ZSgnL2RlcGFydG1lbnRzLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZGVwYXJ0bWVudHMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZGVsZXRlIGRlcGFydG1lbnQnIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGVwYXJ0bWVudCBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RlcGFydG1lbnQgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyA9PT09PSBQUk9DVVJFTUVOVCBURUFNUyBST1VURVMgPT09PT1cblxuLy8gR2V0IGFsbCBwcm9jdXJlbWVudCB0ZWFtc1xucm91dGVyLmdldCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgT1JERVIgQlkgbmFtZScsIChlcnIsIHRlYW1zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHByb2N1cmVtZW50IHRlYW1zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24odGVhbXMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgcHJvY3VyZW1lbnQgdGVhbVxucm91dGVyLnBvc3QoJy9wcm9jdXJlbWVudC10ZWFtcycsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpLFxuICBib2R5KCduYW1lJykubm90RW1wdHkoKS53aXRoTWVzc2FnZSgnVGVhbSBuYW1lIGlzIHJlcXVpcmVkJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IG5hbWUgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsXG4gICAgW25hbWVdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBwcm9jdXJlbWVudCB0ZWFtJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHRlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgdGVhbScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24odGVhbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIHByb2N1cmVtZW50IHRlYW1cbnJvdXRlci5wdXQoJy9wcm9jdXJlbWVudC10ZWFtcy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBwcm9jdXJlbWVudF90ZWFtcyBTRVQgbmFtZSA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBwcm9jdXJlbWVudCB0ZWFtJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2N1cmVtZW50IHRlYW0gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHRlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHVwZGF0ZWQgdGVhbScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24odGVhbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIHByb2N1cmVtZW50IHRlYW1cbnJvdXRlci5kZWxldGUoJy9wcm9jdXJlbWVudC10ZWFtcy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBwcm9jdXJlbWVudCB0ZWFtJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2N1cmVtZW50IHRlYW0gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdQcm9jdXJlbWVudCB0ZWFtIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBib2R5LCB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGF1dGhvcml6ZVJvbGVzIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gPT09PT0gQ09NUExFWElUWSBFU1RJTUFURVMgUk9VVEVTID09PT09XG5cbi8vIEdldCBjb21wbGV4aXR5IGVzdGltYXRlc1xucm91dGVyLmdldCgnL2NvbXBsZXhpdHktZXN0aW1hdGVzJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gY29tcGxleGl0eV9lc3RpbWF0ZXMgT1JERVIgQlkgaWQgREVTQyBMSU1JVCAxJywgKGVyciwgZXN0aW1hdGVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNvbXBsZXhpdHkgZXN0aW1hdGVzJyB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gSWYgbm8gZXN0aW1hdGVzIGV4aXN0LCByZXR1cm4gZGVmYXVsdCB2YWx1ZXNcbiAgICBpZiAoIWVzdGltYXRlcykge1xuICAgICAgZXN0aW1hdGVzID0ge1xuICAgICAgICBpZDogMSxcbiAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMTogNSxcbiAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMjogMTAsXG4gICAgICAgIGVzdGltYXRlX2xldmVsXzM6IDIwXG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbih7XG4gICAgICBlc3RpbWF0ZUxldmVsMTogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzEsXG4gICAgICBlc3RpbWF0ZUxldmVsMjogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzIsXG4gICAgICBlc3RpbWF0ZUxldmVsMzogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzNcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8gVXBkYXRlIGNvbXBsZXhpdHkgZXN0aW1hdGVzXG5yb3V0ZXIucHV0KCcvY29tcGxleGl0eS1lc3RpbWF0ZXMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSwgLy8gQWRtaW4gYW5kIFByb2N1cmVtZW50IE1hbmFnZXJcbiAgYm9keSgnZXN0aW1hdGVMZXZlbDEnKS5pc0ludCh7IG1pbjogMSwgbWF4OiAzNjUgfSkud2l0aE1lc3NhZ2UoJ0xldmVsIDEgZXN0aW1hdGUgbXVzdCBiZSBiZXR3ZWVuIDEtMzY1JyksXG4gIGJvZHkoJ2VzdGltYXRlTGV2ZWwyJykuaXNJbnQoeyBtaW46IDEsIG1heDogMzY1IH0pLndpdGhNZXNzYWdlKCdMZXZlbCAyIGVzdGltYXRlIG11c3QgYmUgYmV0d2VlbiAxLTM2NScpLFxuICBib2R5KCdlc3RpbWF0ZUxldmVsMycpLmlzSW50KHsgbWluOiAxLCBtYXg6IDM2NSB9KS53aXRoTWVzc2FnZSgnTGV2ZWwgMyBlc3RpbWF0ZSBtdXN0IGJlIGJldHdlZW4gMS0zNjUnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgZXN0aW1hdGVMZXZlbDEsIGVzdGltYXRlTGV2ZWwyLCBlc3RpbWF0ZUxldmVsMyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBGaXJzdCBjaGVjayBpZiByZWNvcmQgZXhpc3RzXG4gIGRiLmdldCgnU0VMRUNUIGlkIEZST00gY29tcGxleGl0eV9lc3RpbWF0ZXMgTElNSVQgMScsIChlcnIsIGV4aXN0aW5nKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIHJlY29yZFxuICAgICAgZGIucnVuKFxuICAgICAgICAnVVBEQVRFIGNvbXBsZXhpdHlfZXN0aW1hdGVzIFNFVCBlc3RpbWF0ZV9sZXZlbF8xID0gPywgZXN0aW1hdGVfbGV2ZWxfMiA9ID8sIGVzdGltYXRlX2xldmVsXzMgPSA/LCB1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAgV0hFUkUgaWQgPSA/JyxcbiAgICAgICAgW2VzdGltYXRlTGV2ZWwxLCBlc3RpbWF0ZUxldmVsMiwgZXN0aW1hdGVMZXZlbDMsIGV4aXN0aW5nLmlkXSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBjb21wbGV4aXR5IGVzdGltYXRlcycgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgICAgZXN0aW1hdGVMZXZlbDEsXG4gICAgICAgICAgICBlc3RpbWF0ZUxldmVsMixcbiAgICAgICAgICAgIGVzdGltYXRlTGV2ZWwzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluc2VydCBuZXcgcmVjb3JkXG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgSU5UTyBjb21wbGV4aXR5X2VzdGltYXRlcyAoZXN0aW1hdGVfbGV2ZWxfMSwgZXN0aW1hdGVfbGV2ZWxfMiwgZXN0aW1hdGVfbGV2ZWxfMykgVkFMVUVTICg/LCA/LCA/KScsXG4gICAgICAgIFtlc3RpbWF0ZUxldmVsMSwgZXN0aW1hdGVMZXZlbDIsIGVzdGltYXRlTGV2ZWwzXSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBjb21wbGV4aXR5IGVzdGltYXRlcycgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgICAgZXN0aW1hdGVMZXZlbDEsXG4gICAgICAgICAgICBlc3RpbWF0ZUxldmVsMixcbiAgICAgICAgICAgIGVzdGltYXRlTGV2ZWwzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG4vLyA9PT09PSBBQ0NFUFRBTkNFIE9QVElPTlMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgYWNjZXB0YW5jZSBvcHRpb25zXG5yb3V0ZXIuZ2V0KCcvYWNjZXB0YW5jZS1vcHRpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIE9SREVSIEJZIHllYXJfaWQgREVTQycsIChlcnIsIG9wdGlvbnMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBhY2NlcHRhbmNlIG9wdGlvbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGFjY2VwdGFuY2Ugb3B0aW9ucycgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYW5zZm9ybSB0byBtYXRjaCBmcm9udGVuZCBmb3JtYXRcbiAgICBjb25zdCB0cmFuc2Zvcm1lZE9wdGlvbnMgPSBvcHRpb25zLm1hcChvcHRpb24gPT4gKHtcbiAgICAgIGlkOiBvcHRpb24uaWQsXG4gICAgICB5ZWFySWQ6IG9wdGlvbi55ZWFyX2lkLFxuICAgICAgdXBsb2FkQ29kZTogb3B0aW9uLnVwbG9hZF9jb2RlLFxuICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiBvcHRpb24udXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICBicm9hZE1lYW5pbmc6IG9wdGlvbi5icm9hZF9tZWFuaW5nXG4gICAgfSkpO1xuICAgIFxuICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkT3B0aW9ucyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLnBvc3QoJy9hY2NlcHRhbmNlLW9wdGlvbnMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSwgLy8gQWRtaW4gYW5kIFByb2N1cmVtZW50IE1hbmFnZXJcbiAgYm9keSgneWVhcklkJykuaXNJbnQoeyBtaW46IDIwMjAsIG1heDogMjA1MCB9KS53aXRoTWVzc2FnZSgnWWVhciBtdXN0IGJlIGJldHdlZW4gMjAyMC0yMDUwJyksXG4gIGJvZHkoJ3VwbG9hZENvZGUnKS5pc0luKFsnUGxhbicsICdMYXRlJywgJ0Jsb2NrJywgJ0ZpbmlzaCddKS53aXRoTWVzc2FnZSgnSW52YWxpZCB1cGxvYWQgY29kZScpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICB9XG5cbiAgY29uc3QgeyB5ZWFySWQsIHVwbG9hZENvZGUsIGJyb2FkTWVhbmluZyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBDaGVjayBpZiB5ZWFyIGFscmVhZHkgZXhpc3RzXG4gIGRiLmdldCgnU0VMRUNUIGlkIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIHllYXJfaWQgPSA/JywgW3llYXJJZF0sIChlcnIsIGV4aXN0aW5nKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgeWVhcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogYFllYXIgJHt5ZWFySWR9IGFscmVhZHkgZXhpc3RzYCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdXBsb2FkIGNvZGUgZGVzY3JpcHRpb25cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb25zID0ge1xuICAgICAgJ1BsYW4nOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAgICdMYXRlJzogJ1x1MDVERVx1MDVEMFx1MDVEN1x1MDVFOCcsXG4gICAgICAnQmxvY2snOiAnXHUwNUQ3XHUwNUUxXHUwNUQ1XHUwNUREJyxcbiAgICAgICdGaW5pc2gnOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJ1xuICAgIH07XG5cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb24gPSB1cGxvYWRDb2RlRGVzY3JpcHRpb25zW3VwbG9hZENvZGVdO1xuXG4gICAgZGIucnVuKFxuICAgICAgJ0lOU0VSVCBJTlRPIGFjY2VwdGFuY2Vfb3B0aW9ucyAoeWVhcl9pZCwgdXBsb2FkX2NvZGUsIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLCBicm9hZF9tZWFuaW5nKSBWQUxVRVMgKD8sID8sID8sID8pJyxcbiAgICAgIFt5ZWFySWQsIHVwbG9hZENvZGUsIHVwbG9hZENvZGVEZXNjcmlwdGlvbiwgYnJvYWRNZWFuaW5nIHx8IG51bGxdLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBhY2NlcHRhbmNlIG9wdGlvbicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIG9wdGlvbikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgb3B0aW9uJyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZE9wdGlvbiA9IHtcbiAgICAgICAgICAgIGlkOiBvcHRpb24uaWQsXG4gICAgICAgICAgICB5ZWFySWQ6IG9wdGlvbi55ZWFyX2lkLFxuICAgICAgICAgICAgdXBsb2FkQ29kZTogb3B0aW9uLnVwbG9hZF9jb2RlLFxuICAgICAgICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiBvcHRpb24udXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBicm9hZE1lYW5pbmc6IG9wdGlvbi5icm9hZF9tZWFuaW5nXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHRyYW5zZm9ybWVkT3B0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59KTtcblxuLy8gVXBkYXRlIGFjY2VwdGFuY2Ugb3B0aW9uXG5yb3V0ZXIucHV0KCcvYWNjZXB0YW5jZS1vcHRpb25zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDEpLCAvLyBBZG1pbiBhbmQgUHJvY3VyZW1lbnQgTWFuYWdlclxuICBib2R5KCd5ZWFySWQnKS5pc0ludCh7IG1pbjogMjAyMCwgbWF4OiAyMDUwIH0pLndpdGhNZXNzYWdlKCdZZWFyIG11c3QgYmUgYmV0d2VlbiAyMDIwLTIwNTAnKSxcbiAgYm9keSgndXBsb2FkQ29kZScpLmlzSW4oWydQbGFuJywgJ0xhdGUnLCAnQmxvY2snLCAnRmluaXNoJ10pLndpdGhNZXNzYWdlKCdJbnZhbGlkIHVwbG9hZCBjb2RlJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IHllYXJJZCwgdXBsb2FkQ29kZSwgYnJvYWRNZWFuaW5nIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIENoZWNrIGlmIHllYXIgYWxyZWFkeSBleGlzdHMgZm9yIGRpZmZlcmVudCByZWNvcmRcbiAgZGIuZ2V0KCdTRUxFQ1QgaWQgRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgeWVhcl9pZCA9ID8gQU5EIGlkICE9ID8nLCBbeWVhcklkLCBpZF0sIChlcnIsIGV4aXN0aW5nKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgeWVhcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogYFllYXIgJHt5ZWFySWR9IGFscmVhZHkgZXhpc3RzYCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdXBsb2FkIGNvZGUgZGVzY3JpcHRpb25cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb25zID0ge1xuICAgICAgJ1BsYW4nOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAgICdMYXRlJzogJ1x1MDVERVx1MDVEMFx1MDVEN1x1MDVFOCcsXG4gICAgICAnQmxvY2snOiAnXHUwNUQ3XHUwNUUxXHUwNUQ1XHUwNUREJyxcbiAgICAgICdGaW5pc2gnOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJ1xuICAgIH07XG5cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb24gPSB1cGxvYWRDb2RlRGVzY3JpcHRpb25zW3VwbG9hZENvZGVdO1xuXG4gICAgZGIucnVuKFxuICAgICAgJ1VQREFURSBhY2NlcHRhbmNlX29wdGlvbnMgU0VUIHllYXJfaWQgPSA/LCB1cGxvYWRfY29kZSA9ID8sIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uID0gPywgYnJvYWRfbWVhbmluZyA9ID8sIHVwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCBXSEVSRSBpZCA9ID8nLFxuICAgICAgW3llYXJJZCwgdXBsb2FkQ29kZSwgdXBsb2FkQ29kZURlc2NyaXB0aW9uLCBicm9hZE1lYW5pbmcgfHwgbnVsbCwgaWRdLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBhY2NlcHRhbmNlIG9wdGlvbicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBub3QgZm91bmQnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCBvcHRpb24pID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIG9wdGlvbicgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRPcHRpb24gPSB7XG4gICAgICAgICAgICBpZDogb3B0aW9uLmlkLFxuICAgICAgICAgICAgeWVhcklkOiBvcHRpb24ueWVhcl9pZCxcbiAgICAgICAgICAgIHVwbG9hZENvZGU6IG9wdGlvbi51cGxvYWRfY29kZSxcbiAgICAgICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogb3B0aW9uLnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgYnJvYWRNZWFuaW5nOiBvcHRpb24uYnJvYWRfbWVhbmluZ1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuanNvbih0cmFuc2Zvcm1lZE9wdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufSk7XG5cbi8vIERlbGV0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLmRlbGV0ZSgnL2FjY2VwdGFuY2Utb3B0aW9ucy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSAvLyBBZG1pbiBhbmQgUHJvY3VyZW1lbnQgTWFuYWdlclxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZGVsZXRlIGFjY2VwdGFuY2Ugb3B0aW9uJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjY2VwdGFuY2Ugb3B0aW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnQWNjZXB0YW5jZSBvcHRpb24gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzL3NlZWREYXRhYmFzZS5qc1wiO2ltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UsIGluaXRpYWxpemVEYXRhYmFzZSwgY2xvc2VEYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlZWREYXRhYmFzZSgpIHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ1NlZWRpbmcgZGF0YWJhc2Ugd2l0aCBpbml0aWFsIGRhdGEuLi4nKTtcbiAgICBcbiAgICAvLyBTZWVkIG9yZ2FuaXphdGlvbmFsIHJvbGVzXG4gICAgY29uc3Qgcm9sZXMgPSBbXG4gICAgICB7IHJvbGVDb2RlOiAwLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVFOFx1MDVFOVx1MDVEMFx1MDVENVx1MDVFQSBcdTA1REVcdTA1RENcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNURDXHUwNUUwXHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNURDIFx1MDVENFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDEsIGRlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUU4XHUwNUU5XHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNURCXHUwNURDIFx1MDVFQVx1MDVENFx1MDVEQ1x1MDVEOVx1MDVEQlx1MDVEOSBcdTA1RDRcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICB7IHJvbGVDb2RlOiAyLCBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEMFx1MDVFOSBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNUUwXHUwNUQ5XHUwNUREIFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiAzLCBkZXNjcmlwdGlvbjogJ1x1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVERicsIHBlcm1pc3Npb25zOiAnXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyIFx1MDVFNFx1MDVFMlx1MDVEOVx1MDVEQ1x1MDVENVx1MDVEOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVERVx1MDVFOVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEMVx1MDVFN1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMFx1MDVEN1x1MDVFOCBcdTA1RTFcdTA1RDhcdTA1RDhcdTA1RDVcdTA1RTEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDJcdTA1RDNcdTA1RThcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENVx1MDVEOFx1MDVEMVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RTJcdTA1RDZcdTA1RTgnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVFQSBcdTA1RUFcdTA1RTlcdTA1RUFcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUQ0XHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICBbcm9sZS5yb2xlQ29kZSwgcm9sZS5kZXNjcmlwdGlvbiwgcm9sZS5wZXJtaXNzaW9uc11cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZGl2aXNpb25zXG4gICAgY29uc3QgZGl2aXNpb25zID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQwXHUwNUQyXHUwNUUzIFx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycsIGlzSW50ZXJuYWw6IHRydWUgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RTlcdTA1RDlcdTA1RDVcdTA1RDVcdTA1RTcnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDcgXHUwNUQ3XHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUwXHUwNUQ5IFx1MDVEMCcsIGlzSW50ZXJuYWw6IGZhbHNlIH1cbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZGl2aXNpb24gb2YgZGl2aXNpb25zKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgIFtkaXZpc2lvbi5uYW1lLCBkaXZpc2lvbi5pc0ludGVybmFsXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBkZXBhcnRtZW50c1xuICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVENCcsIGRpdmlzaW9uSWQ6IDEgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQScsIGRpdmlzaW9uSWQ6IDIgfVxuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCBkZXB0IG9mIGRlcGFydG1lbnRzKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2RlcHQubmFtZSwgZGVwdC5kaXZpc2lvbklkXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBwcm9jdXJlbWVudCB0ZWFtc1xuICAgIGNvbnN0IHRlYW1zID0gW1xuICAgICAgJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScsICdcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknLCAnXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JywgJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsICdcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDknLCAnXHUwNUQxXHUwNUQ5XHUwNUQ4XHUwNUQ3XHUwNUQ1XHUwNUUwXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0ZWFtIG9mIHRlYW1zKSB7XG4gICAgICBkYi5ydW4oJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsIFt0ZWFtXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZG9tYWluc1xuICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCBcdTA1RDVcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLFxuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDlcdTA1REQgXHUwNURFXHUwNUU3XHUwNUU2XHUwNUQ1XHUwNUUyXHUwNUQ5XHUwNUQ5XHUwNUREJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVERVx1MDVFOVx1MDVFOFx1MDVEM1x1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZG9tYWluIG9mIGRvbWFpbnMpIHtcbiAgICAgIGRiLnJ1bignSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJywgW2RvbWFpbl0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTlcdTA1RDVcdTA1RDVcdTA1RDBcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNURCXHUwNUUwXHUwNUVBIFx1MDVERVx1MDVFNFx1MDVFOFx1MDVEOCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCB0b29sczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDgsIFx1MDVEOVx1MDVEOVx1MDVFMlx1MDVENVx1MDVFNSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQgXHUwNURFXHUwNURCXHUwNUU4XHUwNUQ2JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNURELCBcdTA1RDBcdTA1RUFcdTA1RTggXHUwNUQ0XHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNURFXHUwNUQ4XHUwNUU4XHUwNUQ5XHUwNUU2XHUwNUVBIFx1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENCwgXHUwNUQ1XHUwNUUyXHUwNUQzXHUwNUVBIFx1MDVEMVx1MDVEN1x1MDVEOVx1MDVFMFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RDZcdTA1RDVcdTA1REJcdTA1RDQnLCB0b29sczogJ1x1MDVFNFx1MDVFOFx1MDVENVx1MDVEOFx1MDVENVx1MDVFN1x1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDdcdTA1RENcdTA1RDhcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDdcdTA1RUFcdTA1RDlcdTA1REVcdTA1RDQgXHUwNUUyXHUwNURDIFx1MDVENFx1MDVFMVx1MDVEQlx1MDVERCcsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDdcdTA1RDVcdTA1RDZcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RTdcdTA1RThcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgdG9vbHM6ICdcdTA1RThcdTA1RTlcdTA1RDlcdTA1REVcdTA1RUEgXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUQ1XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1REJcdTA1RTFcdTA1RTRcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVFNFx1MDVFOFx1MDVENVx1MDVEOVx1MDVFN1x1MDVEOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sczogJ1x1MDVEM1x1MDVENVx1MDVENyBcdTA1RTFcdTA1RDlcdTA1REJcdTA1RDVcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGFjdGl2aXR5IG9mIGFjdGl2aXRpZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2FjdGl2aXR5Lm5hbWUsIGFjdGl2aXR5LnRvb2xzXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBlbmdhZ2VtZW50IHR5cGVzXG4gICAgY29uc3QgZW5nYWdlbWVudFR5cGVzID0gW1xuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RDVcdTA1REVcdTA1RDFcdTA1RDknLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1REVcdTA1RDVcdTA1RDJcdTA1RDFcdTA1REMnLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0eXBlIG9mIGVuZ2FnZW1lbnRUeXBlcykge1xuICAgICAgZGIucnVuKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZW5nYWdlbWVudF90eXBlcyAobmFtZSkgVkFMVUVTICg/KScsIFt0eXBlXSk7XG4gICAgfVxuXG4gICAgLy8gU2VlZCBjb21wbGV4aXR5IGVzdGltYXRlcyAoc2luZ2xlIHJlY29yZClcbiAgICBkYi5ydW4oYFxuICAgICAgSU5TRVJUIE9SIElHTk9SRSBJTlRPIGNvbXBsZXhpdHlfZXN0aW1hdGVzIChpZCwgZXN0aW1hdGVfbGV2ZWxfMSwgZXN0aW1hdGVfbGV2ZWxfMiwgZXN0aW1hdGVfbGV2ZWxfMykgXG4gICAgICBWQUxVRVMgKDEsIDUsIDEwLCAyMClcbiAgICBgKTtcblxuICAgIC8vIFNlZWQgYWNjZXB0YW5jZSBvcHRpb25zXG4gICAgY29uc3QgYWNjZXB0YW5jZU9wdGlvbnMgPSBbXG4gICAgICB7XG4gICAgICAgIHllYXJJZDogMjAyNCxcbiAgICAgICAgdXBsb2FkQ29kZTogJ0ZpbmlzaCcsXG4gICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogJ1x1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERCcsXG4gICAgICAgIGJyb2FkTWVhbmluZzogJ1x1MDVFOVx1MDVFMFx1MDVFQSAyMDI0IFx1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERVx1MDVENCBcdTA1RDVcdTA1RENcdTA1RDAgXHUwNUUwXHUwNUQ5XHUwNUVBXHUwNURGIFx1MDVEQ1x1MDVENFx1MDVFMlx1MDVEQ1x1MDVENVx1MDVFQSBcdTA1RDNcdTA1RThcdTA1RDlcdTA1RTlcdTA1RDVcdTA1RUEgXHUwNUQ3XHUwNUQzXHUwNUU5XHUwNUQ1XHUwNUVBJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeWVhcklkOiAyMDI1LFxuICAgICAgICB1cGxvYWRDb2RlOiAnUGxhbicsXG4gICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVERicsXG4gICAgICAgIGJyb2FkTWVhbmluZzogJ1x1MDVFNFx1MDVFQVx1MDVENVx1MDVENyBcdTA1RENcdTA1RTdcdTA1RENcdTA1RDlcdTA1RDhcdTA1RUEgXHUwNUQzXHUwNUU4XHUwNUQ5XHUwNUU5XHUwNUQ1XHUwNUVBIFx1MDVEN1x1MDVEM1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTlcdTA1RTBcdTA1RUEgMjAyNSdcbiAgICAgIH1cbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgYWNjZXB0YW5jZU9wdGlvbnMpIHtcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIElOU0VSVCBPUiBJR05PUkUgSU5UTyBhY2NlcHRhbmNlX29wdGlvbnMgKHllYXJfaWQsIHVwbG9hZF9jb2RlLCB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiwgYnJvYWRfbWVhbmluZykgXG4gICAgICAgIFZBTFVFUyAoPywgPywgPywgPylcbiAgICAgIGAsIFtvcHRpb24ueWVhcklkLCBvcHRpb24udXBsb2FkQ29kZSwgb3B0aW9uLnVwbG9hZENvZGVEZXNjcmlwdGlvbiwgb3B0aW9uLmJyb2FkTWVhbmluZ10pO1xuICAgIH1cbiAgICBcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBhZG1pbiB1c2VyXG4gICAgY29uc3QgYWRtaW5QYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKCcxMjM0NTYnLCAxMik7XG4gICAgZGIucnVuKFxuICAgICAgYElOU0VSVCBPUiBJR05PUkUgSU5UTyB1c2VycyAoXG4gICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgXG4gICAgICAgIHBhc3N3b3JkX2hhc2gsIGVtYWlsXG4gICAgICApIFZBTFVFUyAoPywgPywgPywgPywgPywgPylgLFxuICAgICAgWyc5OTk5JywgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCA5LCAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVEOScsIGFkbWluUGFzc3dvcmQsICdhZG1pbkBzeXN0ZW0uY29tJ11cbiAgICApO1xuICAgIFxuICAgIC8vIENyZWF0ZSBzYW1wbGUgcHJvY3VyZW1lbnQgbWFuYWdlclxuICAgIGNvbnN0IG1hbmFnZXJQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKCcxMjM0NTYnLCAxMik7XG4gICAgZGIucnVuKFxuICAgICAgYElOU0VSVCBPUiBJR05PUkUgSU5UTyB1c2VycyAoXG4gICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgXG4gICAgICAgIHBhc3N3b3JkX2hhc2gsIHByb2N1cmVtZW50X3RlYW0sIGF2YWlsYWJsZV93b3JrX2RheXNcbiAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICBbJzEwMDEnLCAnXHUwNUQwXHUwNUQxXHUwNUU4XHUwNUQ0XHUwNUREIFx1MDVERVx1MDVFMFx1MDVENFx1MDVEQycsIDEsICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNUU4XHUwNURCXHUwNUU5JywgbWFuYWdlclBhc3N3b3JkLCAnXHUwNUQ5XHUwNUUyXHUwNUQ1XHUwNUQzXHUwNUQ5JywgMjAwXVxuICAgICk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHkhJyk7XG4gICAgY29uc29sZS5sb2coJ0RlZmF1bHQgdXNlcnMgY3JlYXRlZDonKTtcbiAgICBjb25zb2xlLmxvZygnLSBBZG1pbjogOTk5OSAvIDEyMzQ1NicpO1xuICAgIGNvbnNvbGUubG9nKCctIE1hbmFnZXI6IDEwMDEgLyAxMjM0NTYnKTtcbiAgICBcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VlZCBkYXRhYmFzZTonLCBlcnJvcik7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbmV4cG9ydCB7IHNlZWREYXRhYmFzZSB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCBoZWxtZXQgZnJvbSAnaGVsbWV0JztcbmltcG9ydCBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgcmF0ZUxpbWl0IGZyb20gJ2V4cHJlc3MtcmF0ZS1saW1pdCc7XG5pbXBvcnQgeyBpbml0aWFsaXplRGF0YWJhc2UgfSBmcm9tICcuL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgYXV0aFJvdXRlcyBmcm9tICcuL3JvdXRlcy9hdXRoLmpzJztcbmltcG9ydCB3b3JrZXJzUm91dGVzIGZyb20gJy4vcm91dGVzL3dvcmtlcnMuanMnO1xuaW1wb3J0IHN5c3RlbVJvdXRlcyBmcm9tICcuL3JvdXRlcy9zeXN0ZW0uanMnO1xuaW1wb3J0IHBsYW5uaW5nUm91dGVzIGZyb20gJy4vcm91dGVzL3BsYW5uaW5nLmpzJztcblxuLy8gRW52aXJvbm1lbnQgdmFyaWFibGVzXG5wcm9jZXNzLmVudi5KV1RfU0VDUkVUID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAneW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtdGhpcy1pbi1wcm9kdWN0aW9uJztcbnByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOID0gcHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gfHwgJzI0aCc7XG5wcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTID0gcHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyB8fCAnMTInO1xucHJvY2Vzcy5lbnYuREJfUEFUSCA9IHByb2Nlc3MuZW52LkRCX1BBVEggfHwgJy4vc3JjL3NlcnZlci9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxubGV0IGV4cHJlc3NBcHAgPSBudWxsO1xubGV0IGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRXhwcmVzc0FwcCgpIHtcbiAgaWYgKGV4cHJlc3NBcHApIHtcbiAgICByZXR1cm4gZXhwcmVzc0FwcDtcbiAgfVxuXG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcblxuICAvLyBTZWN1cml0eSBtaWRkbGV3YXJlXG4gIGFwcC51c2UoaGVsbWV0KHtcbiAgICBjb250ZW50U2VjdXJpdHlQb2xpY3k6IGZhbHNlLCAvLyBEaXNhYmxlIENTUCBmb3IgZGV2ZWxvcG1lbnRcbiAgfSkpO1xuICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuXG4gIC8vIFJhdGUgbGltaXRpbmdcbiAgY29uc3QgbGltaXRlciA9IHJhdGVMaW1pdCh7XG4gICAgd2luZG93TXM6IDE1ICogNjAgKiAxMDAwLCAvLyAxNSBtaW51dGVzXG4gICAgbWF4OiAxMDAwLCAvLyBJbmNyZWFzZWQgbGltaXQgZm9yIGRldmVsb3BtZW50XG4gICAgbWVzc2FnZTogeyBlcnJvcjogJ1RvbyBtYW55IHJlcXVlc3RzIGZyb20gdGhpcyBJUCwgcGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nIH1cbiAgfSk7XG4gIGFwcC51c2UobGltaXRlcik7XG5cbiAgLy8gQ09SUyBjb25maWd1cmF0aW9uXG4gIGFwcC51c2UoY29ycyh7XG4gICAgb3JpZ2luOiB0cnVlLCAvLyBBbGxvdyBhbGwgb3JpZ2lucyBpbiBkZXZlbG9wbWVudFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxuICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXG4gICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXVxuICB9KSk7XG5cbiAgLy8gQm9keSBwYXJzaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZShleHByZXNzLmpzb24oeyBsaW1pdDogJzEwbWInIH0pKTtcbiAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICcxMG1iJyB9KSk7XG5cbiAgLy8gTG9nZ2luZ1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIGFwcC51c2UobW9yZ2FuKCdkZXYnKSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIGRhdGFiYXNlIG9ubHkgb25jZVxuICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgaW5pdGlhbGl6ZURhdGFiYXNlKCk7XG4gICAgICBjb25zb2xlLmxvZygnXHUyNzA1IERhdGFiYXNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICAvLyBTZWVkIGRhdGFiYXNlXG4gICAgICBjb25zdCB7IHNlZWREYXRhYmFzZSB9ID0gYXdhaXQgaW1wb3J0KCcuL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzJyk7XG4gICAgICBhd2FpdCBzZWVkRGF0YWJhc2UoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICBpc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEZhaWxlZCB0byBpbml0aWFsaXplIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBIZWFsdGggY2hlY2sgZW5kcG9pbnRcbiAgYXBwLmdldCgnL2hlYWx0aCcsIChyZXEsIHJlcykgPT4ge1xuICAgIHJlcy5qc29uKHsgXG4gICAgICBzdGF0dXM6ICdPSycsIFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEFQSSBSb3V0ZXNcbiAgYXBwLnVzZSgnL2F1dGgnLCBhdXRoUm91dGVzKTtcbiAgYXBwLnVzZSgnL3dvcmtlcnMnLCB3b3JrZXJzUm91dGVzKTtcbiAgYXBwLnVzZSgnL3N5c3RlbScsIHN5c3RlbVJvdXRlcyk7XG4gIGFwcC51c2UoJy9wbGFubmluZycsIHBsYW5uaW5nUm91dGVzKTtcblxuICAvLyBFcnJvciBoYW5kbGluZyBtaWRkbGV3YXJlXG4gIGFwcC51c2UoKGVyciwgcmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKCdBUEkgRXJyb3I6JywgZXJyKTtcbiAgICBcbiAgICBpZiAoZXJyLnR5cGUgPT09ICdlbnRpdHkucGFyc2UuZmFpbGVkJykge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIEpTT04gZm9ybWF0JyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLnN0YXR1cyhlcnIuc3RhdHVzIHx8IDUwMCkuanNvbih7XG4gICAgICBlcnJvcjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyBcbiAgICAgICAgPyAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyBcbiAgICAgICAgOiBlcnIubWVzc2FnZVxuICAgIH0pO1xuICB9KTtcblxuICAvLyA0MDQgaGFuZGxlciBmb3IgQVBJIHJvdXRlc1xuICBhcHAudXNlKCcqJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FQSSByb3V0ZSBub3QgZm91bmQnIH0pO1xuICB9KTtcblxuICBleHByZXNzQXBwID0gYXBwO1xuICBjb25zb2xlLmxvZygnXHUyNzA1IEV4cHJlc3MgYXBwIGNyZWF0ZWQgYW5kIGNvbmZpZ3VyZWQnKTtcbiAgcmV0dXJuIGFwcDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRXhwcmVzc0FwcCB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2UsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBDdXN0b20gcGx1Z2luIHRvIGludGVncmF0ZSBFeHByZXNzIHNlcnZlclxuICAgIHtcbiAgICAgIG5hbWU6ICdleHByZXNzLWludGVncmF0aW9uJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gSW1wb3J0IGFuZCBzZXR1cCBFeHByZXNzIHJvdXRlc1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCB0aGUgRXhwcmVzcyBhcHBcbiAgICAgICAgICAgIGNvbnN0IHsgY3JlYXRlRXhwcmVzc0FwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4cHJlc3NBcHAgPSBhd2FpdCBjcmVhdGVFeHByZXNzQXBwKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgcmVxdWVzdCB3aXRoIEV4cHJlc3NcbiAgICAgICAgICAgIGV4cHJlc3NBcHAocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHByZXNzIG1pZGRsZXdhcmUgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgbmV4dChlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBeVEsT0FBTyxhQUFhO0FBQzdSLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFhZixTQUFTLGNBQWM7QUFDckIsTUFBSSxDQUFDLElBQUk7QUFDUCxZQUFRLElBQUksNkJBQTZCLE9BQU87QUFDaEQsU0FBSyxJQUFJLFFBQVEsU0FBUyxTQUFTLENBQUMsUUFBUTtBQUMxQyxVQUFJLEtBQUs7QUFDUCxnQkFBUSxNQUFNLDJCQUEyQixHQUFHO0FBQzVDLGNBQU07QUFBQSxNQUNSO0FBQ0EsY0FBUSxJQUFJLG9DQUFvQyxPQUFPO0FBQUEsSUFDekQsQ0FBQztBQUdELE9BQUcsSUFBSSwwQkFBMEI7QUFBQSxFQUNuQztBQUNBLFNBQU87QUFDVDtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU1BLE1BQUssWUFBWTtBQUV2QixTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxJQUFBQSxJQUFHLFVBQVUsTUFBTTtBQUNqQixjQUFRLElBQUksNkJBQTZCO0FBR3pDLE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BZ0JOO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQU1OO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FLTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FLTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQU1OO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUtOO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FVTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQW9DTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FvQk47QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BUU47QUFHRCxNQUFB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QUNkLG9CQUFRLE1BQU0sNkJBQTZCLEtBQUs7QUFDaEQsaUJBQUssS0FBSztBQUFBLFVBQ1o7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0YsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLQyxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbImRiIiwgImVyciIsICJqd3QiLCAiaW5pdF9hdXRoIiwgImRiIiwgImV4cHJlc3MiLCAiYmNyeXB0IiwgImJvZHkiLCAidmFsaWRhdGlvblJlc3VsdCIsICJyb3V0ZXIiLCAiZGIiLCAiZXJyIiwgImV4cHJlc3MiLCAiYm9keSIsICJ2YWxpZGF0aW9uUmVzdWx0IiwgInJvdXRlciIsICJkYiIsICJlcnIiLCAiZXhwcmVzcyIsICJib2R5IiwgInZhbGlkYXRpb25SZXN1bHQiLCAicm91dGVyIiwgImRiIiwgImVyciIsICJiY3J5cHQiLCAiZGIiLCAiZXhwcmVzcyIsICJzZWVkRGF0YWJhc2UiLCAiaW5pdF9hdXRoIiwgInBhdGgiLCAiY3JlYXRlRXhwcmVzc0FwcCIsICJleHByZXNzQXBwIiwgInBhdGgiXQp9Cg==
