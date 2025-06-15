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
  if (isInitialized) {
    console.log("Database already initialized, skipping...");
    return;
  }
  const db2 = getDatabase();
  return new Promise((resolve, reject) => {
    db2.serialize(() => {
      console.log("Creating database tables...");
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
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_code) REFERENCES organizational_roles(role_code),
          FOREIGN KEY (division_id) REFERENCES divisions(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
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
          isInitialized = true;
          resolve();
        });
      });
    });
  });
}
var DB_PATH, dataDir, db, isInitialized;
var init_database = __esm({
  "src/server/config/database.js"() {
    DB_PATH = process.env.DB_PATH || "./src/server/data/procurement.db";
    dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      console.log("Creating data directory:", dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = null;
    isInitialized = false;
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
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)");
        for (const role of roles) {
          stmt.run([role.roleCode, role.description, role.permissions]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    const divisions = [
      { name: "\u05D0\u05D2\u05E3 \u05EA\u05E4\u05E2\u05D5\u05DC", isInternal: true },
      { name: "\u05D0\u05D2\u05E3 \u05E9\u05D9\u05D5\u05D5\u05E7", isInternal: true },
      { name: "\u05DC\u05E7\u05D5\u05D7 \u05D7\u05D9\u05E6\u05D5\u05E0\u05D9 \u05D0", isInternal: false }
    ];
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO divisions (name, is_internal) VALUES (?, ?)");
        for (const division of divisions) {
          stmt.run([division.name, division.isInternal]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    const departments = [
      { name: "\u05DE\u05D7\u05DC\u05E7\u05EA \u05D4\u05E0\u05D3\u05E1\u05D4", divisionId: 1 },
      { name: "\u05DE\u05D7\u05DC\u05E7\u05EA \u05D0\u05D9\u05DB\u05D5\u05EA", divisionId: 1 },
      { name: "\u05DE\u05D7\u05DC\u05E7\u05EA \u05E9\u05D9\u05E8\u05D5\u05EA \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA", divisionId: 2 }
    ];
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO departments (name, division_id) VALUES (?, ?)");
        for (const dept of departments) {
          stmt.run([dept.name, dept.divisionId]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    const teams = [
      "\u05D9\u05E2\u05D5\u05D3\u05D9",
      "\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9",
      "\u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9",
      "\u05DE\u05D7\u05E9\u05D5\u05D1",
      "\u05D4\u05E0\u05D3\u05E1\u05D9",
      "\u05D1\u05D9\u05D8\u05D7\u05D5\u05E0\u05D9"
    ];
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO procurement_teams (name) VALUES (?)");
        for (const team of teams) {
          stmt.run([team]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    const domains = [
      "\u05E8\u05DB\u05E9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D5\u05DE\u05D7\u05E9\u05D5\u05D1",
      "\u05E8\u05DB\u05E9 \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9\u05D9\u05DD",
      "\u05E8\u05DB\u05E9 \u05E6\u05D9\u05D5\u05D3 \u05DE\u05E9\u05E8\u05D3\u05D9"
    ];
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO domains (description) VALUES (?)");
        for (const domain of domains) {
          stmt.run([domain]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
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
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO activity_pool (name, tools_and_resources) VALUES (?, ?)");
        for (const activity of activities) {
          stmt.run([activity.name, activity.tools]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    const engagementTypes = [
      "\u05DE\u05DB\u05E8\u05D6 \u05E4\u05D5\u05DE\u05D1\u05D9",
      "\u05DE\u05DB\u05E8\u05D6 \u05DE\u05D5\u05D2\u05D1\u05DC",
      "\u05DE\u05DB\u05E8\u05D6 \u05E4\u05EA\u05D5\u05D7 \u05DE\u05D5\u05D2\u05D1\u05DC",
      "\u05E8\u05DB\u05E9 \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA\u05D9"
    ];
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare("INSERT OR IGNORE INTO engagement_types (name) VALUES (?)");
        for (const type of engagementTypes) {
          stmt.run([type]);
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    await new Promise((resolve, reject) => {
      db2.run(`
        INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) 
        VALUES (1, 5, 10, 20)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
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
    await new Promise((resolve, reject) => {
      db2.serialize(() => {
        const stmt = db2.prepare(`
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
    const adminPassword = await bcrypt3.hash("123456", 12);
    await new Promise((resolve, reject) => {
      db2.run(
        `INSERT OR IGNORE INTO users (
          employee_id, full_name, role_code, role_description, 
          password_hash, email
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        ["9999", "\u05DE\u05E0\u05D4\u05DC \u05DE\u05E2\u05E8\u05DB\u05EA", 9, "\u05D2\u05D5\u05E8\u05DD \u05D8\u05DB\u05E0\u05D9", adminPassword, "admin@system.com"],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    const managerPassword = await bcrypt3.hash("123456", 12);
    await new Promise((resolve, reject) => {
      db2.run(
        `INSERT OR IGNORE INTO users (
          employee_id, full_name, role_code, role_description, 
          password_hash, procurement_team, available_work_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["1001", "\u05D0\u05D1\u05E8\u05D4\u05DD \u05DE\u05E0\u05D4\u05DC", 1, "\u05DE\u05E0\u05D4\u05DC \u05E8\u05DB\u05E9", managerPassword, "\u05D9\u05E2\u05D5\u05D3\u05D9", 200],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
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
  if (!isAppInitialized) {
    try {
      await initializeDatabase();
      console.log("\u2705 Database initialized successfully");
      const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seedDatabase(), seedDatabase_exports));
      await seedDatabase2();
      console.log("\u2705 Database seeded successfully");
      isAppInitialized = true;
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
var expressApp, isAppInitialized;
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
    expressApp = null;
    isAppInitialized = false;
  }
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path2 from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
process.env.DB_PATH = "./src/server/data/procurement.db";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3N5c3RlbS5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qcyIsICJzcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzIiwgInNyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtpbXBvcnQgc3FsaXRlMyBmcm9tICdzcWxpdGUzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gVXNlIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBzZXQgaW4gdml0ZS5jb25maWcudHMsIHdpdGggZmFsbGJhY2tcbmNvbnN0IERCX1BBVEggPSBwcm9jZXNzLmVudi5EQl9QQVRIIHx8ICcuL3NyYy9zZXJ2ZXIvZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbi8vIEVuc3VyZSBkYXRhIGRpcmVjdG9yeSBleGlzdHNcbmNvbnN0IGRhdGFEaXIgPSBwYXRoLmRpcm5hbWUoREJfUEFUSCk7XG5pZiAoIWZzLmV4aXN0c1N5bmMoZGF0YURpcikpIHtcbiAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGEgZGlyZWN0b3J5OicsIGRhdGFEaXIpO1xuICBmcy5ta2RpclN5bmMoZGF0YURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG59XG5cbmxldCBkYiA9IG51bGw7XG5sZXQgaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBnZXREYXRhYmFzZSgpIHtcbiAgaWYgKCFkYikge1xuICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgZGIgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZShEQl9QQVRILCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgZGF0YWJhc2U6JywgZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBTUUxpdGUgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gRW5hYmxlIGZvcmVpZ24ga2V5c1xuICAgIGRiLnJ1bignUFJBR01BIGZvcmVpZ25fa2V5cyA9IE9OJyk7XG4gIH1cbiAgcmV0dXJuIGRiO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0aWFsaXplRGF0YWJhc2UoKSB7XG4gIC8vIFByZXZlbnQgbXVsdGlwbGUgaW5pdGlhbGl6YXRpb25zXG4gIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGFscmVhZHkgaW5pdGlhbGl6ZWQsIHNraXBwaW5nLi4uJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGFiYXNlIHRhYmxlcy4uLicpO1xuICAgICAgXG4gICAgICAvLyBPcmdhbml6YXRpb25hbCByb2xlcyB0YWJsZSAobXVzdCBiZSBjcmVhdGVkIGJlZm9yZSB1c2VycylcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG9yZ2FuaXphdGlvbmFsX3JvbGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgcm9sZV9jb2RlIElOVEVHRVIgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgcGVybWlzc2lvbnMgVEVYVFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGl2aXNpb25zIHRhYmxlIChtdXN0IGJlIGNyZWF0ZWQgYmVmb3JlIHVzZXJzIGFuZCBkZXBhcnRtZW50cylcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGVwYXJ0bWVudHMgdGFibGUgKG11c3QgYmUgY3JlYXRlZCBiZWZvcmUgdXNlcnMpXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkZXBhcnRtZW50cyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9jdXJlbWVudCB0ZWFtcyB0YWJsZSAobXVzdCBiZSBjcmVhdGVkIGJlZm9yZSB1c2VycylcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2N1cmVtZW50X3RlYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBVc2VycyB0YWJsZSAod2l0aCBwcm9wZXIgZm9yZWlnbiBrZXkgY29uc3RyYWludHMpXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyB1c2VycyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVtcGxveWVlX2lkIFRFWFQgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGZ1bGxfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBwcm9jdXJlbWVudF90ZWFtIFRFWFQsXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGF2YWlsYWJsZV93b3JrX2RheXMgSU5URUdFUixcbiAgICAgICAgICBlbWFpbCBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHJvbGVfY29kZSkgUkVGRVJFTkNFUyBvcmdhbml6YXRpb25hbF9yb2xlcyhyb2xlX2NvZGUpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkZXBhcnRtZW50X2lkKSBSRUZFUkVOQ0VTIGRlcGFydG1lbnRzKGlkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRG9tYWlucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZG9tYWlucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEFjdGl2aXR5IHBvb2wgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjdGl2aXR5X3Bvb2wgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgdG9vbHNfYW5kX3Jlc291cmNlcyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGUgcHJvY2Vzc2VzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVfcHJvY2Vzc2VzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGVuZ2FnZW1lbnRfdHlwZV9pZCkgUkVGRVJFTkNFUyBlbmdhZ2VtZW50X3R5cGVzKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoYWN0aXZpdHlfaWQpIFJFRkVSRU5DRVMgYWN0aXZpdHlfcG9vbChpZCksXG4gICAgICAgICAgVU5JUVVFKGVuZ2FnZW1lbnRfdHlwZV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHRhc2tfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgd29ya195ZWFyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgcmVxdWlyZWRfcXVhcnRlciBEQVRFIE5PVCBOVUxMLFxuICAgICAgICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICByZXF1ZXN0ZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXF1ZXN0ZXJfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgZGl2aXNpb25fbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X25hbWUgVEVYVCxcbiAgICAgICAgICBkb21haW5faWQgSU5URUdFUixcbiAgICAgICAgICBkb21haW5fbmFtZSBURVhULFxuICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQgREVDSU1BTCgxNSwyKSxcbiAgICAgICAgICBjdXJyZW5jeSBURVhULFxuICAgICAgICAgIHN1cHBsaWVyX2xpc3QgVEVYVCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uIFRFWFQsXG4gICAgICAgICAgcGxhbm5pbmdfc291cmNlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9ncmFtIHRhc2tzIChzdGF0aW9ucykgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1fdGFza3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBwcm9ncmFtX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIGNvbXBsZXRpb25fZGF0ZSBEQVRFLFxuICAgICAgICAgIHJlcG9ydGluZ191c2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfbmFtZSBURVhULFxuICAgICAgICAgIHJlZmVyZW5jZSBURVhULFxuICAgICAgICAgIG5vdGVzIFRFWFQsXG4gICAgICAgICAgaXNfbGFzdF9zdGF0aW9uIEJPT0xFQU4gREVGQVVMVCAwLFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHByb2dyYW1faWQpIFJFRkVSRU5DRVMgcHJvZ3JhbXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUocHJvZ3JhbV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENvbXBsZXhpdHkgZXN0aW1hdGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBjb21wbGV4aXR5X2VzdGltYXRlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVzdGltYXRlX2xldmVsXzEgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDUsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMiBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMTAsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMyBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMjAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBBY2NlcHRhbmNlIG9wdGlvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjY2VwdGFuY2Vfb3B0aW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHllYXJfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgdXBsb2FkX2NvZGUgVEVYVCBOT1QgTlVMTCBDSEVDSyAodXBsb2FkX2NvZGUgSU4gKCdQbGFuJywgJ0xhdGUnLCAnQmxvY2snLCAnRmluaXNoJykpLFxuICAgICAgICAgIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgYnJvYWRfbWVhbmluZyBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFN5c3RlbSBzZXR0aW5ncyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3lzdGVtX3NldHRpbmdzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgc2V0dGluZ19rZXkgVEVYVCBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgc2V0dGluZ192YWx1ZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGAsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHN5c3RlbV9zZXR0aW5ncyB0YWJsZTonLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBpbmRleGVzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfc3RhdHVzIE9OIHByb2dyYW1zKHN0YXR1cyknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfd29ya195ZWFyIE9OIHByb2dyYW1zKHdvcmtfeWVhciknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19wcm9ncmFtX2lkIE9OIHByb2dyYW1fdGFza3MocHJvZ3JhbV9pZCknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfdXNlcnNfZW1wbG95ZWVfaWQgT04gdXNlcnMoZW1wbG95ZWVfaWQpJyk7XG4gICAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X2FjY2VwdGFuY2Vfb3B0aW9uc195ZWFyIE9OIGFjY2VwdGFuY2Vfb3B0aW9ucyh5ZWFyX2lkKScsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBpbmRleGVzOicsIGVycik7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHRhYmxlcyBhbmQgaW5kZXhlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgIGlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlRGF0YWJhc2UoKSB7XG4gIGlmIChkYikge1xuICAgIGRiLmNsb3NlKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xvc2luZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGIgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIGdldERhdGFiYXNlLFxuICBpbml0aWFsaXplRGF0YWJhc2UsXG4gIGNsb3NlRGF0YWJhc2Vcbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7aW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5mdW5jdGlvbiBhdXRoZW50aWNhdGVUb2tlbihyZXEsIHJlcywgbmV4dCkge1xuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnNbJ2F1dGhvcml6YXRpb24nXTtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyICYmIGF1dGhIZWFkZXIuc3BsaXQoJyAnKVsxXTtcblxuICBpZiAoIXRva2VuKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBY2Nlc3MgdG9rZW4gcmVxdWlyZWQnIH0pO1xuICB9XG5cbiAgand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCwgKGVyciwgdXNlcikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW52YWxpZCBvciBleHBpcmVkIHRva2VuJyB9KTtcbiAgICB9XG4gICAgcmVxLnVzZXIgPSB1c2VyO1xuICAgIG5leHQoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGF1dGhvcml6ZVJvbGVzKC4uLnJvbGVzKSB7XG4gIHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBpZiAoIXJlcS51c2VyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0F1dGhlbnRpY2F0aW9uIHJlcXVpcmVkJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJvbGVzLmluY2x1ZGVzKHJlcS51c2VyLnJvbGVDb2RlKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH0pO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVVc2VyRXhpc3RzKHJlcSwgcmVzLCBuZXh0KSB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3QgdXNlcklkID0gcmVxLnVzZXIuaWQ7XG5cbiAgZGIuZ2V0KFxuICAgICdTRUxFQ1QgaWQsIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSBGUk9NIHVzZXJzIFdIRVJFIGlkID0gPycsXG4gICAgW3VzZXJJZF0sXG4gICAgKGVyciwgdXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXEudXNlci5jdXJyZW50VXNlciA9IHVzZXI7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuICApO1xufVxuXG5leHBvcnQge1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMsXG4gIHZhbGlkYXRlVXNlckV4aXN0c1xufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgYm9keSwgdmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gTG9naW4gZW5kcG9pbnRcbnJvdXRlci5wb3N0KCcvbG9naW4nLCBbXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5pc0xlbmd0aCh7IG1pbjogNCwgbWF4OiA0IH0pLndpdGhNZXNzYWdlKCdFbXBsb3llZSBJRCBtdXN0IGJlIDQgZGlnaXRzJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykuaXNMZW5ndGgoeyBtaW46IDYsIG1heDogNiB9KS53aXRoTWVzc2FnZSgnUGFzc3dvcmQgbXVzdCBiZSA2IGNoYXJhY3RlcnMnKVxuXSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGVtcGxveWVlSWQsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICBkYi5nZXQoXG4gICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSBlbXBsb3llZV9pZCA9ID8nLFxuICAgICAgW2VtcGxveWVlSWRdLFxuICAgICAgYXN5bmMgKGVyciwgdXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNWYWxpZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHVzZXIucGFzc3dvcmRfaGFzaCk7XG4gICAgICAgIGlmICghaXNWYWxpZFBhc3N3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRva2VuID0gand0LnNpZ24oXG4gICAgICAgICAgeyBcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLCBcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUgXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVULFxuICAgICAgICAgIHsgZXhwaXJlc0luOiBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB8fCAnMjRoJyB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xuICB9XG59KTtcblxuLy8gR2V0IGN1cnJlbnQgdXNlciBpbmZvXG5yb3V0ZXIuZ2V0KCcvbWUnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmdldChcbiAgICAnU0VMRUNUIGlkLCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUsIHJvbGVfZGVzY3JpcHRpb24sIHByb2N1cmVtZW50X3RlYW0sIGVtYWlsIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JyxcbiAgICBbcmVxLnVzZXIuaWRdLFxuICAgIChlcnIsIHVzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVzLmpzb24oe1xuICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3dvcmtlcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgYXV0aG9yaXplUm9sZXMgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBHZXQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbnJvdXRlci5nZXQoJy9vcmdhbml6YXRpb25hbC1yb2xlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzIE9SREVSIEJZIHJvbGVfY29kZScsIChlcnIsIHJvbGVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIG9yZ2FuaXphdGlvbmFsIHJvbGVzJyB9KTtcbiAgICB9XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0ZldGNoZWQgb3JnYW5pemF0aW9uYWwgcm9sZXM6Jywgcm9sZXMpO1xuICAgIHJlcy5qc29uKHJvbGVzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRpdmlzaW9uc1xucm91dGVyLmdldCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGl2aXNpb25zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGl2aXNpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkaXZpc2lvbnMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkaXZpc2lvbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgZGVwYXJ0bWVudHNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIE9SREVSIEJZIG5hbWUnLCAoZXJyLCBkZXBhcnRtZW50cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRlcGFydG1lbnRzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkZXBhcnRtZW50cycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRlcGFydG1lbnRzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IHByb2N1cmVtZW50IHRlYW1zXG5yb3V0ZXIuZ2V0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBPUkRFUiBCWSBuYW1lJywgKGVyciwgdGVhbXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBwcm9jdXJlbWVudCB0ZWFtczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggcHJvY3VyZW1lbnQgdGVhbXMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbih0ZWFtcyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBhbGwgd29ya2Vyc1xucm91dGVyLmdldCgnLycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgdHJ5IHtcbiAgICBkYi5hbGwoYFxuICAgICAgU0VMRUNUIFxuICAgICAgICB1LiosXG4gICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICBGUk9NIHVzZXJzIHVcbiAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgT1JERVIgQlkgdS5mdWxsX25hbWVcbiAgICBgLCAoZXJyLCB3b3JrZXJzKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHdvcmtlcnM6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggd29ya2VycycgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFRyYW5zZm9ybSB0byBtYXRjaCBmcm9udGVuZCBleHBlY3RhdGlvbnNcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VycyA9IHdvcmtlcnMubWFwKHdvcmtlciA9PiAoe1xuICAgICAgICBpZDogd29ya2VyLmlkLFxuICAgICAgICBlbXBsb3llZUlkOiB3b3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgIHJvbGVDb2RlOiB3b3JrZXIucm9sZV9jb2RlLFxuICAgICAgICBmdWxsTmFtZTogd29ya2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB3b3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgZGl2aXNpb25JZDogd29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHdvcmtlci5kZXBhcnRtZW50X2lkLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHdvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBwYXNzd29yZDogJyoqKioqKicsIC8vIERvbid0IHNlbmQgYWN0dWFsIHBhc3N3b3JkXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB3b3JrZXIuYXZhaWxhYmxlX3dvcmtfZGF5cz8udG9TdHJpbmcoKSxcbiAgICAgICAgZW1haWw6IHdvcmtlci5lbWFpbCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiB3b3JrZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHdvcmtlci5kZXBhcnRtZW50X25hbWVcbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgcmVzLmpzb24odHJhbnNmb3JtZWRXb3JrZXJzKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXJzOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcnMnIH0pO1xuICB9XG59KTtcblxuLy8gR2V0IHdvcmtlciBieSBJRFxucm91dGVyLmdldCgnLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBcbiAgdHJ5IHtcbiAgICBkYi5nZXQoYFxuICAgICAgU0VMRUNUIFxuICAgICAgICB1LiosXG4gICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICBGUk9NIHVzZXJzIHVcbiAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgV0hFUkUgdS5pZCA9ID9cbiAgICBgLCBbaWRdLCAoZXJyLCB3b3JrZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnV29ya2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICBpZDogd29ya2VyLmlkLFxuICAgICAgICBlbXBsb3llZUlkOiB3b3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgIHJvbGVDb2RlOiB3b3JrZXIucm9sZV9jb2RlLFxuICAgICAgICBmdWxsTmFtZTogd29ya2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB3b3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgZGl2aXNpb25JZDogd29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHdvcmtlci5kZXBhcnRtZW50X2lkLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHdvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB3b3JrZXIuYXZhaWxhYmxlX3dvcmtfZGF5cz8udG9TdHJpbmcoKSxcbiAgICAgICAgZW1haWw6IHdvcmtlci5lbWFpbCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiB3b3JrZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHdvcmtlci5kZXBhcnRtZW50X25hbWVcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXI6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggd29ya2VyJyB9KTtcbiAgfVxufSk7XG5cbi8vIENyZWF0ZSBuZXcgd29ya2VyXG5yb3V0ZXIucG9zdCgnLycsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpLCAvLyBNYW5hZ2VyLCBBZG1pbiwgVGVjaG5pY2FsXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5pc0xlbmd0aCh7IG1pbjogNCwgbWF4OiA0IH0pLndpdGhNZXNzYWdlKCdFbXBsb3llZSBJRCBtdXN0IGJlIDQgZGlnaXRzJyksXG4gIGJvZHkoJ3JvbGVDb2RlJykuaXNJbnQoeyBtaW46IDEsIG1heDogOSB9KS53aXRoTWVzc2FnZSgnSW52YWxpZCByb2xlIGNvZGUnKSxcbiAgYm9keSgnZnVsbE5hbWUnKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdGdWxsIG5hbWUgaXMgcmVxdWlyZWQnKSxcbiAgYm9keSgncGFzc3dvcmQnKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXZhaWxhYmxlV29ya0RheXMsXG4gICAgICBlbWFpbFxuICAgIH0gPSByZXEuYm9keTtcblxuICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyB3b3JrZXIgd2l0aCBkYXRhOicsIHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIC8vIENoZWNrIGlmIGVtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzXG4gICAgZGIuZ2V0KCdTRUxFQ1QgaWQgRlJPTSB1c2VycyBXSEVSRSBlbXBsb3llZV9pZCA9ID8nLCBbZW1wbG95ZWVJZF0sIGFzeW5jIChlcnIsIGV4aXN0aW5nVXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdEYXRhYmFzZSBlcnJvciBjaGVja2luZyBleGlzdGluZyB1c2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnRW1wbG95ZWUgSUQgYWxyZWFkeSBleGlzdHMnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBIYXNoIHBhc3N3b3JkXG4gICAgICBjb25zdCBwYXNzd29yZEhhc2ggPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgcGFyc2VJbnQocHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUykgfHwgMTIpO1xuXG4gICAgICAvLyBJbnNlcnQgbmV3IHdvcmtlclxuICAgICAgZGIucnVuKGBcbiAgICAgICAgSU5TRVJUIElOVE8gdXNlcnMgKFxuICAgICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICBkaXZpc2lvbl9pZCwgZGVwYXJ0bWVudF9pZCwgcHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICBwYXNzd29yZF9oYXNoLCBhdmFpbGFibGVfd29ya19kYXlzLCBlbWFpbFxuICAgICAgICApIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPywgPywgPywgPylcbiAgICAgIGAsIFtcbiAgICAgICAgZW1wbG95ZWVJZCxcbiAgICAgICAgZnVsbE5hbWUsXG4gICAgICAgIHJvbGVDb2RlLFxuICAgICAgICByb2xlRGVzY3JpcHRpb24gfHwgbnVsbCxcbiAgICAgICAgZGl2aXNpb25JZCB8fCBudWxsLFxuICAgICAgICBkZXBhcnRtZW50SWQgfHwgbnVsbCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtIHx8IG51bGwsXG4gICAgICAgIHBhc3N3b3JkSGFzaCxcbiAgICAgICAgYXZhaWxhYmxlV29ya0RheXMgPyBwYXJzZUludChhdmFpbGFibGVXb3JrRGF5cykgOiBudWxsLFxuICAgICAgICBlbWFpbCB8fCBudWxsXG4gICAgICBdLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSB3b3JrZXInIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtlciBjcmVhdGVkIHdpdGggSUQ6JywgdGhpcy5sYXN0SUQpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgY3JlYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoYFxuICAgICAgICAgIFNFTEVDVCBcbiAgICAgICAgICAgIHUuKixcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIEZST00gdXNlcnMgdVxuICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgICAgICBXSEVSRSB1LmlkID0gP1xuICAgICAgICBgLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBuZXdXb3JrZXIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY3JlYXRlZCB3b3JrZXInIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICAgICAgaWQ6IG5ld1dvcmtlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IG5ld1dvcmtlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIHJvbGVDb2RlOiBuZXdXb3JrZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgZnVsbE5hbWU6IG5ld1dvcmtlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IG5ld1dvcmtlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZGl2aXNpb25JZDogbmV3V29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiBuZXdXb3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogbmV3V29ya2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogbmV3V29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBlbWFpbDogbmV3V29ya2VyLmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiBuZXdXb3JrZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgICAgIGRlcGFydG1lbnROYW1lOiBuZXdXb3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdSZXR1cm5pbmcgY3JlYXRlZCB3b3JrZXI6JywgdHJhbnNmb3JtZWRXb3JrZXIpO1xuICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB3b3JrZXI6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gY3JlYXRlIHdvcmtlcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBVcGRhdGUgd29ya2VyXG5yb3V0ZXIucHV0KCcvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMSwgNSwgOSksIC8vIE1hbmFnZXIsIEFkbWluLCBUZWNobmljYWxcbiAgYm9keSgnZW1wbG95ZWVJZCcpLm9wdGlvbmFsKCkuaXNMZW5ndGgoeyBtaW46IDQsIG1heDogNCB9KS53aXRoTWVzc2FnZSgnRW1wbG95ZWUgSUQgbXVzdCBiZSA0IGRpZ2l0cycpLFxuICBib2R5KCdyb2xlQ29kZScpLm9wdGlvbmFsKCkuaXNJbnQoeyBtaW46IDEsIG1heDogOSB9KS53aXRoTWVzc2FnZSgnSW52YWxpZCByb2xlIGNvZGUnKSxcbiAgYm9keSgncGFzc3dvcmQnKS5vcHRpb25hbCgpLmlzTGVuZ3RoKHsgbWluOiA2LCBtYXg6IDYgfSkud2l0aE1lc3NhZ2UoJ1Bhc3N3b3JkIG11c3QgYmUgNiBjaGFyYWN0ZXJzJylcbl0sIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd29ya2VySWQgPSByZXEucGFyYW1zLmlkO1xuICAgIGNvbnN0IHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXZhaWxhYmxlV29ya0RheXMsXG4gICAgICBlbWFpbFxuICAgIH0gPSByZXEuYm9keTtcblxuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIC8vIENoZWNrIGlmIGVtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzIChleGNsdWRpbmcgY3VycmVudCB3b3JrZXIpXG4gICAgaWYgKGVtcGxveWVlSWQpIHtcbiAgICAgIGRiLmdldCgnU0VMRUNUIGlkIEZST00gdXNlcnMgV0hFUkUgZW1wbG95ZWVfaWQgPSA/IEFORCBpZCAhPSA/JywgW2VtcGxveWVlSWQsIHdvcmtlcklkXSwgYXN5bmMgKGVyciwgZXhpc3RpbmdVc2VyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChleGlzdGluZ1VzZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHVwZGF0ZVdvcmtlcigpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHVwZGF0ZVdvcmtlcigpO1xuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVdvcmtlcigpIHtcbiAgICAgIGxldCBwYXNzd29yZEhhc2ggPSBudWxsO1xuICAgICAgaWYgKHBhc3N3b3JkICYmIHBhc3N3b3JkICE9PSAnKioqKioqJykge1xuICAgICAgICBwYXNzd29yZEhhc2ggPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgcGFyc2VJbnQocHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUykgfHwgMTIpO1xuICAgICAgfVxuXG4gICAgICAvLyBCdWlsZCB1cGRhdGUgcXVlcnkgZHluYW1pY2FsbHlcbiAgICAgIGNvbnN0IHVwZGF0ZUZpZWxkcyA9IFtdO1xuICAgICAgY29uc3QgdmFsdWVzID0gW107XG5cbiAgICAgIGlmIChlbXBsb3llZUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2VtcGxveWVlX2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChlbXBsb3llZUlkKTtcbiAgICAgIH1cbiAgICAgIGlmIChyb2xlQ29kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdyb2xlX2NvZGUgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHJvbGVDb2RlKTtcbiAgICAgIH1cbiAgICAgIGlmIChmdWxsTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdmdWxsX25hbWUgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKGZ1bGxOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChyb2xlRGVzY3JpcHRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncm9sZV9kZXNjcmlwdGlvbiA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2gocm9sZURlc2NyaXB0aW9uIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGRpdmlzaW9uSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnZGl2aXNpb25faWQgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKGRpdmlzaW9uSWQgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBpZiAoZGVwYXJ0bWVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2RlcGFydG1lbnRfaWQgPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKGRlcGFydG1lbnRJZCB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm9jdXJlbWVudFRlYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncHJvY3VyZW1lbnRfdGVhbSA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2gocHJvY3VyZW1lbnRUZWFtIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKHBhc3N3b3JkSGFzaCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncGFzc3dvcmRfaGFzaCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2gocGFzc3dvcmRIYXNoKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdmFpbGFibGVXb3JrRGF5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdhdmFpbGFibGVfd29ya19kYXlzID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChhdmFpbGFibGVXb3JrRGF5cyA/IHBhcnNlSW50KGF2YWlsYWJsZVdvcmtEYXlzKSA6IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGVtYWlsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2VtYWlsID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChlbWFpbCB8fCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3VwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCcpO1xuICAgICAgdmFsdWVzLnB1c2god29ya2VySWQpO1xuXG4gICAgICBpZiAodXBkYXRlRmllbGRzLmxlbmd0aCA9PT0gMSkgeyAvLyBPbmx5IHRpbWVzdGFtcCB1cGRhdGVcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdObyBmaWVsZHMgdG8gdXBkYXRlJyB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXBkYXRlUXVlcnkgPSBgVVBEQVRFIHVzZXJzIFNFVCAke3VwZGF0ZUZpZWxkcy5qb2luKCcsICcpfSBXSEVSRSBpZCA9ID9gO1xuXG4gICAgICBkYi5ydW4odXBkYXRlUXVlcnksIHZhbHVlcywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgd29ya2VyJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoZSB1cGRhdGVkIHdvcmtlciB3aXRoIGpvaW5lZCBkYXRhXG4gICAgICAgIGRiLmdldChgXG4gICAgICAgICAgU0VMRUNUIFxuICAgICAgICAgICAgdS4qLFxuICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgRlJPTSB1c2VycyB1XG4gICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHUuZGl2aXNpb25faWQgPSBkLmlkXG4gICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdS5kZXBhcnRtZW50X2lkID0gZGVwdC5pZFxuICAgICAgICAgIFdIRVJFIHUuaWQgPSA/XG4gICAgICAgIGAsIFt3b3JrZXJJZF0sIChlcnIsIHVwZGF0ZWRXb3JrZXIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIHdvcmtlcicgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRXb3JrZXIgPSB7XG4gICAgICAgICAgICBpZDogdXBkYXRlZFdvcmtlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVwZGF0ZWRXb3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogdXBkYXRlZFdvcmtlci5yb2xlX2NvZGUsXG4gICAgICAgICAgICBmdWxsTmFtZTogdXBkYXRlZFdvcmtlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IHVwZGF0ZWRXb3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGRpdmlzaW9uSWQ6IHVwZGF0ZWRXb3JrZXIuZGl2aXNpb25faWQsXG4gICAgICAgICAgICBkZXBhcnRtZW50SWQ6IHVwZGF0ZWRXb3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogdXBkYXRlZFdvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IHVwZGF0ZWRXb3JrZXIuYXZhaWxhYmxlX3dvcmtfZGF5cz8udG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGVtYWlsOiB1cGRhdGVkV29ya2VyLmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiB1cGRhdGVkV29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogdXBkYXRlZFdvcmtlci5kZXBhcnRtZW50X25hbWVcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmVzLmpzb24odHJhbnNmb3JtZWRXb3JrZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyB3b3JrZXI6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIHdvcmtlcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBEZWxldGUgd29ya2VyXG5yb3V0ZXIuZGVsZXRlKCcvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMSwgNSwgOSkgLy8gTWFuYWdlciwgQWRtaW4sIFRlY2huaWNhbFxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3Qgd29ya2VySWQgPSByZXEucGFyYW1zLmlkO1xuXG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgaWYgd29ya2VyIGlzIGFzc2lnbmVkIHRvIGFueSBhY3RpdmUgdGFza3NcbiAgICAvLyBGb3Igbm93LCB3ZSdsbCBhbGxvdyBkZWxldGlvbiBidXQgaW4gcHJvZHVjdGlvbiB5b3UgbWlnaHQgd2FudCB0byBwcmV2ZW50IGl0XG4gICAgXG4gICAgZGIucnVuKCdERUxFVEUgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLCBbd29ya2VySWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSB3b3JrZXInIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnV29ya2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ1dvcmtlciBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9zeXN0ZW0uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9zeXN0ZW0uanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgYXV0aG9yaXplUm9sZXMgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyA9PT09PSBBQ1RJVklUWSBQT09MIFJPVVRFUyA9PT09PVxuXG4vLyBHZXQgYWxsIGFjdGl2aXRpZXNcbnJvdXRlci5nZXQoJy9hY3Rpdml0eS1wb29sJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBPUkRFUiBCWSBuYW1lJywgKGVyciwgYWN0aXZpdGllcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGFjdGl2aXRpZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGFjdGl2aXRpZXMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihhY3Rpdml0aWVzKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIGFjdGl2aXR5XG5yb3V0ZXIucG9zdCgnL2FjdGl2aXR5LXBvb2wnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0FjdGl2aXR5IG5hbWUgaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfHwgbnVsbF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBhY3Rpdml0eScgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGFjdGl2aXR5JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihhY3Rpdml0eSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIGFjdGl2aXR5XG5yb3V0ZXIucHV0KCcvYWN0aXZpdHktcG9vbC86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgYWN0aXZpdHlfcG9vbCBTRVQgbmFtZSA9ID8sIHRvb2xzX2FuZF9yZXNvdXJjZXMgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIHx8IG51bGwsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIGFjdGl2aXR5JyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjdGl2aXR5IG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIGFjdGl2aXR5JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihhY3Rpdml0eSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGFjdGl2aXR5XG5yb3V0ZXIuZGVsZXRlKCcvYWN0aXZpdHktcG9vbC86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGFjdGl2aXR5X3Bvb2wgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBhY3Rpdml0eScgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY3Rpdml0eSBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0FjdGl2aXR5IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gPT09PT0gRE9NQUlOUyBST1VURVMgPT09PT1cblxuLy8gR2V0IGFsbCBkb21haW5zXG5yb3V0ZXIuZ2V0KCcvZG9tYWlucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgT1JERVIgQlkgZGVzY3JpcHRpb24nLCAoZXJyLCBkb21haW5zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZG9tYWluczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZG9tYWlucycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRvbWFpbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgZG9tYWluXG5yb3V0ZXIucG9zdCgnL2RvbWFpbnMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnZGVzY3JpcHRpb24nKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdEb21haW4gZGVzY3JpcHRpb24gaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgZGVzY3JpcHRpb24gfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBkb21haW5zIChkZXNjcmlwdGlvbikgVkFMVUVTICg/KScsXG4gICAgW2Rlc2NyaXB0aW9uXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBkb21haW4nIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBkb21haW4pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgZG9tYWluJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihkb21haW4pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBkb21haW5cbnJvdXRlci5wdXQoJy9kb21haW5zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBkZXNjcmlwdGlvbiB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBkb21haW5zIFNFVCBkZXNjcmlwdGlvbiA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbZGVzY3JpcHRpb24sIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBkb21haW4nIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRG9tYWluIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIGRvbWFpbikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCBkb21haW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKGRvbWFpbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGRvbWFpblxucm91dGVyLmRlbGV0ZSgnL2RvbWFpbnMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZGVsZXRlIGRvbWFpbicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEb21haW4gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEb21haW4gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyA9PT09PSBESVZJU0lPTlMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgZGl2aXNpb25zXG5yb3V0ZXIuZ2V0KCcvZGl2aXNpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCBkaXZpc2lvbnMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkaXZpc2lvbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGRpdmlzaW9ucycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRpdmlzaW9ucyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBkaXZpc2lvblxucm91dGVyLnBvc3QoJy9kaXZpc2lvbnMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0RpdmlzaW9uIG5hbWUgaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgbmFtZSwgaXNJbnRlcm5hbCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknLFxuICAgIFtuYW1lLCBpc0ludGVybmFsID8gMSA6IDBdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgZGl2aXNpb24nIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIGRpdmlzaW9uKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGRpdmlzaW9uJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihkaXZpc2lvbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIGRpdmlzaW9uXG5yb3V0ZXIucHV0KCcvZGl2aXNpb25zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lLCBpc0ludGVybmFsIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGRpdmlzaW9ucyBTRVQgbmFtZSA9ID8sIGlzX2ludGVybmFsID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCBpc0ludGVybmFsID8gMSA6IDAsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIGRpdmlzaW9uJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RpdmlzaW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgZGl2aXNpb24pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHVwZGF0ZWQgZGl2aXNpb24nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKGRpdmlzaW9uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBEZWxldGUgZGl2aXNpb25cbnJvdXRlci5kZWxldGUoJy9kaXZpc2lvbnMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBkaXZpc2lvbicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEaXZpc2lvbiBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RpdmlzaW9uIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gPT09PT0gREVQQVJUTUVOVFMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgZGVwYXJ0bWVudHNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIE9SREVSIEJZIG5hbWUnLCAoZXJyLCBkZXBhcnRtZW50cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRlcGFydG1lbnRzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkZXBhcnRtZW50cycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKGRlcGFydG1lbnRzKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIGRlcGFydG1lbnRcbnJvdXRlci5wb3N0KCcvZGVwYXJ0bWVudHMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ0RlcGFydG1lbnQgbmFtZSBpcyByZXF1aXJlZCcpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICB9XG5cbiAgY29uc3QgeyBuYW1lLCBkaXZpc2lvbklkIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgZGl2aXNpb25JZCB8fCBudWxsXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgZGVwYXJ0bWVudCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkZXBhcnRtZW50cyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBkZXBhcnRtZW50KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGRlcGFydG1lbnQnIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKGRlcGFydG1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBkZXBhcnRtZW50XG5yb3V0ZXIucHV0KCcvZGVwYXJ0bWVudHMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUsIGRpdmlzaW9uSWQgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgZGVwYXJ0bWVudHMgU0VUIG5hbWUgPSA/LCBkaXZpc2lvbl9pZCA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgZGl2aXNpb25JZCB8fCBudWxsLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIGRlcGFydG1lbnQnIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGVwYXJ0bWVudCBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGVwYXJ0bWVudHMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgZGVwYXJ0bWVudCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCBkZXBhcnRtZW50JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihkZXBhcnRtZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBEZWxldGUgZGVwYXJ0bWVudFxucm91dGVyLmRlbGV0ZSgnL2RlcGFydG1lbnRzLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZGVwYXJ0bWVudHMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZGVsZXRlIGRlcGFydG1lbnQnIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGVwYXJ0bWVudCBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RlcGFydG1lbnQgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyA9PT09PSBQUk9DVVJFTUVOVCBURUFNUyBST1VURVMgPT09PT1cblxuLy8gR2V0IGFsbCBwcm9jdXJlbWVudCB0ZWFtc1xucm91dGVyLmdldCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgT1JERVIgQlkgbmFtZScsIChlcnIsIHRlYW1zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHByb2N1cmVtZW50IHRlYW1zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24odGVhbXMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgcHJvY3VyZW1lbnQgdGVhbVxucm91dGVyLnBvc3QoJy9wcm9jdXJlbWVudC10ZWFtcycsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpLFxuICBib2R5KCduYW1lJykubm90RW1wdHkoKS53aXRoTWVzc2FnZSgnVGVhbSBuYW1lIGlzIHJlcXVpcmVkJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IG5hbWUgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsXG4gICAgW25hbWVdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBwcm9jdXJlbWVudCB0ZWFtJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHRlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgdGVhbScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24odGVhbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIHByb2N1cmVtZW50IHRlYW1cbnJvdXRlci5wdXQoJy9wcm9jdXJlbWVudC10ZWFtcy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBwcm9jdXJlbWVudF90ZWFtcyBTRVQgbmFtZSA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBwcm9jdXJlbWVudCB0ZWFtJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2N1cmVtZW50IHRlYW0gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHRlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHVwZGF0ZWQgdGVhbScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24odGVhbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIHByb2N1cmVtZW50IHRlYW1cbnJvdXRlci5kZWxldGUoJy9wcm9jdXJlbWVudC10ZWFtcy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBwcm9jdXJlbWVudCB0ZWFtJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2N1cmVtZW50IHRlYW0gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdQcm9jdXJlbWVudCB0ZWFtIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBib2R5LCB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGF1dGhvcml6ZVJvbGVzIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gPT09PT0gQ09NUExFWElUWSBFU1RJTUFURVMgUk9VVEVTID09PT09XG5cbi8vIEdldCBjb21wbGV4aXR5IGVzdGltYXRlc1xucm91dGVyLmdldCgnL2NvbXBsZXhpdHktZXN0aW1hdGVzJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gY29tcGxleGl0eV9lc3RpbWF0ZXMgT1JERVIgQlkgaWQgREVTQyBMSU1JVCAxJywgKGVyciwgZXN0aW1hdGVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNvbXBsZXhpdHkgZXN0aW1hdGVzJyB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gSWYgbm8gZXN0aW1hdGVzIGV4aXN0LCByZXR1cm4gZGVmYXVsdCB2YWx1ZXNcbiAgICBpZiAoIWVzdGltYXRlcykge1xuICAgICAgZXN0aW1hdGVzID0ge1xuICAgICAgICBpZDogMSxcbiAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMTogNSxcbiAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMjogMTAsXG4gICAgICAgIGVzdGltYXRlX2xldmVsXzM6IDIwXG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbih7XG4gICAgICBlc3RpbWF0ZUxldmVsMTogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzEsXG4gICAgICBlc3RpbWF0ZUxldmVsMjogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzIsXG4gICAgICBlc3RpbWF0ZUxldmVsMzogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzNcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8gVXBkYXRlIGNvbXBsZXhpdHkgZXN0aW1hdGVzXG5yb3V0ZXIucHV0KCcvY29tcGxleGl0eS1lc3RpbWF0ZXMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSwgLy8gQWRtaW4gYW5kIFByb2N1cmVtZW50IE1hbmFnZXJcbiAgYm9keSgnZXN0aW1hdGVMZXZlbDEnKS5pc0ludCh7IG1pbjogMSwgbWF4OiAzNjUgfSkud2l0aE1lc3NhZ2UoJ0xldmVsIDEgZXN0aW1hdGUgbXVzdCBiZSBiZXR3ZWVuIDEtMzY1JyksXG4gIGJvZHkoJ2VzdGltYXRlTGV2ZWwyJykuaXNJbnQoeyBtaW46IDEsIG1heDogMzY1IH0pLndpdGhNZXNzYWdlKCdMZXZlbCAyIGVzdGltYXRlIG11c3QgYmUgYmV0d2VlbiAxLTM2NScpLFxuICBib2R5KCdlc3RpbWF0ZUxldmVsMycpLmlzSW50KHsgbWluOiAxLCBtYXg6IDM2NSB9KS53aXRoTWVzc2FnZSgnTGV2ZWwgMyBlc3RpbWF0ZSBtdXN0IGJlIGJldHdlZW4gMS0zNjUnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgZXN0aW1hdGVMZXZlbDEsIGVzdGltYXRlTGV2ZWwyLCBlc3RpbWF0ZUxldmVsMyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBGaXJzdCBjaGVjayBpZiByZWNvcmQgZXhpc3RzXG4gIGRiLmdldCgnU0VMRUNUIGlkIEZST00gY29tcGxleGl0eV9lc3RpbWF0ZXMgTElNSVQgMScsIChlcnIsIGV4aXN0aW5nKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIHJlY29yZFxuICAgICAgZGIucnVuKFxuICAgICAgICAnVVBEQVRFIGNvbXBsZXhpdHlfZXN0aW1hdGVzIFNFVCBlc3RpbWF0ZV9sZXZlbF8xID0gPywgZXN0aW1hdGVfbGV2ZWxfMiA9ID8sIGVzdGltYXRlX2xldmVsXzMgPSA/LCB1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAgV0hFUkUgaWQgPSA/JyxcbiAgICAgICAgW2VzdGltYXRlTGV2ZWwxLCBlc3RpbWF0ZUxldmVsMiwgZXN0aW1hdGVMZXZlbDMsIGV4aXN0aW5nLmlkXSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBjb21wbGV4aXR5IGVzdGltYXRlcycgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgICAgZXN0aW1hdGVMZXZlbDEsXG4gICAgICAgICAgICBlc3RpbWF0ZUxldmVsMixcbiAgICAgICAgICAgIGVzdGltYXRlTGV2ZWwzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluc2VydCBuZXcgcmVjb3JkXG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgSU5UTyBjb21wbGV4aXR5X2VzdGltYXRlcyAoZXN0aW1hdGVfbGV2ZWxfMSwgZXN0aW1hdGVfbGV2ZWxfMiwgZXN0aW1hdGVfbGV2ZWxfMykgVkFMVUVTICg/LCA/LCA/KScsXG4gICAgICAgIFtlc3RpbWF0ZUxldmVsMSwgZXN0aW1hdGVMZXZlbDIsIGVzdGltYXRlTGV2ZWwzXSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBjb21wbGV4aXR5IGVzdGltYXRlcycgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgICAgZXN0aW1hdGVMZXZlbDEsXG4gICAgICAgICAgICBlc3RpbWF0ZUxldmVsMixcbiAgICAgICAgICAgIGVzdGltYXRlTGV2ZWwzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG4vLyA9PT09PSBBQ0NFUFRBTkNFIE9QVElPTlMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgYWNjZXB0YW5jZSBvcHRpb25zXG5yb3V0ZXIuZ2V0KCcvYWNjZXB0YW5jZS1vcHRpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIE9SREVSIEJZIHllYXJfaWQgREVTQycsIChlcnIsIG9wdGlvbnMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBhY2NlcHRhbmNlIG9wdGlvbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGFjY2VwdGFuY2Ugb3B0aW9ucycgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYW5zZm9ybSB0byBtYXRjaCBmcm9udGVuZCBmb3JtYXRcbiAgICBjb25zdCB0cmFuc2Zvcm1lZE9wdGlvbnMgPSBvcHRpb25zLm1hcChvcHRpb24gPT4gKHtcbiAgICAgIGlkOiBvcHRpb24uaWQsXG4gICAgICB5ZWFySWQ6IG9wdGlvbi55ZWFyX2lkLFxuICAgICAgdXBsb2FkQ29kZTogb3B0aW9uLnVwbG9hZF9jb2RlLFxuICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiBvcHRpb24udXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICBicm9hZE1lYW5pbmc6IG9wdGlvbi5icm9hZF9tZWFuaW5nXG4gICAgfSkpO1xuICAgIFxuICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkT3B0aW9ucyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLnBvc3QoJy9hY2NlcHRhbmNlLW9wdGlvbnMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSwgLy8gQWRtaW4gYW5kIFByb2N1cmVtZW50IE1hbmFnZXJcbiAgYm9keSgneWVhcklkJykuaXNJbnQoeyBtaW46IDIwMjAsIG1heDogMjA1MCB9KS53aXRoTWVzc2FnZSgnWWVhciBtdXN0IGJlIGJldHdlZW4gMjAyMC0yMDUwJyksXG4gIGJvZHkoJ3VwbG9hZENvZGUnKS5pc0luKFsnUGxhbicsICdMYXRlJywgJ0Jsb2NrJywgJ0ZpbmlzaCddKS53aXRoTWVzc2FnZSgnSW52YWxpZCB1cGxvYWQgY29kZScpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICB9XG5cbiAgY29uc3QgeyB5ZWFySWQsIHVwbG9hZENvZGUsIGJyb2FkTWVhbmluZyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBDaGVjayBpZiB5ZWFyIGFscmVhZHkgZXhpc3RzXG4gIGRiLmdldCgnU0VMRUNUIGlkIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIHllYXJfaWQgPSA/JywgW3llYXJJZF0sIChlcnIsIGV4aXN0aW5nKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgeWVhcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogYFllYXIgJHt5ZWFySWR9IGFscmVhZHkgZXhpc3RzYCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdXBsb2FkIGNvZGUgZGVzY3JpcHRpb25cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb25zID0ge1xuICAgICAgJ1BsYW4nOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAgICdMYXRlJzogJ1x1MDVERVx1MDVEMFx1MDVEN1x1MDVFOCcsXG4gICAgICAnQmxvY2snOiAnXHUwNUQ3XHUwNUUxXHUwNUQ1XHUwNUREJyxcbiAgICAgICdGaW5pc2gnOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJ1xuICAgIH07XG5cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb24gPSB1cGxvYWRDb2RlRGVzY3JpcHRpb25zW3VwbG9hZENvZGVdO1xuXG4gICAgZGIucnVuKFxuICAgICAgJ0lOU0VSVCBJTlRPIGFjY2VwdGFuY2Vfb3B0aW9ucyAoeWVhcl9pZCwgdXBsb2FkX2NvZGUsIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLCBicm9hZF9tZWFuaW5nKSBWQUxVRVMgKD8sID8sID8sID8pJyxcbiAgICAgIFt5ZWFySWQsIHVwbG9hZENvZGUsIHVwbG9hZENvZGVEZXNjcmlwdGlvbiwgYnJvYWRNZWFuaW5nIHx8IG51bGxdLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBhY2NlcHRhbmNlIG9wdGlvbicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIG9wdGlvbikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgb3B0aW9uJyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZE9wdGlvbiA9IHtcbiAgICAgICAgICAgIGlkOiBvcHRpb24uaWQsXG4gICAgICAgICAgICB5ZWFySWQ6IG9wdGlvbi55ZWFyX2lkLFxuICAgICAgICAgICAgdXBsb2FkQ29kZTogb3B0aW9uLnVwbG9hZF9jb2RlLFxuICAgICAgICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiBvcHRpb24udXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBicm9hZE1lYW5pbmc6IG9wdGlvbi5icm9hZF9tZWFuaW5nXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHRyYW5zZm9ybWVkT3B0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59KTtcblxuLy8gVXBkYXRlIGFjY2VwdGFuY2Ugb3B0aW9uXG5yb3V0ZXIucHV0KCcvYWNjZXB0YW5jZS1vcHRpb25zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDEpLCAvLyBBZG1pbiBhbmQgUHJvY3VyZW1lbnQgTWFuYWdlclxuICBib2R5KCd5ZWFySWQnKS5pc0ludCh7IG1pbjogMjAyMCwgbWF4OiAyMDUwIH0pLndpdGhNZXNzYWdlKCdZZWFyIG11c3QgYmUgYmV0d2VlbiAyMDIwLTIwNTAnKSxcbiAgYm9keSgndXBsb2FkQ29kZScpLmlzSW4oWydQbGFuJywgJ0xhdGUnLCAnQmxvY2snLCAnRmluaXNoJ10pLndpdGhNZXNzYWdlKCdJbnZhbGlkIHVwbG9hZCBjb2RlJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IHllYXJJZCwgdXBsb2FkQ29kZSwgYnJvYWRNZWFuaW5nIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIENoZWNrIGlmIHllYXIgYWxyZWFkeSBleGlzdHMgZm9yIGRpZmZlcmVudCByZWNvcmRcbiAgZGIuZ2V0KCdTRUxFQ1QgaWQgRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgeWVhcl9pZCA9ID8gQU5EIGlkICE9ID8nLCBbeWVhcklkLCBpZF0sIChlcnIsIGV4aXN0aW5nKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgeWVhcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogYFllYXIgJHt5ZWFySWR9IGFscmVhZHkgZXhpc3RzYCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdXBsb2FkIGNvZGUgZGVzY3JpcHRpb25cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb25zID0ge1xuICAgICAgJ1BsYW4nOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAgICdMYXRlJzogJ1x1MDVERVx1MDVEMFx1MDVEN1x1MDVFOCcsXG4gICAgICAnQmxvY2snOiAnXHUwNUQ3XHUwNUUxXHUwNUQ1XHUwNUREJyxcbiAgICAgICdGaW5pc2gnOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJ1xuICAgIH07XG5cbiAgICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb24gPSB1cGxvYWRDb2RlRGVzY3JpcHRpb25zW3VwbG9hZENvZGVdO1xuXG4gICAgZGIucnVuKFxuICAgICAgJ1VQREFURSBhY2NlcHRhbmNlX29wdGlvbnMgU0VUIHllYXJfaWQgPSA/LCB1cGxvYWRfY29kZSA9ID8sIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uID0gPywgYnJvYWRfbWVhbmluZyA9ID8sIHVwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCBXSEVSRSBpZCA9ID8nLFxuICAgICAgW3llYXJJZCwgdXBsb2FkQ29kZSwgdXBsb2FkQ29kZURlc2NyaXB0aW9uLCBicm9hZE1lYW5pbmcgfHwgbnVsbCwgaWRdLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBhY2NlcHRhbmNlIG9wdGlvbicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBub3QgZm91bmQnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCBvcHRpb24pID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIG9wdGlvbicgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRPcHRpb24gPSB7XG4gICAgICAgICAgICBpZDogb3B0aW9uLmlkLFxuICAgICAgICAgICAgeWVhcklkOiBvcHRpb24ueWVhcl9pZCxcbiAgICAgICAgICAgIHVwbG9hZENvZGU6IG9wdGlvbi51cGxvYWRfY29kZSxcbiAgICAgICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogb3B0aW9uLnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgYnJvYWRNZWFuaW5nOiBvcHRpb24uYnJvYWRfbWVhbmluZ1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuanNvbih0cmFuc2Zvcm1lZE9wdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufSk7XG5cbi8vIERlbGV0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLmRlbGV0ZSgnL2FjY2VwdGFuY2Utb3B0aW9ucy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSAvLyBBZG1pbiBhbmQgUHJvY3VyZW1lbnQgTWFuYWdlclxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZGVsZXRlIGFjY2VwdGFuY2Ugb3B0aW9uJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjY2VwdGFuY2Ugb3B0aW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnQWNjZXB0YW5jZSBvcHRpb24gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzL3NlZWREYXRhYmFzZS5qc1wiO2ltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UsIGluaXRpYWxpemVEYXRhYmFzZSwgY2xvc2VEYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlZWREYXRhYmFzZSgpIHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ1NlZWRpbmcgZGF0YWJhc2Ugd2l0aCBpbml0aWFsIGRhdGEuLi4nKTtcbiAgICBcbiAgICAvLyBTZWVkIG9yZ2FuaXphdGlvbmFsIHJvbGVzIGZpcnN0XG4gICAgY29uc3Qgcm9sZXMgPSBbXG4gICAgICB7IHJvbGVDb2RlOiAwLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVFOFx1MDVFOVx1MDVEMFx1MDVENVx1MDVFQSBcdTA1REVcdTA1RENcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNURDXHUwNUUwXHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNURDIFx1MDVENFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDEsIGRlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUU4XHUwNUU5XHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNURCXHUwNURDIFx1MDVFQVx1MDVENFx1MDVEQ1x1MDVEOVx1MDVEQlx1MDVEOSBcdTA1RDRcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICB7IHJvbGVDb2RlOiAyLCBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEMFx1MDVFOSBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNUUwXHUwNUQ5XHUwNUREIFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiAzLCBkZXNjcmlwdGlvbjogJ1x1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVERicsIHBlcm1pc3Npb25zOiAnXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyIFx1MDVFNFx1MDVFMlx1MDVEOVx1MDVEQ1x1MDVENVx1MDVEOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVERVx1MDVFOVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEMVx1MDVFN1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMFx1MDVEN1x1MDVFOCBcdTA1RTFcdTA1RDhcdTA1RDhcdTA1RDVcdTA1RTEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDJcdTA1RDNcdTA1RThcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENVx1MDVEOFx1MDVEMVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RTJcdTA1RDZcdTA1RTgnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVFQSBcdTA1RUFcdTA1RTlcdTA1RUFcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUQ0XHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyB9XG4gICAgXTtcbiAgICBcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZSgnSU5TRVJUIE9SIElHTk9SRSBJTlRPIG9yZ2FuaXphdGlvbmFsX3JvbGVzIChyb2xlX2NvZGUsIGRlc2NyaXB0aW9uLCBwZXJtaXNzaW9ucykgVkFMVUVTICg/LCA/LCA/KScpO1xuICAgICAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgICAgICBzdG10LnJ1bihbcm9sZS5yb2xlQ29kZSwgcm9sZS5kZXNjcmlwdGlvbiwgcm9sZS5wZXJtaXNzaW9uc10pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFNlZWQgZGl2aXNpb25zXG4gICAgY29uc3QgZGl2aXNpb25zID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQwXHUwNUQyXHUwNUUzIFx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycsIGlzSW50ZXJuYWw6IHRydWUgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RTlcdTA1RDlcdTA1RDVcdTA1RDVcdTA1RTcnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDcgXHUwNUQ3XHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUwXHUwNUQ5IFx1MDVEMCcsIGlzSW50ZXJuYWw6IGZhbHNlIH1cbiAgICBdO1xuICAgIFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScpO1xuICAgICAgICBmb3IgKGNvbnN0IGRpdmlzaW9uIG9mIGRpdmlzaW9ucykge1xuICAgICAgICAgIHN0bXQucnVuKFtkaXZpc2lvbi5uYW1lLCBkaXZpc2lvbi5pc0ludGVybmFsXSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RtdC5maW5hbGl6ZSgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gU2VlZCBkZXBhcnRtZW50cyAoYWZ0ZXIgZGl2aXNpb25zKVxuICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVENCcsIGRpdmlzaW9uSWQ6IDEgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQScsIGRpdmlzaW9uSWQ6IDIgfVxuICAgIF07XG4gICAgXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUoJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBkZXBhcnRtZW50cyAobmFtZSwgZGl2aXNpb25faWQpIFZBTFVFUyAoPywgPyknKTtcbiAgICAgICAgZm9yIChjb25zdCBkZXB0IG9mIGRlcGFydG1lbnRzKSB7XG4gICAgICAgICAgc3RtdC5ydW4oW2RlcHQubmFtZSwgZGVwdC5kaXZpc2lvbklkXSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RtdC5maW5hbGl6ZSgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gU2VlZCBwcm9jdXJlbWVudCB0ZWFtc1xuICAgIGNvbnN0IHRlYW1zID0gW1xuICAgICAgJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScsICdcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknLCAnXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JywgJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsICdcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDknLCAnXHUwNUQxXHUwNUQ5XHUwNUQ4XHUwNUQ3XHUwNUQ1XHUwNUUwXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUoJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScpO1xuICAgICAgICBmb3IgKGNvbnN0IHRlYW0gb2YgdGVhbXMpIHtcbiAgICAgICAgICBzdG10LnJ1bihbdGVhbV0pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFNlZWQgZG9tYWluc1xuICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCBcdTA1RDVcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLFxuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDlcdTA1REQgXHUwNURFXHUwNUU3XHUwNUU2XHUwNUQ1XHUwNUUyXHUwNUQ5XHUwNUQ5XHUwNUREJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVERVx1MDVFOVx1MDVFOFx1MDVEM1x1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZG9tYWlucyAoZGVzY3JpcHRpb24pIFZBTFVFUyAoPyknKTtcbiAgICAgICAgZm9yIChjb25zdCBkb21haW4gb2YgZG9tYWlucykge1xuICAgICAgICAgIHN0bXQucnVuKFtkb21haW5dKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10LmZpbmFsaXplKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTlcdTA1RDVcdTA1RDVcdTA1RDBcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNURCXHUwNUUwXHUwNUVBIFx1MDVERVx1MDVFNFx1MDVFOFx1MDVEOCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCB0b29sczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDgsIFx1MDVEOVx1MDVEOVx1MDVFMlx1MDVENVx1MDVFNSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQgXHUwNURFXHUwNURCXHUwNUU4XHUwNUQ2JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNURELCBcdTA1RDBcdTA1RUFcdTA1RTggXHUwNUQ0XHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNURFXHUwNUQ4XHUwNUU4XHUwNUQ5XHUwNUU2XHUwNUVBIFx1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENCwgXHUwNUQ1XHUwNUUyXHUwNUQzXHUwNUVBIFx1MDVEMVx1MDVEN1x1MDVEOVx1MDVFMFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RDZcdTA1RDVcdTA1REJcdTA1RDQnLCB0b29sczogJ1x1MDVFNFx1MDVFOFx1MDVENVx1MDVEOFx1MDVENVx1MDVFN1x1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDdcdTA1RENcdTA1RDhcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDdcdTA1RUFcdTA1RDlcdTA1REVcdTA1RDQgXHUwNUUyXHUwNURDIFx1MDVENFx1MDVFMVx1MDVEQlx1MDVERCcsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDdcdTA1RDVcdTA1RDZcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RTdcdTA1RThcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgdG9vbHM6ICdcdTA1RThcdTA1RTlcdTA1RDlcdTA1REVcdTA1RUEgXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUQ1XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1REJcdTA1RTFcdTA1RTRcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVFNFx1MDVFOFx1MDVENVx1MDVEOVx1MDVFN1x1MDVEOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sczogJ1x1MDVEM1x1MDVENVx1MDVENyBcdTA1RTFcdTA1RDlcdTA1REJcdTA1RDVcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgXTtcbiAgICBcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZSgnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGFjdGl2aXR5X3Bvb2wgKG5hbWUsIHRvb2xzX2FuZF9yZXNvdXJjZXMpIFZBTFVFUyAoPywgPyknKTtcbiAgICAgICAgZm9yIChjb25zdCBhY3Rpdml0eSBvZiBhY3Rpdml0aWVzKSB7XG4gICAgICAgICAgc3RtdC5ydW4oW2FjdGl2aXR5Lm5hbWUsIGFjdGl2aXR5LnRvb2xzXSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RtdC5maW5hbGl6ZSgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gU2VlZCBlbmdhZ2VtZW50IHR5cGVzXG4gICAgY29uc3QgZW5nYWdlbWVudFR5cGVzID0gW1xuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RDVcdTA1REVcdTA1RDFcdTA1RDknLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1REVcdTA1RDVcdTA1RDJcdTA1RDFcdTA1REMnLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUoJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBlbmdhZ2VtZW50X3R5cGVzIChuYW1lKSBWQUxVRVMgKD8pJyk7XG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBlbmdhZ2VtZW50VHlwZXMpIHtcbiAgICAgICAgICBzdG10LnJ1bihbdHlwZV0pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gU2VlZCBjb21wbGV4aXR5IGVzdGltYXRlcyAoc2luZ2xlIHJlY29yZClcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5ydW4oYFxuICAgICAgICBJTlNFUlQgT1IgSUdOT1JFIElOVE8gY29tcGxleGl0eV9lc3RpbWF0ZXMgKGlkLCBlc3RpbWF0ZV9sZXZlbF8xLCBlc3RpbWF0ZV9sZXZlbF8yLCBlc3RpbWF0ZV9sZXZlbF8zKSBcbiAgICAgICAgVkFMVUVTICgxLCA1LCAxMCwgMjApXG4gICAgICBgLCAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gU2VlZCBhY2NlcHRhbmNlIG9wdGlvbnNcbiAgICBjb25zdCBhY2NlcHRhbmNlT3B0aW9ucyA9IFtcbiAgICAgIHtcbiAgICAgICAgeWVhcklkOiAyMDI0LFxuICAgICAgICB1cGxvYWRDb2RlOiAnRmluaXNoJyxcbiAgICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJyxcbiAgICAgICAgYnJvYWRNZWFuaW5nOiAnXHUwNUU5XHUwNUUwXHUwNUVBIDIwMjQgXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNURFXHUwNUQ0IFx1MDVENVx1MDVEQ1x1MDVEMCBcdTA1RTBcdTA1RDlcdTA1RUFcdTA1REYgXHUwNURDXHUwNUQ0XHUwNUUyXHUwNURDXHUwNUQ1XHUwNUVBIFx1MDVEM1x1MDVFOFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFQSBcdTA1RDdcdTA1RDNcdTA1RTlcdTA1RDVcdTA1RUEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB5ZWFySWQ6IDIwMjUsXG4gICAgICAgIHVwbG9hZENvZGU6ICdQbGFuJyxcbiAgICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAgICAgYnJvYWRNZWFuaW5nOiAnXHUwNUU0XHUwNUVBXHUwNUQ1XHUwNUQ3IFx1MDVEQ1x1MDVFN1x1MDVEQ1x1MDVEOVx1MDVEOFx1MDVFQSBcdTA1RDNcdTA1RThcdTA1RDlcdTA1RTlcdTA1RDVcdTA1RUEgXHUwNUQ3XHUwNUQzXHUwNUU5XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFOVx1MDVFMFx1MDVFQSAyMDI1J1xuICAgICAgfVxuICAgIF07XG5cbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZShgXG4gICAgICAgICAgSU5TRVJUIE9SIElHTk9SRSBJTlRPIGFjY2VwdGFuY2Vfb3B0aW9ucyAoeWVhcl9pZCwgdXBsb2FkX2NvZGUsIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLCBicm9hZF9tZWFuaW5nKSBcbiAgICAgICAgICBWQUxVRVMgKD8sID8sID8sID8pXG4gICAgICAgIGApO1xuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBhY2NlcHRhbmNlT3B0aW9ucykge1xuICAgICAgICAgIHN0bXQucnVuKFtvcHRpb24ueWVhcklkLCBvcHRpb24udXBsb2FkQ29kZSwgb3B0aW9uLnVwbG9hZENvZGVEZXNjcmlwdGlvbiwgb3B0aW9uLmJyb2FkTWVhbmluZ10pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IGFkbWluIHVzZXIgKGFmdGVyIG9yZ2FuaXphdGlvbmFsX3JvbGVzIGlzIHBvcHVsYXRlZClcbiAgICBjb25zdCBhZG1pblBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgIGBJTlNFUlQgT1IgSUdOT1JFIElOVE8gdXNlcnMgKFxuICAgICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCwgZW1haWxcbiAgICAgICAgKSBWQUxVRVMgKD8sID8sID8sID8sID8sID8pYCxcbiAgICAgICAgWyc5OTk5JywgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCA5LCAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVEOScsIGFkbWluUGFzc3dvcmQsICdhZG1pbkBzeXN0ZW0uY29tJ10sXG4gICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBDcmVhdGUgc2FtcGxlIHByb2N1cmVtZW50IG1hbmFnZXIgKGFmdGVyIG9yZ2FuaXphdGlvbmFsX3JvbGVzIGlzIHBvcHVsYXRlZClcbiAgICBjb25zdCBtYW5hZ2VyUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaCgnMTIzNDU2JywgMTIpO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgYElOU0VSVCBPUiBJR05PUkUgSU5UTyB1c2VycyAoXG4gICAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgICBwYXNzd29yZF9oYXNoLCBwcm9jdXJlbWVudF90ZWFtLCBhdmFpbGFibGVfd29ya19kYXlzXG4gICAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICAgIFsnMTAwMScsICdcdTA1RDBcdTA1RDFcdTA1RThcdTA1RDRcdTA1REQgXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDJywgMSwgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBtYW5hZ2VyUGFzc3dvcmQsICdcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RDNcdTA1RDknLCAyMDBdLFxuICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHkhJyk7XG4gICAgY29uc29sZS5sb2coJ0RlZmF1bHQgdXNlcnMgY3JlYXRlZDonKTtcbiAgICBjb25zb2xlLmxvZygnLSBBZG1pbjogOTk5OSAvIDEyMzQ1NicpO1xuICAgIGNvbnNvbGUubG9nKCctIE1hbmFnZXI6IDEwMDEgLyAxMjM0NTYnKTtcbiAgICBcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VlZCBkYXRhYmFzZTonLCBlcnJvcik7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbmV4cG9ydCB7IHNlZWREYXRhYmFzZSB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCBoZWxtZXQgZnJvbSAnaGVsbWV0JztcbmltcG9ydCBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgcmF0ZUxpbWl0IGZyb20gJ2V4cHJlc3MtcmF0ZS1saW1pdCc7XG5pbXBvcnQgeyBpbml0aWFsaXplRGF0YWJhc2UgfSBmcm9tICcuL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgYXV0aFJvdXRlcyBmcm9tICcuL3JvdXRlcy9hdXRoLmpzJztcbmltcG9ydCB3b3JrZXJzUm91dGVzIGZyb20gJy4vcm91dGVzL3dvcmtlcnMuanMnO1xuaW1wb3J0IHN5c3RlbVJvdXRlcyBmcm9tICcuL3JvdXRlcy9zeXN0ZW0uanMnO1xuaW1wb3J0IHBsYW5uaW5nUm91dGVzIGZyb20gJy4vcm91dGVzL3BsYW5uaW5nLmpzJztcblxuLy8gRW52aXJvbm1lbnQgdmFyaWFibGVzXG5wcm9jZXNzLmVudi5KV1RfU0VDUkVUID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAneW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtdGhpcy1pbi1wcm9kdWN0aW9uJztcbnByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOID0gcHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gfHwgJzI0aCc7XG5wcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTID0gcHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyB8fCAnMTInO1xuXG5sZXQgZXhwcmVzc0FwcCA9IG51bGw7XG5sZXQgaXNBcHBJbml0aWFsaXplZCA9IGZhbHNlO1xuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeHByZXNzQXBwKCkge1xuICBpZiAoZXhwcmVzc0FwcCkge1xuICAgIHJldHVybiBleHByZXNzQXBwO1xuICB9XG5cbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4gIC8vIFNlY3VyaXR5IG1pZGRsZXdhcmVcbiAgYXBwLnVzZShoZWxtZXQoe1xuICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeTogZmFsc2UsIC8vIERpc2FibGUgQ1NQIGZvciBkZXZlbG9wbWVudFxuICB9KSk7XG4gIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG5cbiAgLy8gUmF0ZSBsaW1pdGluZ1xuICBjb25zdCBsaW1pdGVyID0gcmF0ZUxpbWl0KHtcbiAgICB3aW5kb3dNczogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcbiAgICBtYXg6IDEwMDAsIC8vIEluY3JlYXNlZCBsaW1pdCBmb3IgZGV2ZWxvcG1lbnRcbiAgICBtZXNzYWdlOiB7IGVycm9yOiAnVG9vIG1hbnkgcmVxdWVzdHMgZnJvbSB0aGlzIElQLCBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicgfVxuICB9KTtcbiAgYXBwLnVzZShsaW1pdGVyKTtcblxuICAvLyBDT1JTIGNvbmZpZ3VyYXRpb25cbiAgYXBwLnVzZShjb3JzKHtcbiAgICBvcmlnaW46IHRydWUsIC8vIEFsbG93IGFsbCBvcmlnaW5zIGluIGRldmVsb3BtZW50XG4gICAgY3JlZGVudGlhbHM6IHRydWUsXG4gICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICBhbGxvd2VkSGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbiddXG4gIH0pKTtcblxuICAvLyBCb2R5IHBhcnNpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKGV4cHJlc3MuanNvbih7IGxpbWl0OiAnMTBtYicgfSkpO1xuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcblxuICAvLyBMb2dnaW5nXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2RldicpKTtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgZGF0YWJhc2Ugb25seSBvbmNlXG4gIGlmICghaXNBcHBJbml0aWFsaXplZCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2UgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICBcbiAgICAgIC8vIFNlZWQgZGF0YWJhc2VcbiAgICAgIGNvbnN0IHsgc2VlZERhdGFiYXNlIH0gPSBhd2FpdCBpbXBvcnQoJy4vc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMnKTtcbiAgICAgIGF3YWl0IHNlZWREYXRhYmFzZSgpO1xuICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBEYXRhYmFzZSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICBcbiAgICAgIGlzQXBwSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRmFpbGVkIHRvIGluaXRpYWxpemUgZGF0YWJhc2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhlYWx0aCBjaGVjayBlbmRwb2ludFxuICBhcHAuZ2V0KCcvaGVhbHRoJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLmpzb24oeyBcbiAgICAgIHN0YXR1czogJ09LJywgXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gQVBJIFJvdXRlc1xuICBhcHAudXNlKCcvYXV0aCcsIGF1dGhSb3V0ZXMpO1xuICBhcHAudXNlKCcvd29ya2VycycsIHdvcmtlcnNSb3V0ZXMpO1xuICBhcHAudXNlKCcvc3lzdGVtJywgc3lzdGVtUm91dGVzKTtcbiAgYXBwLnVzZSgnL3BsYW5uaW5nJywgcGxhbm5pbmdSb3V0ZXMpO1xuXG4gIC8vIEVycm9yIGhhbmRsaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZSgoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSBFcnJvcjonLCBlcnIpO1xuICAgIFxuICAgIGlmIChlcnIudHlwZSA9PT0gJ2VudGl0eS5wYXJzZS5mYWlsZWQnKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgSlNPTiBmb3JtYXQnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuc3RhdHVzKGVyci5zdGF0dXMgfHwgNTAwKS5qc29uKHtcbiAgICAgIGVycm9yOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nIFxuICAgICAgICA/ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIFxuICAgICAgICA6IGVyci5tZXNzYWdlXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIDQwNCBoYW5kbGVyIGZvciBBUEkgcm91dGVzXG4gIGFwcC51c2UoJyonLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQVBJIHJvdXRlIG5vdCBmb3VuZCcgfSk7XG4gIH0pO1xuXG4gIGV4cHJlc3NBcHAgPSBhcHA7XG4gIGNvbnNvbGUubG9nKCdcdTI3MDUgRXhwcmVzcyBhcHAgY3JlYXRlZCBhbmQgY29uZmlndXJlZCcpO1xuICByZXR1cm4gYXBwO1xufVxuXG5leHBvcnQgeyBjcmVhdGVFeHByZXNzQXBwIH07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBTZXQgY29uc2lzdGVudCBkYXRhYmFzZSBwYXRoIGJlZm9yZSBhbnkgc2VydmVyIG1vZHVsZXMgYXJlIGltcG9ydGVkXG5wcm9jZXNzLmVudi5EQl9QQVRIID0gJy4vc3JjL3NlcnZlci9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIG1pZGRsZXdhcmVNb2RlOiBmYWxzZSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gaW50ZWdyYXRlIEV4cHJlc3Mgc2VydmVyXG4gICAge1xuICAgICAgbmFtZTogJ2V4cHJlc3MtaW50ZWdyYXRpb24nLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAvLyBJbXBvcnQgYW5kIHNldHVwIEV4cHJlc3Mgcm91dGVzXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGknLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IHRoZSBFeHByZXNzIGFwcFxuICAgICAgICAgICAgY29uc3QgeyBjcmVhdGVFeHByZXNzQXBwIH0gPSBhd2FpdCBpbXBvcnQoJy4vc3JjL3NlcnZlci9leHByZXNzLWFwcC5qcycpO1xuICAgICAgICAgICAgY29uc3QgZXhwcmVzc0FwcCA9IGF3YWl0IGNyZWF0ZUV4cHJlc3NBcHAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSByZXF1ZXN0IHdpdGggRXhwcmVzc1xuICAgICAgICAgICAgZXhwcmVzc0FwcChyZXEsIHJlcywgbmV4dCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cHJlc3MgbWlkZGxld2FyZSBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICBuZXh0KGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTsiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7OztBQUF5USxPQUFPLGFBQWE7QUFDN1Is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LElBQUksY0FBYztBQUNuRCxZQUFRLElBQUksaUJBQWlCLFFBQVEsSUFBSSxrQkFBa0I7QUFDM0QsWUFBUSxJQUFJLGdCQUFnQixRQUFRLElBQUksaUJBQWlCO0FBRXpELElBQUksYUFBYTtBQUNqQixJQUFJLG1CQUFtQjtBQUFBO0FBQUE7OztBQ2xCa00sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU9DLFdBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsUUFBUSxJQUFJLFVBQVU7QUFHdEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixnQkFBZ0I7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQTtBQUFBLElBRWhCO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixnQkFBZ0IsUUFBUTtBQUV0QixlQUFPLFlBQVksSUFBSSxRQUFRLE9BQU8sS0FBSyxLQUFLLFNBQVM7QUFDdkQsY0FBSTtBQUVGLGtCQUFNLEVBQUUsa0JBQUFDLGtCQUFpQixJQUFJLE1BQU07QUFDbkMsa0JBQU1DLGNBQWEsTUFBTUQsa0JBQWlCO0FBRzFDLFlBQUFDLFlBQVcsS0FBSyxLQUFLLElBQUk7QUFBQSxVQUMzQixTQUFTLE9BQU87QUFDZCxvQkFBUSxNQUFNLDZCQUE2QixLQUFLO0FBQ2hELGlCQUFLLEtBQUs7QUFBQSxVQUNaO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBS0MsTUFBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJkYiIsICJlcnIiLCAiand0IiwgImluaXRfYXV0aCIsICJkYiIsICJleHByZXNzIiwgImJjcnlwdCIsICJib2R5IiwgInZhbGlkYXRpb25SZXN1bHQiLCAicm91dGVyIiwgImRiIiwgImVyciIsICJleHByZXNzIiwgImJvZHkiLCAidmFsaWRhdGlvblJlc3VsdCIsICJyb3V0ZXIiLCAiZGIiLCAiZXJyIiwgImV4cHJlc3MiLCAiYm9keSIsICJ2YWxpZGF0aW9uUmVzdWx0IiwgInJvdXRlciIsICJkYiIsICJlcnIiLCAiYmNyeXB0IiwgImRiIiwgImV4cHJlc3MiLCAic2VlZERhdGFiYXNlIiwgImluaXRfYXV0aCIsICJwYXRoIiwgImNyZWF0ZUV4cHJlc3NBcHAiLCAiZXhwcmVzc0FwcCIsICJwYXRoIl0KfQo=
