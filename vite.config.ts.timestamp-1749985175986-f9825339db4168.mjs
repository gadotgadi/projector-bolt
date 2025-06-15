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
      console.log("\u{1F50D} API: Getting organizational roles...");
      const db2 = getDatabase();
      db2.all("SELECT * FROM organizational_roles ORDER BY role_code", (err, roles) => {
        if (err) {
          console.error("\u274C Error fetching organizational roles:", err);
          return res.status(500).json({ error: "Failed to fetch organizational roles" });
        }
        console.log("\u2705 Fetched organizational roles from DB:", roles);
        const transformedRoles = roles.map((role) => ({
          id: role.id,
          roleCode: role.role_code,
          description: role.description,
          permissions: role.permissions
        }));
        console.log("\u2705 Transformed roles for frontend:", transformedRoles);
        res.json(transformedRoles);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3N5c3RlbS5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qcyIsICJzcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzIiwgInNyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtpbXBvcnQgc3FsaXRlMyBmcm9tICdzcWxpdGUzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gVXNlIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBzZXQgaW4gdml0ZS5jb25maWcudHMsIHdpdGggZmFsbGJhY2tcbmNvbnN0IERCX1BBVEggPSBwcm9jZXNzLmVudi5EQl9QQVRIIHx8ICcuL3NyYy9zZXJ2ZXIvZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbi8vIEVuc3VyZSBkYXRhIGRpcmVjdG9yeSBleGlzdHNcbmNvbnN0IGRhdGFEaXIgPSBwYXRoLmRpcm5hbWUoREJfUEFUSCk7XG5pZiAoIWZzLmV4aXN0c1N5bmMoZGF0YURpcikpIHtcbiAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGEgZGlyZWN0b3J5OicsIGRhdGFEaXIpO1xuICBmcy5ta2RpclN5bmMoZGF0YURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG59XG5cbmxldCBkYiA9IG51bGw7XG5sZXQgaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBnZXREYXRhYmFzZSgpIHtcbiAgaWYgKCFkYikge1xuICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgZGIgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZShEQl9QQVRILCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgZGF0YWJhc2U6JywgZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBTUUxpdGUgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gRW5hYmxlIGZvcmVpZ24ga2V5c1xuICAgIGRiLnJ1bignUFJBR01BIGZvcmVpZ25fa2V5cyA9IE9OJyk7XG4gIH1cbiAgcmV0dXJuIGRiO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0aWFsaXplRGF0YWJhc2UoKSB7XG4gIC8vIFByZXZlbnQgbXVsdGlwbGUgaW5pdGlhbGl6YXRpb25zXG4gIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGFscmVhZHkgaW5pdGlhbGl6ZWQsIHNraXBwaW5nLi4uJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGFiYXNlIHRhYmxlcy4uLicpO1xuICAgICAgXG4gICAgICAvLyBPcmdhbml6YXRpb25hbCByb2xlcyB0YWJsZSAobXVzdCBiZSBjcmVhdGVkIGJlZm9yZSB1c2VycylcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG9yZ2FuaXphdGlvbmFsX3JvbGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgcm9sZV9jb2RlIElOVEVHRVIgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgcGVybWlzc2lvbnMgVEVYVFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGl2aXNpb25zIHRhYmxlIChtdXN0IGJlIGNyZWF0ZWQgYmVmb3JlIHVzZXJzIGFuZCBkZXBhcnRtZW50cylcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGVwYXJ0bWVudHMgdGFibGUgKG11c3QgYmUgY3JlYXRlZCBiZWZvcmUgdXNlcnMpXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkZXBhcnRtZW50cyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9jdXJlbWVudCB0ZWFtcyB0YWJsZSAobXVzdCBiZSBjcmVhdGVkIGJlZm9yZSB1c2VycylcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2N1cmVtZW50X3RlYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBVc2VycyB0YWJsZSAod2l0aCBwcm9wZXIgZm9yZWlnbiBrZXkgY29uc3RyYWludHMpXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyB1c2VycyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVtcGxveWVlX2lkIFRFWFQgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGZ1bGxfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBwcm9jdXJlbWVudF90ZWFtIFRFWFQsXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGF2YWlsYWJsZV93b3JrX2RheXMgSU5URUdFUixcbiAgICAgICAgICBlbWFpbCBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHJvbGVfY29kZSkgUkVGRVJFTkNFUyBvcmdhbml6YXRpb25hbF9yb2xlcyhyb2xlX2NvZGUpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkZXBhcnRtZW50X2lkKSBSRUZFUkVOQ0VTIGRlcGFydG1lbnRzKGlkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRG9tYWlucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZG9tYWlucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEFjdGl2aXR5IHBvb2wgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjdGl2aXR5X3Bvb2wgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgdG9vbHNfYW5kX3Jlc291cmNlcyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGUgcHJvY2Vzc2VzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVfcHJvY2Vzc2VzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGVuZ2FnZW1lbnRfdHlwZV9pZCkgUkVGRVJFTkNFUyBlbmdhZ2VtZW50X3R5cGVzKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoYWN0aXZpdHlfaWQpIFJFRkVSRU5DRVMgYWN0aXZpdHlfcG9vbChpZCksXG4gICAgICAgICAgVU5JUVVFKGVuZ2FnZW1lbnRfdHlwZV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHRhc2tfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgd29ya195ZWFyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgcmVxdWlyZWRfcXVhcnRlciBEQVRFIE5PVCBOVUxMLFxuICAgICAgICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICByZXF1ZXN0ZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXF1ZXN0ZXJfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgZGl2aXNpb25fbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X25hbWUgVEVYVCxcbiAgICAgICAgICBkb21haW5faWQgSU5URUdFUixcbiAgICAgICAgICBkb21haW5fbmFtZSBURVhULFxuICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQgREVDSU1BTCgxNSwyKSxcbiAgICAgICAgICBjdXJyZW5jeSBURVhULFxuICAgICAgICAgIHN1cHBsaWVyX2xpc3QgVEVYVCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uIFRFWFQsXG4gICAgICAgICAgcGxhbm5pbmdfc291cmNlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9ncmFtIHRhc2tzIChzdGF0aW9ucykgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1fdGFza3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBwcm9ncmFtX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIGNvbXBsZXRpb25fZGF0ZSBEQVRFLFxuICAgICAgICAgIHJlcG9ydGluZ191c2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfbmFtZSBURVhULFxuICAgICAgICAgIHJlZmVyZW5jZSBURVhULFxuICAgICAgICAgIG5vdGVzIFRFWFQsXG4gICAgICAgICAgaXNfbGFzdF9zdGF0aW9uIEJPT0xFQU4gREVGQVVMVCAwLFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHByb2dyYW1faWQpIFJFRkVSRU5DRVMgcHJvZ3JhbXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUocHJvZ3JhbV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENvbXBsZXhpdHkgZXN0aW1hdGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBjb21wbGV4aXR5X2VzdGltYXRlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVzdGltYXRlX2xldmVsXzEgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDUsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMiBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMTAsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMyBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMjAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBBY2NlcHRhbmNlIG9wdGlvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjY2VwdGFuY2Vfb3B0aW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHllYXJfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgdXBsb2FkX2NvZGUgVEVYVCBOT1QgTlVMTCBDSEVDSyAodXBsb2FkX2NvZGUgSU4gKCdQbGFuJywgJ0xhdGUnLCAnQmxvY2snLCAnRmluaXNoJykpLFxuICAgICAgICAgIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgYnJvYWRfbWVhbmluZyBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFN5c3RlbSBzZXR0aW5ncyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3lzdGVtX3NldHRpbmdzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgc2V0dGluZ19rZXkgVEVYVCBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgc2V0dGluZ192YWx1ZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGAsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHN5c3RlbV9zZXR0aW5ncyB0YWJsZTonLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBpbmRleGVzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfc3RhdHVzIE9OIHByb2dyYW1zKHN0YXR1cyknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfd29ya195ZWFyIE9OIHByb2dyYW1zKHdvcmtfeWVhciknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19wcm9ncmFtX2lkIE9OIHByb2dyYW1fdGFza3MocHJvZ3JhbV9pZCknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfdXNlcnNfZW1wbG95ZWVfaWQgT04gdXNlcnMoZW1wbG95ZWVfaWQpJyk7XG4gICAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X2FjY2VwdGFuY2Vfb3B0aW9uc195ZWFyIE9OIGFjY2VwdGFuY2Vfb3B0aW9ucyh5ZWFyX2lkKScsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBpbmRleGVzOicsIGVycik7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHRhYmxlcyBhbmQgaW5kZXhlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgIGlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlRGF0YWJhc2UoKSB7XG4gIGlmIChkYikge1xuICAgIGRiLmNsb3NlKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xvc2luZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGIgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIGdldERhdGFiYXNlLFxuICBpbml0aWFsaXplRGF0YWJhc2UsXG4gIGNsb3NlRGF0YWJhc2Vcbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7aW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5mdW5jdGlvbiBhdXRoZW50aWNhdGVUb2tlbihyZXEsIHJlcywgbmV4dCkge1xuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnNbJ2F1dGhvcml6YXRpb24nXTtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyICYmIGF1dGhIZWFkZXIuc3BsaXQoJyAnKVsxXTtcblxuICBpZiAoIXRva2VuKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBY2Nlc3MgdG9rZW4gcmVxdWlyZWQnIH0pO1xuICB9XG5cbiAgand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCwgKGVyciwgdXNlcikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW52YWxpZCBvciBleHBpcmVkIHRva2VuJyB9KTtcbiAgICB9XG4gICAgcmVxLnVzZXIgPSB1c2VyO1xuICAgIG5leHQoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGF1dGhvcml6ZVJvbGVzKC4uLnJvbGVzKSB7XG4gIHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBpZiAoIXJlcS51c2VyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0F1dGhlbnRpY2F0aW9uIHJlcXVpcmVkJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJvbGVzLmluY2x1ZGVzKHJlcS51c2VyLnJvbGVDb2RlKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH0pO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVVc2VyRXhpc3RzKHJlcSwgcmVzLCBuZXh0KSB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3QgdXNlcklkID0gcmVxLnVzZXIuaWQ7XG5cbiAgZGIuZ2V0KFxuICAgICdTRUxFQ1QgaWQsIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSBGUk9NIHVzZXJzIFdIRVJFIGlkID0gPycsXG4gICAgW3VzZXJJZF0sXG4gICAgKGVyciwgdXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXEudXNlci5jdXJyZW50VXNlciA9IHVzZXI7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuICApO1xufVxuXG5leHBvcnQge1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMsXG4gIHZhbGlkYXRlVXNlckV4aXN0c1xufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgYm9keSwgdmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gTG9naW4gZW5kcG9pbnRcbnJvdXRlci5wb3N0KCcvbG9naW4nLCBbXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5pc0xlbmd0aCh7IG1pbjogNCwgbWF4OiA0IH0pLndpdGhNZXNzYWdlKCdFbXBsb3llZSBJRCBtdXN0IGJlIDQgZGlnaXRzJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykuaXNMZW5ndGgoeyBtaW46IDYsIG1heDogNiB9KS53aXRoTWVzc2FnZSgnUGFzc3dvcmQgbXVzdCBiZSA2IGNoYXJhY3RlcnMnKVxuXSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGVtcGxveWVlSWQsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICBkYi5nZXQoXG4gICAgICAnU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSBlbXBsb3llZV9pZCA9ID8nLFxuICAgICAgW2VtcGxveWVlSWRdLFxuICAgICAgYXN5bmMgKGVyciwgdXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNWYWxpZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHVzZXIucGFzc3dvcmRfaGFzaCk7XG4gICAgICAgIGlmICghaXNWYWxpZFBhc3N3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRva2VuID0gand0LnNpZ24oXG4gICAgICAgICAgeyBcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLCBcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUgXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVULFxuICAgICAgICAgIHsgZXhwaXJlc0luOiBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB8fCAnMjRoJyB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmVzLmpzb24oe1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xuICB9XG59KTtcblxuLy8gR2V0IGN1cnJlbnQgdXNlciBpbmZvXG5yb3V0ZXIuZ2V0KCcvbWUnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmdldChcbiAgICAnU0VMRUNUIGlkLCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUsIHJvbGVfZGVzY3JpcHRpb24sIHByb2N1cmVtZW50X3RlYW0sIGVtYWlsIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JyxcbiAgICBbcmVxLnVzZXIuaWRdLFxuICAgIChlcnIsIHVzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVzLmpzb24oe1xuICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3dvcmtlcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgYXV0aG9yaXplUm9sZXMgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBHZXQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbnJvdXRlci5nZXQoJy9vcmdhbml6YXRpb25hbC1yb2xlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBBUEk6IEdldHRpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXMuLi4nKTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzIE9SREVSIEJZIHJvbGVfY29kZScsIChlcnIsIHJvbGVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEVycm9yIGZldGNoaW5nIG9yZ2FuaXphdGlvbmFsIHJvbGVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBvcmdhbml6YXRpb25hbCByb2xlcycgfSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRmV0Y2hlZCBvcmdhbml6YXRpb25hbCByb2xlcyBmcm9tIERCOicsIHJvbGVzKTtcbiAgICBcbiAgICAvLyBUcmFuc2Zvcm0gdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgY29uc3QgdHJhbnNmb3JtZWRSb2xlcyA9IHJvbGVzLm1hcChyb2xlID0+ICh7XG4gICAgICBpZDogcm9sZS5pZCxcbiAgICAgIHJvbGVDb2RlOiByb2xlLnJvbGVfY29kZSxcbiAgICAgIGRlc2NyaXB0aW9uOiByb2xlLmRlc2NyaXB0aW9uLFxuICAgICAgcGVybWlzc2lvbnM6IHJvbGUucGVybWlzc2lvbnNcbiAgICB9KSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBUcmFuc2Zvcm1lZCByb2xlcyBmb3IgZnJvbnRlbmQ6JywgdHJhbnNmb3JtZWRSb2xlcyk7XG4gICAgcmVzLmpzb24odHJhbnNmb3JtZWRSb2xlcyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBkaXZpc2lvbnNcbnJvdXRlci5nZXQoJy9kaXZpc2lvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgT1JERVIgQlkgbmFtZScsIChlcnIsIGRpdmlzaW9ucykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGl2aXNpb25zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24oZGl2aXNpb25zKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRlcGFydG1lbnRzXG5yb3V0ZXIuZ2V0KCcvZGVwYXJ0bWVudHMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkZXBhcnRtZW50cyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGVwYXJ0bWVudHMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkZXBhcnRtZW50czonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGVwYXJ0bWVudHMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkZXBhcnRtZW50cyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBwcm9jdXJlbWVudCB0ZWFtc1xucm91dGVyLmdldCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgT1JERVIgQlkgbmFtZScsIChlcnIsIHRlYW1zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHByb2N1cmVtZW50IHRlYW1zJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24odGVhbXMpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgYWxsIHdvcmtlcnNcbnJvdXRlci5nZXQoJy8nLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIHRyeSB7XG4gICAgZGIuYWxsKGBcbiAgICAgIFNFTEVDVCBcbiAgICAgICAgdS4qLFxuICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgRlJPTSB1c2VycyB1XG4gICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdS5kaXZpc2lvbl9pZCA9IGQuaWRcbiAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgIE9SREVSIEJZIHUuZnVsbF9uYW1lXG4gICAgYCwgKGVyciwgd29ya2VycykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXJzOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcnMnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUcmFuc2Zvcm0gdG8gbWF0Y2ggZnJvbnRlbmQgZXhwZWN0YXRpb25zXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlcnMgPSB3b3JrZXJzLm1hcCh3b3JrZXIgPT4gKHtcbiAgICAgICAgaWQ6IHdvcmtlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogd29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICByb2xlQ29kZTogd29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgZnVsbE5hbWU6IHdvcmtlci5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogd29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgIGRpdmlzaW9uSWQ6IHdvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGVwYXJ0bWVudElkOiB3b3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB3b3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLCAvLyBEb24ndCBzZW5kIGFjdHVhbCBwYXNzd29yZFxuICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogd29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgIGVtYWlsOiB3b3JrZXIuZW1haWwsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogd29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcGFydG1lbnROYW1lOiB3b3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICB9KSk7XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2Vycyk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyczonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB3b3JrZXJzJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCB3b3JrZXIgYnkgSURcbnJvdXRlci5nZXQoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgXG4gIHRyeSB7XG4gICAgZGIuZ2V0KGBcbiAgICAgIFNFTEVDVCBcbiAgICAgICAgdS4qLFxuICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgRlJPTSB1c2VycyB1XG4gICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdS5kaXZpc2lvbl9pZCA9IGQuaWRcbiAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgIFdIRVJFIHUuaWQgPSA/XG4gICAgYCwgW2lkXSwgKGVyciwgd29ya2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB3b3JrZXInIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXdvcmtlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlciA9IHtcbiAgICAgICAgaWQ6IHdvcmtlci5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogd29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICByb2xlQ29kZTogd29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgZnVsbE5hbWU6IHdvcmtlci5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogd29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgIGRpdmlzaW9uSWQ6IHdvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGVwYXJ0bWVudElkOiB3b3JrZXIuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB3b3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogd29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgIGVtYWlsOiB3b3JrZXIuZW1haWwsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogd29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcGFydG1lbnROYW1lOiB3b3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICB9O1xuICAgICAgXG4gICAgICByZXMuanNvbih0cmFuc2Zvcm1lZFdvcmtlcik7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdvcmtlcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBDcmVhdGUgbmV3IHdvcmtlclxucm91dGVyLnBvc3QoJy8nLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygxLCA1LCA5KSwgLy8gTWFuYWdlciwgQWRtaW4sIFRlY2huaWNhbFxuICBib2R5KCdlbXBsb3llZUlkJykuaXNMZW5ndGgoeyBtaW46IDQsIG1heDogNCB9KS53aXRoTWVzc2FnZSgnRW1wbG95ZWUgSUQgbXVzdCBiZSA0IGRpZ2l0cycpLFxuICBib2R5KCdyb2xlQ29kZScpLmlzSW50KHsgbWluOiAxLCBtYXg6IDkgfSkud2l0aE1lc3NhZ2UoJ0ludmFsaWQgcm9sZSBjb2RlJyksXG4gIGJvZHkoJ2Z1bGxOYW1lJykubm90RW1wdHkoKS53aXRoTWVzc2FnZSgnRnVsbCBuYW1lIGlzIHJlcXVpcmVkJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykuaXNMZW5ndGgoeyBtaW46IDYsIG1heDogNiB9KS53aXRoTWVzc2FnZSgnUGFzc3dvcmQgbXVzdCBiZSA2IGNoYXJhY3RlcnMnKVxuXSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgd29ya2VyIHdpdGggZGF0YTonLCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBhdmFpbGFibGVXb3JrRGF5cyxcbiAgICAgIGVtYWlsXG4gICAgfSk7XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBDaGVjayBpZiBlbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0c1xuICAgIGRiLmdldCgnU0VMRUNUIGlkIEZST00gdXNlcnMgV0hFUkUgZW1wbG95ZWVfaWQgPSA/JywgW2VtcGxveWVlSWRdLCBhc3luYyAoZXJyLCBleGlzdGluZ1VzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRGF0YWJhc2UgZXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgdXNlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0aW5nVXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gSGFzaCBwYXNzd29yZFxuICAgICAgY29uc3QgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIHBhcnNlSW50KHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMpIHx8IDEyKTtcblxuICAgICAgLy8gSW5zZXJ0IG5ldyB3b3JrZXJcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIElOU0VSVCBJTlRPIHVzZXJzIChcbiAgICAgICAgICBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUsIHJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgZGl2aXNpb25faWQsIGRlcGFydG1lbnRfaWQsIHByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCwgYXZhaWxhYmxlX3dvcmtfZGF5cywgZW1haWxcbiAgICAgICAgKSBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8sID8sID8sID8pXG4gICAgICBgLCBbXG4gICAgICAgIGVtcGxveWVlSWQsXG4gICAgICAgIGZ1bGxOYW1lLFxuICAgICAgICByb2xlQ29kZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uIHx8IG51bGwsXG4gICAgICAgIGRpdmlzaW9uSWQgfHwgbnVsbCxcbiAgICAgICAgZGVwYXJ0bWVudElkIHx8IG51bGwsXG4gICAgICAgIHByb2N1cmVtZW50VGVhbSB8fCBudWxsLFxuICAgICAgICBwYXNzd29yZEhhc2gsXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzID8gcGFyc2VJbnQoYXZhaWxhYmxlV29ya0RheXMpIDogbnVsbCxcbiAgICAgICAgZW1haWwgfHwgbnVsbFxuICAgICAgXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgd29ya2VyJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3JrZXIgY3JlYXRlZCB3aXRoIElEOicsIHRoaXMubGFzdElEKTtcblxuICAgICAgICAvLyBHZXQgdGhlIGNyZWF0ZWQgd29ya2VyIHdpdGggam9pbmVkIGRhdGFcbiAgICAgICAgZGIuZ2V0KGBcbiAgICAgICAgICBTRUxFQ1QgXG4gICAgICAgICAgICB1LiosXG4gICAgICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSxcbiAgICAgICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWVcbiAgICAgICAgICBGUk9NIHVzZXJzIHVcbiAgICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdS5kaXZpc2lvbl9pZCA9IGQuaWRcbiAgICAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB1LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkXG4gICAgICAgICAgV0hFUkUgdS5pZCA9ID9cbiAgICAgICAgYCwgW3RoaXMubGFzdElEXSwgKGVyciwgbmV3V29ya2VyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNyZWF0ZWQgd29ya2VyJyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFdvcmtlciA9IHtcbiAgICAgICAgICAgIGlkOiBuZXdXb3JrZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiBuZXdXb3JrZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogbmV3V29ya2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiBuZXdXb3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiBuZXdXb3JrZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGRpdmlzaW9uSWQ6IG5ld1dvcmtlci5kaXZpc2lvbl9pZCxcbiAgICAgICAgICAgIGRlcGFydG1lbnRJZDogbmV3V29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IG5ld1dvcmtlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLFxuICAgICAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IG5ld1dvcmtlci5hdmFpbGFibGVfd29ya19kYXlzPy50b1N0cmluZygpLFxuICAgICAgICAgICAgZW1haWw6IG5ld1dvcmtlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogbmV3V29ya2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogbmV3V29ya2VyLmRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnUmV0dXJuaW5nIGNyZWF0ZWQgd29ya2VyOicsIHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih0cmFuc2Zvcm1lZFdvcmtlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gVXBkYXRlIHdvcmtlclxucm91dGVyLnB1dCgnLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpLCAvLyBNYW5hZ2VyLCBBZG1pbiwgVGVjaG5pY2FsXG4gIGJvZHkoJ2VtcGxveWVlSWQnKS5vcHRpb25hbCgpLmlzTGVuZ3RoKHsgbWluOiA0LCBtYXg6IDQgfSkud2l0aE1lc3NhZ2UoJ0VtcGxveWVlIElEIG11c3QgYmUgNCBkaWdpdHMnKSxcbiAgYm9keSgncm9sZUNvZGUnKS5vcHRpb25hbCgpLmlzSW50KHsgbWluOiAxLCBtYXg6IDkgfSkud2l0aE1lc3NhZ2UoJ0ludmFsaWQgcm9sZSBjb2RlJyksXG4gIGJvZHkoJ3Bhc3N3b3JkJykub3B0aW9uYWwoKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtlcklkID0gcmVxLnBhcmFtcy5pZDtcbiAgICBjb25zdCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBDaGVjayBpZiBlbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cyAoZXhjbHVkaW5nIGN1cnJlbnQgd29ya2VyKVxuICAgIGlmIChlbXBsb3llZUlkKSB7XG4gICAgICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIHVzZXJzIFdIRVJFIGVtcGxveWVlX2lkID0gPyBBTkQgaWQgIT0gPycsIFtlbXBsb3llZUlkLCB3b3JrZXJJZF0sIGFzeW5jIChlcnIsIGV4aXN0aW5nVXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB1cGRhdGVXb3JrZXIoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB1cGRhdGVXb3JrZXIoKTtcbiAgICB9XG5cbiAgICBhc3luYyBmdW5jdGlvbiB1cGRhdGVXb3JrZXIoKSB7XG4gICAgICBsZXQgcGFzc3dvcmRIYXNoID0gbnVsbDtcbiAgICAgIGlmIChwYXNzd29yZCAmJiBwYXNzd29yZCAhPT0gJyoqKioqKicpIHtcbiAgICAgICAgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIHBhcnNlSW50KHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMpIHx8IDEyKTtcbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgdXBkYXRlIHF1ZXJ5IGR5bmFtaWNhbGx5XG4gICAgICBjb25zdCB1cGRhdGVGaWVsZHMgPSBbXTtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuXG4gICAgICBpZiAoZW1wbG95ZWVJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdlbXBsb3llZV9pZCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goZW1wbG95ZWVJZCk7XG4gICAgICB9XG4gICAgICBpZiAocm9sZUNvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgncm9sZV9jb2RlID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChyb2xlQ29kZSk7XG4gICAgICB9XG4gICAgICBpZiAoZnVsbE5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnZnVsbF9uYW1lID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChmdWxsTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAocm9sZURlc2NyaXB0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3JvbGVfZGVzY3JpcHRpb24gPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHJvbGVEZXNjcmlwdGlvbiB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChkaXZpc2lvbklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ2RpdmlzaW9uX2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChkaXZpc2lvbklkIHx8IG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKGRlcGFydG1lbnRJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdkZXBhcnRtZW50X2lkID0gPycpO1xuICAgICAgICB2YWx1ZXMucHVzaChkZXBhcnRtZW50SWQgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBpZiAocHJvY3VyZW1lbnRUZWFtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3Byb2N1cmVtZW50X3RlYW0gPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHByb2N1cmVtZW50VGVhbSB8fCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXNzd29yZEhhc2gpIHtcbiAgICAgICAgdXBkYXRlRmllbGRzLnB1c2goJ3Bhc3N3b3JkX2hhc2ggPSA/Jyk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHBhc3N3b3JkSGFzaCk7XG4gICAgICB9XG4gICAgICBpZiAoYXZhaWxhYmxlV29ya0RheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB1cGRhdGVGaWVsZHMucHVzaCgnYXZhaWxhYmxlX3dvcmtfZGF5cyA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goYXZhaWxhYmxlV29ya0RheXMgPyBwYXJzZUludChhdmFpbGFibGVXb3JrRGF5cykgOiBudWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbWFpbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCdlbWFpbCA9ID8nKTtcbiAgICAgICAgdmFsdWVzLnB1c2goZW1haWwgfHwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZUZpZWxkcy5wdXNoKCd1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAnKTtcbiAgICAgIHZhbHVlcy5wdXNoKHdvcmtlcklkKTtcblxuICAgICAgaWYgKHVwZGF0ZUZpZWxkcy5sZW5ndGggPT09IDEpIHsgLy8gT25seSB0aW1lc3RhbXAgdXBkYXRlXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnTm8gZmllbGRzIHRvIHVwZGF0ZScgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVwZGF0ZVF1ZXJ5ID0gYFVQREFURSB1c2VycyBTRVQgJHt1cGRhdGVGaWVsZHMuam9pbignLCAnKX0gV0hFUkUgaWQgPSA/YDtcblxuICAgICAgZGIucnVuKHVwZGF0ZVF1ZXJ5LCB2YWx1ZXMsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gdXBkYXRlIHdvcmtlcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCB0aGUgdXBkYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoYFxuICAgICAgICAgIFNFTEVDVCBcbiAgICAgICAgICAgIHUuKixcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZVxuICAgICAgICAgIEZST00gdXNlcnMgdVxuICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB1LmRpdmlzaW9uX2lkID0gZC5pZFxuICAgICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHUuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWRcbiAgICAgICAgICBXSEVSRSB1LmlkID0gP1xuICAgICAgICBgLCBbd29ya2VySWRdLCAoZXJyLCB1cGRhdGVkV29ya2VyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCB3b3JrZXInIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkV29ya2VyID0ge1xuICAgICAgICAgICAgaWQ6IHVwZGF0ZWRXb3JrZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1cGRhdGVkV29ya2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVwZGF0ZWRXb3JrZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHVwZGF0ZWRXb3JrZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1cGRhdGVkV29ya2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBkaXZpc2lvbklkOiB1cGRhdGVkV29ya2VyLmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiB1cGRhdGVkV29ya2VyLmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVwZGF0ZWRXb3JrZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiAnKioqKioqJyxcbiAgICAgICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiB1cGRhdGVkV29ya2VyLmF2YWlsYWJsZV93b3JrX2RheXM/LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBlbWFpbDogdXBkYXRlZFdvcmtlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogdXBkYXRlZFdvcmtlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHVwZGF0ZWRXb3JrZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcy5qc29uKHRyYW5zZm9ybWVkV29ya2VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSB3b3JrZXInIH0pO1xuICB9XG59KTtcblxuLy8gRGVsZXRlIHdvcmtlclxucm91dGVyLmRlbGV0ZSgnLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDEsIDUsIDkpIC8vIE1hbmFnZXIsIEFkbWluLCBUZWNobmljYWxcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHdvcmtlcklkID0gcmVxLnBhcmFtcy5pZDtcblxuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIHdvcmtlciBpcyBhc3NpZ25lZCB0byBhbnkgYWN0aXZlIHRhc2tzXG4gICAgLy8gRm9yIG5vdywgd2UnbGwgYWxsb3cgZGVsZXRpb24gYnV0IGluIHByb2R1Y3Rpb24geW91IG1pZ2h0IHdhbnQgdG8gcHJldmVudCBpdFxuICAgIFxuICAgIGRiLnJ1bignREVMRVRFIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JywgW3dvcmtlcklkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgd29ya2VyJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdXb3JrZXIgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgd29ya2VyJyB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBib2R5LCB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGF1dGhvcml6ZVJvbGVzIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gPT09PT0gQUNUSVZJVFkgUE9PTCBST1VURVMgPT09PT1cblxuLy8gR2V0IGFsbCBhY3Rpdml0aWVzXG5yb3V0ZXIuZ2V0KCcvYWN0aXZpdHktcG9vbCcsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGFjdGl2aXR5X3Bvb2wgT1JERVIgQlkgbmFtZScsIChlcnIsIGFjdGl2aXRpZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBhY3Rpdml0aWVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBhY3Rpdml0aWVzJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24oYWN0aXZpdGllcyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBhY3Rpdml0eVxucm91dGVyLnBvc3QoJy9hY3Rpdml0eS1wb29sJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSksXG4gIGJvZHkoJ25hbWUnKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdBY3Rpdml0eSBuYW1lIGlzIHJlcXVpcmVkJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IG5hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gYWN0aXZpdHlfcG9vbCAobmFtZSwgdG9vbHNfYW5kX3Jlc291cmNlcykgVkFMVUVTICg/LCA/KScsXG4gICAgW25hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIHx8IG51bGxdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBhY3Rpdml0eTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgYWN0aXZpdHknIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBhY3Rpdml0eSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY3JlYXRlZCBhY3Rpdml0eScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24oYWN0aXZpdHkpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBhY3Rpdml0eVxucm91dGVyLnB1dCgnL2FjdGl2aXR5LXBvb2wvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGFjdGl2aXR5X3Bvb2wgU0VUIG5hbWUgPSA/LCB0b29sc19hbmRfcmVzb3VyY2VzID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCB0b29sc0FuZFJlc291cmNlcyB8fCBudWxsLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBhY3Rpdml0eScgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY3Rpdml0eSBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCBhY3Rpdml0eSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCBhY3Rpdml0eScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24oYWN0aXZpdHkpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIERlbGV0ZSBhY3Rpdml0eVxucm91dGVyLmRlbGV0ZSgnL2FjdGl2aXR5LXBvb2wvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgYWN0aXZpdHknIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQWN0aXZpdHkgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdBY3Rpdml0eSBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vID09PT09IERPTUFJTlMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgZG9tYWluc1xucm91dGVyLmdldCgnL2RvbWFpbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkb21haW5zIE9SREVSIEJZIGRlc2NyaXB0aW9uJywgKGVyciwgZG9tYWlucykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRvbWFpbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGRvbWFpbnMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkb21haW5zKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIGRvbWFpblxucm91dGVyLnBvc3QoJy9kb21haW5zJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSksXG4gIGJvZHkoJ2Rlc2NyaXB0aW9uJykubm90RW1wdHkoKS53aXRoTWVzc2FnZSgnRG9tYWluIGRlc2NyaXB0aW9uIGlzIHJlcXVpcmVkJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IGRlc2NyaXB0aW9uIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gZG9tYWlucyAoZGVzY3JpcHRpb24pIFZBTFVFUyAoPyknLFxuICAgIFtkZXNjcmlwdGlvbl0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgZG9tYWluJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgZG9tYWluKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIGRvbWFpbicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24oZG9tYWluKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBVcGRhdGUgZG9tYWluXG5yb3V0ZXIucHV0KCcvZG9tYWlucy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgZGVzY3JpcHRpb24gfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgZG9tYWlucyBTRVQgZGVzY3JpcHRpb24gPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW2Rlc2NyaXB0aW9uLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgZG9tYWluJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RvbWFpbiBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCBkb21haW4pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHVwZGF0ZWQgZG9tYWluJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihkb21haW4pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIERlbGV0ZSBkb21haW5cbnJvdXRlci5kZWxldGUoJy9kb21haW5zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBkb21haW46JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBkb21haW4nIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRG9tYWluIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnRG9tYWluIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gPT09PT0gRElWSVNJT05TIFJPVVRFUyA9PT09PVxuXG4vLyBHZXQgYWxsIGRpdmlzaW9uc1xucm91dGVyLmdldCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGl2aXNpb25zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGl2aXNpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBkaXZpc2lvbnMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkaXZpc2lvbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgZGl2aXNpb25cbnJvdXRlci5wb3N0KCcvZGl2aXNpb25zJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSksXG4gIGJvZHkoJ25hbWUnKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdEaXZpc2lvbiBuYW1lIGlzIHJlcXVpcmVkJylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IG5hbWUsIGlzSW50ZXJuYWwgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBkaXZpc2lvbnMgKG5hbWUsIGlzX2ludGVybmFsKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgaXNJbnRlcm5hbCA/IDEgOiAwXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gY3JlYXRlIGRpdmlzaW9uJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBkaXZpc2lvbikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY3JlYXRlZCBkaXZpc2lvbicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24oZGl2aXNpb24pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBkaXZpc2lvblxucm91dGVyLnB1dCgnL2RpdmlzaW9ucy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSwgaXNJbnRlcm5hbCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBkaXZpc2lvbnMgU0VUIG5hbWUgPSA/LCBpc19pbnRlcm5hbCA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgaXNJbnRlcm5hbCA/IDEgOiAwLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRpdmlzaW9uOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBkaXZpc2lvbicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEaXZpc2lvbiBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIGRpdmlzaW9uKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIGRpdmlzaW9uJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihkaXZpc2lvbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGRpdmlzaW9uXG5yb3V0ZXIuZGVsZXRlKCcvZGl2aXNpb25zLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRpdmlzaW9uOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgZGl2aXNpb24nIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGl2aXNpb24gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEaXZpc2lvbiBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vID09PT09IERFUEFSVE1FTlRTIFJPVVRFUyA9PT09PVxuXG4vLyBHZXQgYWxsIGRlcGFydG1lbnRzXG5yb3V0ZXIuZ2V0KCcvZGVwYXJ0bWVudHMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkZXBhcnRtZW50cyBPUkRFUiBCWSBuYW1lJywgKGVyciwgZGVwYXJ0bWVudHMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkZXBhcnRtZW50czonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggZGVwYXJ0bWVudHMnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuanNvbihkZXBhcnRtZW50cyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBkZXBhcnRtZW50XG5yb3V0ZXIucG9zdCgnL2RlcGFydG1lbnRzJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSksXG4gIGJvZHkoJ25hbWUnKS5ub3RFbXB0eSgpLndpdGhNZXNzYWdlKCdEZXBhcnRtZW50IG5hbWUgaXMgcmVxdWlyZWQnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgbmFtZSwgZGl2aXNpb25JZCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGRlcGFydG1lbnRzIChuYW1lLCBkaXZpc2lvbl9pZCkgVkFMVUVTICg/LCA/KScsXG4gICAgW25hbWUsIGRpdmlzaW9uSWQgfHwgbnVsbF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gY3JlYXRlIGRlcGFydG1lbnQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGVwYXJ0bWVudHMgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgZGVwYXJ0bWVudCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY3JlYXRlZCBkZXBhcnRtZW50JyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihkZXBhcnRtZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBVcGRhdGUgZGVwYXJ0bWVudFxucm91dGVyLnB1dCgnL2RlcGFydG1lbnRzLzppZCcsIFtcbiAgYXV0aGVudGljYXRlVG9rZW4sXG4gIGF1dGhvcml6ZVJvbGVzKDAsIDkpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lLCBkaXZpc2lvbklkIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGRlcGFydG1lbnRzIFNFVCBuYW1lID0gPywgZGl2aXNpb25faWQgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIGRpdmlzaW9uSWQgfHwgbnVsbCwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBkZXBhcnRtZW50OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHVwZGF0ZSBkZXBhcnRtZW50JyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RlcGFydG1lbnQgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIGRlcGFydG1lbnQpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHVwZGF0ZWQgZGVwYXJ0bWVudCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24oZGVwYXJ0bWVudCk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGRlcGFydG1lbnRcbnJvdXRlci5kZWxldGUoJy9kZXBhcnRtZW50cy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGRlcGFydG1lbnRzIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBkZXBhcnRtZW50JyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RlcGFydG1lbnQgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEZXBhcnRtZW50IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gPT09PT0gUFJPQ1VSRU1FTlQgVEVBTVMgUk9VVEVTID09PT09XG5cbi8vIEdldCBhbGwgcHJvY3VyZW1lbnQgdGVhbXNcbnJvdXRlci5nZXQoJy9wcm9jdXJlbWVudC10ZWFtcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCB0ZWFtcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHByb2N1cmVtZW50IHRlYW1zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBwcm9jdXJlbWVudCB0ZWFtcycgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5qc29uKHRlYW1zKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIHByb2N1cmVtZW50IHRlYW1cbnJvdXRlci5wb3N0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCA5KSxcbiAgYm9keSgnbmFtZScpLm5vdEVtcHR5KCkud2l0aE1lc3NhZ2UoJ1RlYW0gbmFtZSBpcyByZXF1aXJlZCcpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICB9XG5cbiAgY29uc3QgeyBuYW1lIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gcHJvY3VyZW1lbnRfdGVhbXMgKG5hbWUpIFZBTFVFUyAoPyknLFxuICAgIFtuYW1lXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgcHJvY3VyZW1lbnQgdGVhbScgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCB0ZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIHRlYW0nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHRlYW0pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBwcm9jdXJlbWVudCB0ZWFtXG5yb3V0ZXIucHV0KCcvcHJvY3VyZW1lbnQtdGVhbXMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgcHJvY3VyZW1lbnRfdGVhbXMgU0VUIG5hbWUgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgcHJvY3VyZW1lbnQgdGVhbScgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9jdXJlbWVudCB0ZWFtIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCB0ZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCB1cGRhdGVkIHRlYW0nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKHRlYW0pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIERlbGV0ZSBwcm9jdXJlbWVudCB0ZWFtXG5yb3V0ZXIuZGVsZXRlKCcvcHJvY3VyZW1lbnQtdGVhbXMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgOSlcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBkZWxldGUgcHJvY3VyZW1lbnQgdGVhbScgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9jdXJlbWVudCB0ZWFtIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnUHJvY3VyZW1lbnQgdGVhbSBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvcGxhbm5pbmcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgYm9keSwgdmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuLCBhdXRob3JpemVSb2xlcyB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vID09PT09IENPTVBMRVhJVFkgRVNUSU1BVEVTIFJPVVRFUyA9PT09PVxuXG4vLyBHZXQgY29tcGxleGl0eSBlc3RpbWF0ZXNcbnJvdXRlci5nZXQoJy9jb21wbGV4aXR5LWVzdGltYXRlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGNvbXBsZXhpdHlfZXN0aW1hdGVzIE9SREVSIEJZIGlkIERFU0MgTElNSVQgMScsIChlcnIsIGVzdGltYXRlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjb21wbGV4aXR5IGVzdGltYXRlcycgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIElmIG5vIGVzdGltYXRlcyBleGlzdCwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzXG4gICAgaWYgKCFlc3RpbWF0ZXMpIHtcbiAgICAgIGVzdGltYXRlcyA9IHtcbiAgICAgICAgaWQ6IDEsXG4gICAgICAgIGVzdGltYXRlX2xldmVsXzE6IDUsXG4gICAgICAgIGVzdGltYXRlX2xldmVsXzI6IDEwLFxuICAgICAgICBlc3RpbWF0ZV9sZXZlbF8zOiAyMFxuICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgcmVzLmpzb24oe1xuICAgICAgZXN0aW1hdGVMZXZlbDE6IGVzdGltYXRlcy5lc3RpbWF0ZV9sZXZlbF8xLFxuICAgICAgZXN0aW1hdGVMZXZlbDI6IGVzdGltYXRlcy5lc3RpbWF0ZV9sZXZlbF8yLFxuICAgICAgZXN0aW1hdGVMZXZlbDM6IGVzdGltYXRlcy5lc3RpbWF0ZV9sZXZlbF8zXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIFVwZGF0ZSBjb21wbGV4aXR5IGVzdGltYXRlc1xucm91dGVyLnB1dCgnL2NvbXBsZXhpdHktZXN0aW1hdGVzJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgMSksIC8vIEFkbWluIGFuZCBQcm9jdXJlbWVudCBNYW5hZ2VyXG4gIGJvZHkoJ2VzdGltYXRlTGV2ZWwxJykuaXNJbnQoeyBtaW46IDEsIG1heDogMzY1IH0pLndpdGhNZXNzYWdlKCdMZXZlbCAxIGVzdGltYXRlIG11c3QgYmUgYmV0d2VlbiAxLTM2NScpLFxuICBib2R5KCdlc3RpbWF0ZUxldmVsMicpLmlzSW50KHsgbWluOiAxLCBtYXg6IDM2NSB9KS53aXRoTWVzc2FnZSgnTGV2ZWwgMiBlc3RpbWF0ZSBtdXN0IGJlIGJldHdlZW4gMS0zNjUnKSxcbiAgYm9keSgnZXN0aW1hdGVMZXZlbDMnKS5pc0ludCh7IG1pbjogMSwgbWF4OiAzNjUgfSkud2l0aE1lc3NhZ2UoJ0xldmVsIDMgZXN0aW1hdGUgbXVzdCBiZSBiZXR3ZWVuIDEtMzY1Jylcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG4gIH1cblxuICBjb25zdCB7IGVzdGltYXRlTGV2ZWwxLCBlc3RpbWF0ZUxldmVsMiwgZXN0aW1hdGVMZXZlbDMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gRmlyc3QgY2hlY2sgaWYgcmVjb3JkIGV4aXN0c1xuICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIGNvbXBsZXhpdHlfZXN0aW1hdGVzIExJTUlUIDEnLCAoZXJyLCBleGlzdGluZykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyByZWNvcmRcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ1VQREFURSBjb21wbGV4aXR5X2VzdGltYXRlcyBTRVQgZXN0aW1hdGVfbGV2ZWxfMSA9ID8sIGVzdGltYXRlX2xldmVsXzIgPSA/LCBlc3RpbWF0ZV9sZXZlbF8zID0gPywgdXBkYXRlZF9hdCA9IENVUlJFTlRfVElNRVNUQU1QIFdIRVJFIGlkID0gPycsXG4gICAgICAgIFtlc3RpbWF0ZUxldmVsMSwgZXN0aW1hdGVMZXZlbDIsIGVzdGltYXRlTGV2ZWwzLCBleGlzdGluZy5pZF0sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgY29tcGxleGl0eSBlc3RpbWF0ZXMnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlcy5qc29uKHtcbiAgICAgICAgICAgIGVzdGltYXRlTGV2ZWwxLFxuICAgICAgICAgICAgZXN0aW1hdGVMZXZlbDIsXG4gICAgICAgICAgICBlc3RpbWF0ZUxldmVsM1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnNlcnQgbmV3IHJlY29yZFxuICAgICAgZGIucnVuKFxuICAgICAgICAnSU5TRVJUIElOVE8gY29tcGxleGl0eV9lc3RpbWF0ZXMgKGVzdGltYXRlX2xldmVsXzEsIGVzdGltYXRlX2xldmVsXzIsIGVzdGltYXRlX2xldmVsXzMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICBbZXN0aW1hdGVMZXZlbDEsIGVzdGltYXRlTGV2ZWwyLCBlc3RpbWF0ZUxldmVsM10sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgY29tcGxleGl0eSBlc3RpbWF0ZXMnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlcy5qc29uKHtcbiAgICAgICAgICAgIGVzdGltYXRlTGV2ZWwxLFxuICAgICAgICAgICAgZXN0aW1hdGVMZXZlbDIsXG4gICAgICAgICAgICBlc3RpbWF0ZUxldmVsM1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59KTtcblxuLy8gPT09PT0gQUNDRVBUQU5DRSBPUFRJT05TIFJPVVRFUyA9PT09PVxuXG4vLyBHZXQgYWxsIGFjY2VwdGFuY2Ugb3B0aW9uc1xucm91dGVyLmdldCgnL2FjY2VwdGFuY2Utb3B0aW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBPUkRFUiBCWSB5ZWFyX2lkIERFU0MnLCAoZXJyLCBvcHRpb25zKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgYWNjZXB0YW5jZSBvcHRpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBhY2NlcHRhbmNlIG9wdGlvbnMnIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBUcmFuc2Zvcm0gdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgY29uc3QgdHJhbnNmb3JtZWRPcHRpb25zID0gb3B0aW9ucy5tYXAob3B0aW9uID0+ICh7XG4gICAgICBpZDogb3B0aW9uLmlkLFxuICAgICAgeWVhcklkOiBvcHRpb24ueWVhcl9pZCxcbiAgICAgIHVwbG9hZENvZGU6IG9wdGlvbi51cGxvYWRfY29kZSxcbiAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogb3B0aW9uLnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgYnJvYWRNZWFuaW5nOiBvcHRpb24uYnJvYWRfbWVhbmluZ1xuICAgIH0pKTtcbiAgICBcbiAgICByZXMuanNvbih0cmFuc2Zvcm1lZE9wdGlvbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgYWNjZXB0YW5jZSBvcHRpb25cbnJvdXRlci5wb3N0KCcvYWNjZXB0YW5jZS1vcHRpb25zJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgMSksIC8vIEFkbWluIGFuZCBQcm9jdXJlbWVudCBNYW5hZ2VyXG4gIGJvZHkoJ3llYXJJZCcpLmlzSW50KHsgbWluOiAyMDIwLCBtYXg6IDIwNTAgfSkud2l0aE1lc3NhZ2UoJ1llYXIgbXVzdCBiZSBiZXR3ZWVuIDIwMjAtMjA1MCcpLFxuICBib2R5KCd1cGxvYWRDb2RlJykuaXNJbihbJ1BsYW4nLCAnTGF0ZScsICdCbG9jaycsICdGaW5pc2gnXSkud2l0aE1lc3NhZ2UoJ0ludmFsaWQgdXBsb2FkIGNvZGUnKVxuXSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3JzOiBlcnJvcnMuYXJyYXkoKSB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgeWVhcklkLCB1cGxvYWRDb2RlLCBicm9hZE1lYW5pbmcgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gQ2hlY2sgaWYgeWVhciBhbHJlYWR5IGV4aXN0c1xuICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSB5ZWFyX2lkID0gPycsIFt5ZWFySWRdLCAoZXJyLCBleGlzdGluZykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIGV4aXN0aW5nIHllYXI6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IGBZZWFyICR7eWVhcklkfSBhbHJlYWR5IGV4aXN0c2AgfSk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHVwbG9hZCBjb2RlIGRlc2NyaXB0aW9uXG4gICAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9ucyA9IHtcbiAgICAgICdQbGFuJzogJ1x1MDVERVx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVERicsXG4gICAgICAnTGF0ZSc6ICdcdTA1REVcdTA1RDBcdTA1RDdcdTA1RTgnLFxuICAgICAgJ0Jsb2NrJzogJ1x1MDVEN1x1MDVFMVx1MDVENVx1MDVERCcsXG4gICAgICAnRmluaXNoJzogJ1x1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERCdcbiAgICB9O1xuXG4gICAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9uID0gdXBsb2FkQ29kZURlc2NyaXB0aW9uc1t1cGxvYWRDb2RlXTtcblxuICAgIGRiLnJ1bihcbiAgICAgICdJTlNFUlQgSU5UTyBhY2NlcHRhbmNlX29wdGlvbnMgKHllYXJfaWQsIHVwbG9hZF9jb2RlLCB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiwgYnJvYWRfbWVhbmluZykgVkFMVUVTICg/LCA/LCA/LCA/KScsXG4gICAgICBbeWVhcklkLCB1cGxvYWRDb2RlLCB1cGxvYWRDb2RlRGVzY3JpcHRpb24sIGJyb2FkTWVhbmluZyB8fCBudWxsXSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgYWNjZXB0YW5jZSBvcHRpb24nIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCBvcHRpb24pID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjcmVhdGVkIG9wdGlvbicgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRPcHRpb24gPSB7XG4gICAgICAgICAgICBpZDogb3B0aW9uLmlkLFxuICAgICAgICAgICAgeWVhcklkOiBvcHRpb24ueWVhcl9pZCxcbiAgICAgICAgICAgIHVwbG9hZENvZGU6IG9wdGlvbi51cGxvYWRfY29kZSxcbiAgICAgICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogb3B0aW9uLnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgYnJvYWRNZWFuaW5nOiBvcHRpb24uYnJvYWRfbWVhbmluZ1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih0cmFuc2Zvcm1lZE9wdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufSk7XG5cbi8vIFVwZGF0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLnB1dCgnL2FjY2VwdGFuY2Utb3B0aW9ucy86aWQnLCBbXG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcygwLCAxKSwgLy8gQWRtaW4gYW5kIFByb2N1cmVtZW50IE1hbmFnZXJcbiAgYm9keSgneWVhcklkJykuaXNJbnQoeyBtaW46IDIwMjAsIG1heDogMjA1MCB9KS53aXRoTWVzc2FnZSgnWWVhciBtdXN0IGJlIGJldHdlZW4gMjAyMC0yMDUwJyksXG4gIGJvZHkoJ3VwbG9hZENvZGUnKS5pc0luKFsnUGxhbicsICdMYXRlJywgJ0Jsb2NrJywgJ0ZpbmlzaCddKS53aXRoTWVzc2FnZSgnSW52YWxpZCB1cGxvYWQgY29kZScpXG5dLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICB9XG5cbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyB5ZWFySWQsIHVwbG9hZENvZGUsIGJyb2FkTWVhbmluZyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBDaGVjayBpZiB5ZWFyIGFscmVhZHkgZXhpc3RzIGZvciBkaWZmZXJlbnQgcmVjb3JkXG4gIGRiLmdldCgnU0VMRUNUIGlkIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIHllYXJfaWQgPSA/IEFORCBpZCAhPSA/JywgW3llYXJJZCwgaWRdLCAoZXJyLCBleGlzdGluZykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIGV4aXN0aW5nIHllYXI6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IGBZZWFyICR7eWVhcklkfSBhbHJlYWR5IGV4aXN0c2AgfSk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHVwbG9hZCBjb2RlIGRlc2NyaXB0aW9uXG4gICAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9ucyA9IHtcbiAgICAgICdQbGFuJzogJ1x1MDVERVx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVERicsXG4gICAgICAnTGF0ZSc6ICdcdTA1REVcdTA1RDBcdTA1RDdcdTA1RTgnLFxuICAgICAgJ0Jsb2NrJzogJ1x1MDVEN1x1MDVFMVx1MDVENVx1MDVERCcsXG4gICAgICAnRmluaXNoJzogJ1x1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERCdcbiAgICB9O1xuXG4gICAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9uID0gdXBsb2FkQ29kZURlc2NyaXB0aW9uc1t1cGxvYWRDb2RlXTtcblxuICAgIGRiLnJ1bihcbiAgICAgICdVUERBVEUgYWNjZXB0YW5jZV9vcHRpb25zIFNFVCB5ZWFyX2lkID0gPywgdXBsb2FkX2NvZGUgPSA/LCB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiA9ID8sIGJyb2FkX21lYW5pbmcgPSA/LCB1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAgV0hFUkUgaWQgPSA/JyxcbiAgICAgIFt5ZWFySWQsIHVwbG9hZENvZGUsIHVwbG9hZENvZGVEZXNjcmlwdGlvbiwgYnJvYWRNZWFuaW5nIHx8IG51bGwsIGlkXSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgYWNjZXB0YW5jZSBvcHRpb24nIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQWNjZXB0YW5jZSBvcHRpb24gbm90IGZvdW5kJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgb3B0aW9uKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlZCBvcHRpb24nIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkT3B0aW9uID0ge1xuICAgICAgICAgICAgaWQ6IG9wdGlvbi5pZCxcbiAgICAgICAgICAgIHllYXJJZDogb3B0aW9uLnllYXJfaWQsXG4gICAgICAgICAgICB1cGxvYWRDb2RlOiBvcHRpb24udXBsb2FkX2NvZGUsXG4gICAgICAgICAgICB1cGxvYWRDb2RlRGVzY3JpcHRpb246IG9wdGlvbi51cGxvYWRfY29kZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGJyb2FkTWVhbmluZzogb3B0aW9uLmJyb2FkX21lYW5pbmdcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmVzLmpzb24odHJhbnNmb3JtZWRPcHRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn0pO1xuXG4vLyBEZWxldGUgYWNjZXB0YW5jZSBvcHRpb25cbnJvdXRlci5kZWxldGUoJy9hY2NlcHRhbmNlLW9wdGlvbnMvOmlkJywgW1xuICBhdXRoZW50aWNhdGVUb2tlbixcbiAgYXV0aG9yaXplUm9sZXMoMCwgMSkgLy8gQWRtaW4gYW5kIFByb2N1cmVtZW50IE1hbmFnZXJcbl0sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIGRlbGV0ZSBhY2NlcHRhbmNlIG9wdGlvbicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0FjY2VwdGFuY2Ugb3B0aW9uIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzL3NlZWREYXRhYmFzZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtpbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGdldERhdGFiYXNlLCBpbml0aWFsaXplRGF0YWJhc2UsIGNsb3NlRGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBzZWVkRGF0YWJhc2UoKSB7XG4gIHRyeSB7XG4gICAgYXdhaXQgaW5pdGlhbGl6ZURhdGFiYXNlKCk7XG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdTZWVkaW5nIGRhdGFiYXNlIHdpdGggaW5pdGlhbCBkYXRhLi4uJyk7XG4gICAgXG4gICAgLy8gU2VlZCBvcmdhbml6YXRpb25hbCByb2xlcyBmaXJzdFxuICAgIGNvbnN0IHJvbGVzID0gW1xuICAgICAgeyByb2xlQ29kZTogMCwgZGVzY3JpcHRpb246ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1RENcdTA1REYgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RDRcdTA1RThcdTA1RTlcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNURFXHUwNURDXHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDRcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiAxLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVFOFx1MDVFOVx1MDVEMFx1MDVENVx1MDVFQSBcdTA1REVcdTA1RENcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNURDXHUwNUUwXHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNURDIFx1MDVEQlx1MDVEQyBcdTA1RUFcdTA1RDRcdTA1RENcdTA1RDlcdTA1REJcdTA1RDkgXHUwNUQ0XHUwNUU4XHUwNURCXHUwNUU5JyB9LFxuICAgICAgeyByb2xlQ29kZTogMiwgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1RDBcdTA1RTkgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBIFx1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVFMFx1MDVEOVx1MDVERCBcdTA1RDVcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNURFXHUwNUU5XHUwNUQ5XHUwNURFXHUwNUQ1XHUwNUVBJyB9LFxuICAgICAgeyByb2xlQ29kZTogMywgZGVzY3JpcHRpb246ICdcdTA1RTdcdTA1RTBcdTA1RDlcdTA1RDlcdTA1REYnLCBwZXJtaXNzaW9uczogJ1x1MDVEMVx1MDVEOVx1MDVFNlx1MDVENVx1MDVFMiBcdTA1RTRcdTA1RTJcdTA1RDlcdTA1RENcdTA1RDVcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA0LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDNcdTA1RDVcdTA1RThcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVEMlx1MDVFOVx1MDVFQSBcdTA1RDFcdTA1RTdcdTA1RTlcdTA1RDVcdTA1RUEgXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RDBcdTA1RDdcdTA1RTggXHUwNUUxXHUwNUQ4XHUwNUQ4XHUwNUQ1XHUwNUUxJyB9LFxuICAgICAgeyByb2xlQ29kZTogNSwgZGVzY3JpcHRpb246ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1RENcdTA1REYgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUQ0XHUwNUQyXHUwNUQzXHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDVcdTA1RDhcdTA1RDFcdTA1RENcdTA1RDBcdTA1RDVcdTA1RUEgXHUwNUUyXHUwNUQ2XHUwNUU4JyB9LFxuICAgICAgeyByb2xlQ29kZTogOSwgZGVzY3JpcHRpb246ICdcdTA1RDJcdTA1RDVcdTA1RThcdTA1REQgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgcGVybWlzc2lvbnM6ICdcdTA1RUFcdTA1RDdcdTA1RDZcdTA1RDVcdTA1RTdcdTA1RUEgXHUwNUVBXHUwNUU5XHUwNUVBXHUwNUQ5XHUwNUQ1XHUwNUVBIFx1MDVENFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScgfVxuICAgIF07XG4gICAgXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUoJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknKTtcbiAgICAgICAgZm9yIChjb25zdCByb2xlIG9mIHJvbGVzKSB7XG4gICAgICAgICAgc3RtdC5ydW4oW3JvbGUucm9sZUNvZGUsIHJvbGUuZGVzY3JpcHRpb24sIHJvbGUucGVybWlzc2lvbnNdKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10LmZpbmFsaXplKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBTZWVkIGRpdmlzaW9uc1xuICAgIGNvbnN0IGRpdmlzaW9ucyA9IFtcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RUFcdTA1RTRcdTA1RTJcdTA1RDVcdTA1REMnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDBcdTA1RDJcdTA1RTMgXHUwNUU5XHUwNUQ5XHUwNUQ1XHUwNUQ1XHUwNUU3JywgaXNJbnRlcm5hbDogdHJ1ZSB9LFxuICAgICAgeyBuYW1lOiAnXHUwNURDXHUwNUU3XHUwNUQ1XHUwNUQ3IFx1MDVEN1x1MDVEOVx1MDVFNlx1MDVENVx1MDVFMFx1MDVEOSBcdTA1RDAnLCBpc0ludGVybmFsOiBmYWxzZSB9XG4gICAgXTtcbiAgICBcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZSgnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknKTtcbiAgICAgICAgZm9yIChjb25zdCBkaXZpc2lvbiBvZiBkaXZpc2lvbnMpIHtcbiAgICAgICAgICBzdG10LnJ1bihbZGl2aXNpb24ubmFtZSwgZGl2aXNpb24uaXNJbnRlcm5hbF0pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFNlZWQgZGVwYXJ0bWVudHMgKGFmdGVyIGRpdmlzaW9ucylcbiAgICBjb25zdCBkZXBhcnRtZW50cyA9IFtcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDQnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgZGl2aXNpb25JZDogMSB9LFxuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVFOVx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDdcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAyIH1cbiAgICBdO1xuICAgIFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyk7XG4gICAgICAgIGZvciAoY29uc3QgZGVwdCBvZiBkZXBhcnRtZW50cykge1xuICAgICAgICAgIHN0bXQucnVuKFtkZXB0Lm5hbWUsIGRlcHQuZGl2aXNpb25JZF0pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFNlZWQgcHJvY3VyZW1lbnQgdGVhbXNcbiAgICBjb25zdCB0ZWFtcyA9IFtcbiAgICAgICdcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RDNcdTA1RDknLCAnXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5JywgJ1x1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOScsICdcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLCAnXHUwNUQ0XHUwNUUwXHUwNUQzXHUwNUUxXHUwNUQ5JywgJ1x1MDVEMVx1MDVEOVx1MDVEOFx1MDVEN1x1MDVENVx1MDVFMFx1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gcHJvY3VyZW1lbnRfdGVhbXMgKG5hbWUpIFZBTFVFUyAoPyknKTtcbiAgICAgICAgZm9yIChjb25zdCB0ZWFtIG9mIHRlYW1zKSB7XG4gICAgICAgICAgc3RtdC5ydW4oW3RlYW1dKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10LmZpbmFsaXplKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBTZWVkIGRvbWFpbnNcbiAgICBjb25zdCBkb21haW5zID0gW1xuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDlcdTA1RDQgXHUwNUQ1XHUwNURFXHUwNUQ3XHUwNUU5XHUwNUQ1XHUwNUQxJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBXHUwNUQ5XHUwNUREIFx1MDVERVx1MDVFN1x1MDVFNlx1MDVENVx1MDVFMlx1MDVEOVx1MDVEOVx1MDVERCcsXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVFNlx1MDVEOVx1MDVENVx1MDVEMyBcdTA1REVcdTA1RTlcdTA1RThcdTA1RDNcdTA1RDknXG4gICAgXTtcbiAgICBcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZSgnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJyk7XG4gICAgICAgIGZvciAoY29uc3QgZG9tYWluIG9mIGRvbWFpbnMpIHtcbiAgICAgICAgICBzdG10LnJ1bihbZG9tYWluXSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RtdC5maW5hbGl6ZSgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gU2VlZCBhY3Rpdml0eSBwb29sXG4gICAgY29uc3QgYWN0aXZpdGllcyA9IFtcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEM1x1MDVEOVx1MDVFN1x1MDVFQSBcdTA1RDRcdTA1RTZcdTA1RTJcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBIFx1MDVERVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVEQlx1MDVFMFx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDggXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUU0XHUwNUU4XHUwNUQ4LCBcdTA1RDlcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RTUgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNUREIFx1MDVERVx1MDVEQlx1MDVFOFx1MDVENicsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFNFx1MDVFOFx1MDVFMVx1MDVENVx1MDVERCwgXHUwNUQwXHUwNUVBXHUwNUU4IFx1MDVENFx1MDVEN1x1MDVEMVx1MDVFOFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTZcdTA1RTJcdTA1RDVcdTA1RUEnLCB0b29sczogJ1x1MDVERVx1MDVEOFx1MDVFOFx1MDVEOVx1MDVFNlx1MDVFQSBcdTA1RDRcdTA1RTJcdTA1RThcdTA1REJcdTA1RDQsIFx1MDVENVx1MDVFMlx1MDVEM1x1MDVFQSBcdTA1RDFcdTA1RDdcdTA1RDlcdTA1RTBcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RDdcdTA1RDlcdTA1RThcdTA1RUEgXHUwNUQ2XHUwNUQ1XHUwNURCXHUwNUQ0JywgdG9vbHM6ICdcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDhcdTA1RDVcdTA1RTdcdTA1RDVcdTA1REMgXHUwNUQ0XHUwNUQ3XHUwNURDXHUwNUQ4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ3XHUwNUVBXHUwNUQ5XHUwNURFXHUwNUQ0IFx1MDVFMlx1MDVEQyBcdTA1RDRcdTA1RTFcdTA1REJcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUQ3XHUwNUQ1XHUwNUQ2XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUU3XHUwNUU4XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNUU4XHUwNUU5XHUwNUQ5XHUwNURFXHUwNUVBIFx1MDVEMVx1MDVEM1x1MDVEOVx1MDVFN1x1MDVENVx1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDBcdTA1RDlcdTA1RTlcdTA1RDVcdTA1RTggXHUwNUVBXHUwNUU5XHUwNURDXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURCXHUwNUUxXHUwNUU0XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMVx1MDVEOVx1MDVFNlx1MDVENVx1MDVFMicsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDhcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTFcdTA1RDJcdTA1RDlcdTA1RThcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUQ1XHUwNUQ5XHUwNUU3XHUwNUQ4JywgdG9vbHM6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQzXHUwNUQ1XHUwNUQ3IFx1MDVFMVx1MDVEOVx1MDVEQlx1MDVENVx1MDVERCcsIHRvb2xzOiAnXHUwNUVBXHUwNUQxXHUwNUUwXHUwNUQ5XHUwNUVBIFx1MDVEM1x1MDVENVx1MDVENycgfVxuICAgIF07XG4gICAgXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUoJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyk7XG4gICAgICAgIGZvciAoY29uc3QgYWN0aXZpdHkgb2YgYWN0aXZpdGllcykge1xuICAgICAgICAgIHN0bXQucnVuKFthY3Rpdml0eS5uYW1lLCBhY3Rpdml0eS50b29sc10pO1xuICAgICAgICB9XG4gICAgICAgIHN0bXQuZmluYWxpemUoKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFNlZWQgZW5nYWdlbWVudCB0eXBlc1xuICAgIGNvbnN0IGVuZ2FnZW1lbnRUeXBlcyA9IFtcbiAgICAgICdcdTA1REVcdTA1REJcdTA1RThcdTA1RDYgXHUwNUU0XHUwNUQ1XHUwNURFXHUwNUQxXHUwNUQ5JyxcbiAgICAgICdcdTA1REVcdTA1REJcdTA1RThcdTA1RDYgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1REVcdTA1REJcdTA1RThcdTA1RDYgXHUwNUU0XHUwNUVBXHUwNUQ1XHUwNUQ3IFx1MDVERVx1MDVENVx1MDVEMlx1MDVEMVx1MDVEQycsXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENFx1MDVFOVx1MDVENVx1MDVENVx1MDVEMFx1MDVFQVx1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZW5nYWdlbWVudF90eXBlcyAobmFtZSkgVkFMVUVTICg/KScpO1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgZW5nYWdlbWVudFR5cGVzKSB7XG4gICAgICAgICAgc3RtdC5ydW4oW3R5cGVdKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10LmZpbmFsaXplKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFNlZWQgY29tcGxleGl0eSBlc3RpbWF0ZXMgKHNpbmdsZSByZWNvcmQpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIucnVuKGBcbiAgICAgICAgSU5TRVJUIE9SIElHTk9SRSBJTlRPIGNvbXBsZXhpdHlfZXN0aW1hdGVzIChpZCwgZXN0aW1hdGVfbGV2ZWxfMSwgZXN0aW1hdGVfbGV2ZWxfMiwgZXN0aW1hdGVfbGV2ZWxfMykgXG4gICAgICAgIFZBTFVFUyAoMSwgNSwgMTAsIDIwKVxuICAgICAgYCwgKGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFNlZWQgYWNjZXB0YW5jZSBvcHRpb25zXG4gICAgY29uc3QgYWNjZXB0YW5jZU9wdGlvbnMgPSBbXG4gICAgICB7XG4gICAgICAgIHllYXJJZDogMjAyNCxcbiAgICAgICAgdXBsb2FkQ29kZTogJ0ZpbmlzaCcsXG4gICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogJ1x1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERCcsXG4gICAgICAgIGJyb2FkTWVhbmluZzogJ1x1MDVFOVx1MDVFMFx1MDVFQSAyMDI0IFx1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERVx1MDVENCBcdTA1RDVcdTA1RENcdTA1RDAgXHUwNUUwXHUwNUQ5XHUwNUVBXHUwNURGIFx1MDVEQ1x1MDVENFx1MDVFMlx1MDVEQ1x1MDVENVx1MDVFQSBcdTA1RDNcdTA1RThcdTA1RDlcdTA1RTlcdTA1RDVcdTA1RUEgXHUwNUQ3XHUwNUQzXHUwNUU5XHUwNUQ1XHUwNUVBJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeWVhcklkOiAyMDI1LFxuICAgICAgICB1cGxvYWRDb2RlOiAnUGxhbicsXG4gICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVERicsXG4gICAgICAgIGJyb2FkTWVhbmluZzogJ1x1MDVFNFx1MDVFQVx1MDVENVx1MDVENyBcdTA1RENcdTA1RTdcdTA1RENcdTA1RDlcdTA1RDhcdTA1RUEgXHUwNUQzXHUwNUU4XHUwNUQ5XHUwNUU5XHUwNUQ1XHUwNUVBIFx1MDVEN1x1MDVEM1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTlcdTA1RTBcdTA1RUEgMjAyNSdcbiAgICAgIH1cbiAgICBdO1xuXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIuc2VyaWFsaXplKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUoYFxuICAgICAgICAgIElOU0VSVCBPUiBJR05PUkUgSU5UTyBhY2NlcHRhbmNlX29wdGlvbnMgKHllYXJfaWQsIHVwbG9hZF9jb2RlLCB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiwgYnJvYWRfbWVhbmluZykgXG4gICAgICAgICAgVkFMVUVTICg/LCA/LCA/LCA/KVxuICAgICAgICBgKTtcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgYWNjZXB0YW5jZU9wdGlvbnMpIHtcbiAgICAgICAgICBzdG10LnJ1bihbb3B0aW9uLnllYXJJZCwgb3B0aW9uLnVwbG9hZENvZGUsIG9wdGlvbi51cGxvYWRDb2RlRGVzY3JpcHRpb24sIG9wdGlvbi5icm9hZE1lYW5pbmddKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10LmZpbmFsaXplKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBhZG1pbiB1c2VyIChhZnRlciBvcmdhbml6YXRpb25hbF9yb2xlcyBpcyBwb3B1bGF0ZWQpXG4gICAgY29uc3QgYWRtaW5QYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKCcxMjM0NTYnLCAxMik7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGIucnVuKFxuICAgICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgICBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUsIHJvbGVfZGVzY3JpcHRpb24sIFxuICAgICAgICAgIHBhc3N3b3JkX2hhc2gsIGVtYWlsXG4gICAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICAgIFsnOTk5OScsICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJywgOSwgJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBhZG1pblBhc3N3b3JkLCAnYWRtaW5Ac3lzdGVtLmNvbSddLFxuICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgZWxzZSByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIHNhbXBsZSBwcm9jdXJlbWVudCBtYW5hZ2VyIChhZnRlciBvcmdhbml6YXRpb25hbF9yb2xlcyBpcyBwb3B1bGF0ZWQpXG4gICAgY29uc3QgbWFuYWdlclBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgIGBJTlNFUlQgT1IgSUdOT1JFIElOVE8gdXNlcnMgKFxuICAgICAgICAgIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgXG4gICAgICAgICAgcGFzc3dvcmRfaGFzaCwgcHJvY3VyZW1lbnRfdGVhbSwgYXZhaWxhYmxlX3dvcmtfZGF5c1xuICAgICAgICApIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPylgLFxuICAgICAgICBbJzEwMDEnLCAnXHUwNUQwXHUwNUQxXHUwNUU4XHUwNUQ0XHUwNUREIFx1MDVERVx1MDVFMFx1MDVENFx1MDVEQycsIDEsICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNUU4XHUwNURCXHUwNUU5JywgbWFuYWdlclBhc3N3b3JkLCAnXHUwNUQ5XHUwNUUyXHUwNUQ1XHUwNUQzXHUwNUQ5JywgMjAwXSxcbiAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgIGVsc2UgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBzZWVkZWQgc3VjY2Vzc2Z1bGx5IScpO1xuICAgIGNvbnNvbGUubG9nKCdEZWZhdWx0IHVzZXJzIGNyZWF0ZWQ6Jyk7XG4gICAgY29uc29sZS5sb2coJy0gQWRtaW46IDk5OTkgLyAxMjM0NTYnKTtcbiAgICBjb25zb2xlLmxvZygnLSBNYW5hZ2VyOiAxMDAxIC8gMTIzNDU2Jyk7XG4gICAgXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlZWQgZGF0YWJhc2U6JywgZXJyb3IpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuXG5leHBvcnQgeyBzZWVkRGF0YWJhc2UgfTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9leHByZXNzLWFwcC5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycyc7XG5pbXBvcnQgaGVsbWV0IGZyb20gJ2hlbG1ldCc7XG5pbXBvcnQgbW9yZ2FuIGZyb20gJ21vcmdhbic7XG5pbXBvcnQgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nO1xuaW1wb3J0IHJhdGVMaW1pdCBmcm9tICdleHByZXNzLXJhdGUtbGltaXQnO1xuaW1wb3J0IHsgaW5pdGlhbGl6ZURhdGFiYXNlIH0gZnJvbSAnLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IGF1dGhSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvYXV0aC5qcyc7XG5pbXBvcnQgd29ya2Vyc1JvdXRlcyBmcm9tICcuL3JvdXRlcy93b3JrZXJzLmpzJztcbmltcG9ydCBzeXN0ZW1Sb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvc3lzdGVtLmpzJztcbmltcG9ydCBwbGFubmluZ1JvdXRlcyBmcm9tICcuL3JvdXRlcy9wbGFubmluZy5qcyc7XG5cbi8vIEVudmlyb25tZW50IHZhcmlhYmxlc1xucHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQgfHwgJ3lvdXItc3VwZXItc2VjcmV0LWp3dC1rZXktY2hhbmdlLXRoaXMtaW4tcHJvZHVjdGlvbic7XG5wcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiA9IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOIHx8ICcyNGgnO1xucHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyA9IHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMgfHwgJzEyJztcblxubGV0IGV4cHJlc3NBcHAgPSBudWxsO1xubGV0IGlzQXBwSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRXhwcmVzc0FwcCgpIHtcbiAgaWYgKGV4cHJlc3NBcHApIHtcbiAgICByZXR1cm4gZXhwcmVzc0FwcDtcbiAgfVxuXG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcblxuICAvLyBTZWN1cml0eSBtaWRkbGV3YXJlXG4gIGFwcC51c2UoaGVsbWV0KHtcbiAgICBjb250ZW50U2VjdXJpdHlQb2xpY3k6IGZhbHNlLCAvLyBEaXNhYmxlIENTUCBmb3IgZGV2ZWxvcG1lbnRcbiAgfSkpO1xuICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuXG4gIC8vIFJhdGUgbGltaXRpbmdcbiAgY29uc3QgbGltaXRlciA9IHJhdGVMaW1pdCh7XG4gICAgd2luZG93TXM6IDE1ICogNjAgKiAxMDAwLCAvLyAxNSBtaW51dGVzXG4gICAgbWF4OiAxMDAwLCAvLyBJbmNyZWFzZWQgbGltaXQgZm9yIGRldmVsb3BtZW50XG4gICAgbWVzc2FnZTogeyBlcnJvcjogJ1RvbyBtYW55IHJlcXVlc3RzIGZyb20gdGhpcyBJUCwgcGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nIH1cbiAgfSk7XG4gIGFwcC51c2UobGltaXRlcik7XG5cbiAgLy8gQ09SUyBjb25maWd1cmF0aW9uXG4gIGFwcC51c2UoY29ycyh7XG4gICAgb3JpZ2luOiB0cnVlLCAvLyBBbGxvdyBhbGwgb3JpZ2lucyBpbiBkZXZlbG9wbWVudFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxuICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXG4gICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXVxuICB9KSk7XG5cbiAgLy8gQm9keSBwYXJzaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZShleHByZXNzLmpzb24oeyBsaW1pdDogJzEwbWInIH0pKTtcbiAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICcxMG1iJyB9KSk7XG5cbiAgLy8gTG9nZ2luZ1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIGFwcC51c2UobW9yZ2FuKCdkZXYnKSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIGRhdGFiYXNlIG9ubHkgb25jZVxuICBpZiAoIWlzQXBwSW5pdGlhbGl6ZWQpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgaW5pdGlhbGl6ZURhdGFiYXNlKCk7XG4gICAgICBjb25zb2xlLmxvZygnXHUyNzA1IERhdGFiYXNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICAvLyBTZWVkIGRhdGFiYXNlXG4gICAgICBjb25zdCB7IHNlZWREYXRhYmFzZSB9ID0gYXdhaXQgaW1wb3J0KCcuL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzJyk7XG4gICAgICBhd2FpdCBzZWVkRGF0YWJhc2UoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICBpc0FwcEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEZhaWxlZCB0byBpbml0aWFsaXplIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBIZWFsdGggY2hlY2sgZW5kcG9pbnRcbiAgYXBwLmdldCgnL2hlYWx0aCcsIChyZXEsIHJlcykgPT4ge1xuICAgIHJlcy5qc29uKHsgXG4gICAgICBzdGF0dXM6ICdPSycsIFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEFQSSBSb3V0ZXNcbiAgYXBwLnVzZSgnL2F1dGgnLCBhdXRoUm91dGVzKTtcbiAgYXBwLnVzZSgnL3dvcmtlcnMnLCB3b3JrZXJzUm91dGVzKTtcbiAgYXBwLnVzZSgnL3N5c3RlbScsIHN5c3RlbVJvdXRlcyk7XG4gIGFwcC51c2UoJy9wbGFubmluZycsIHBsYW5uaW5nUm91dGVzKTtcblxuICAvLyBFcnJvciBoYW5kbGluZyBtaWRkbGV3YXJlXG4gIGFwcC51c2UoKGVyciwgcmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKCdBUEkgRXJyb3I6JywgZXJyKTtcbiAgICBcbiAgICBpZiAoZXJyLnR5cGUgPT09ICdlbnRpdHkucGFyc2UuZmFpbGVkJykge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIEpTT04gZm9ybWF0JyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVzLnN0YXR1cyhlcnIuc3RhdHVzIHx8IDUwMCkuanNvbih7XG4gICAgICBlcnJvcjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyBcbiAgICAgICAgPyAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyBcbiAgICAgICAgOiBlcnIubWVzc2FnZVxuICAgIH0pO1xuICB9KTtcblxuICAvLyA0MDQgaGFuZGxlciBmb3IgQVBJIHJvdXRlc1xuICBhcHAudXNlKCcqJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FQSSByb3V0ZSBub3QgZm91bmQnIH0pO1xuICB9KTtcblxuICBleHByZXNzQXBwID0gYXBwO1xuICBjb25zb2xlLmxvZygnXHUyNzA1IEV4cHJlc3MgYXBwIGNyZWF0ZWQgYW5kIGNvbmZpZ3VyZWQnKTtcbiAgcmV0dXJuIGFwcDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRXhwcmVzc0FwcCB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gU2V0IGNvbnNpc3RlbnQgZGF0YWJhc2UgcGF0aCBiZWZvcmUgYW55IHNlcnZlciBtb2R1bGVzIGFyZSBpbXBvcnRlZFxucHJvY2Vzcy5lbnYuREJfUEFUSCA9ICcuL3NyYy9zZXJ2ZXIvZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2UsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBDdXN0b20gcGx1Z2luIHRvIGludGVncmF0ZSBFeHByZXNzIHNlcnZlclxuICAgIHtcbiAgICAgIG5hbWU6ICdleHByZXNzLWludGVncmF0aW9uJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gSW1wb3J0IGFuZCBzZXR1cCBFeHByZXNzIHJvdXRlc1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCB0aGUgRXhwcmVzcyBhcHBcbiAgICAgICAgICAgIGNvbnN0IHsgY3JlYXRlRXhwcmVzc0FwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4cHJlc3NBcHAgPSBhd2FpdCBjcmVhdGVFeHByZXNzQXBwKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgcmVxdWVzdCB3aXRoIEV4cHJlc3NcbiAgICAgICAgICAgIGV4cHJlc3NBcHAocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHByZXNzIG1pZGRsZXdhcmUgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgbmV4dChlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBeVEsT0FBTyxhQUFhO0FBQzdSLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFlZixTQUFTLGNBQWM7QUFDckIsTUFBSSxDQUFDLElBQUk7QUFDUCxZQUFRLElBQUksNkJBQTZCLE9BQU87QUFDaEQsU0FBSyxJQUFJLFFBQVEsU0FBUyxTQUFTLENBQUMsUUFBUTtBQUMxQyxVQUFJLEtBQUs7QUFDUCxnQkFBUSxNQUFNLDJCQUEyQixHQUFHO0FBQzVDLGNBQU07QUFBQSxNQUNSO0FBQ0EsY0FBUSxJQUFJLG9DQUFvQyxPQUFPO0FBQUEsSUFDekQsQ0FBQztBQUdELE9BQUcsSUFBSSwwQkFBMEI7QUFBQSxFQUNuQztBQUNBLFNBQU87QUFDVDtBQUVBLGVBQWUscUJBQXFCO0FBRWxDLE1BQUksZUFBZTtBQUNqQixZQUFRLElBQUksMkNBQTJDO0FBQ3ZEO0FBQUEsRUFDRjtBQUVBLFFBQU1BLE1BQUssWUFBWTtBQUV2QixTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxJQUFBQSxJQUFHLFVBQVUsTUFBTTtBQUNqQixjQUFRLElBQUksNkJBQTZCO0FBR3pDLE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BT047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FNTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BT047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BS047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQW1CTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FLTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQU1OO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUtOO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FVTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQW9DTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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QUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sZ0JBQWdCO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUE7QUFBQSxJQUVoQjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFFdEIsZUFBTyxZQUFZLElBQUksUUFBUSxPQUFPLEtBQUssS0FBSyxTQUFTO0FBQ3ZELGNBQUk7QUFFRixrQkFBTSxFQUFFLGtCQUFBQyxrQkFBaUIsSUFBSSxNQUFNO0FBQ25DLGtCQUFNQyxjQUFhLE1BQU1ELGtCQUFpQjtBQUcxQyxZQUFBQyxZQUFXLEtBQUssS0FBSyxJQUFJO0FBQUEsVUFDM0IsU0FBUyxPQUFPO0FBQ2Qsb0JBQVEsTUFBTSw2QkFBNkIsS0FBSztBQUNoRCxpQkFBSyxLQUFLO0FBQUEsVUFDWjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsiZGIiLCAiZXJyIiwgImp3dCIsICJpbml0X2F1dGgiLCAiZGIiLCAiZXhwcmVzcyIsICJiY3J5cHQiLCAiYm9keSIsICJ2YWxpZGF0aW9uUmVzdWx0IiwgInJvdXRlciIsICJkYiIsICJlcnIiLCAiZXhwcmVzcyIsICJib2R5IiwgInZhbGlkYXRpb25SZXN1bHQiLCAicm91dGVyIiwgImRiIiwgImVyciIsICJleHByZXNzIiwgImJvZHkiLCAidmFsaWRhdGlvblJlc3VsdCIsICJyb3V0ZXIiLCAiZGIiLCAiZXJyIiwgImJjcnlwdCIsICJkYiIsICJleHByZXNzIiwgInNlZWREYXRhYmFzZSIsICJpbml0X2F1dGgiLCAicGF0aCIsICJjcmVhdGVFeHByZXNzQXBwIiwgImV4cHJlc3NBcHAiLCAicGF0aCJdCn0K
