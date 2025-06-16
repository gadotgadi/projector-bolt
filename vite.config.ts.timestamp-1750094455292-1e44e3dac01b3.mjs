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
import { fileURLToPath } from "url";
import fs from "fs";
function getDatabase() {
  if (!dbInstance) {
    console.log("Initializing database at:", DB_PATH);
    dbInstance = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        throw err;
      }
      console.log("Connected to SQLite database at:", DB_PATH);
    });
    dbInstance.run("PRAGMA foreign_keys = ON");
  }
  return dbInstance;
}
function closeDatabase() {
  if (dbInstance) {
    dbInstance.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
      }
    });
    dbInstance = null;
  }
}
async function initializeDatabase() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    console.log("Creating database tables...");
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS organizational_roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role_code INTEGER UNIQUE NOT NULL,
          description TEXT NOT NULL,
          permissions TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS divisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT 1
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          division_id INTEGER,
          FOREIGN KEY (division_id) REFERENCES divisions(id)
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS procurement_teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        )
      `);
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
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_pool (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          tools_and_resources TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL
        )
      `);
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
      db.run(`
        CREATE TABLE IF NOT EXISTS complexity_estimates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estimate_level_1 INTEGER NOT NULL DEFAULT 5,
          estimate_level_2 INTEGER NOT NULL DEFAULT 10,
          estimate_level_3 INTEGER NOT NULL DEFAULT 20,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
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
      db.run("CREATE INDEX IF NOT EXISTS idx_workers_employee_id ON workers(employee_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_workers_role_code ON workers(role_code)");
      db.run("CREATE INDEX IF NOT EXISTS idx_programs_task_id ON programs(task_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status)");
      db.run("CREATE INDEX IF NOT EXISTS idx_program_tasks_program_id ON program_tasks(program_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_program_tasks_station_id ON program_tasks(station_id)");
      console.log("Database tables and indexes created successfully");
      resolve();
    });
    db.on("error", (err) => {
      console.error("Database error:", err);
      reject(err);
    });
  });
}
var __vite_injected_original_import_meta_url, __filename, __dirname2, DATA_DIR, DB_PATH, dbInstance;
var init_database = __esm({
  "src/server/config/database.js"() {
    __vite_injected_original_import_meta_url = "file:///home/project/src/server/config/database.js";
    __filename = fileURLToPath(__vite_injected_original_import_meta_url);
    __dirname2 = path.dirname(__filename);
    DATA_DIR = process.env.DATA_DIR || path.join(__dirname2, "../data");
    DB_PATH = process.env.DATABASE_URL || path.join(DATA_DIR, "procurement.db");
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log("\u{1F4C1} Created data directory:", DATA_DIR);
    }
    dbInstance = null;
    process.on("SIGINT", () => {
      console.log("Received SIGINT, closing database...");
      closeDatabase();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      console.log("Received SIGTERM, closing database...");
      closeDatabase();
      process.exit(0);
    });
  }
});

// src/server/middleware/auth.js
import jwt from "file:///home/project/node_modules/jsonwebtoken/index.js";
var authenticateToken, requireRole, getUserFromToken;
var init_auth = __esm({
  "src/server/middleware/auth.js"() {
    init_database();
    authenticateToken = (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Access token required" });
      }
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.error("Token verification failed:", err);
          return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
      });
    };
    requireRole = (allowedRoles) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ error: "Authentication required" });
        }
        if (!allowedRoles.includes(req.user.roleCode)) {
          return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
      };
    };
    getUserFromToken = async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = getDatabase();
        return new Promise((resolve, reject) => {
          db.get(
            `SELECT w.*, d.name as division_name, dept.name as department_name 
         FROM workers w 
         LEFT JOIN divisions d ON w.division_id = d.id 
         LEFT JOIN departments dept ON w.department_id = dept.id 
         WHERE w.id = ?`,
            [decoded.id],
            (err, row) => {
              if (err) {
                reject(err);
              } else {
                resolve(row);
              }
            }
          );
        });
      } catch (error) {
        throw new Error("Invalid token");
      }
    };
  }
});

// src/server/routes/auth.js
import express from "file:///home/project/node_modules/express/index.js";
import bcrypt from "file:///home/project/node_modules/bcryptjs/index.js";
import jwt2 from "file:///home/project/node_modules/jsonwebtoken/index.js";
var router, auth_default;
var init_auth2 = __esm({
  "src/server/routes/auth.js"() {
    init_database();
    init_auth();
    router = express.Router();
    router.post("/login", async (req, res) => {
      try {
        const { employeeId, password } = req.body;
        console.log("\u{1F50D} Login attempt:", { employeeId, passwordLength: password?.length });
        if (!employeeId || !password) {
          console.log("\u274C Missing credentials");
          return res.status(400).json({ error: "Employee ID and password are required" });
        }
        if (employeeId.length !== 4 || !/^\d{4}$/.test(employeeId)) {
          console.log("\u274C Invalid employee ID format");
          return res.status(400).json({ error: "Employee ID must be exactly 4 digits" });
        }
        if (password.length !== 6) {
          console.log("\u274C Invalid password length");
          return res.status(400).json({ error: "Password must be exactly 6 characters" });
        }
        const db = getDatabase();
        db.all("SELECT employee_id, full_name FROM workers", (err, allUsers) => {
          if (err) {
            console.error("\u274C Error checking users:", err);
          } else {
            console.log("\u{1F4CB} Available users in database:", allUsers);
          }
        });
        db.get(
          `SELECT w.*, d.name as division_name, dept.name as department_name, or_role.description as role_description
       FROM workers w 
       LEFT JOIN divisions d ON w.division_id = d.id 
       LEFT JOIN departments dept ON w.department_id = dept.id 
       LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
       WHERE w.employee_id = ?`,
          [employeeId],
          async (err, user) => {
            if (err) {
              console.error("\u274C Database error during login:", err);
              return res.status(500).json({ error: "Database error" });
            }
            console.log("\u{1F50D} User found in database:", user ? "YES" : "NO");
            if (user) {
              console.log("\u{1F464} User details:", {
                id: user.id,
                employeeId: user.employee_id,
                fullName: user.full_name,
                roleCode: user.role_code,
                hasPassword: !!user.password
              });
            }
            if (!user) {
              console.log("\u274C User not found for employee ID:", employeeId);
              return res.status(401).json({ error: "Invalid credentials" });
            }
            console.log("\u{1F50D} Verifying password...");
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log("\u{1F50D} Password valid:", isValidPassword);
            if (!isValidPassword) {
              console.log("\u274C Invalid password for user:", employeeId);
              return res.status(401).json({ error: "Invalid credentials" });
            }
            console.log("\u2705 Login successful for user:", employeeId);
            const token = jwt2.sign(
              {
                id: user.id,
                employeeId: user.employee_id,
                roleCode: user.role_code
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            const responseData = {
              token,
              user: {
                id: user.id,
                employeeId: user.employee_id,
                fullName: user.full_name,
                roleCode: user.role_code,
                roleDescription: user.role_description || "Unknown Role",
                procurementTeam: user.procurement_team,
                email: user.email,
                divisionName: user.division_name,
                departmentName: user.department_name
              }
            };
            console.log("\u2705 Sending response:", responseData);
            res.json(responseData);
          }
        );
      } catch (error) {
        console.error("\u274C Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router.get("/me", authenticateToken, async (req, res) => {
      try {
        const user = await getUserFromToken(req.headers.authorization.split(" ")[1]);
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
          email: user.email,
          divisionName: user.division_name,
          departmentName: user.department_name
        });
      } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    auth_default = router;
  }
});

// src/server/routes/workers.js
import express2 from "file:///home/project/node_modules/express/index.js";
import bcrypt2 from "file:///home/project/node_modules/bcryptjs/index.js";
var router2, workers_default;
var init_workers = __esm({
  "src/server/routes/workers.js"() {
    init_database();
    init_auth();
    router2 = express2.Router();
    router2.get("/", authenticateToken, requireRole([0, 9]), (req, res) => {
      const db = getDatabase();
      db.all(
        `SELECT w.*, d.name as divisionName, dept.name as departmentName, or_role.description as roleDescription
     FROM workers w 
     LEFT JOIN divisions d ON w.division_id = d.id 
     LEFT JOIN departments dept ON w.department_id = dept.id 
     LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
     ORDER BY w.full_name`,
        (err, rows) => {
          if (err) {
            console.error("Error fetching workers:", err);
            return res.status(500).json({ error: "Database error" });
          }
          const workers = rows.map((row) => ({
            id: row.id,
            employeeId: row.employee_id,
            roleCode: row.role_code,
            fullName: row.full_name,
            roleDescription: row.roleDescription,
            divisionId: row.division_id,
            departmentId: row.department_id,
            procurementTeam: row.procurement_team,
            password: "******",
            // Never send actual password
            availableWorkDays: row.available_work_days,
            email: row.email,
            divisionName: row.divisionName,
            departmentName: row.departmentName
          }));
          res.json(workers);
        }
      );
    });
    router2.post("/", authenticateToken, requireRole([0, 9]), async (req, res) => {
      try {
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
        if (!employeeId || !roleCode || !fullName || !password) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const hashedPassword = await bcrypt2.hash(password, 12);
        const db = getDatabase();
        db.run(
          `INSERT INTO workers 
       (employee_id, role_code, full_name, role_description, division_id, department_id, 
        procurement_team, password, available_work_days, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employeeId,
            roleCode,
            fullName,
            roleDescription,
            divisionId,
            departmentId,
            procurementTeam,
            hashedPassword,
            availableWorkDays,
            email
          ],
          function(err) {
            if (err) {
              console.error("Error creating worker:", err);
              if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: "Employee ID already exists" });
              }
              return res.status(500).json({ error: "Database error" });
            }
            db.get(
              `SELECT w.*, d.name as divisionName, dept.name as departmentName, or_role.description as roleDescription
           FROM workers w 
           LEFT JOIN divisions d ON w.division_id = d.id 
           LEFT JOIN departments dept ON w.department_id = dept.id 
           LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
           WHERE w.id = ?`,
              [this.lastID],
              (err2, row) => {
                if (err2) {
                  console.error("Error fetching created worker:", err2);
                  return res.status(500).json({ error: "Database error" });
                }
                const worker = {
                  id: row.id,
                  employeeId: row.employee_id,
                  roleCode: row.role_code,
                  fullName: row.full_name,
                  roleDescription: row.roleDescription,
                  divisionId: row.division_id,
                  departmentId: row.department_id,
                  procurementTeam: row.procurement_team,
                  password: "******",
                  availableWorkDays: row.available_work_days,
                  email: row.email,
                  divisionName: row.divisionName,
                  departmentName: row.departmentName
                };
                res.status(201).json(worker);
              }
            );
          }
        );
      } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router2.put("/:id", authenticateToken, requireRole([0, 9]), async (req, res) => {
      try {
        const { id } = req.params;
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
        const db = getDatabase();
        let updateQuery = `
      UPDATE workers SET 
        employee_id = ?, role_code = ?, full_name = ?, role_description = ?,
        division_id = ?, department_id = ?, procurement_team = ?, 
        available_work_days = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    `;
        let params = [
          employeeId,
          roleCode,
          fullName,
          roleDescription,
          divisionId,
          departmentId,
          procurementTeam,
          availableWorkDays,
          email
        ];
        if (password && password !== "******") {
          const hashedPassword = await bcrypt2.hash(password, 12);
          updateQuery += ", password = ?";
          params.push(hashedPassword);
        }
        updateQuery += " WHERE id = ?";
        params.push(id);
        db.run(updateQuery, params, function(err) {
          if (err) {
            console.error("Error updating worker:", err);
            if (err.message.includes("UNIQUE constraint failed")) {
              return res.status(400).json({ error: "Employee ID already exists" });
            }
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Worker not found" });
          }
          db.get(
            `SELECT w.*, d.name as divisionName, dept.name as departmentName, or_role.description as roleDescription
         FROM workers w 
         LEFT JOIN divisions d ON w.division_id = d.id 
         LEFT JOIN departments dept ON w.department_id = dept.id 
         LEFT JOIN organizational_roles or_role ON w.role_code = or_role.role_code
         WHERE w.id = ?`,
            [id],
            (err2, row) => {
              if (err2) {
                console.error("Error fetching updated worker:", err2);
                return res.status(500).json({ error: "Database error" });
              }
              const worker = {
                id: row.id,
                employeeId: row.employee_id,
                roleCode: row.role_code,
                fullName: row.full_name,
                roleDescription: row.roleDescription,
                divisionId: row.division_id,
                departmentId: row.department_id,
                procurementTeam: row.procurement_team,
                password: "******",
                availableWorkDays: row.available_work_days,
                email: row.email,
                divisionName: row.divisionName,
                departmentName: row.departmentName
              };
              res.json(worker);
            }
          );
        });
      } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    router2.delete("/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM workers WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting worker:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Worker not found" });
        }
        res.json({ message: "Worker deleted successfully" });
      });
    });
    router2.get("/organizational-roles", authenticateToken, (req, res) => {
      console.log("\u{1F50D} API: Getting organizational roles...");
      const db = getDatabase();
      db.all("SELECT * FROM organizational_roles ORDER BY role_code", (err, rows) => {
        if (err) {
          console.error("\u274C Error fetching organizational roles:", err);
          return res.status(500).json({ error: "Database error" });
        }
        console.log("\u2705 Fetched organizational roles from DB:", rows);
        res.json(rows);
      });
    });
    router2.get("/divisions", authenticateToken, (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM divisions ORDER BY name", (err, rows) => {
        if (err) {
          console.error("Error fetching divisions:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });
    });
    router2.get("/departments", authenticateToken, (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM departments ORDER BY name", (err, rows) => {
        if (err) {
          console.error("Error fetching departments:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });
    });
    router2.get("/procurement-teams", authenticateToken, (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM procurement_teams ORDER BY name", (err, rows) => {
        if (err) {
          console.error("Error fetching procurement teams:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
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
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    console.log("Seeding database with initial data...");
    db.serialize(() => {
      try {
        console.log("Step 1: Ensuring organizational roles exist...");
        const roles = [
          { role_code: 0, description: "\u05DE\u05E0\u05D4\u05DC\u05DF \u05DE\u05E2\u05E8\u05DB\u05EA", permissions: "\u05DE\u05DC\u05D0" },
          { role_code: 1, description: "\u05DE\u05E0\u05D4\u05DC \u05E8\u05DB\u05E9", permissions: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E8\u05DB\u05E9" },
          { role_code: 2, description: "\u05E8\u05D0\u05E9 \u05E6\u05D5\u05D5\u05EA", permissions: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E6\u05D5\u05D5\u05EA" },
          { role_code: 3, description: "\u05E7\u05E0\u05D9\u05D9\u05DF", permissions: "\u05D1\u05D9\u05E6\u05D5\u05E2 \u05E8\u05DB\u05E9" },
          { role_code: 4, description: "\u05D2\u05D5\u05E8\u05DD \u05D3\u05D5\u05E8\u05E9", permissions: "\u05D4\u05D2\u05E9\u05EA \u05D3\u05E8\u05D9\u05E9\u05D5\u05EA" },
          { role_code: 5, description: "\u05DE\u05E0\u05D4\u05DC\u05DF \u05DE\u05E2\u05E8\u05DB\u05EA", permissions: "\u05DE\u05DC\u05D0" },
          { role_code: 9, description: "\u05D2\u05D5\u05E8\u05DD \u05D8\u05DB\u05E0\u05D9", permissions: "\u05EA\u05D7\u05D6\u05D5\u05E7\u05D4 \u05D8\u05DB\u05E0\u05D9\u05EA" }
        ];
        roles.forEach((role) => {
          db.run(
            "INSERT OR REPLACE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)",
            [role.role_code, role.description, role.permissions],
            function(err) {
              if (err) {
                console.error("\u274C Error inserting role:", role.role_code, err);
              } else {
                console.log("\u2705 Ensured role exists:", role.role_code);
              }
            }
          );
        });
        console.log("Step 2: Ensuring default users exist...");
        const defaultPassword = "123456";
        const hashedPassword = bcrypt3.hashSync(defaultPassword, 12);
        const defaultUsers = [
          {
            employee_id: "9999",
            role_code: 0,
            full_name: "\u05DE\u05E0\u05D4\u05DC \u05DE\u05E2\u05E8\u05DB\u05EA",
            role_description: "\u05DE\u05E0\u05D4\u05DC\u05DF \u05DE\u05E2\u05E8\u05DB\u05EA",
            password: hashedPassword
          },
          {
            employee_id: "1001",
            role_code: 1,
            full_name: "\u05DE\u05E0\u05D4\u05DC \u05E8\u05DB\u05E9",
            role_description: "\u05DE\u05E0\u05D4\u05DC \u05E8\u05DB\u05E9 \u05E8\u05D0\u05E9\u05D9",
            password: hashedPassword
          }
        ];
        defaultUsers.forEach((user) => {
          db.run(
            `INSERT OR REPLACE INTO workers 
             (employee_id, role_code, full_name, role_description, password) 
             VALUES (?, ?, ?, ?, ?)`,
            [user.employee_id, user.role_code, user.full_name, user.role_description, user.password],
            function(err) {
              if (err) {
                console.error("\u274C Error ensuring user exists:", user.employee_id, err);
              } else {
                console.log("\u2705 Ensured user exists:", user.employee_id);
              }
            }
          );
        });
        db.get("SELECT COUNT(*) as count FROM divisions", (err, row) => {
          if (err) {
            console.error("\u274C Error checking divisions:", err);
            reject(err);
            return;
          }
          if (row && row.count > 0) {
            console.log("\u2705 Basic data already exists, only ensured roles and default users");
            resolve();
            return;
          }
          console.log("Step 3: Seeding additional data...");
          const divisions = [
            { name: "\u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4", is_internal: 1 },
            { name: "\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4", is_internal: 1 },
            { name: "\u05DE\u05D7\u05E7\u05E8 \u05D5\u05E4\u05D9\u05EA\u05D5\u05D7", is_internal: 1 },
            { name: "\u05DE\u05E9\u05D0\u05D1\u05D9 \u05D0\u05E0\u05D5\u05E9", is_internal: 1 }
          ];
          divisions.forEach((division) => {
            db.run(
              "INSERT OR IGNORE INTO divisions (name, is_internal) VALUES (?, ?)",
              [division.name, division.is_internal]
            );
          });
          const departments = [
            { name: "\u05E8\u05DB\u05E9 \u05D5\u05D7\u05D5\u05D6\u05D9\u05DD", division_id: 1 },
            { name: "\u05EA\u05E4\u05E2\u05D5\u05DC \u05D5\u05EA\u05D7\u05D6\u05D5\u05E7\u05D4", division_id: 1 },
            { name: "\u05DE\u05E2\u05E8\u05DB\u05D5\u05EA \u05DE\u05D9\u05D3\u05E2", division_id: 2 },
            { name: "\u05E4\u05D9\u05EA\u05D5\u05D7 \u05EA\u05D5\u05DB\u05E0\u05D4", division_id: 2 }
          ];
          departments.forEach((dept) => {
            db.run(
              "INSERT OR IGNORE INTO departments (name, division_id) VALUES (?, ?)",
              [dept.name, dept.division_id]
            );
          });
          const teams = [
            { name: "\u05D9\u05E2\u05D5\u05D3\u05D9" },
            { name: "\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9" },
            { name: "\u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9" },
            { name: "\u05DE\u05D7\u05E9\u05D5\u05D1" },
            { name: "\u05D4\u05E0\u05D3\u05E1\u05D9" },
            { name: "\u05D1\u05D9\u05D8\u05D7\u05D5\u05E0\u05D9" }
          ];
          teams.forEach((team) => {
            db.run(
              "INSERT OR IGNORE INTO procurement_teams (name) VALUES (?)",
              [team.name]
            );
          });
          const activities = [
            { name: "\u05D1\u05D3\u05D9\u05E7\u05EA \u05D4\u05E6\u05E2\u05D5\u05EA \u05DE\u05D7\u05D9\u05E8", tools_and_resources: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D7\u05D9\u05E8\u05D9\u05DD" },
            { name: "\u05D4\u05DB\u05E0\u05EA \u05DE\u05E4\u05E8\u05D8 \u05D8\u05DB\u05E0\u05D9", tools_and_resources: "\u05EA\u05D1\u05E0\u05D9\u05D5\u05EA \u05DE\u05E4\u05E8\u05D8" },
            { name: "\u05E4\u05E8\u05E1\u05D5\u05DD \u05DE\u05DB\u05E8\u05D6", tools_and_resources: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05E4\u05E8\u05E1\u05D5\u05DD" },
            { name: "\u05D4\u05E2\u05E8\u05DB\u05EA \u05D4\u05E6\u05E2\u05D5\u05EA", tools_and_resources: "\u05DE\u05D8\u05E8\u05D9\u05E6\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4" },
            { name: "\u05D1\u05D7\u05D9\u05E8\u05EA \u05D6\u05D5\u05DB\u05D4", tools_and_resources: "\u05D5\u05E2\u05D3\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4" },
            { name: "\u05D7\u05EA\u05D9\u05DE\u05D4 \u05E2\u05DC \u05D4\u05E1\u05DB\u05DD", tools_and_resources: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05D7\u05EA\u05D9\u05DE\u05D5\u05EA" },
            { name: "\u05D1\u05E7\u05E8\u05EA \u05D0\u05D9\u05DB\u05D5\u05EA", tools_and_resources: "\u05E8\u05E9\u05D9\u05DE\u05EA \u05D1\u05D3\u05D9\u05E7\u05D5\u05EA" },
            { name: "\u05D0\u05D9\u05E9\u05D5\u05E8 \u05EA\u05E9\u05DC\u05D5\u05DD", tools_and_resources: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05DB\u05E1\u05E4\u05D9\u05DD" },
            { name: "\u05DE\u05E2\u05E7\u05D1 \u05D1\u05D9\u05E6\u05D5\u05E2", tools_and_resources: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05DE\u05E2\u05E7\u05D1" },
            { name: "\u05E1\u05D2\u05D9\u05E8\u05EA \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8", tools_and_resources: "\u05D3\u05D5\u05D7 \u05E1\u05D9\u05DB\u05D5\u05DD" },
            { name: '\u05D3\u05D5"\u05D7 \u05E1\u05D9\u05DB\u05D5\u05DD', tools_and_resources: "\u05EA\u05D1\u05E0\u05D9\u05EA \u05D3\u05D5\u05D7" }
          ];
          activities.forEach((activity) => {
            db.run(
              "INSERT OR IGNORE INTO activity_pool (name, tools_and_resources) VALUES (?, ?)",
              [activity.name, activity.tools_and_resources]
            );
          });
          const domains = [
            { description: "\u05E8\u05DB\u05E9 \u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9" },
            { description: "\u05E8\u05DB\u05E9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9" },
            { description: "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9\u05D9\u05DD" },
            { description: "\u05EA\u05D7\u05D6\u05D5\u05E7\u05D4 \u05D5\u05EA\u05E4\u05E2\u05D5\u05DC" }
          ];
          domains.forEach((domain) => {
            db.run(
              "INSERT OR IGNORE INTO domains (description) VALUES (?)",
              [domain.description]
            );
          });
          db.run(
            "INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) VALUES (1, 5, 10, 20)",
            function(err2) {
              if (err2) {
                console.error("\u274C Error seeding complexity estimates:", err2);
              } else {
                console.log("\u2705 Seeded complexity estimates");
              }
            }
          );
          console.log("\u2705 Database seeded successfully!");
          console.log("Default users available:");
          console.log("- Admin: 9999 / 123456");
          console.log("- Manager: 1001 / 123456");
          resolve();
        });
      } catch (error) {
        console.error("\u274C Error seeding database:", error);
        reject(error);
      }
    });
  });
}
var init_seedDatabase = __esm({
  "src/server/scripts/seedDatabase.js"() {
    init_database();
  }
});

// src/server/routes/system.js
import express3 from "file:///home/project/node_modules/express/index.js";
var router3, system_default;
var init_system = __esm({
  "src/server/routes/system.js"() {
    init_database();
    init_auth();
    init_seedDatabase();
    router3 = express3.Router();
    router3.get("/seed_db", async (req, res) => {
      try {
        console.log("\u{1F331} Manual database seeding requested (public endpoint)");
        await seedDatabase();
        console.log("\u2705 Manual database seeding completed successfully");
        res.json({
          message: "Database seeded successfully",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (error) {
        console.error("\u274C Manual database seeding failed:", error);
        res.status(500).json({
          error: "Database seeding failed",
          message: error.message
        });
      }
    });
    router3.get("/activity-pool", authenticateToken, requireRole([0, 9]), (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM activity_pool ORDER BY name", (err, rows) => {
        if (err) {
          console.error("Error fetching activity pool:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });
    });
    router3.post("/activity-pool", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { name, toolsAndResources } = req.body;
      const db = getDatabase();
      db.run(
        "INSERT INTO activity_pool (name, tools_and_resources) VALUES (?, ?)",
        [name, toolsAndResources],
        function(err) {
          if (err) {
            console.error("Error creating activity:", err);
            return res.status(500).json({ error: "Database error" });
          }
          db.get("SELECT * FROM activity_pool WHERE id = ?", [this.lastID], (err2, row) => {
            if (err2) {
              console.error("Error fetching created activity:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json(row);
          });
        }
      );
    });
    router3.put("/activity-pool/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const { name, toolsAndResources } = req.body;
      const db = getDatabase();
      db.run(
        "UPDATE activity_pool SET name = ?, tools_and_resources = ? WHERE id = ?",
        [name, toolsAndResources, id],
        function(err) {
          if (err) {
            console.error("Error updating activity:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Activity not found" });
          }
          db.get("SELECT * FROM activity_pool WHERE id = ?", [id], (err2, row) => {
            if (err2) {
              console.error("Error fetching updated activity:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.json(row);
          });
        }
      );
    });
    router3.delete("/activity-pool/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM activity_pool WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting activity:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Activity not found" });
        }
        res.json({ message: "Activity deleted successfully" });
      });
    });
    router3.get("/domains", authenticateToken, requireRole([0, 9]), (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM domains ORDER BY description", (err, rows) => {
        if (err) {
          console.error("Error fetching domains:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });
    });
    router3.post("/domains", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { description } = req.body;
      const db = getDatabase();
      db.run(
        "INSERT INTO domains (description) VALUES (?)",
        [description],
        function(err) {
          if (err) {
            console.error("Error creating domain:", err);
            return res.status(500).json({ error: "Database error" });
          }
          db.get("SELECT * FROM domains WHERE id = ?", [this.lastID], (err2, row) => {
            if (err2) {
              console.error("Error fetching created domain:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json(row);
          });
        }
      );
    });
    router3.put("/domains/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const { description } = req.body;
      const db = getDatabase();
      db.run(
        "UPDATE domains SET description = ? WHERE id = ?",
        [description, id],
        function(err) {
          if (err) {
            console.error("Error updating domain:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Domain not found" });
          }
          db.get("SELECT * FROM domains WHERE id = ?", [id], (err2, row) => {
            if (err2) {
              console.error("Error fetching updated domain:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.json(row);
          });
        }
      );
    });
    router3.delete("/domains/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM domains WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting domain:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Domain not found" });
        }
        res.json({ message: "Domain deleted successfully" });
      });
    });
    router3.get("/divisions", authenticateToken, requireRole([0, 9]), (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM divisions ORDER BY name", (err, rows) => {
        if (err) {
          console.error("Error fetching divisions:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });
    });
    router3.post("/divisions", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { name, isInternal } = req.body;
      const db = getDatabase();
      db.run(
        "INSERT INTO divisions (name, is_internal) VALUES (?, ?)",
        [name, isInternal],
        function(err) {
          if (err) {
            console.error("Error creating division:", err);
            return res.status(500).json({ error: "Database error" });
          }
          db.get("SELECT * FROM divisions WHERE id = ?", [this.lastID], (err2, row) => {
            if (err2) {
              console.error("Error fetching created division:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json(row);
          });
        }
      );
    });
    router3.put("/divisions/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const { name, isInternal } = req.body;
      const db = getDatabase();
      db.run(
        "UPDATE divisions SET name = ?, is_internal = ? WHERE id = ?",
        [name, isInternal, id],
        function(err) {
          if (err) {
            console.error("Error updating division:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Division not found" });
          }
          db.get("SELECT * FROM divisions WHERE id = ?", [id], (err2, row) => {
            if (err2) {
              console.error("Error fetching updated division:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.json(row);
          });
        }
      );
    });
    router3.delete("/divisions/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM divisions WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting division:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Division not found" });
        }
        res.json({ message: "Division deleted successfully" });
      });
    });
    router3.get("/departments", authenticateToken, requireRole([0, 9]), (req, res) => {
      const db = getDatabase();
      db.all(
        `SELECT d.*, div.name as divisionName 
     FROM departments d 
     LEFT JOIN divisions div ON d.division_id = div.id 
     ORDER BY d.name`,
        (err, rows) => {
          if (err) {
            console.error("Error fetching departments:", err);
            return res.status(500).json({ error: "Database error" });
          }
          res.json(rows);
        }
      );
    });
    router3.post("/departments", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { name, divisionId } = req.body;
      const db = getDatabase();
      db.run(
        "INSERT INTO departments (name, division_id) VALUES (?, ?)",
        [name, divisionId],
        function(err) {
          if (err) {
            console.error("Error creating department:", err);
            return res.status(500).json({ error: "Database error" });
          }
          db.get(
            `SELECT d.*, div.name as divisionName 
         FROM departments d 
         LEFT JOIN divisions div ON d.division_id = div.id 
         WHERE d.id = ?`,
            [this.lastID],
            (err2, row) => {
              if (err2) {
                console.error("Error fetching created department:", err2);
                return res.status(500).json({ error: "Database error" });
              }
              res.status(201).json(row);
            }
          );
        }
      );
    });
    router3.put("/departments/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const { name, divisionId } = req.body;
      const db = getDatabase();
      db.run(
        "UPDATE departments SET name = ?, division_id = ? WHERE id = ?",
        [name, divisionId, id],
        function(err) {
          if (err) {
            console.error("Error updating department:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Department not found" });
          }
          db.get(
            `SELECT d.*, div.name as divisionName 
         FROM departments d 
         LEFT JOIN divisions div ON d.division_id = div.id 
         WHERE d.id = ?`,
            [id],
            (err2, row) => {
              if (err2) {
                console.error("Error fetching updated department:", err2);
                return res.status(500).json({ error: "Database error" });
              }
              res.json(row);
            }
          );
        }
      );
    });
    router3.delete("/departments/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM departments WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting department:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
      });
    });
    router3.get("/procurement-teams", authenticateToken, requireRole([0, 9]), (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM procurement_teams ORDER BY name", (err, rows) => {
        if (err) {
          console.error("Error fetching procurement teams:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });
    });
    router3.post("/procurement-teams", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { name } = req.body;
      const db = getDatabase();
      db.run(
        "INSERT INTO procurement_teams (name) VALUES (?)",
        [name],
        function(err) {
          if (err) {
            console.error("Error creating procurement team:", err);
            return res.status(500).json({ error: "Database error" });
          }
          db.get("SELECT * FROM procurement_teams WHERE id = ?", [this.lastID], (err2, row) => {
            if (err2) {
              console.error("Error fetching created procurement team:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json(row);
          });
        }
      );
    });
    router3.put("/procurement-teams/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const { name } = req.body;
      const db = getDatabase();
      db.run(
        "UPDATE procurement_teams SET name = ? WHERE id = ?",
        [name, id],
        function(err) {
          if (err) {
            console.error("Error updating procurement team:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Procurement team not found" });
          }
          db.get("SELECT * FROM procurement_teams WHERE id = ?", [id], (err2, row) => {
            if (err2) {
              console.error("Error fetching updated procurement team:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            res.json(row);
          });
        }
      );
    });
    router3.delete("/procurement-teams/:id", authenticateToken, requireRole([0, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM procurement_teams WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting procurement team:", err);
          return res.status(500).json({ error: "Database error" });
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
var router4, planning_default;
var init_planning = __esm({
  "src/server/routes/planning.js"() {
    init_database();
    init_auth();
    router4 = express4.Router();
    router4.get("/complexity-estimates", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const db = getDatabase();
      db.get("SELECT * FROM complexity_estimates ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) {
          console.error("Error fetching complexity estimates:", err);
          return res.status(500).json({ error: "Database error" });
        }
        const estimates = row || {
          estimateLevel1: 5,
          estimateLevel2: 10,
          estimateLevel3: 20
        };
        res.json({
          estimateLevel1: estimates.estimate_level_1,
          estimateLevel2: estimates.estimate_level_2,
          estimateLevel3: estimates.estimate_level_3
        });
      });
    });
    router4.put("/complexity-estimates", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const { estimateLevel1, estimateLevel2, estimateLevel3 } = req.body;
      const db = getDatabase();
      db.get("SELECT id FROM complexity_estimates LIMIT 1", (err, row) => {
        if (err) {
          console.error("Error checking complexity estimates:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (row) {
          db.run(
            "UPDATE complexity_estimates SET estimate_level_1 = ?, estimate_level_2 = ?, estimate_level_3 = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [estimateLevel1, estimateLevel2, estimateLevel3, row.id],
            function(err2) {
              if (err2) {
                console.error("Error updating complexity estimates:", err2);
                return res.status(500).json({ error: "Database error" });
              }
              res.json({ message: "Complexity estimates updated successfully" });
            }
          );
        } else {
          db.run(
            "INSERT INTO complexity_estimates (estimate_level_1, estimate_level_2, estimate_level_3) VALUES (?, ?, ?)",
            [estimateLevel1, estimateLevel2, estimateLevel3],
            function(err2) {
              if (err2) {
                console.error("Error creating complexity estimates:", err2);
                return res.status(500).json({ error: "Database error" });
              }
              res.json({ message: "Complexity estimates created successfully" });
            }
          );
        }
      });
    });
    router4.get("/acceptance-options", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const db = getDatabase();
      db.all("SELECT * FROM acceptance_options ORDER BY year_id DESC", (err, rows) => {
        if (err) {
          console.error("Error fetching acceptance options:", err);
          return res.status(500).json({ error: "Database error" });
        }
        const options = rows.map((row) => ({
          id: row.id,
          yearId: row.year_id,
          uploadCode: row.upload_code,
          uploadCodeDescription: row.upload_code_description,
          broadMeaning: row.broad_meaning
        }));
        res.json(options);
      });
    });
    router4.post("/acceptance-options", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const { yearId, uploadCode, broadMeaning } = req.body;
      const db = getDatabase();
      const uploadCodeDescriptions = {
        "Plan": "\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF",
        "Late": "\u05DE\u05D0\u05D7\u05E8",
        "Block": "\u05D7\u05E1\u05D5\u05DD",
        "Finish": "\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD"
      };
      const uploadCodeDescription = uploadCodeDescriptions[uploadCode];
      db.run(
        "INSERT INTO acceptance_options (year_id, upload_code, upload_code_description, broad_meaning) VALUES (?, ?, ?, ?)",
        [yearId, uploadCode, uploadCodeDescription, broadMeaning],
        function(err) {
          if (err) {
            console.error("Error creating acceptance option:", err);
            if (err.message.includes("UNIQUE constraint failed")) {
              return res.status(400).json({ error: "Acceptance option for this year already exists" });
            }
            return res.status(500).json({ error: "Database error" });
          }
          db.get("SELECT * FROM acceptance_options WHERE id = ?", [this.lastID], (err2, row) => {
            if (err2) {
              console.error("Error fetching created acceptance option:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            const option = {
              id: row.id,
              yearId: row.year_id,
              uploadCode: row.upload_code,
              uploadCodeDescription: row.upload_code_description,
              broadMeaning: row.broad_meaning
            };
            res.status(201).json(option);
          });
        }
      );
    });
    router4.put("/acceptance-options/:id", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const { id } = req.params;
      const { yearId, uploadCode, broadMeaning } = req.body;
      const db = getDatabase();
      const uploadCodeDescriptions = {
        "Plan": "\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF",
        "Late": "\u05DE\u05D0\u05D7\u05E8",
        "Block": "\u05D7\u05E1\u05D5\u05DD",
        "Finish": "\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD"
      };
      const uploadCodeDescription = uploadCodeDescriptions[uploadCode];
      db.run(
        "UPDATE acceptance_options SET year_id = ?, upload_code = ?, upload_code_description = ?, broad_meaning = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [yearId, uploadCode, uploadCodeDescription, broadMeaning, id],
        function(err) {
          if (err) {
            console.error("Error updating acceptance option:", err);
            if (err.message.includes("UNIQUE constraint failed")) {
              return res.status(400).json({ error: "Acceptance option for this year already exists" });
            }
            return res.status(500).json({ error: "Database error" });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Acceptance option not found" });
          }
          db.get("SELECT * FROM acceptance_options WHERE id = ?", [id], (err2, row) => {
            if (err2) {
              console.error("Error fetching updated acceptance option:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            const option = {
              id: row.id,
              yearId: row.year_id,
              uploadCode: row.upload_code,
              uploadCodeDescription: row.upload_code_description,
              broadMeaning: row.broad_meaning
            };
            res.json(option);
          });
        }
      );
    });
    router4.delete("/acceptance-options/:id", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM acceptance_options WHERE id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting acceptance option:", err);
          return res.status(500).json({ error: "Database error" });
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

// src/server/routes/programs.js
import express5 from "file:///home/project/node_modules/express/index.js";
var router5, programs_default;
var init_programs = __esm({
  "src/server/routes/programs.js"() {
    init_database();
    init_auth();
    router5 = express5.Router();
    router5.get("/", authenticateToken, (req, res) => {
      const db = getDatabase();
      db.all(
        `SELECT p.*, 
            d.name as division_name, 
            dept.name as department_name,
            dom.description as domain_name
     FROM programs p 
     LEFT JOIN divisions d ON p.division_id = d.id 
     LEFT JOIN departments dept ON p.department_id = dept.id 
     LEFT JOIN domains dom ON p.domain_id = dom.id
     ORDER BY p.created_at DESC`,
        (err, rows) => {
          if (err) {
            console.error("Error fetching programs:", err);
            return res.status(500).json({ error: "Database error" });
          }
          const programs = rows.map((row) => ({
            taskId: row.task_id,
            workYear: row.work_year,
            requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
            title: row.title,
            description: row.description,
            requesterId: row.requester_id,
            requesterName: row.requester_name,
            divisionId: row.division_id,
            divisionName: row.division_name || row.division_name,
            departmentId: row.department_id,
            departmentName: row.department_name || row.department_name,
            domainId: row.domain_id,
            domainName: row.domain_name || row.domain_name,
            estimatedAmount: row.estimated_amount,
            currency: row.currency,
            supplierList: row.supplier_list,
            justification: row.justification,
            planningSource: row.planning_source,
            complexity: row.complexity,
            engagementTypeId: row.engagement_type_id,
            engagementTypeName: row.engagement_type_name,
            status: row.status,
            assignedOfficerId: row.assigned_officer_id,
            assignedOfficerName: row.assigned_officer_name,
            teamId: row.team_id,
            teamName: row.team_name,
            startDate: row.start_date ? new Date(row.start_date) : null,
            planningNotes: row.planning_notes,
            officerNotes: row.officer_notes,
            lastUpdate: new Date(row.updated_at),
            createdAt: new Date(row.created_at)
          }));
          res.json(programs);
        }
      );
    });
    router5.get("/:id", authenticateToken, (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.get(
        `SELECT p.*, 
            d.name as division_name, 
            dept.name as department_name,
            dom.description as domain_name
     FROM programs p 
     LEFT JOIN divisions d ON p.division_id = d.id 
     LEFT JOIN departments dept ON p.department_id = dept.id 
     LEFT JOIN domains dom ON p.domain_id = dom.id
     WHERE p.task_id = ?`,
        [id],
        (err, row) => {
          if (err) {
            console.error("Error fetching program:", err);
            return res.status(500).json({ error: "Database error" });
          }
          if (!row) {
            return res.status(404).json({ error: "Program not found" });
          }
          const program = {
            taskId: row.task_id,
            workYear: row.work_year,
            requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
            title: row.title,
            description: row.description,
            requesterId: row.requester_id,
            requesterName: row.requester_name,
            divisionId: row.division_id,
            divisionName: row.division_name || row.division_name,
            departmentId: row.department_id,
            departmentName: row.department_name || row.department_name,
            domainId: row.domain_id,
            domainName: row.domain_name || row.domain_name,
            estimatedAmount: row.estimated_amount,
            currency: row.currency,
            supplierList: row.supplier_list,
            justification: row.justification,
            planningSource: row.planning_source,
            complexity: row.complexity,
            engagementTypeId: row.engagement_type_id,
            engagementTypeName: row.engagement_type_name,
            status: row.status,
            assignedOfficerId: row.assigned_officer_id,
            assignedOfficerName: row.assigned_officer_name,
            teamId: row.team_id,
            teamName: row.team_name,
            startDate: row.start_date ? new Date(row.start_date) : null,
            planningNotes: row.planning_notes,
            officerNotes: row.officer_notes,
            lastUpdate: new Date(row.updated_at),
            createdAt: new Date(row.created_at)
          };
          res.json(program);
        }
      );
    });
    router5.post("/", authenticateToken, requireRole([1, 4]), (req, res) => {
      const {
        workYear,
        requiredQuarter,
        title,
        description,
        requesterName,
        divisionName,
        departmentName,
        domainName,
        estimatedAmount,
        currency,
        supplierList,
        justification,
        planningSource,
        complexity
      } = req.body;
      const db = getDatabase();
      db.get("SELECT MAX(task_id) as maxId FROM programs", (err, row) => {
        if (err) {
          console.error("Error getting max task ID:", err);
          return res.status(500).json({ error: "Database error" });
        }
        const newTaskId = (row.maxId || 0) + 1;
        const safeEstimatedAmount = estimatedAmount !== void 0 ? estimatedAmount : null;
        const safeCurrency = currency !== void 0 ? currency : null;
        const safeComplexity = complexity !== void 0 ? complexity : null;
        db.run(
          `INSERT INTO programs 
       (task_id, work_year, required_quarter, title, description, requester_name, 
        division_name, department_name, domain_name, estimated_amount, currency, 
        supplier_list, justification, planning_source, complexity, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newTaskId,
            workYear,
            requiredQuarter,
            title,
            description,
            requesterName,
            divisionName,
            departmentName,
            domainName,
            safeEstimatedAmount,
            safeCurrency,
            supplierList,
            justification,
            planningSource,
            safeComplexity,
            "Open"
          ],
          function(err2) {
            if (err2) {
              console.error("Error creating program:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            db.get(
              `SELECT p.*, 
                  d.name as division_name, 
                  dept.name as department_name,
                  dom.description as domain_name
           FROM programs p 
           LEFT JOIN divisions d ON p.division_id = d.id 
           LEFT JOIN departments dept ON p.department_id = dept.id 
           LEFT JOIN domains dom ON p.domain_id = dom.id
           WHERE p.task_id = ?`,
              [newTaskId],
              (err3, row2) => {
                if (err3) {
                  console.error("Error fetching created program:", err3);
                  return res.status(500).json({ error: "Database error" });
                }
                const program = {
                  taskId: row2.task_id,
                  workYear: row2.work_year,
                  requiredQuarter: row2.required_quarter ? new Date(row2.required_quarter) : null,
                  title: row2.title,
                  description: row2.description,
                  requesterId: row2.requester_id,
                  requesterName: row2.requester_name,
                  divisionId: row2.division_id,
                  divisionName: row2.division_name || row2.division_name,
                  departmentId: row2.department_id,
                  departmentName: row2.department_name || row2.department_name,
                  domainId: row2.domain_id,
                  domainName: row2.domain_name || row2.domain_name,
                  estimatedAmount: row2.estimated_amount,
                  currency: row2.currency,
                  supplierList: row2.supplier_list,
                  justification: row2.justification,
                  planningSource: row2.planning_source,
                  complexity: row2.complexity,
                  engagementTypeId: row2.engagement_type_id,
                  engagementTypeName: row2.engagement_type_name,
                  status: row2.status,
                  assignedOfficerId: row2.assigned_officer_id,
                  assignedOfficerName: row2.assigned_officer_name,
                  teamId: row2.team_id,
                  teamName: row2.team_name,
                  startDate: row2.start_date ? new Date(row2.start_date) : null,
                  planningNotes: row2.planning_notes,
                  officerNotes: row2.officer_notes,
                  lastUpdate: new Date(row2.updated_at),
                  createdAt: new Date(row2.created_at)
                };
                res.status(201).json(program);
              }
            );
          }
        );
      });
    });
    router5.put("/:id", authenticateToken, (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const db = getDatabase();
      const fields = [];
      const values = [];
      const fieldMapping = {
        workYear: "work_year",
        requiredQuarter: "required_quarter",
        title: "title",
        description: "description",
        requesterName: "requester_name",
        divisionName: "division_name",
        departmentName: "department_name",
        domainName: "domain_name",
        estimatedAmount: "estimated_amount",
        currency: "currency",
        supplierList: "supplier_list",
        justification: "justification",
        planningSource: "planning_source",
        complexity: "complexity",
        engagementTypeId: "engagement_type_id",
        engagementTypeName: "engagement_type_name",
        status: "status",
        assignedOfficerId: "assigned_officer_id",
        assignedOfficerName: "assigned_officer_name",
        teamId: "team_id",
        teamName: "team_name",
        startDate: "start_date",
        planningNotes: "planning_notes",
        officerNotes: "officer_notes"
      };
      Object.keys(updateData).forEach((key) => {
        if (fieldMapping[key]) {
          fields.push(`${fieldMapping[key]} = ?`);
          const value = updateData[key] !== void 0 ? updateData[key] : null;
          values.push(value);
        }
      });
      if (fields.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      fields.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);
      const query = `UPDATE programs SET ${fields.join(", ")} WHERE task_id = ?`;
      db.run(query, values, function(err) {
        if (err) {
          console.error("Error updating program:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Program not found" });
        }
        db.get(
          `SELECT p.*, 
              d.name as division_name, 
              dept.name as department_name,
              dom.description as domain_name
       FROM programs p 
       LEFT JOIN divisions d ON p.division_id = d.id 
       LEFT JOIN departments dept ON p.department_id = dept.id 
       LEFT JOIN domains dom ON p.domain_id = dom.id
       WHERE p.task_id = ?`,
          [id],
          (err2, row) => {
            if (err2) {
              console.error("Error fetching updated program:", err2);
              return res.status(500).json({ error: "Database error" });
            }
            const program = {
              taskId: row.task_id,
              workYear: row.work_year,
              requiredQuarter: row.required_quarter ? new Date(row.required_quarter) : null,
              title: row.title,
              description: row.description,
              requesterId: row.requester_id,
              requesterName: row.requester_name,
              divisionId: row.division_id,
              divisionName: row.division_name || row.division_name,
              departmentId: row.department_id,
              departmentName: row.department_name || row.department_name,
              domainId: row.domain_id,
              domainName: row.domain_name || row.domain_name,
              estimatedAmount: row.estimated_amount,
              currency: row.currency,
              supplierList: row.supplier_list,
              justification: row.justification,
              planningSource: row.planning_source,
              complexity: row.complexity,
              engagementTypeId: row.engagement_type_id,
              engagementTypeName: row.engagement_type_name,
              status: row.status,
              assignedOfficerId: row.assigned_officer_id,
              assignedOfficerName: row.assigned_officer_name,
              teamId: row.team_id,
              teamName: row.team_name,
              startDate: row.start_date ? new Date(row.start_date) : null,
              planningNotes: row.planning_notes,
              officerNotes: row.officer_notes,
              lastUpdate: new Date(row.updated_at),
              createdAt: new Date(row.created_at)
            };
            res.json(program);
          }
        );
      });
    });
    router5.delete("/:id", authenticateToken, requireRole([0, 1, 9]), (req, res) => {
      const { id } = req.params;
      const db = getDatabase();
      db.run("DELETE FROM programs WHERE task_id = ?", [id], function(err) {
        if (err) {
          console.error("Error deleting program:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: "Program not found" });
        }
        res.json({ message: "Program deleted successfully" });
      });
    });
    programs_default = router5;
  }
});

// src/server/scripts/addDemoTasks.js
var addDemoTasks_exports = {};
__export(addDemoTasks_exports, {
  addDemoTasks: () => addDemoTasks
});
async function addDemoTasks() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    console.log("\u{1F3AD} Adding demo tasks to database...");
    db.serialize(() => {
      db.get("SELECT COUNT(*) as count FROM programs", (err, row) => {
        if (err) {
          console.error("\u274C Error checking existing programs:", err);
          reject(err);
          return;
        }
        if (row && row.count > 0) {
          console.log("\u2705 Demo tasks already exist, skipping...");
          resolve();
          return;
        }
        console.log("\u{1F4DD} Creating demo tasks...");
        const demoTasks = [
          {
            task_id: 1001,
            work_year: 2024,
            required_quarter: "2024-03-01",
            title: "\u05E8\u05DB\u05E9 \u05DE\u05D7\u05E9\u05D1\u05D9\u05DD \u05D7\u05D3\u05E9\u05D9\u05DD",
            description: "\u05E8\u05DB\u05E9 50 \u05DE\u05D7\u05E9\u05D1\u05D9\u05DD \u05E0\u05D9\u05D9\u05D7\u05D9\u05DD \u05DC\u05DE\u05E9\u05E8\u05D3\u05D9 \u05D4\u05D7\u05D1\u05E8\u05D4",
            requester_name: "\u05D3\u05D5\u05D3 \u05DB\u05D4\u05DF",
            division_name: "\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4",
            department_name: "\u05DE\u05E2\u05E8\u05DB\u05D5\u05EA \u05DE\u05D9\u05D3\u05E2",
            domain_name: "\u05E6\u05D9\u05D5\u05D3 \u05DE\u05D7\u05E9\u05D5\u05D1",
            estimated_amount: 25e4,
            currency: "ILS",
            supplier_list: "\u05D3\u05DC, HP, \u05DC\u05E0\u05D5\u05D1\u05D5",
            justification: "\u05D4\u05D7\u05DC\u05E4\u05EA \u05E6\u05D9\u05D5\u05D3 \u05D9\u05E9\u05DF \u05D5\u05E9\u05D9\u05E4\u05D5\u05E8 \u05D1\u05D9\u05E6\u05D5\u05E2\u05D9\u05DD",
            planning_source: "annual_planning",
            complexity: 2,
            status: "Open",
            assigned_officer_name: "\u05E9\u05E8\u05D4 \u05DC\u05D5\u05D9",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05DE\u05D7\u05E9\u05D5\u05D1",
            planning_notes: "\u05DC\u05D1\u05D3\u05D5\u05E7 \u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05E2\u05DD \u05EA\u05D5\u05DB\u05E0\u05D5\u05EA \u05E7\u05D9\u05D9\u05DE\u05D5\u05EA",
            officer_notes: "\u05D1\u05EA\u05D4\u05DC\u05D9\u05DA \u05D0\u05D9\u05E1\u05D5\u05E3 \u05D4\u05E6\u05E2\u05D5\u05EA \u05DE\u05D7\u05D9\u05E8"
          },
          {
            task_id: 1002,
            work_year: 2024,
            required_quarter: "2024-06-01",
            title: "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9 \u05E0\u05D9\u05E7\u05D9\u05D5\u05DF \u05DC\u05DE\u05E9\u05E8\u05D3\u05D9\u05DD",
            description: "\u05D7\u05D5\u05D6\u05D4 \u05E9\u05E0\u05EA\u05D9 \u05DC\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9 \u05E0\u05D9\u05E7\u05D9\u05D5\u05DF",
            requester_name: "\u05E8\u05D7\u05DC \u05D0\u05D1\u05E8\u05D4\u05DD",
            division_name: "\u05DE\u05E9\u05D0\u05D1\u05D9 \u05D0\u05E0\u05D5\u05E9",
            department_name: "\u05EA\u05E4\u05E2\u05D5\u05DC",
            domain_name: "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD",
            estimated_amount: 12e4,
            currency: "ILS",
            supplier_list: "\u05D7\u05D1\u05E8\u05EA \u05E0\u05D9\u05E7\u05D9\u05D5\u05DF \u05D0, \u05D7\u05D1\u05E8\u05EA \u05E0\u05D9\u05E7\u05D9\u05D5\u05DF \u05D1",
            justification: "\u05E9\u05DE\u05D9\u05E8\u05D4 \u05E2\u05DC \u05E1\u05D1\u05D9\u05D1\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4 \u05E0\u05E7\u05D9\u05D9\u05D4",
            planning_source: "annual_planning",
            complexity: 1,
            status: "Plan",
            assigned_officer_name: "\u05D0\u05D1\u05D9 \u05DB\u05D4\u05DF",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD",
            planning_notes: "\u05DC\u05D5\u05D5\u05D3\u05D0 \u05DB\u05D9\u05E1\u05D5\u05D9 \u05DC\u05DB\u05DC \u05D4\u05E7\u05D5\u05DE\u05D5\u05EA",
            officer_notes: "\u05DE\u05D7\u05DB\u05D4 \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8 \u05EA\u05E7\u05E6\u05D9\u05D1"
          },
          {
            task_id: 1003,
            work_year: 2024,
            required_quarter: "2024-04-01",
            title: "\u05E4\u05D9\u05EA\u05D5\u05D7 \u05DE\u05E2\u05E8\u05DB\u05EA CRM",
            description: "\u05E4\u05D9\u05EA\u05D5\u05D7 \u05DE\u05E2\u05E8\u05DB\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05DE\u05D5\u05EA\u05D0\u05DE\u05EA",
            requester_name: "\u05D9\u05D5\u05E1\u05D9 \u05DC\u05D5\u05D9",
            division_name: "\u05DE\u05DB\u05D9\u05E8\u05D5\u05EA",
            department_name: "\u05E9\u05D9\u05D5\u05D5\u05E7",
            domain_name: "\u05E4\u05D9\u05EA\u05D5\u05D7 \u05EA\u05D5\u05DB\u05E0\u05D4",
            estimated_amount: 5e5,
            currency: "ILS",
            supplier_list: "\u05D7\u05D1\u05E8\u05EA \u05E4\u05D9\u05EA\u05D5\u05D7 \u05D0, \u05D7\u05D1\u05E8\u05EA \u05E4\u05D9\u05EA\u05D5\u05D7 \u05D1",
            justification: "\u05E9\u05D9\u05E4\u05D5\u05E8 \u05E0\u05D9\u05D4\u05D5\u05DC \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05D5\u05DE\u05DB\u05D9\u05E8\u05D5\u05EA",
            planning_source: "unplanned",
            complexity: 3,
            status: "In Progress",
            assigned_officer_name: "\u05DE\u05D9\u05E8\u05D9 \u05D3\u05D5\u05D3",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9",
            planning_notes: "\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9 \u05D7\u05E9\u05D5\u05D1",
            officer_notes: "\u05D1\u05E9\u05DC\u05D1 \u05E4\u05D9\u05EA\u05D5\u05D7 \u05E8\u05D0\u05E9\u05D5\u05E0\u05D9"
          },
          {
            task_id: 1004,
            work_year: 2024,
            required_quarter: "2024-02-01",
            title: "\u05E8\u05D9\u05D4\u05D5\u05D8 \u05DE\u05E9\u05E8\u05D3\u05D9 \u05D7\u05D3\u05E9",
            description: "\u05E8\u05DB\u05E9 \u05E9\u05D5\u05DC\u05D7\u05E0\u05D5\u05EA \u05D5\u05DB\u05E1\u05D0\u05D5\u05EA \u05DC\u05DE\u05E9\u05E8\u05D3 \u05D4\u05D7\u05D3\u05E9",
            requester_name: "\u05E0\u05D5\u05E2\u05D4 \u05D2\u05E8\u05D9\u05DF",
            division_name: "\u05EA\u05E4\u05E2\u05D5\u05DC",
            department_name: "\u05DE\u05EA\u05E7\u05E0\u05D9\u05DD",
            domain_name: "\u05E8\u05D9\u05D4\u05D5\u05D8",
            estimated_amount: 8e4,
            currency: "ILS",
            supplier_list: "\u05D0\u05D9\u05E7\u05D0\u05D4, \u05DB\u05EA\u05E8 \u05E4\u05DC\u05E1\u05D8\u05D9\u05E7",
            justification: "\u05D4\u05E7\u05DE\u05EA \u05DE\u05E9\u05E8\u05D3 \u05D7\u05D3\u05E9",
            planning_source: "carried_over",
            complexity: 1,
            status: "Complete",
            assigned_officer_name: "\u05D3\u05E0\u05D9 \u05E8\u05D5\u05D6\u05DF",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05E8\u05DB\u05E9 \u05DB\u05DC\u05DC\u05D9",
            planning_notes: "\u05DC\u05D5\u05D5\u05D3\u05D0 \u05D4\u05EA\u05D0\u05DE\u05D4 \u05DC\u05E2\u05D9\u05E6\u05D5\u05D1 \u05D4\u05DE\u05E9\u05E8\u05D3",
            officer_notes: "\u05D4\u05D5\u05E9\u05DC\u05DD \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4, \u05D4\u05E8\u05D9\u05D4\u05D5\u05D8 \u05D4\u05D5\u05EA\u05E7\u05DF"
          },
          {
            task_id: 1005,
            work_year: 2024,
            required_quarter: "2024-01-01",
            title: "\u05E9\u05D3\u05E8\u05D5\u05D2 \u05DE\u05E2\u05E8\u05DB\u05EA \u05D0\u05D1\u05D8\u05D7\u05D4",
            description: "\u05D4\u05EA\u05E7\u05E0\u05EA \u05DE\u05E6\u05DC\u05DE\u05D5\u05EA \u05D0\u05D1\u05D8\u05D7\u05D4 \u05D7\u05D3\u05E9\u05D5\u05EA",
            requester_name: "\u05D0\u05DE\u05D9\u05E8 \u05D1\u05DF \u05D3\u05D5\u05D3",
            division_name: "\u05D0\u05D1\u05D8\u05D7\u05D4",
            department_name: "\u05D0\u05D1\u05D8\u05D7\u05D4 \u05E4\u05D9\u05D6\u05D9\u05EA",
            domain_name: "\u05DE\u05E2\u05E8\u05DB\u05D5\u05EA \u05D0\u05D1\u05D8\u05D7\u05D4",
            estimated_amount: 15e4,
            currency: "ILS",
            supplier_list: "\u05D7\u05D1\u05E8\u05EA \u05D0\u05D1\u05D8\u05D7\u05D4 \u05DE\u05EA\u05E7\u05D3\u05DE\u05EA",
            justification: "\u05E9\u05D9\u05E4\u05D5\u05E8 \u05E8\u05DE\u05EA \u05D4\u05D0\u05D1\u05D8\u05D7\u05D4 \u05D1\u05DE\u05EA\u05E7\u05DF",
            planning_source: "annual_planning",
            complexity: 2,
            status: "Done",
            assigned_officer_name: "\u05EA\u05DE\u05E8 \u05DB\u05D4\u05DF",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05D1\u05D9\u05D8\u05D7\u05D5\u05DF",
            planning_notes: "\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 \u05E7\u05E8\u05D9\u05D8\u05D9 \u05DC\u05D0\u05D1\u05D8\u05D7\u05D4",
            officer_notes: "\u05D4\u05D5\u05E9\u05DC\u05DD \u05D5\u05E0\u05DE\u05E1\u05E8 \u05DC\u05EA\u05E4\u05E2\u05D5\u05DC"
          },
          {
            task_id: 1006,
            work_year: 2024,
            required_quarter: "2024-05-01",
            title: "\u05E8\u05DB\u05E9 \u05E8\u05DB\u05D1\u05D9 \u05D7\u05D1\u05E8\u05D4",
            description: "\u05E8\u05DB\u05E9 5 \u05E8\u05DB\u05D1\u05D9 \u05D7\u05D1\u05E8\u05D4 \u05D7\u05D3\u05E9\u05D9\u05DD",
            requester_name: "\u05D2\u05D9\u05DC \u05E9\u05DE\u05D5\u05D0\u05DC",
            division_name: "\u05EA\u05E4\u05E2\u05D5\u05DC",
            department_name: "\u05E6\u05D9 \u05E8\u05DB\u05D1",
            domain_name: "\u05E8\u05DB\u05D1\u05D9\u05DD",
            estimated_amount: 4e5,
            currency: "ILS",
            supplier_list: "\u05D9\u05D5\u05E0\u05D3\u05D0\u05D9, \u05D8\u05D5\u05D9\u05D5\u05D8\u05D4, \u05E0\u05D9\u05E1\u05D0\u05DF",
            justification: "\u05D4\u05D7\u05DC\u05E4\u05EA \u05E8\u05DB\u05D1\u05D9\u05DD \u05D9\u05E9\u05E0\u05D9\u05DD",
            planning_source: "annual_planning",
            complexity: 2,
            status: "Freeze",
            assigned_officer_name: "\u05E8\u05D5\u05DF \u05D0\u05DC\u05D5\u05DF",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05E8\u05DB\u05E9 \u05DB\u05DC\u05DC\u05D9",
            planning_notes: "\u05DC\u05D1\u05D3\u05D5\u05E7 \u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05DC\u05D9\u05E1\u05D9\u05E0\u05D2",
            officer_notes: "\u05D4\u05D5\u05E7\u05E4\u05D0 \u05E2\u05E7\u05D1 \u05D7\u05E8\u05D9\u05D2\u05D4 \u05D1\u05EA\u05E7\u05E6\u05D9\u05D1"
          },
          {
            task_id: 1007,
            work_year: 2024,
            required_quarter: "2024-07-01",
            title: "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9 \u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9",
            description: "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9 \u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9 \u05E9\u05E0\u05EA\u05D9\u05D9\u05DD",
            requester_name: "\u05E2\u05D3\u05D9 \u05E8\u05D5\u05D6\u05E0\u05D1\u05E8\u05D2",
            division_name: "\u05DE\u05E9\u05E4\u05D8\u05D9",
            department_name: "\u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9",
            domain_name: "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9\u05D9\u05DD",
            estimated_amount: 2e5,
            currency: "ILS",
            supplier_list: "\u05DE\u05E9\u05E8\u05D3 \u05E2\u05D5\u05E8\u05DB\u05D9 \u05D3\u05D9\u05DF \u05D0, \u05DE\u05E9\u05E8\u05D3 \u05E2\u05D5\u05E8\u05DB\u05D9 \u05D3\u05D9\u05DF \u05D1",
            justification: "\u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9 \u05E9\u05D5\u05D8\u05E3",
            planning_source: "unplanned",
            complexity: 2,
            status: "Cancel",
            assigned_officer_name: "\u05DC\u05D9\u05DC\u05DA \u05DE\u05D5\u05E8",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD",
            planning_notes: "\u05DC\u05D1\u05D3\u05D5\u05E7 \u05D7\u05DC\u05D5\u05E4\u05D5\u05EA \u05E4\u05E0\u05D9\u05DE\u05D9\u05D5\u05EA",
            officer_notes: "\u05D1\u05D5\u05D8\u05DC - \u05E0\u05DE\u05E6\u05D0 \u05E4\u05EA\u05E8\u05D5\u05DF \u05E4\u05E0\u05D9\u05DE\u05D9"
          },
          {
            task_id: 1008,
            work_year: 2024,
            required_quarter: "2024-08-01",
            title: "\u05E9\u05D3\u05E8\u05D5\u05D2 \u05EA\u05E9\u05EA\u05D9\u05EA \u05E8\u05E9\u05EA",
            description: "\u05E9\u05D3\u05E8\u05D5\u05D2 \u05DE\u05EA\u05D2\u05D9 \u05E8\u05E9\u05EA \u05D5\u05E0\u05EA\u05D1\u05D9\u05DD",
            requester_name: "\u05D0\u05DC\u05D5\u05DF \u05D8\u05DC",
            division_name: "\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4",
            department_name: "\u05EA\u05E9\u05EA\u05D9\u05D5\u05EA",
            domain_name: "\u05EA\u05E7\u05E9\u05D5\u05E8\u05EA",
            estimated_amount: 18e4,
            currency: "ILS",
            supplier_list: "\u05E1\u05D9\u05E1\u05E7\u05D5, HP, \u05D2'\u05D5\u05E0\u05D9\u05E4\u05E8",
            justification: "\u05E9\u05D9\u05E4\u05D5\u05E8 \u05DE\u05D4\u05D9\u05E8\u05D5\u05EA \u05D5\u05D9\u05E6\u05D9\u05D1\u05D5\u05EA \u05D4\u05E8\u05E9\u05EA",
            planning_source: "annual_planning",
            complexity: 3,
            status: "In Progress",
            assigned_officer_name: "\u05D9\u05E2\u05DC \u05D1\u05E8\u05E7",
            team_name: "\u05E6\u05D5\u05D5\u05EA \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9",
            planning_notes: "\u05DC\u05EA\u05D0\u05DD \u05E2\u05DD \u05E6\u05D5\u05D5\u05EA IT",
            officer_notes: "\u05D1\u05EA\u05D4\u05DC\u05D9\u05DA \u05D4\u05EA\u05E7\u05E0\u05D4"
          }
        ];
        let tasksCreated = 0;
        demoTasks.forEach((task, index) => {
          db.run(
            `INSERT INTO programs 
             (task_id, work_year, required_quarter, title, description, requester_name, 
              division_name, department_name, domain_name, estimated_amount, currency, 
              supplier_list, justification, planning_source, complexity, status, 
              assigned_officer_name, team_name, planning_notes, officer_notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              task.task_id,
              task.work_year,
              task.required_quarter,
              task.title,
              task.description,
              task.requester_name,
              task.division_name,
              task.department_name,
              task.domain_name,
              task.estimated_amount,
              task.currency,
              task.supplier_list,
              task.justification,
              task.planning_source,
              task.complexity,
              task.status,
              task.assigned_officer_name,
              task.team_name,
              task.planning_notes,
              task.officer_notes
            ],
            function(err2) {
              if (err2) {
                console.error("\u274C Error creating demo task:", task.task_id, err2);
                reject(err2);
                return;
              }
              console.log("\u2705 Created demo task:", task.task_id, "-", task.title);
              tasksCreated++;
              if (tasksCreated === demoTasks.length) {
                console.log("\u2705 All demo tasks created successfully!");
                console.log(`\u{1F4CA} Created ${tasksCreated} demo tasks with various statuses`);
                resolve();
              }
            }
          );
        });
      });
    });
  });
}
var __vite_injected_original_import_meta_url2;
var init_addDemoTasks = __esm({
  "src/server/scripts/addDemoTasks.js"() {
    init_database();
    __vite_injected_original_import_meta_url2 = "file:///home/project/src/server/scripts/addDemoTasks.js";
    if (__vite_injected_original_import_meta_url2 === `file://${process.argv[1]}`) {
      addDemoTasks().then(() => {
        console.log("\u2705 Demo tasks added successfully");
        process.exit(0);
      }).catch((error) => {
        console.error("\u274C Failed to add demo tasks:", error);
        process.exit(1);
      });
    }
  }
});

// src/server/express-app.js
var express_app_exports = {};
__export(express_app_exports, {
  createExpressApp: () => createExpressApp
});
import express6 from "file:///home/project/node_modules/express/index.js";
import cors from "file:///home/project/node_modules/cors/lib/index.js";
import helmet from "file:///home/project/node_modules/helmet/index.mjs";
import morgan from "file:///home/project/node_modules/morgan/index.js";
import compression from "file:///home/project/node_modules/compression/index.js";
import rateLimit from "file:///home/project/node_modules/express-rate-limit/dist/index.mjs";
async function createExpressApp() {
  if (expressApp) {
    return expressApp;
  }
  const app = express6();
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
  app.use(express6.json({ limit: "10mb" }));
  app.use(express6.urlencoded({ extended: true, limit: "10mb" }));
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
      const { addDemoTasks: addDemoTasks2 } = await Promise.resolve().then(() => (init_addDemoTasks(), addDemoTasks_exports));
      await addDemoTasks2();
      console.log("\u2705 Demo tasks added successfully");
      isAppInitialized = true;
    } catch (error) {
      console.error("\u274C Database initialization failed:", error);
      throw error;
    }
  }
  app.use("/auth", auth_default);
  app.use("/workers", workers_default);
  app.use("/system", system_default);
  app.use("/planning", planning_default);
  app.use("/programs", programs_default);
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.use((err, req, res, next) => {
    console.error("Express error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
  });
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
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
    init_programs();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3Byb2dyYW1zLmpzIiwgInNyYy9zZXJ2ZXIvc2NyaXB0cy9hZGREZW1vVGFza3MuanMiLCAic3JjL3NlcnZlci9leHByZXNzLWFwcC5qcyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2NvbmZpZy9kYXRhYmFzZS5qc1wiO2ltcG9ydCBzcWxpdGUzIGZyb20gJ3NxbGl0ZTMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8vIFVzZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBvciBkZWZhdWx0IHBhdGggLSBlbnN1cmUgZGF0YSBkaXJlY3RvcnkgZXhpc3RzXG5jb25zdCBEQVRBX0RJUiA9IHByb2Nlc3MuZW52LkRBVEFfRElSIHx8IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9kYXRhJyk7XG5jb25zdCBEQl9QQVRIID0gcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMIHx8IHBhdGguam9pbihEQVRBX0RJUiwgJ3Byb2N1cmVtZW50LmRiJyk7XG5cbi8vIEVuc3VyZSBkYXRhIGRpcmVjdG9yeSBleGlzdHNcbmlmICghZnMuZXhpc3RzU3luYyhEQVRBX0RJUikpIHtcbiAgZnMubWtkaXJTeW5jKERBVEFfRElSLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDMSBDcmVhdGVkIGRhdGEgZGlyZWN0b3J5OicsIERBVEFfRElSKTtcbn1cblxubGV0IGRiSW5zdGFuY2UgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0YWJhc2UoKSB7XG4gIGlmICghZGJJbnN0YW5jZSkge1xuICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgZGJJbnN0YW5jZSA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKERCX1BBVEgsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igb3BlbmluZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIFNRTGl0ZSBkYXRhYmFzZSBhdDonLCBEQl9QQVRIKTtcbiAgICB9KTtcblxuICAgIC8vIEVuYWJsZSBmb3JlaWduIGtleXNcbiAgICBkYkluc3RhbmNlLnJ1bignUFJBR01BIGZvcmVpZ25fa2V5cyA9IE9OJyk7XG4gIH1cbiAgcmV0dXJuIGRiSW5zdGFuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZURhdGFiYXNlKCkge1xuICBpZiAoZGJJbnN0YW5jZSkge1xuICAgIGRiSW5zdGFuY2UuY2xvc2UoKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjbG9zaW5nIGRhdGFiYXNlOicsIGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnRGF0YWJhc2UgY29ubmVjdGlvbiBjbG9zZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkYkluc3RhbmNlID0gbnVsbDtcbiAgfVxufVxuXG4vLyBHcmFjZWZ1bCBzaHV0ZG93blxucHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgU0lHSU5ULCBjbG9zaW5nIGRhdGFiYXNlLi4uJyk7XG4gIGNsb3NlRGF0YWJhc2UoKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufSk7XG5cbnByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBTSUdURVJNLCBjbG9zaW5nIGRhdGFiYXNlLi4uJyk7XG4gIGNsb3NlRGF0YWJhc2UoKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplRGF0YWJhc2UoKSB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGFiYXNlIHRhYmxlcy4uLicpO1xuICAgIFxuICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAvLyBDcmVhdGUgb3JnYW5pemF0aW9uYWxfcm9sZXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG9yZ2FuaXphdGlvbmFsX3JvbGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgcm9sZV9jb2RlIElOVEVHRVIgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgcGVybWlzc2lvbnMgVEVYVFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGRpdmlzaW9ucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZGl2aXNpb25zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGlzX2ludGVybmFsIEJPT0xFQU4gREVGQVVMVCAxXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgZGVwYXJ0bWVudHMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRlcGFydG1lbnRzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRpdmlzaW9uX2lkKSBSRUZFUkVOQ0VTIGRpdmlzaW9ucyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBwcm9jdXJlbWVudF90ZWFtcyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvY3VyZW1lbnRfdGVhbXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwgVU5JUVVFXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgd29ya2VycyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgd29ya2VycyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVtcGxveWVlX2lkIFRFWFQgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGZ1bGxfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHJvbGVfZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBwcm9jdXJlbWVudF90ZWFtIFRFWFQsXG4gICAgICAgICAgcGFzc3dvcmQgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBhdmFpbGFibGVfd29ya19kYXlzIFRFWFQsXG4gICAgICAgICAgZW1haWwgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChyb2xlX2NvZGUpIFJFRkVSRU5DRVMgb3JnYW5pemF0aW9uYWxfcm9sZXMocm9sZV9jb2RlKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGl2aXNpb25faWQpIFJFRkVSRU5DRVMgZGl2aXNpb25zKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGVwYXJ0bWVudF9pZCkgUkVGRVJFTkNFUyBkZXBhcnRtZW50cyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBhY3Rpdml0eV9wb29sIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBhY3Rpdml0eV9wb29sIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHRvb2xzX2FuZF9yZXNvdXJjZXMgVEVYVFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGRvbWFpbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRvbWFpbnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgcHJvZ3JhbXMgdGFibGUgKG1haW4gdGFza3MpXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHRhc2tfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgd29ya195ZWFyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgcmVxdWlyZWRfcXVhcnRlciBEQVRFLFxuICAgICAgICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICByZXF1ZXN0ZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXF1ZXN0ZXJfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgZGl2aXNpb25fbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X25hbWUgVEVYVCxcbiAgICAgICAgICBkb21haW5faWQgSU5URUdFUixcbiAgICAgICAgICBkb21haW5fbmFtZSBURVhULFxuICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQgUkVBTCxcbiAgICAgICAgICBjdXJyZW5jeSBURVhULFxuICAgICAgICAgIHN1cHBsaWVyX2xpc3QgVEVYVCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uIFRFWFQsXG4gICAgICAgICAgcGxhbm5pbmdfc291cmNlIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnYW5udWFsX3BsYW5uaW5nJyxcbiAgICAgICAgICBjb21wbGV4aXR5IElOVEVHRVIsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGF0dXMgVEVYVCBOT1QgTlVMTCBERUZBVUxUICdPcGVuJyxcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgdGVhbV9pZCBJTlRFR0VSLFxuICAgICAgICAgIHRlYW1fbmFtZSBURVhULFxuICAgICAgICAgIHN0YXJ0X2RhdGUgREFURSxcbiAgICAgICAgICBwbGFubmluZ19ub3RlcyBURVhULFxuICAgICAgICAgIG9mZmljZXJfbm90ZXMgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkZXBhcnRtZW50X2lkKSBSRUZFUkVOQ0VTIGRlcGFydG1lbnRzKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZG9tYWluX2lkKSBSRUZFUkVOQ0VTIGRvbWFpbnMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgcHJvZ3JhbV90YXNrcyB0YWJsZSAoc3RhdGlvbnMpXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtX3Rhc2tzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgcHJvZ3JhbV9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHN0YXRpb25faWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBhY3Rpdml0eV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfaWQgSU5URUdFUixcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX25hbWUgVEVYVCxcbiAgICAgICAgICBjb21wbGV0aW9uX2RhdGUgREFURSxcbiAgICAgICAgICByZXBvcnRpbmdfdXNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIHJlcG9ydGluZ191c2VyX25hbWUgVEVYVCxcbiAgICAgICAgICByZWZlcmVuY2UgVEVYVCxcbiAgICAgICAgICBub3RlcyBURVhULFxuICAgICAgICAgIGlzX2xhc3Rfc3RhdGlvbiBCT09MRUFOIERFRkFVTFQgMCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChwcm9ncmFtX2lkKSBSRUZFUkVOQ0VTIHByb2dyYW1zKGlkKSBPTiBERUxFVEUgQ0FTQ0FERSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoYWN0aXZpdHlfaWQpIFJFRkVSRU5DRVMgYWN0aXZpdHlfcG9vbChpZCksXG4gICAgICAgICAgVU5JUVVFKHByb2dyYW1faWQsIHN0YXRpb25faWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgY29tcGxleGl0eV9lc3RpbWF0ZXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGNvbXBsZXhpdHlfZXN0aW1hdGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMSBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgNSxcbiAgICAgICAgICBlc3RpbWF0ZV9sZXZlbF8yIElOVEVHRVIgTk9UIE5VTEwgREVGQVVMVCAxMCxcbiAgICAgICAgICBlc3RpbWF0ZV9sZXZlbF8zIElOVEVHRVIgTk9UIE5VTEwgREVGQVVMVCAyMCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBhY2NlcHRhbmNlX29wdGlvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjY2VwdGFuY2Vfb3B0aW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHllYXJfaWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICB1cGxvYWRfY29kZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgYnJvYWRfbWVhbmluZyBURVhULFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgVU5JUVVFKHllYXJfaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5kZXhlcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF93b3JrZXJzX2VtcGxveWVlX2lkIE9OIHdvcmtlcnMoZW1wbG95ZWVfaWQpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF93b3JrZXJzX3JvbGVfY29kZSBPTiB3b3JrZXJzKHJvbGVfY29kZSknKTtcbiAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X3Byb2dyYW1zX3Rhc2tfaWQgT04gcHJvZ3JhbXModGFza19pZCknKTtcbiAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X3Byb2dyYW1zX3N0YXR1cyBPTiBwcm9ncmFtcyhzdGF0dXMpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtX3Rhc2tzX3Byb2dyYW1faWQgT04gcHJvZ3JhbV90YXNrcyhwcm9ncmFtX2lkKScpO1xuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19zdGF0aW9uX2lkIE9OIHByb2dyYW1fdGFza3Moc3RhdGlvbl9pZCknKTtcblxuICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHRhYmxlcyBhbmQgaW5kZXhlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuXG4gICAgZGIub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignRGF0YWJhc2UgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0pO1xuICB9KTtcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9taWRkbGV3YXJlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanNcIjtpbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBhdXRoZW50aWNhdGVUb2tlbiA9IChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnNbJ2F1dGhvcml6YXRpb24nXTtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyICYmIGF1dGhIZWFkZXIuc3BsaXQoJyAnKVsxXTtcblxuICBpZiAoIXRva2VuKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBY2Nlc3MgdG9rZW4gcmVxdWlyZWQnIH0pO1xuICB9XG5cbiAgand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCwgKGVyciwgdXNlcikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Rva2VuIHZlcmlmaWNhdGlvbiBmYWlsZWQ6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW52YWxpZCBvciBleHBpcmVkIHRva2VuJyB9KTtcbiAgICB9XG4gICAgXG4gICAgcmVxLnVzZXIgPSB1c2VyO1xuICAgIG5leHQoKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgcmVxdWlyZVJvbGUgPSAoYWxsb3dlZFJvbGVzKSA9PiB7XG4gIHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBpZiAoIXJlcS51c2VyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0F1dGhlbnRpY2F0aW9uIHJlcXVpcmVkJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWFsbG93ZWRSb2xlcy5pbmNsdWRlcyhyZXEudXNlci5yb2xlQ29kZSkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9KTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VXNlckZyb21Ub2tlbiA9IGFzeW5jICh0b2tlbikgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRlY29kZWQgPSBqd3QudmVyaWZ5KHRva2VuLCBwcm9jZXNzLmVudi5KV1RfU0VDUkVUKTtcbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRiLmdldChcbiAgICAgICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLCBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lIFxuICAgICAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdy5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB3LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICAgICAgV0hFUkUgdy5pZCA9ID9gLFxuICAgICAgICBbZGVjb2RlZC5pZF0sXG4gICAgICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJvdyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0b2tlbicpO1xuICB9XG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9hdXRoLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgZ2V0VXNlckZyb21Ub2tlbiB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIExvZ2luIGVuZHBvaW50XG5yb3V0ZXIucG9zdCgnL2xvZ2luJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBlbXBsb3llZUlkLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBEIExvZ2luIGF0dGVtcHQ6JywgeyBlbXBsb3llZUlkLCBwYXNzd29yZExlbmd0aDogcGFzc3dvcmQ/Lmxlbmd0aCB9KTtcblxuICAgIC8vIFZhbGlkYXRlIGlucHV0XG4gICAgaWYgKCFlbXBsb3llZUlkIHx8ICFwYXNzd29yZCkge1xuICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBNaXNzaW5nIGNyZWRlbnRpYWxzJyk7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFuZCBwYXNzd29yZCBhcmUgcmVxdWlyZWQnIH0pO1xuICAgIH1cblxuICAgIGlmIChlbXBsb3llZUlkLmxlbmd0aCAhPT0gNCB8fCAhL15cXGR7NH0kLy50ZXN0KGVtcGxveWVlSWQpKSB7XG4gICAgICBjb25zb2xlLmxvZygnXHUyNzRDIEludmFsaWQgZW1wbG95ZWUgSUQgZm9ybWF0Jyk7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIG11c3QgYmUgZXhhY3RseSA0IGRpZ2l0cycgfSk7XG4gICAgfVxuXG4gICAgaWYgKHBhc3N3b3JkLmxlbmd0aCAhPT0gNikge1xuICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBJbnZhbGlkIHBhc3N3b3JkIGxlbmd0aCcpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdQYXNzd29yZCBtdXN0IGJlIGV4YWN0bHkgNiBjaGFyYWN0ZXJzJyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBGaXJzdCwgbGV0J3MgY2hlY2sgd2hhdCB1c2VycyBleGlzdCBpbiB0aGUgZGF0YWJhc2VcbiAgICBkYi5hbGwoJ1NFTEVDVCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lIEZST00gd29ya2VycycsIChlcnIsIGFsbFVzZXJzKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBjaGVja2luZyB1c2VyczonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBBdmFpbGFibGUgdXNlcnMgaW4gZGF0YWJhc2U6JywgYWxsVXNlcnMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRmluZCB1c2VyIGJ5IGVtcGxveWVlIElEXG4gICAgZGIuZ2V0KFxuICAgICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLCBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lLCBvcl9yb2xlLmRlc2NyaXB0aW9uIGFzIHJvbGVfZGVzY3JpcHRpb25cbiAgICAgICBGUk9NIHdvcmtlcnMgdyBcbiAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdy5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICBMRUZUIEpPSU4gb3JnYW5pemF0aW9uYWxfcm9sZXMgb3Jfcm9sZSBPTiB3LnJvbGVfY29kZSA9IG9yX3JvbGUucm9sZV9jb2RlXG4gICAgICAgV0hFUkUgdy5lbXBsb3llZV9pZCA9ID9gLFxuICAgICAgW2VtcGxveWVlSWRdLFxuICAgICAgYXN5bmMgKGVyciwgdXNlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIERhdGFiYXNlIGVycm9yIGR1cmluZyBsb2dpbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBVc2VyIGZvdW5kIGluIGRhdGFiYXNlOicsIHVzZXIgPyAnWUVTJyA6ICdOTycpO1xuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDNjQgVXNlciBkZXRhaWxzOicsIHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIGhhc1Bhc3N3b3JkOiAhIXVzZXIucGFzc3dvcmRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgVXNlciBub3QgZm91bmQgZm9yIGVtcGxveWVlIElEOicsIGVtcGxveWVlSWQpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWZXJpZnkgcGFzc3dvcmRcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBWZXJpZnlpbmcgcGFzc3dvcmQuLi4nKTtcbiAgICAgICAgY29uc3QgaXNWYWxpZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHVzZXIucGFzc3dvcmQpO1xuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBEIFBhc3N3b3JkIHZhbGlkOicsIGlzVmFsaWRQYXNzd29yZCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWlzVmFsaWRQYXNzd29yZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgSW52YWxpZCBwYXNzd29yZCBmb3IgdXNlcjonLCBlbXBsb3llZUlkKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBMb2dpbiBzdWNjZXNzZnVsIGZvciB1c2VyOicsIGVtcGxveWVlSWQpO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIEpXVCB0b2tlblxuICAgICAgICBjb25zdCB0b2tlbiA9IGp3dC5zaWduKFxuICAgICAgICAgIHsgXG4gICAgICAgICAgICBpZDogdXNlci5pZCwgXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLCBcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSBcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsXG4gICAgICAgICAgeyBleHBpcmVzSW46IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBSZXR1cm4gdXNlciBkYXRhIGFuZCB0b2tlblxuICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSB7XG4gICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24gfHwgJ1Vua25vd24gUm9sZScsXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiB1c2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogdXNlci5kZXBhcnRtZW50X25hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBTZW5kaW5nIHJlc3BvbnNlOicsIHJlc3BvbnNlRGF0YSk7XG4gICAgICAgIHJlcy5qc29uKHJlc3BvbnNlRGF0YSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgTG9naW4gZXJyb3I6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xuICB9XG59KTtcblxuLy8gR2V0IGN1cnJlbnQgdXNlciBlbmRwb2ludFxucm91dGVyLmdldCgnL21lJywgYXV0aGVudGljYXRlVG9rZW4sIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBnZXRVc2VyRnJvbVRva2VuKHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24uc3BsaXQoJyAnKVsxXSk7XG4gICAgXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7XG4gICAgICBpZDogdXNlci5pZCxcbiAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICByb2xlRGVzY3JpcHRpb246IHVzZXIucm9sZV9kZXNjcmlwdGlvbixcbiAgICAgIHByb2N1cmVtZW50VGVhbTogdXNlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICBkaXZpc2lvbk5hbWU6IHVzZXIuZGl2aXNpb25fbmFtZSxcbiAgICAgIGRlcGFydG1lbnROYW1lOiB1c2VyLmRlcGFydG1lbnRfbmFtZVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0dldCB1c2VyIGVycm9yOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvd29ya2Vycy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3dvcmtlcnMuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gR2V0IGFsbCB3b3JrZXJzXG5yb3V0ZXIuZ2V0KCcvJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoXG4gICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbk5hbWUsIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50TmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlRGVzY3JpcHRpb25cbiAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB3LmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgTEVGVCBKT0lOIG9yZ2FuaXphdGlvbmFsX3JvbGVzIG9yX3JvbGUgT04gdy5yb2xlX2NvZGUgPSBvcl9yb2xlLnJvbGVfY29kZVxuICAgICBPUkRFUiBCWSB3LmZ1bGxfbmFtZWAsXG4gICAgKGVyciwgcm93cykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB3b3JrZXJzOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUcmFuc2Zvcm0gZGF0YSB0byBtYXRjaCBmcm9udGVuZCBmb3JtYXRcbiAgICAgIGNvbnN0IHdvcmtlcnMgPSByb3dzLm1hcChyb3cgPT4gKHtcbiAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgZW1wbG95ZWVJZDogcm93LmVtcGxveWVlX2lkLFxuICAgICAgICByb2xlQ29kZTogcm93LnJvbGVfY29kZSxcbiAgICAgICAgZnVsbE5hbWU6IHJvdy5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVEZXNjcmlwdGlvbjogcm93LnJvbGVEZXNjcmlwdGlvbixcbiAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICBwcm9jdXJlbWVudFRlYW06IHJvdy5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBwYXNzd29yZDogJyoqKioqKicsIC8vIE5ldmVyIHNlbmQgYWN0dWFsIHBhc3N3b3JkXG4gICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiByb3cuYXZhaWxhYmxlX3dvcmtfZGF5cyxcbiAgICAgICAgZW1haWw6IHJvdy5lbWFpbCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25OYW1lLFxuICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnROYW1lXG4gICAgICB9KSk7XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHdvcmtlcnMpO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBDcmVhdGUgbmV3IHdvcmtlclxucm91dGVyLnBvc3QoJy8nLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qge1xuICAgICAgZW1wbG95ZWVJZCxcbiAgICAgIHJvbGVDb2RlLFxuICAgICAgZnVsbE5hbWUsXG4gICAgICByb2xlRGVzY3JpcHRpb24sXG4gICAgICBkaXZpc2lvbklkLFxuICAgICAgZGVwYXJ0bWVudElkLFxuICAgICAgcHJvY3VyZW1lbnRUZWFtLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhdmFpbGFibGVXb3JrRGF5cyxcbiAgICAgIGVtYWlsXG4gICAgfSA9IHJlcS5ib2R5O1xuXG4gICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFlbXBsb3llZUlkIHx8ICFyb2xlQ29kZSB8fCAhZnVsbE5hbWUgfHwgIXBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzJyB9KTtcbiAgICB9XG5cbiAgICAvLyBIYXNoIHBhc3N3b3JkXG4gICAgY29uc3QgaGFzaGVkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgMTIpO1xuXG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgZGIucnVuKFxuICAgICAgYElOU0VSVCBJTlRPIHdvcmtlcnMgXG4gICAgICAgKGVtcGxveWVlX2lkLCByb2xlX2NvZGUsIGZ1bGxfbmFtZSwgcm9sZV9kZXNjcmlwdGlvbiwgZGl2aXNpb25faWQsIGRlcGFydG1lbnRfaWQsIFxuICAgICAgICBwcm9jdXJlbWVudF90ZWFtLCBwYXNzd29yZCwgYXZhaWxhYmxlX3dvcmtfZGF5cywgZW1haWwpIFxuICAgICAgIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPywgPywgPywgPylgLFxuICAgICAgW2VtcGxveWVlSWQsIHJvbGVDb2RlLCBmdWxsTmFtZSwgcm9sZURlc2NyaXB0aW9uLCBkaXZpc2lvbklkLCBkZXBhcnRtZW50SWQsIFxuICAgICAgIHByb2N1cmVtZW50VGVhbSwgaGFzaGVkUGFzc3dvcmQsIGF2YWlsYWJsZVdvcmtEYXlzLCBlbWFpbF0sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgIGlmIChlcnIubWVzc2FnZS5pbmNsdWRlcygnVU5JUVVFIGNvbnN0cmFpbnQgZmFpbGVkJykpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnRW1wbG95ZWUgSUQgYWxyZWFkeSBleGlzdHMnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZldGNoIHRoZSBjcmVhdGVkIHdvcmtlciB3aXRoIGpvaW5lZCBkYXRhXG4gICAgICAgIGRiLmdldChcbiAgICAgICAgICBgU0VMRUNUIHcuKiwgZC5uYW1lIGFzIGRpdmlzaW9uTmFtZSwgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnROYW1lLCBvcl9yb2xlLmRlc2NyaXB0aW9uIGFzIHJvbGVEZXNjcmlwdGlvblxuICAgICAgICAgICBGUk9NIHdvcmtlcnMgdyBcbiAgICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB3LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICAgICAgICBMRUZUIEpPSU4gb3JnYW5pemF0aW9uYWxfcm9sZXMgb3Jfcm9sZSBPTiB3LnJvbGVfY29kZSA9IG9yX3JvbGUucm9sZV9jb2RlXG4gICAgICAgICAgIFdIRVJFIHcuaWQgPSA/YCxcbiAgICAgICAgICBbdGhpcy5sYXN0SURdLFxuICAgICAgICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgd29ya2VyID0ge1xuICAgICAgICAgICAgICBpZDogcm93LmlkLFxuICAgICAgICAgICAgICBlbXBsb3llZUlkOiByb3cuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICAgIHJvbGVDb2RlOiByb3cucm9sZV9jb2RlLFxuICAgICAgICAgICAgICBmdWxsTmFtZTogcm93LmZ1bGxfbmFtZSxcbiAgICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiByb3cucm9sZURlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICBkaXZpc2lvbklkOiByb3cuZGl2aXNpb25faWQsXG4gICAgICAgICAgICAgIGRlcGFydG1lbnRJZDogcm93LmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogcm93LnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiAnKioqKioqJyxcbiAgICAgICAgICAgICAgYXZhaWxhYmxlV29ya0RheXM6IHJvdy5hdmFpbGFibGVfd29ya19kYXlzLFxuICAgICAgICAgICAgICBlbWFpbDogcm93LmVtYWlsLFxuICAgICAgICAgICAgICBkaXZpc2lvbk5hbWU6IHJvdy5kaXZpc2lvbk5hbWUsXG4gICAgICAgICAgICAgIGRlcGFydG1lbnROYW1lOiByb3cuZGVwYXJ0bWVudE5hbWVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHdvcmtlcik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbi8vIFVwZGF0ZSB3b3JrZXJcbnJvdXRlci5wdXQoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICBjb25zdCB7XG4gICAgICBlbXBsb3llZUlkLFxuICAgICAgcm9sZUNvZGUsXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHJvbGVEZXNjcmlwdGlvbixcbiAgICAgIGRpdmlzaW9uSWQsXG4gICAgICBkZXBhcnRtZW50SWQsXG4gICAgICBwcm9jdXJlbWVudFRlYW0sXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGF2YWlsYWJsZVdvcmtEYXlzLFxuICAgICAgZW1haWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgICAvLyBQcmVwYXJlIHVwZGF0ZSBxdWVyeVxuICAgIGxldCB1cGRhdGVRdWVyeSA9IGBcbiAgICAgIFVQREFURSB3b3JrZXJzIFNFVCBcbiAgICAgICAgZW1wbG95ZWVfaWQgPSA/LCByb2xlX2NvZGUgPSA/LCBmdWxsX25hbWUgPSA/LCByb2xlX2Rlc2NyaXB0aW9uID0gPyxcbiAgICAgICAgZGl2aXNpb25faWQgPSA/LCBkZXBhcnRtZW50X2lkID0gPywgcHJvY3VyZW1lbnRfdGVhbSA9ID8sIFxuICAgICAgICBhdmFpbGFibGVfd29ya19kYXlzID0gPywgZW1haWwgPSA/LCB1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVBcbiAgICBgO1xuICAgIFxuICAgIGxldCBwYXJhbXMgPSBbZW1wbG95ZWVJZCwgcm9sZUNvZGUsIGZ1bGxOYW1lLCByb2xlRGVzY3JpcHRpb24sIGRpdmlzaW9uSWQsIFxuICAgICAgICAgICAgICAgICAgZGVwYXJ0bWVudElkLCBwcm9jdXJlbWVudFRlYW0sIGF2YWlsYWJsZVdvcmtEYXlzLCBlbWFpbF07XG5cbiAgICAvLyBPbmx5IHVwZGF0ZSBwYXNzd29yZCBpZiBwcm92aWRlZCBhbmQgbm90IHRoZSBwbGFjZWhvbGRlclxuICAgIGlmIChwYXNzd29yZCAmJiBwYXNzd29yZCAhPT0gJyoqKioqKicpIHtcbiAgICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEyKTtcbiAgICAgIHVwZGF0ZVF1ZXJ5ICs9ICcsIHBhc3N3b3JkID0gPyc7XG4gICAgICBwYXJhbXMucHVzaChoYXNoZWRQYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdXBkYXRlUXVlcnkgKz0gJyBXSEVSRSBpZCA9ID8nO1xuICAgIHBhcmFtcy5wdXNoKGlkKTtcblxuICAgIGRiLnJ1bih1cGRhdGVRdWVyeSwgcGFyYW1zLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICAgIGlmIChlcnIubWVzc2FnZS5pbmNsdWRlcygnVU5JUVVFIGNvbnN0cmFpbnQgZmFpbGVkJykpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBGZXRjaCB1cGRhdGVkIHdvcmtlclxuICAgICAgZGIuZ2V0KFxuICAgICAgICBgU0VMRUNUIHcuKiwgZC5uYW1lIGFzIGRpdmlzaW9uTmFtZSwgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnROYW1lLCBvcl9yb2xlLmRlc2NyaXB0aW9uIGFzIHJvbGVEZXNjcmlwdGlvblxuICAgICAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdy5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiB3LmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICAgICAgTEVGVCBKT0lOIG9yZ2FuaXphdGlvbmFsX3JvbGVzIG9yX3JvbGUgT04gdy5yb2xlX2NvZGUgPSBvcl9yb2xlLnJvbGVfY29kZVxuICAgICAgICAgV0hFUkUgdy5pZCA9ID9gLFxuICAgICAgICBbaWRdLFxuICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgd29ya2VyID0ge1xuICAgICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHJvdy5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIHJvbGVDb2RlOiByb3cucm9sZV9jb2RlLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHJvdy5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlRGVzY3JpcHRpb246IHJvdy5yb2xlRGVzY3JpcHRpb24sXG4gICAgICAgICAgICBkaXZpc2lvbklkOiByb3cuZGl2aXNpb25faWQsXG4gICAgICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiByb3cucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiAnKioqKioqJyxcbiAgICAgICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiByb3cuYXZhaWxhYmxlX3dvcmtfZGF5cyxcbiAgICAgICAgICAgIGVtYWlsOiByb3cuZW1haWwsXG4gICAgICAgICAgICBkaXZpc2lvbk5hbWU6IHJvdy5kaXZpc2lvbk5hbWUsXG4gICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnROYW1lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJlcy5qc29uKHdvcmtlcik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgd29ya2VyOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbi8vIERlbGV0ZSB3b3JrZXJcbnJvdXRlci5kZWxldGUoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIHdvcmtlcnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgd29ya2VyOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1dvcmtlciBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ1dvcmtlciBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBvcmdhbml6YXRpb25hbCByb2xlc1xucm91dGVyLmdldCgnL29yZ2FuaXphdGlvbmFsLXJvbGVzJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBEIEFQSTogR2V0dGluZyBvcmdhbml6YXRpb25hbCByb2xlcy4uLicpO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gb3JnYW5pemF0aW9uYWxfcm9sZXMgT1JERVIgQlkgcm9sZV9jb2RlJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBmZXRjaGluZyBvcmdhbml6YXRpb25hbCByb2xlczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRmV0Y2hlZCBvcmdhbml6YXRpb25hbCByb2xlcyBmcm9tIERCOicsIHJvd3MpO1xuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgZGl2aXNpb25zXG5yb3V0ZXIuZ2V0KCcvZGl2aXNpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGl2aXNpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbi8vIEdldCBkZXBhcnRtZW50c1xucm91dGVyLmdldCgnL2RlcGFydG1lbnRzJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gZGVwYXJ0bWVudHMgT1JERVIgQlkgbmFtZScsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkZXBhcnRtZW50czonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgcHJvY3VyZW1lbnQgdGVhbXNcbnJvdXRlci5nZXQoJy9wcm9jdXJlbWVudC10ZWFtcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzL3NlZWREYXRhYmFzZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtpbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlZWREYXRhYmFzZSgpIHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zb2xlLmxvZygnU2VlZGluZyBkYXRhYmFzZSB3aXRoIGluaXRpYWwgZGF0YS4uLicpO1xuICAgIFxuICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBTdGVwIDE6IEZpcnN0LCBlbnN1cmUgb3JnYW5pemF0aW9uYWwgcm9sZXMgZXhpc3RcbiAgICAgICAgY29uc29sZS5sb2coJ1N0ZXAgMTogRW5zdXJpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXMgZXhpc3QuLi4nKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJvbGVzID0gW1xuICAgICAgICAgIHsgcm9sZV9jb2RlOiAwLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVERVx1MDVEQ1x1MDVEMCcgfSxcbiAgICAgICAgICB7IHJvbGVfY29kZTogMSwgZGVzY3JpcHRpb246ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNUU4XHUwNURCXHUwNUU5JywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUU4XHUwNURCXHUwNUU5JyB9LFxuICAgICAgICAgIHsgcm9sZV9jb2RlOiAyLCBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEMFx1MDVFOSBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICAgICAgeyByb2xlX2NvZGU6IDMsIGRlc2NyaXB0aW9uOiAnXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNURGJywgcGVybWlzc2lvbnM6ICdcdTA1RDFcdTA1RDlcdTA1RTZcdTA1RDVcdTA1RTIgXHUwNUU4XHUwNURCXHUwNUU5JyB9LFxuICAgICAgICAgIHsgcm9sZV9jb2RlOiA0LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDNcdTA1RDVcdTA1RThcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVENFx1MDVEMlx1MDVFOVx1MDVFQSBcdTA1RDNcdTA1RThcdTA1RDlcdTA1RTlcdTA1RDVcdTA1RUEnIH0sXG4gICAgICAgICAgeyByb2xlX2NvZGU6IDUsIGRlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDXHUwNURGIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScsIHBlcm1pc3Npb25zOiAnXHUwNURFXHUwNURDXHUwNUQwJyB9LFxuICAgICAgICAgIHsgcm9sZV9jb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVENCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDlcdTA1RUEnIH1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBJbnNlcnQgcm9sZXMgc3luY2hyb25vdXNseVxuICAgICAgICByb2xlcy5mb3JFYWNoKHJvbGUgPT4ge1xuICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICdJTlNFUlQgT1IgUkVQTEFDRSBJTlRPIG9yZ2FuaXphdGlvbmFsX3JvbGVzIChyb2xlX2NvZGUsIGRlc2NyaXB0aW9uLCBwZXJtaXNzaW9ucykgVkFMVUVTICg/LCA/LCA/KScsXG4gICAgICAgICAgICBbcm9sZS5yb2xlX2NvZGUsIHJvbGUuZGVzY3JpcHRpb24sIHJvbGUucGVybWlzc2lvbnNdLFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgaW5zZXJ0aW5nIHJvbGU6Jywgcm9sZS5yb2xlX2NvZGUsIGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBFbnN1cmVkIHJvbGUgZXhpc3RzOicsIHJvbGUucm9sZV9jb2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFN0ZXAgMjogV2FpdCBmb3Igcm9sZXMgdG8gYmUgaW5zZXJ0ZWQsIHRoZW4gaW5zZXJ0IHVzZXJzXG4gICAgICAgIGNvbnNvbGUubG9nKCdTdGVwIDI6IEVuc3VyaW5nIGRlZmF1bHQgdXNlcnMgZXhpc3QuLi4nKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRlZmF1bHRQYXNzd29yZCA9ICcxMjM0NTYnO1xuICAgICAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGJjcnlwdC5oYXNoU3luYyhkZWZhdWx0UGFzc3dvcmQsIDEyKTtcblxuICAgICAgICBjb25zdCBkZWZhdWx0VXNlcnMgPSBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZW1wbG95ZWVfaWQ6ICc5OTk5JyxcbiAgICAgICAgICAgIHJvbGVfY29kZTogMCxcbiAgICAgICAgICAgIGZ1bGxfbmFtZTogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLFxuICAgICAgICAgICAgcm9sZV9kZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBlbXBsb3llZV9pZDogJzEwMDEnLFxuICAgICAgICAgICAgcm9sZV9jb2RlOiAxLFxuICAgICAgICAgICAgZnVsbF9uYW1lOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOScsXG4gICAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RThcdTA1RDBcdTA1RTlcdTA1RDknLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkXG4gICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIEluc2VydCB1c2VycyBhZnRlciByb2xlcyBhcmUgcmVhZHlcbiAgICAgICAgZGVmYXVsdFVzZXJzLmZvckVhY2goKHVzZXIpID0+IHtcbiAgICAgICAgICBkYi5ydW4oXG4gICAgICAgICAgICBgSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyB3b3JrZXJzIFxuICAgICAgICAgICAgIChlbXBsb3llZV9pZCwgcm9sZV9jb2RlLCBmdWxsX25hbWUsIHJvbGVfZGVzY3JpcHRpb24sIHBhc3N3b3JkKSBcbiAgICAgICAgICAgICBWQUxVRVMgKD8sID8sID8sID8sID8pYCxcbiAgICAgICAgICAgIFt1c2VyLmVtcGxveWVlX2lkLCB1c2VyLnJvbGVfY29kZSwgdXNlci5mdWxsX25hbWUsIHVzZXIucm9sZV9kZXNjcmlwdGlvbiwgdXNlci5wYXNzd29yZF0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBlbnN1cmluZyB1c2VyIGV4aXN0czonLCB1c2VyLmVtcGxveWVlX2lkLCBlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRW5zdXJlZCB1c2VyIGV4aXN0czonLCB1c2VyLmVtcGxveWVlX2lkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFN0ZXAgMzogQ2hlY2sgaWYgb3RoZXIgZGF0YSBhbHJlYWR5IGV4aXN0cyB0byBhdm9pZCBkdXBsaWNhdGVzXG4gICAgICAgIGRiLmdldCgnU0VMRUNUIENPVU5UKCopIGFzIGNvdW50IEZST00gZGl2aXNpb25zJywgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEVycm9yIGNoZWNraW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIChyb3cgJiYgcm93LmNvdW50ID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBCYXNpYyBkYXRhIGFscmVhZHkgZXhpc3RzLCBvbmx5IGVuc3VyZWQgcm9sZXMgYW5kIGRlZmF1bHQgdXNlcnMnKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS5sb2coJ1N0ZXAgMzogU2VlZGluZyBhZGRpdGlvbmFsIGRhdGEuLi4nKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBTZWVkIGRpdmlzaW9uc1xuICAgICAgICAgIGNvbnN0IGRpdmlzaW9ucyA9IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOVx1MDVFN1x1MDVENCcsIGlzX2ludGVybmFsOiAxIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDlcdTA1RDQnLCBpc19pbnRlcm5hbDogMSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNUU3XHUwNUU4IFx1MDVENVx1MDVFNFx1MDVEOVx1MDVFQVx1MDVENVx1MDVENycsIGlzX2ludGVybmFsOiAxIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RTlcdTA1RDBcdTA1RDFcdTA1RDkgXHUwNUQwXHUwNUUwXHUwNUQ1XHUwNUU5JywgaXNfaW50ZXJuYWw6IDEgfVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBkaXZpc2lvbnMuZm9yRWFjaChkaXZpc2lvbiA9PiB7XG4gICAgICAgICAgICBkYi5ydW4oXG4gICAgICAgICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgICAgICAgIFtkaXZpc2lvbi5uYW1lLCBkaXZpc2lvbi5pc19pbnRlcm5hbF1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTZWVkIGRlcGFydG1lbnRzXG4gICAgICAgICAgY29uc3QgZGVwYXJ0bWVudHMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNUQ3XHUwNUQ1XHUwNUQ2XHUwNUQ5XHUwNUREJywgZGl2aXNpb25faWQ6IDEgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQyBcdTA1RDVcdTA1RUFcdTA1RDdcdTA1RDZcdTA1RDVcdTA1RTdcdTA1RDQnLCBkaXZpc2lvbl9pZDogMSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEOVx1MDVEM1x1MDVFMicsIGRpdmlzaW9uX2lkOiAyIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RDlcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNUQ0JywgZGl2aXNpb25faWQ6IDIgfVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBkZXBhcnRtZW50cy5mb3JFYWNoKGRlcHQgPT4ge1xuICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRlcGFydG1lbnRzIChuYW1lLCBkaXZpc2lvbl9pZCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgICAgICAgIFtkZXB0Lm5hbWUsIGRlcHQuZGl2aXNpb25faWRdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBwcm9jdXJlbWVudCB0ZWFtc1xuICAgICAgICAgIGNvbnN0IHRlYW1zID0gW1xuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ5XHUwNUUyXHUwNUQ1XHUwNUQzXHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNUU5XHUwNUQ1XHUwNUQxJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUwXHUwNUQzXHUwNUUxXHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQ5XHUwNUQ4XHUwNUQ3XHUwNUQ1XHUwNUUwXHUwNUQ5JyB9XG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHRlYW1zLmZvckVhY2godGVhbSA9PiB7XG4gICAgICAgICAgICBkYi5ydW4oXG4gICAgICAgICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gcHJvY3VyZW1lbnRfdGVhbXMgKG5hbWUpIFZBTFVFUyAoPyknLFxuICAgICAgICAgICAgICBbdGVhbS5uYW1lXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNlZWQgYWN0aXZpdHkgcG9vbFxuICAgICAgICAgIGNvbnN0IGFjdGl2aXRpZXMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RDNcdTA1RDlcdTA1RTdcdTA1RUEgXHUwNUQ0XHUwNUU2XHUwNUUyXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEN1x1MDVEOVx1MDVFOCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBIFx1MDVERVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVEQlx1MDVFMFx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDggXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgdG9vbHNfYW5kX3Jlc291cmNlczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDgnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQgXHUwNURFXHUwNURCXHUwNUU4XHUwNUQ2JywgdG9vbHNfYW5kX3Jlc291cmNlczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDRcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUQ0XHUwNUU2XHUwNUUyXHUwNUQ1XHUwNUVBJywgdG9vbHNfYW5kX3Jlc291cmNlczogJ1x1MDVERVx1MDVEOFx1MDVFOFx1MDVEOVx1MDVFNlx1MDVFQSBcdTA1RDRcdTA1RTJcdTA1RThcdTA1REJcdTA1RDQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RDdcdTA1RDlcdTA1RThcdTA1RUEgXHUwNUQ2XHUwNUQ1XHUwNURCXHUwNUQ0JywgdG9vbHNfYW5kX3Jlc291cmNlczogJ1x1MDVENVx1MDVFMlx1MDVEM1x1MDVFQSBcdTA1RDRcdTA1RTJcdTA1RThcdTA1REJcdTA1RDQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDdcdTA1RUFcdTA1RDlcdTA1REVcdTA1RDQgXHUwNUUyXHUwNURDIFx1MDVENFx1MDVFMVx1MDVEQlx1MDVERCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUQ3XHUwNUVBXHUwNUQ5XHUwNURFXHUwNUQ1XHUwNUVBJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUU3XHUwNUU4XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RThcdTA1RTlcdTA1RDlcdTA1REVcdTA1RUEgXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUQ1XHUwNUVBJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQwXHUwNUQ5XHUwNUU5XHUwNUQ1XHUwNUU4IFx1MDVFQVx1MDVFOVx1MDVEQ1x1MDVENVx1MDVERCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURCXHUwNUUxXHUwNUU0XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMVx1MDVEOVx1MDVFNlx1MDVENVx1MDVFMicsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUUxXHUwNUQyXHUwNUQ5XHUwNUU4XHUwNUVBIFx1MDVFNFx1MDVFOFx1MDVENVx1MDVEOVx1MDVFN1x1MDVEOCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQzXHUwNUQ1XCJcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJywgdG9vbHNfYW5kX3Jlc291cmNlczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVFQSBcdTA1RDNcdTA1RDVcdTA1RDcnIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgYWN0aXZpdGllcy5mb3JFYWNoKGFjdGl2aXR5ID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgICAgICAgW2FjdGl2aXR5Lm5hbWUsIGFjdGl2aXR5LnRvb2xzX2FuZF9yZXNvdXJjZXNdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBkb21haW5zXG4gICAgICAgICAgY29uc3QgZG9tYWlucyA9IFtcbiAgICAgICAgICAgIHsgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknIH0sXG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uOiAnXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBXHUwNUQ5XHUwNUREIFx1MDVERVx1MDVFN1x1MDVFNlx1MDVENVx1MDVFMlx1MDVEOVx1MDVEOVx1MDVERCcgfSxcbiAgICAgICAgICAgIHsgZGVzY3JpcHRpb246ICdcdTA1RUFcdTA1RDdcdTA1RDZcdTA1RDVcdTA1RTdcdTA1RDQgXHUwNUQ1XHUwNUVBXHUwNUU0XHUwNUUyXHUwNUQ1XHUwNURDJyB9XG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGRvbWFpbnMuZm9yRWFjaChkb21haW4gPT4ge1xuICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJyxcbiAgICAgICAgICAgICAgW2RvbWFpbi5kZXNjcmlwdGlvbl1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTZWVkIGNvbXBsZXhpdHkgZXN0aW1hdGVzXG4gICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBjb21wbGV4aXR5X2VzdGltYXRlcyAoaWQsIGVzdGltYXRlX2xldmVsXzEsIGVzdGltYXRlX2xldmVsXzIsIGVzdGltYXRlX2xldmVsXzMpIFZBTFVFUyAoMSwgNSwgMTAsIDIwKScsXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBzZWVkaW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBTZWVkZWQgY29tcGxleGl0eSBlc3RpbWF0ZXMnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IERhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHkhJyk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0RlZmF1bHQgdXNlcnMgYXZhaWxhYmxlOicpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctIEFkbWluOiA5OTk5IC8gMTIzNDU2Jyk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0gTWFuYWdlcjogMTAwMSAvIDEyMzQ1NicpO1xuICAgICAgICAgIFxuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3Igc2VlZGluZyBkYXRhYmFzZTonLCBlcnJvcik7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9zeXN0ZW0uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9zeXN0ZW0uanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZSB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5pbXBvcnQgeyBzZWVkRGF0YWJhc2UgfSBmcm9tICcuLi9zY3JpcHRzL3NlZWREYXRhYmFzZS5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIFNlZWQgZGF0YWJhc2UgZW5kcG9pbnQgLSBwdWJsaWNseSBhdmFpbGFibGUgd2l0aG91dCBhdXRoZW50aWNhdGlvblxucm91dGVyLmdldCgnL3NlZWRfZGInLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZygnXHVEODNDXHVERjMxIE1hbnVhbCBkYXRhYmFzZSBzZWVkaW5nIHJlcXVlc3RlZCAocHVibGljIGVuZHBvaW50KScpO1xuICAgIFxuICAgIGF3YWl0IHNlZWREYXRhYmFzZSgpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgTWFudWFsIGRhdGFiYXNlIHNlZWRpbmcgY29tcGxldGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIHJlcy5qc29uKHsgXG4gICAgICBtZXNzYWdlOiAnRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseScsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBNYW51YWwgZGF0YWJhc2Ugc2VlZGluZyBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgXG4gICAgICBlcnJvcjogJ0RhdGFiYXNlIHNlZWRpbmcgZmFpbGVkJyxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8vIEFjdGl2aXR5IFBvb2wgcm91dGVzXG5yb3V0ZXIuZ2V0KCcvYWN0aXZpdHktcG9vbCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGFjdGl2aXR5X3Bvb2wgT1JERVIgQlkgbmFtZScsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBhY3Rpdml0eSBwb29sOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbnJvdXRlci5wb3N0KCcvYWN0aXZpdHktcG9vbCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBuYW1lLCB0b29sc0FuZFJlc291cmNlcyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGFjdGl2aXR5X3Bvb2wgKG5hbWUsIHRvb2xzX2FuZF9yZXNvdXJjZXMpIFZBTFVFUyAoPywgPyknLFxuICAgIFtuYW1lLCB0b29sc0FuZFJlc291cmNlc10sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5wdXQoJy9hY3Rpdml0eS1wb29sLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lLCB0b29sc0FuZFJlc291cmNlcyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBhY3Rpdml0eV9wb29sIFNFVCBuYW1lID0gPywgdG9vbHNfYW5kX3Jlc291cmNlcyA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY3Rpdml0eSBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5kZWxldGUoJy9hY3Rpdml0eS1wb29sLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gYWN0aXZpdHlfcG9vbCBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBhY3Rpdml0eTonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY3Rpdml0eSBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0FjdGl2aXR5IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gRG9tYWlucyByb3V0ZXNcbnJvdXRlci5nZXQoJy9kb21haW5zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gZG9tYWlucyBPUkRFUiBCWSBkZXNjcmlwdGlvbicsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkb21haW5zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbnJvdXRlci5wb3N0KCcvZG9tYWlucycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBkZXNjcmlwdGlvbiB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJyxcbiAgICBbZGVzY3JpcHRpb25dLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBkb21haW46JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBkb21haW46JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5wdXQoJy9kb21haW5zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBkZXNjcmlwdGlvbiB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBkb21haW5zIFNFVCBkZXNjcmlwdGlvbiA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbZGVzY3JpcHRpb24sIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRG9tYWluIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBkb21haW46JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5kZWxldGUoJy9kb21haW5zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBkb21haW46JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRG9tYWluIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnRG9tYWluIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gRGl2aXNpb25zIHJvdXRlc1xucm91dGVyLmdldCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG5yb3V0ZXIucG9zdCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBuYW1lLCBpc0ludGVybmFsIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScsXG4gICAgW25hbWUsIGlzSW50ZXJuYWxdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5wdXQoJy9kaXZpc2lvbnMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUsIGlzSW50ZXJuYWwgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgZGl2aXNpb25zIFNFVCBuYW1lID0gPywgaXNfaW50ZXJuYWwgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIGlzSW50ZXJuYWwsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEaXZpc2lvbiBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLmRlbGV0ZSgnL2RpdmlzaW9ucy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGRpdmlzaW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEaXZpc2lvbiBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RpdmlzaW9uIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gRGVwYXJ0bWVudHMgcm91dGVzXG5yb3V0ZXIuZ2V0KCcvZGVwYXJ0bWVudHMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbChcbiAgICBgU0VMRUNUIGQuKiwgZGl2Lm5hbWUgYXMgZGl2aXNpb25OYW1lIFxuICAgICBGUk9NIGRlcGFydG1lbnRzIGQgXG4gICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZGl2IE9OIGQuZGl2aXNpb25faWQgPSBkaXYuaWQgXG4gICAgIE9SREVSIEJZIGQubmFtZWAsXG4gICAgKGVyciwgcm93cykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkZXBhcnRtZW50czonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIHJlcy5qc29uKHJvd3MpO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIucG9zdCgnL2RlcGFydG1lbnRzJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IG5hbWUsIGRpdmlzaW9uSWQgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBkZXBhcnRtZW50cyAobmFtZSwgZGl2aXNpb25faWQpIFZBTFVFUyAoPywgPyknLFxuICAgIFtuYW1lLCBkaXZpc2lvbklkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KFxuICAgICAgICBgU0VMRUNUIGQuKiwgZGl2Lm5hbWUgYXMgZGl2aXNpb25OYW1lIFxuICAgICAgICAgRlJPTSBkZXBhcnRtZW50cyBkIFxuICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkaXYgT04gZC5kaXZpc2lvbl9pZCA9IGRpdi5pZCBcbiAgICAgICAgIFdIRVJFIGQuaWQgPSA/YCxcbiAgICAgICAgW3RoaXMubGFzdElEXSxcbiAgICAgICAgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBkZXBhcnRtZW50OicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocm93KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLnB1dCgnL2RlcGFydG1lbnRzLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lLCBkaXZpc2lvbklkIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGRlcGFydG1lbnRzIFNFVCBuYW1lID0gPywgZGl2aXNpb25faWQgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIGRpdmlzaW9uSWQsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RlcGFydG1lbnQgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KFxuICAgICAgICBgU0VMRUNUIGQuKiwgZGl2Lm5hbWUgYXMgZGl2aXNpb25OYW1lIFxuICAgICAgICAgRlJPTSBkZXBhcnRtZW50cyBkIFxuICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkaXYgT04gZC5kaXZpc2lvbl9pZCA9IGRpdi5pZCBcbiAgICAgICAgIFdIRVJFIGQuaWQgPSA/YCxcbiAgICAgICAgW2lkXSxcbiAgICAgICAgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBkZXBhcnRtZW50OicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLmpzb24ocm93KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLmRlbGV0ZSgnL2RlcGFydG1lbnRzLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZGVwYXJ0bWVudHMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEZXBhcnRtZW50IG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnRGVwYXJ0bWVudCBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vIFByb2N1cmVtZW50IFRlYW1zIHJvdXRlc1xucm91dGVyLmdldCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgT1JERVIgQlkgbmFtZScsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBwcm9jdXJlbWVudCB0ZWFtczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG5yb3V0ZXIucG9zdCgnL3Byb2N1cmVtZW50LXRlYW1zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IG5hbWUgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsXG4gICAgW25hbWVdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5wdXQoJy9wcm9jdXJlbWVudC10ZWFtcy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBwcm9jdXJlbWVudF90ZWFtcyBTRVQgbmFtZSA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnUHJvY3VyZW1lbnQgdGVhbSBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5kZWxldGUoJy9wcm9jdXJlbWVudC10ZWFtcy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnUHJvY3VyZW1lbnQgdGVhbSBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ1Byb2N1cmVtZW50IHRlYW0gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvcGxhbm5pbmcuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZSB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIEdldCBjb21wbGV4aXR5IGVzdGltYXRlc1xucm91dGVyLmdldCgnL2NvbXBsZXhpdHktZXN0aW1hdGVzJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gY29tcGxleGl0eV9lc3RpbWF0ZXMgT1JERVIgQlkgaWQgREVTQyBMSU1JVCAxJywgKGVyciwgcm93KSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBSZXR1cm4gZGVmYXVsdCB2YWx1ZXMgaWYgbm8gcmVjb3JkIGV4aXN0c1xuICAgIGNvbnN0IGVzdGltYXRlcyA9IHJvdyB8fCB7XG4gICAgICBlc3RpbWF0ZUxldmVsMTogNSxcbiAgICAgIGVzdGltYXRlTGV2ZWwyOiAxMCxcbiAgICAgIGVzdGltYXRlTGV2ZWwzOiAyMFxuICAgIH07XG4gICAgXG4gICAgcmVzLmpzb24oe1xuICAgICAgZXN0aW1hdGVMZXZlbDE6IGVzdGltYXRlcy5lc3RpbWF0ZV9sZXZlbF8xLFxuICAgICAgZXN0aW1hdGVMZXZlbDI6IGVzdGltYXRlcy5lc3RpbWF0ZV9sZXZlbF8yLFxuICAgICAgZXN0aW1hdGVMZXZlbDM6IGVzdGltYXRlcy5lc3RpbWF0ZV9sZXZlbF8zXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIFVwZGF0ZSBjb21wbGV4aXR5IGVzdGltYXRlc1xucm91dGVyLnB1dCgnL2NvbXBsZXhpdHktZXN0aW1hdGVzJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGVzdGltYXRlTGV2ZWwxLCBlc3RpbWF0ZUxldmVsMiwgZXN0aW1hdGVMZXZlbDMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gRmlyc3QgY2hlY2sgaWYgYSByZWNvcmQgZXhpc3RzXG4gIGRiLmdldCgnU0VMRUNUIGlkIEZST00gY29tcGxleGl0eV9lc3RpbWF0ZXMgTElNSVQgMScsIChlcnIsIHJvdykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAocm93KSB7XG4gICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgcmVjb3JkXG4gICAgICBkYi5ydW4oXG4gICAgICAgICdVUERBVEUgY29tcGxleGl0eV9lc3RpbWF0ZXMgU0VUIGVzdGltYXRlX2xldmVsXzEgPSA/LCBlc3RpbWF0ZV9sZXZlbF8yID0gPywgZXN0aW1hdGVfbGV2ZWxfMyA9ID8sIHVwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCBXSEVSRSBpZCA9ID8nLFxuICAgICAgICBbZXN0aW1hdGVMZXZlbDEsIGVzdGltYXRlTGV2ZWwyLCBlc3RpbWF0ZUxldmVsMywgcm93LmlkXSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdDb21wbGV4aXR5IGVzdGltYXRlcyB1cGRhdGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluc2VydCBuZXcgcmVjb3JkXG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgSU5UTyBjb21wbGV4aXR5X2VzdGltYXRlcyAoZXN0aW1hdGVfbGV2ZWxfMSwgZXN0aW1hdGVfbGV2ZWxfMiwgZXN0aW1hdGVfbGV2ZWxfMykgVkFMVUVTICg/LCA/LCA/KScsXG4gICAgICAgIFtlc3RpbWF0ZUxldmVsMSwgZXN0aW1hdGVMZXZlbDIsIGVzdGltYXRlTGV2ZWwzXSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdDb21wbGV4aXR5IGVzdGltYXRlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG4vLyBHZXQgYWNjZXB0YW5jZSBvcHRpb25zXG5yb3V0ZXIuZ2V0KCcvYWNjZXB0YW5jZS1vcHRpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIE9SREVSIEJZIHllYXJfaWQgREVTQycsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBhY2NlcHRhbmNlIG9wdGlvbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBUcmFuc2Zvcm0gZGF0YSB0byBtYXRjaCBmcm9udGVuZCBmb3JtYXRcbiAgICBjb25zdCBvcHRpb25zID0gcm93cy5tYXAocm93ID0+ICh7XG4gICAgICBpZDogcm93LmlkLFxuICAgICAgeWVhcklkOiByb3cueWVhcl9pZCxcbiAgICAgIHVwbG9hZENvZGU6IHJvdy51cGxvYWRfY29kZSxcbiAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogcm93LnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgYnJvYWRNZWFuaW5nOiByb3cuYnJvYWRfbWVhbmluZ1xuICAgIH0pKTtcbiAgICBcbiAgICByZXMuanNvbihvcHRpb25zKTtcbiAgfSk7XG59KTtcblxuLy8gQ3JlYXRlIGFjY2VwdGFuY2Ugb3B0aW9uXG5yb3V0ZXIucG9zdCgnL2FjY2VwdGFuY2Utb3B0aW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyB5ZWFySWQsIHVwbG9hZENvZGUsIGJyb2FkTWVhbmluZyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBNYXAgdXBsb2FkIGNvZGVzIHRvIGRlc2NyaXB0aW9uc1xuICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb25zID0ge1xuICAgICdQbGFuJzogJ1x1MDVERVx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVERicsXG4gICAgJ0xhdGUnOiAnXHUwNURFXHUwNUQwXHUwNUQ3XHUwNUU4JyxcbiAgICAnQmxvY2snOiAnXHUwNUQ3XHUwNUUxXHUwNUQ1XHUwNUREJyxcbiAgICAnRmluaXNoJzogJ1x1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERCdcbiAgfTtcblxuICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb24gPSB1cGxvYWRDb2RlRGVzY3JpcHRpb25zW3VwbG9hZENvZGVdO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gYWNjZXB0YW5jZV9vcHRpb25zICh5ZWFyX2lkLCB1cGxvYWRfY29kZSwgdXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sIGJyb2FkX21lYW5pbmcpIFZBTFVFUyAoPywgPywgPywgPyknLFxuICAgIFt5ZWFySWQsIHVwbG9hZENvZGUsIHVwbG9hZENvZGVEZXNjcmlwdGlvbiwgYnJvYWRNZWFuaW5nXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgICAgaWYgKGVyci5tZXNzYWdlLmluY2x1ZGVzKCdVTklRVUUgY29uc3RyYWludCBmYWlsZWQnKSkge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnQWNjZXB0YW5jZSBvcHRpb24gZm9yIHRoaXMgeWVhciBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIGFjY2VwdGFuY2Ugb3B0aW9uOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHtcbiAgICAgICAgICBpZDogcm93LmlkLFxuICAgICAgICAgIHllYXJJZDogcm93LnllYXJfaWQsXG4gICAgICAgICAgdXBsb2FkQ29kZTogcm93LnVwbG9hZF9jb2RlLFxuICAgICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogcm93LnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgIGJyb2FkTWVhbmluZzogcm93LmJyb2FkX21lYW5pbmdcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKG9wdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gVXBkYXRlIGFjY2VwdGFuY2Ugb3B0aW9uXG5yb3V0ZXIucHV0KCcvYWNjZXB0YW5jZS1vcHRpb25zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyB5ZWFySWQsIHVwbG9hZENvZGUsIGJyb2FkTWVhbmluZyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBNYXAgdXBsb2FkIGNvZGVzIHRvIGRlc2NyaXB0aW9uc1xuICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb25zID0ge1xuICAgICdQbGFuJzogJ1x1MDVERVx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVERicsXG4gICAgJ0xhdGUnOiAnXHUwNURFXHUwNUQwXHUwNUQ3XHUwNUU4JyxcbiAgICAnQmxvY2snOiAnXHUwNUQ3XHUwNUUxXHUwNUQ1XHUwNUREJyxcbiAgICAnRmluaXNoJzogJ1x1MDVENFx1MDVFMVx1MDVFQVx1MDVEOVx1MDVEOVx1MDVERCdcbiAgfTtcblxuICBjb25zdCB1cGxvYWRDb2RlRGVzY3JpcHRpb24gPSB1cGxvYWRDb2RlRGVzY3JpcHRpb25zW3VwbG9hZENvZGVdO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGFjY2VwdGFuY2Vfb3B0aW9ucyBTRVQgeWVhcl9pZCA9ID8sIHVwbG9hZF9jb2RlID0gPywgdXBsb2FkX2NvZGVfZGVzY3JpcHRpb24gPSA/LCBicm9hZF9tZWFuaW5nID0gPywgdXBkYXRlZF9hdCA9IENVUlJFTlRfVElNRVNUQU1QIFdIRVJFIGlkID0gPycsXG4gICAgW3llYXJJZCwgdXBsb2FkQ29kZSwgdXBsb2FkQ29kZURlc2NyaXB0aW9uLCBicm9hZE1lYW5pbmcsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgICAgaWYgKGVyci5tZXNzYWdlLmluY2x1ZGVzKCdVTklRVUUgY29uc3RyYWludCBmYWlsZWQnKSkge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnQWNjZXB0YW5jZSBvcHRpb24gZm9yIHRoaXMgeWVhciBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBvcHRpb24gPSB7XG4gICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICB5ZWFySWQ6IHJvdy55ZWFyX2lkLFxuICAgICAgICAgIHVwbG9hZENvZGU6IHJvdy51cGxvYWRfY29kZSxcbiAgICAgICAgICB1cGxvYWRDb2RlRGVzY3JpcHRpb246IHJvdy51cGxvYWRfY29kZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICBicm9hZE1lYW5pbmc6IHJvdy5icm9hZF9tZWFuaW5nXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXMuanNvbihvcHRpb24pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIERlbGV0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLmRlbGV0ZSgnL2FjY2VwdGFuY2Utb3B0aW9ucy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0FjY2VwdGFuY2Ugb3B0aW9uIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wcm9ncmFtcy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3Byb2dyYW1zLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBHZXQgYWxsIHByb2dyYW1zXG5yb3V0ZXIuZ2V0KCcvJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoXG4gICAgYFNFTEVDVCBwLiosIFxuICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsIFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgICAgIGRvbS5kZXNjcmlwdGlvbiBhcyBkb21haW5fbmFtZVxuICAgICBGUk9NIHByb2dyYW1zIHAgXG4gICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiBwLmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gcC5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgTEVGVCBKT0lOIGRvbWFpbnMgZG9tIE9OIHAuZG9tYWluX2lkID0gZG9tLmlkXG4gICAgIE9SREVSIEJZIHAuY3JlYXRlZF9hdCBERVNDYCxcbiAgICAoZXJyLCByb3dzKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHByb2dyYW1zOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUcmFuc2Zvcm0gZGF0YSB0byBtYXRjaCBmcm9udGVuZCBmb3JtYXRcbiAgICAgIGNvbnN0IHByb2dyYW1zID0gcm93cy5tYXAocm93ID0+ICh7XG4gICAgICAgIHRhc2tJZDogcm93LnRhc2tfaWQsXG4gICAgICAgIHdvcmtZZWFyOiByb3cud29ya195ZWFyLFxuICAgICAgICByZXF1aXJlZFF1YXJ0ZXI6IHJvdy5yZXF1aXJlZF9xdWFydGVyID8gbmV3IERhdGUocm93LnJlcXVpcmVkX3F1YXJ0ZXIpIDogbnVsbCxcbiAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgZGVzY3JpcHRpb246IHJvdy5kZXNjcmlwdGlvbixcbiAgICAgICAgcmVxdWVzdGVySWQ6IHJvdy5yZXF1ZXN0ZXJfaWQsXG4gICAgICAgIHJlcXVlc3Rlck5hbWU6IHJvdy5yZXF1ZXN0ZXJfbmFtZSxcbiAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICBkaXZpc2lvbk5hbWU6IHJvdy5kaXZpc2lvbl9uYW1lIHx8IHJvdy5kaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnRfbmFtZSB8fCByb3cuZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICBkb21haW5JZDogcm93LmRvbWFpbl9pZCxcbiAgICAgICAgZG9tYWluTmFtZTogcm93LmRvbWFpbl9uYW1lIHx8IHJvdy5kb21haW5fbmFtZSxcbiAgICAgICAgZXN0aW1hdGVkQW1vdW50OiByb3cuZXN0aW1hdGVkX2Ftb3VudCxcbiAgICAgICAgY3VycmVuY3k6IHJvdy5jdXJyZW5jeSxcbiAgICAgICAgc3VwcGxpZXJMaXN0OiByb3cuc3VwcGxpZXJfbGlzdCxcbiAgICAgICAganVzdGlmaWNhdGlvbjogcm93Lmp1c3RpZmljYXRpb24sXG4gICAgICAgIHBsYW5uaW5nU291cmNlOiByb3cucGxhbm5pbmdfc291cmNlLFxuICAgICAgICBjb21wbGV4aXR5OiByb3cuY29tcGxleGl0eSxcbiAgICAgICAgZW5nYWdlbWVudFR5cGVJZDogcm93LmVuZ2FnZW1lbnRfdHlwZV9pZCxcbiAgICAgICAgZW5nYWdlbWVudFR5cGVOYW1lOiByb3cuZW5nYWdlbWVudF90eXBlX25hbWUsXG4gICAgICAgIHN0YXR1czogcm93LnN0YXR1cyxcbiAgICAgICAgYXNzaWduZWRPZmZpY2VySWQ6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX2lkLFxuICAgICAgICBhc3NpZ25lZE9mZmljZXJOYW1lOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9uYW1lLFxuICAgICAgICB0ZWFtSWQ6IHJvdy50ZWFtX2lkLFxuICAgICAgICB0ZWFtTmFtZTogcm93LnRlYW1fbmFtZSxcbiAgICAgICAgc3RhcnREYXRlOiByb3cuc3RhcnRfZGF0ZSA/IG5ldyBEYXRlKHJvdy5zdGFydF9kYXRlKSA6IG51bGwsXG4gICAgICAgIHBsYW5uaW5nTm90ZXM6IHJvdy5wbGFubmluZ19ub3RlcyxcbiAgICAgICAgb2ZmaWNlck5vdGVzOiByb3cub2ZmaWNlcl9ub3RlcyxcbiAgICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUocm93LnVwZGF0ZWRfYXQpLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKHJvdy5jcmVhdGVkX2F0KVxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICByZXMuanNvbihwcm9ncmFtcyk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIEdldCBwcm9ncmFtIGJ5IElEXG5yb3V0ZXIuZ2V0KCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5nZXQoXG4gICAgYFNFTEVDVCBwLiosIFxuICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsIFxuICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgICAgIGRvbS5kZXNjcmlwdGlvbiBhcyBkb21haW5fbmFtZVxuICAgICBGUk9NIHByb2dyYW1zIHAgXG4gICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiBwLmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gcC5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgTEVGVCBKT0lOIGRvbWFpbnMgZG9tIE9OIHAuZG9tYWluX2lkID0gZG9tLmlkXG4gICAgIFdIRVJFIHAudGFza19pZCA9ID9gLFxuICAgIFtpZF0sXG4gICAgKGVyciwgcm93KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHByb2dyYW06JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnUHJvZ3JhbSBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUcmFuc2Zvcm0gZGF0YSB0byBtYXRjaCBmcm9udGVuZCBmb3JtYXRcbiAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgIHRhc2tJZDogcm93LnRhc2tfaWQsXG4gICAgICAgIHdvcmtZZWFyOiByb3cud29ya195ZWFyLFxuICAgICAgICByZXF1aXJlZFF1YXJ0ZXI6IHJvdy5yZXF1aXJlZF9xdWFydGVyID8gbmV3IERhdGUocm93LnJlcXVpcmVkX3F1YXJ0ZXIpIDogbnVsbCxcbiAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgZGVzY3JpcHRpb246IHJvdy5kZXNjcmlwdGlvbixcbiAgICAgICAgcmVxdWVzdGVySWQ6IHJvdy5yZXF1ZXN0ZXJfaWQsXG4gICAgICAgIHJlcXVlc3Rlck5hbWU6IHJvdy5yZXF1ZXN0ZXJfbmFtZSxcbiAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICBkaXZpc2lvbk5hbWU6IHJvdy5kaXZpc2lvbl9uYW1lIHx8IHJvdy5kaXZpc2lvbl9uYW1lLFxuICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnRfbmFtZSB8fCByb3cuZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICBkb21haW5JZDogcm93LmRvbWFpbl9pZCxcbiAgICAgICAgZG9tYWluTmFtZTogcm93LmRvbWFpbl9uYW1lIHx8IHJvdy5kb21haW5fbmFtZSxcbiAgICAgICAgZXN0aW1hdGVkQW1vdW50OiByb3cuZXN0aW1hdGVkX2Ftb3VudCxcbiAgICAgICAgY3VycmVuY3k6IHJvdy5jdXJyZW5jeSxcbiAgICAgICAgc3VwcGxpZXJMaXN0OiByb3cuc3VwcGxpZXJfbGlzdCxcbiAgICAgICAganVzdGlmaWNhdGlvbjogcm93Lmp1c3RpZmljYXRpb24sXG4gICAgICAgIHBsYW5uaW5nU291cmNlOiByb3cucGxhbm5pbmdfc291cmNlLFxuICAgICAgICBjb21wbGV4aXR5OiByb3cuY29tcGxleGl0eSxcbiAgICAgICAgZW5nYWdlbWVudFR5cGVJZDogcm93LmVuZ2FnZW1lbnRfdHlwZV9pZCxcbiAgICAgICAgZW5nYWdlbWVudFR5cGVOYW1lOiByb3cuZW5nYWdlbWVudF90eXBlX25hbWUsXG4gICAgICAgIHN0YXR1czogcm93LnN0YXR1cyxcbiAgICAgICAgYXNzaWduZWRPZmZpY2VySWQ6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX2lkLFxuICAgICAgICBhc3NpZ25lZE9mZmljZXJOYW1lOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9uYW1lLFxuICAgICAgICB0ZWFtSWQ6IHJvdy50ZWFtX2lkLFxuICAgICAgICB0ZWFtTmFtZTogcm93LnRlYW1fbmFtZSxcbiAgICAgICAgc3RhcnREYXRlOiByb3cuc3RhcnRfZGF0ZSA/IG5ldyBEYXRlKHJvdy5zdGFydF9kYXRlKSA6IG51bGwsXG4gICAgICAgIHBsYW5uaW5nTm90ZXM6IHJvdy5wbGFubmluZ19ub3RlcyxcbiAgICAgICAgb2ZmaWNlck5vdGVzOiByb3cub2ZmaWNlcl9ub3RlcyxcbiAgICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUocm93LnVwZGF0ZWRfYXQpLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKHJvdy5jcmVhdGVkX2F0KVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgcmVzLmpzb24ocHJvZ3JhbSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIENyZWF0ZSBuZXcgcHJvZ3JhbVxucm91dGVyLnBvc3QoJy8nLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzEsIDRdKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICB3b3JrWWVhcixcbiAgICByZXF1aXJlZFF1YXJ0ZXIsXG4gICAgdGl0bGUsXG4gICAgZGVzY3JpcHRpb24sXG4gICAgcmVxdWVzdGVyTmFtZSxcbiAgICBkaXZpc2lvbk5hbWUsXG4gICAgZGVwYXJ0bWVudE5hbWUsXG4gICAgZG9tYWluTmFtZSxcbiAgICBlc3RpbWF0ZWRBbW91bnQsXG4gICAgY3VycmVuY3ksXG4gICAgc3VwcGxpZXJMaXN0LFxuICAgIGp1c3RpZmljYXRpb24sXG4gICAgcGxhbm5pbmdTb3VyY2UsXG4gICAgY29tcGxleGl0eVxuICB9ID0gcmVxLmJvZHk7XG5cbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIEdlbmVyYXRlIG5ldyB0YXNrIElEXG4gIGRiLmdldCgnU0VMRUNUIE1BWCh0YXNrX2lkKSBhcyBtYXhJZCBGUk9NIHByb2dyYW1zJywgKGVyciwgcm93KSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBtYXggdGFzayBJRDonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3VGFza0lkID0gKHJvdy5tYXhJZCB8fCAwKSArIDE7XG5cbiAgICAvLyBDb252ZXJ0IHVuZGVmaW5lZCB2YWx1ZXMgdG8gbnVsbCBmb3IgU1FMaXRlIGNvbXBhdGliaWxpdHlcbiAgICBjb25zdCBzYWZlRXN0aW1hdGVkQW1vdW50ID0gZXN0aW1hdGVkQW1vdW50ICE9PSB1bmRlZmluZWQgPyBlc3RpbWF0ZWRBbW91bnQgOiBudWxsO1xuICAgIGNvbnN0IHNhZmVDdXJyZW5jeSA9IGN1cnJlbmN5ICE9PSB1bmRlZmluZWQgPyBjdXJyZW5jeSA6IG51bGw7XG4gICAgY29uc3Qgc2FmZUNvbXBsZXhpdHkgPSBjb21wbGV4aXR5ICE9PSB1bmRlZmluZWQgPyBjb21wbGV4aXR5IDogbnVsbDtcblxuICAgIGRiLnJ1bihcbiAgICAgIGBJTlNFUlQgSU5UTyBwcm9ncmFtcyBcbiAgICAgICAodGFza19pZCwgd29ya195ZWFyLCByZXF1aXJlZF9xdWFydGVyLCB0aXRsZSwgZGVzY3JpcHRpb24sIHJlcXVlc3Rlcl9uYW1lLCBcbiAgICAgICAgZGl2aXNpb25fbmFtZSwgZGVwYXJ0bWVudF9uYW1lLCBkb21haW5fbmFtZSwgZXN0aW1hdGVkX2Ftb3VudCwgY3VycmVuY3ksIFxuICAgICAgICBzdXBwbGllcl9saXN0LCBqdXN0aWZpY2F0aW9uLCBwbGFubmluZ19zb3VyY2UsIGNvbXBsZXhpdHksIHN0YXR1cykgXG4gICAgICAgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICBbbmV3VGFza0lkLCB3b3JrWWVhciwgcmVxdWlyZWRRdWFydGVyLCB0aXRsZSwgZGVzY3JpcHRpb24sIHJlcXVlc3Rlck5hbWUsXG4gICAgICAgZGl2aXNpb25OYW1lLCBkZXBhcnRtZW50TmFtZSwgZG9tYWluTmFtZSwgc2FmZUVzdGltYXRlZEFtb3VudCwgc2FmZUN1cnJlbmN5LFxuICAgICAgIHN1cHBsaWVyTGlzdCwganVzdGlmaWNhdGlvbiwgcGxhbm5pbmdTb3VyY2UsIHNhZmVDb21wbGV4aXR5LCAnT3BlbiddLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBwcm9ncmFtOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGZXRjaCB0aGUgY3JlYXRlZCBwcm9ncmFtXG4gICAgICAgIGRiLmdldChcbiAgICAgICAgICBgU0VMRUNUIHAuKiwgXG4gICAgICAgICAgICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgXG4gICAgICAgICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgZG9tLmRlc2NyaXB0aW9uIGFzIGRvbWFpbl9uYW1lXG4gICAgICAgICAgIEZST00gcHJvZ3JhbXMgcCBcbiAgICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHAuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiBwLmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICAgICAgICBMRUZUIEpPSU4gZG9tYWlucyBkb20gT04gcC5kb21haW5faWQgPSBkb20uaWRcbiAgICAgICAgICAgV0hFUkUgcC50YXNrX2lkID0gP2AsXG4gICAgICAgICAgW25ld1Rhc2tJZF0sXG4gICAgICAgICAgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgcHJvZ3JhbTonLCBlcnIpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHtcbiAgICAgICAgICAgICAgdGFza0lkOiByb3cudGFza19pZCxcbiAgICAgICAgICAgICAgd29ya1llYXI6IHJvdy53b3JrX3llYXIsXG4gICAgICAgICAgICAgIHJlcXVpcmVkUXVhcnRlcjogcm93LnJlcXVpcmVkX3F1YXJ0ZXIgPyBuZXcgRGF0ZShyb3cucmVxdWlyZWRfcXVhcnRlcikgOiBudWxsLFxuICAgICAgICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcm93LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICByZXF1ZXN0ZXJJZDogcm93LnJlcXVlc3Rlcl9pZCxcbiAgICAgICAgICAgICAgcmVxdWVzdGVyTmFtZTogcm93LnJlcXVlc3Rlcl9uYW1lLFxuICAgICAgICAgICAgICBkaXZpc2lvbklkOiByb3cuZGl2aXNpb25faWQsXG4gICAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogcm93LmRpdmlzaW9uX25hbWUgfHwgcm93LmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgICAgIGRlcGFydG1lbnRJZDogcm93LmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgICAgIGRlcGFydG1lbnROYW1lOiByb3cuZGVwYXJ0bWVudF9uYW1lIHx8IHJvdy5kZXBhcnRtZW50X25hbWUsXG4gICAgICAgICAgICAgIGRvbWFpbklkOiByb3cuZG9tYWluX2lkLFxuICAgICAgICAgICAgICBkb21haW5OYW1lOiByb3cuZG9tYWluX25hbWUgfHwgcm93LmRvbWFpbl9uYW1lLFxuICAgICAgICAgICAgICBlc3RpbWF0ZWRBbW91bnQ6IHJvdy5lc3RpbWF0ZWRfYW1vdW50LFxuICAgICAgICAgICAgICBjdXJyZW5jeTogcm93LmN1cnJlbmN5LFxuICAgICAgICAgICAgICBzdXBwbGllckxpc3Q6IHJvdy5zdXBwbGllcl9saXN0LFxuICAgICAgICAgICAgICBqdXN0aWZpY2F0aW9uOiByb3cuanVzdGlmaWNhdGlvbixcbiAgICAgICAgICAgICAgcGxhbm5pbmdTb3VyY2U6IHJvdy5wbGFubmluZ19zb3VyY2UsXG4gICAgICAgICAgICAgIGNvbXBsZXhpdHk6IHJvdy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgICBlbmdhZ2VtZW50VHlwZUlkOiByb3cuZW5nYWdlbWVudF90eXBlX2lkLFxuICAgICAgICAgICAgICBlbmdhZ2VtZW50VHlwZU5hbWU6IHJvdy5lbmdhZ2VtZW50X3R5cGVfbmFtZSxcbiAgICAgICAgICAgICAgc3RhdHVzOiByb3cuc3RhdHVzLFxuICAgICAgICAgICAgICBhc3NpZ25lZE9mZmljZXJJZDogcm93LmFzc2lnbmVkX29mZmljZXJfaWQsXG4gICAgICAgICAgICAgIGFzc2lnbmVkT2ZmaWNlck5hbWU6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX25hbWUsXG4gICAgICAgICAgICAgIHRlYW1JZDogcm93LnRlYW1faWQsXG4gICAgICAgICAgICAgIHRlYW1OYW1lOiByb3cudGVhbV9uYW1lLFxuICAgICAgICAgICAgICBzdGFydERhdGU6IHJvdy5zdGFydF9kYXRlID8gbmV3IERhdGUocm93LnN0YXJ0X2RhdGUpIDogbnVsbCxcbiAgICAgICAgICAgICAgcGxhbm5pbmdOb3Rlczogcm93LnBsYW5uaW5nX25vdGVzLFxuICAgICAgICAgICAgICBvZmZpY2VyTm90ZXM6IHJvdy5vZmZpY2VyX25vdGVzLFxuICAgICAgICAgICAgICBsYXN0VXBkYXRlOiBuZXcgRGF0ZShyb3cudXBkYXRlZF9hdCksXG4gICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUocm93LmNyZWF0ZWRfYXQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihwcm9ncmFtKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59KTtcblxuLy8gVXBkYXRlIHByb2dyYW1cbnJvdXRlci5wdXQoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHVwZGF0ZURhdGEgPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIEJ1aWxkIGR5bmFtaWMgdXBkYXRlIHF1ZXJ5XG4gIGNvbnN0IGZpZWxkcyA9IFtdO1xuICBjb25zdCB2YWx1ZXMgPSBbXTtcblxuICAvLyBNYXAgZnJvbnRlbmQgZmllbGQgbmFtZXMgdG8gZGF0YWJhc2UgY29sdW1uIG5hbWVzXG4gIGNvbnN0IGZpZWxkTWFwcGluZyA9IHtcbiAgICB3b3JrWWVhcjogJ3dvcmtfeWVhcicsXG4gICAgcmVxdWlyZWRRdWFydGVyOiAncmVxdWlyZWRfcXVhcnRlcicsXG4gICAgdGl0bGU6ICd0aXRsZScsXG4gICAgZGVzY3JpcHRpb246ICdkZXNjcmlwdGlvbicsXG4gICAgcmVxdWVzdGVyTmFtZTogJ3JlcXVlc3Rlcl9uYW1lJyxcbiAgICBkaXZpc2lvbk5hbWU6ICdkaXZpc2lvbl9uYW1lJyxcbiAgICBkZXBhcnRtZW50TmFtZTogJ2RlcGFydG1lbnRfbmFtZScsXG4gICAgZG9tYWluTmFtZTogJ2RvbWFpbl9uYW1lJyxcbiAgICBlc3RpbWF0ZWRBbW91bnQ6ICdlc3RpbWF0ZWRfYW1vdW50JyxcbiAgICBjdXJyZW5jeTogJ2N1cnJlbmN5JyxcbiAgICBzdXBwbGllckxpc3Q6ICdzdXBwbGllcl9saXN0JyxcbiAgICBqdXN0aWZpY2F0aW9uOiAnanVzdGlmaWNhdGlvbicsXG4gICAgcGxhbm5pbmdTb3VyY2U6ICdwbGFubmluZ19zb3VyY2UnLFxuICAgIGNvbXBsZXhpdHk6ICdjb21wbGV4aXR5JyxcbiAgICBlbmdhZ2VtZW50VHlwZUlkOiAnZW5nYWdlbWVudF90eXBlX2lkJyxcbiAgICBlbmdhZ2VtZW50VHlwZU5hbWU6ICdlbmdhZ2VtZW50X3R5cGVfbmFtZScsXG4gICAgc3RhdHVzOiAnc3RhdHVzJyxcbiAgICBhc3NpZ25lZE9mZmljZXJJZDogJ2Fzc2lnbmVkX29mZmljZXJfaWQnLFxuICAgIGFzc2lnbmVkT2ZmaWNlck5hbWU6ICdhc3NpZ25lZF9vZmZpY2VyX25hbWUnLFxuICAgIHRlYW1JZDogJ3RlYW1faWQnLFxuICAgIHRlYW1OYW1lOiAndGVhbV9uYW1lJyxcbiAgICBzdGFydERhdGU6ICdzdGFydF9kYXRlJyxcbiAgICBwbGFubmluZ05vdGVzOiAncGxhbm5pbmdfbm90ZXMnLFxuICAgIG9mZmljZXJOb3RlczogJ29mZmljZXJfbm90ZXMnXG4gIH07XG5cbiAgT2JqZWN0LmtleXModXBkYXRlRGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmIChmaWVsZE1hcHBpbmdba2V5XSkge1xuICAgICAgZmllbGRzLnB1c2goYCR7ZmllbGRNYXBwaW5nW2tleV19ID0gP2ApO1xuICAgICAgLy8gQ29udmVydCB1bmRlZmluZWQgdG8gbnVsbCBmb3IgU1FMaXRlIGNvbXBhdGliaWxpdHlcbiAgICAgIGNvbnN0IHZhbHVlID0gdXBkYXRlRGF0YVtrZXldICE9PSB1bmRlZmluZWQgPyB1cGRhdGVEYXRhW2tleV0gOiBudWxsO1xuICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ05vIHZhbGlkIGZpZWxkcyB0byB1cGRhdGUnIH0pO1xuICB9XG5cbiAgLy8gQWRkIHVwZGF0ZWRfYXRcbiAgZmllbGRzLnB1c2goJ3VwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCcpO1xuICB2YWx1ZXMucHVzaChpZCk7XG5cbiAgY29uc3QgcXVlcnkgPSBgVVBEQVRFIHByb2dyYW1zIFNFVCAke2ZpZWxkcy5qb2luKCcsICcpfSBXSEVSRSB0YXNrX2lkID0gP2A7XG5cbiAgZGIucnVuKHF1ZXJ5LCB2YWx1ZXMsIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHByb2dyYW06JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnUHJvZ3JhbSBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIC8vIEZldGNoIHVwZGF0ZWQgcHJvZ3JhbVxuICAgIGRiLmdldChcbiAgICAgIGBTRUxFQ1QgcC4qLCBcbiAgICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsIFxuICAgICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICAgICAgICBkb20uZGVzY3JpcHRpb24gYXMgZG9tYWluX25hbWVcbiAgICAgICBGUk9NIHByb2dyYW1zIHAgXG4gICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHAuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHAuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgICAgTEVGVCBKT0lOIGRvbWFpbnMgZG9tIE9OIHAuZG9tYWluX2lkID0gZG9tLmlkXG4gICAgICAgV0hFUkUgcC50YXNrX2lkID0gP2AsXG4gICAgICBbaWRdLFxuICAgICAgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIHByb2dyYW06JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgdGFza0lkOiByb3cudGFza19pZCxcbiAgICAgICAgICB3b3JrWWVhcjogcm93LndvcmtfeWVhcixcbiAgICAgICAgICByZXF1aXJlZFF1YXJ0ZXI6IHJvdy5yZXF1aXJlZF9xdWFydGVyID8gbmV3IERhdGUocm93LnJlcXVpcmVkX3F1YXJ0ZXIpIDogbnVsbCxcbiAgICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiByb3cuZGVzY3JpcHRpb24sXG4gICAgICAgICAgcmVxdWVzdGVySWQ6IHJvdy5yZXF1ZXN0ZXJfaWQsXG4gICAgICAgICAgcmVxdWVzdGVyTmFtZTogcm93LnJlcXVlc3Rlcl9uYW1lLFxuICAgICAgICAgIGRpdmlzaW9uSWQ6IHJvdy5kaXZpc2lvbl9pZCxcbiAgICAgICAgICBkaXZpc2lvbk5hbWU6IHJvdy5kaXZpc2lvbl9uYW1lIHx8IHJvdy5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgIGRlcGFydG1lbnRJZDogcm93LmRlcGFydG1lbnRfaWQsXG4gICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50X25hbWUgfHwgcm93LmRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgICBkb21haW5JZDogcm93LmRvbWFpbl9pZCxcbiAgICAgICAgICBkb21haW5OYW1lOiByb3cuZG9tYWluX25hbWUgfHwgcm93LmRvbWFpbl9uYW1lLFxuICAgICAgICAgIGVzdGltYXRlZEFtb3VudDogcm93LmVzdGltYXRlZF9hbW91bnQsXG4gICAgICAgICAgY3VycmVuY3k6IHJvdy5jdXJyZW5jeSxcbiAgICAgICAgICBzdXBwbGllckxpc3Q6IHJvdy5zdXBwbGllcl9saXN0LFxuICAgICAgICAgIGp1c3RpZmljYXRpb246IHJvdy5qdXN0aWZpY2F0aW9uLFxuICAgICAgICAgIHBsYW5uaW5nU291cmNlOiByb3cucGxhbm5pbmdfc291cmNlLFxuICAgICAgICAgIGNvbXBsZXhpdHk6IHJvdy5jb21wbGV4aXR5LFxuICAgICAgICAgIGVuZ2FnZW1lbnRUeXBlSWQ6IHJvdy5lbmdhZ2VtZW50X3R5cGVfaWQsXG4gICAgICAgICAgZW5nYWdlbWVudFR5cGVOYW1lOiByb3cuZW5nYWdlbWVudF90eXBlX25hbWUsXG4gICAgICAgICAgc3RhdHVzOiByb3cuc3RhdHVzLFxuICAgICAgICAgIGFzc2lnbmVkT2ZmaWNlcklkOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9pZCxcbiAgICAgICAgICBhc3NpZ25lZE9mZmljZXJOYW1lOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9uYW1lLFxuICAgICAgICAgIHRlYW1JZDogcm93LnRlYW1faWQsXG4gICAgICAgICAgdGVhbU5hbWU6IHJvdy50ZWFtX25hbWUsXG4gICAgICAgICAgc3RhcnREYXRlOiByb3cuc3RhcnRfZGF0ZSA/IG5ldyBEYXRlKHJvdy5zdGFydF9kYXRlKSA6IG51bGwsXG4gICAgICAgICAgcGxhbm5pbmdOb3Rlczogcm93LnBsYW5uaW5nX25vdGVzLFxuICAgICAgICAgIG9mZmljZXJOb3Rlczogcm93Lm9mZmljZXJfbm90ZXMsXG4gICAgICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUocm93LnVwZGF0ZWRfYXQpLFxuICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUocm93LmNyZWF0ZWRfYXQpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmVzLmpzb24ocHJvZ3JhbSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59KTtcblxuLy8gRGVsZXRlIHByb2dyYW1cbnJvdXRlci5kZWxldGUoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIHByb2dyYW1zIFdIRVJFIHRhc2tfaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgcHJvZ3JhbTonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9ncmFtIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnUHJvZ3JhbSBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9hZGREZW1vVGFza3MuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvYWRkRGVtb1Rhc2tzLmpzXCI7aW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkRGVtb1Rhc2tzKCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0NcdURGQUQgQWRkaW5nIGRlbW8gdGFza3MgdG8gZGF0YWJhc2UuLi4nKTtcbiAgICBcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgZGVtbyB0YXNrcyBhbHJlYWR5IGV4aXN0XG4gICAgICBkYi5nZXQoJ1NFTEVDVCBDT1VOVCgqKSBhcyBjb3VudCBGUk9NIHByb2dyYW1zJywgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgcHJvZ3JhbXM6JywgZXJyKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChyb3cgJiYgcm93LmNvdW50ID4gMCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGVtbyB0YXNrcyBhbHJlYWR5IGV4aXN0LCBza2lwcGluZy4uLicpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDREQgQ3JlYXRpbmcgZGVtbyB0YXNrcy4uLicpO1xuICAgICAgICBcbiAgICAgICAgLy8gRGVtbyB0YXNrcyB3aXRoIHZhcmlvdXMgc3RhdHVzZXNcbiAgICAgICAgY29uc3QgZGVtb1Rhc2tzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRhc2tfaWQ6IDEwMDEsXG4gICAgICAgICAgICB3b3JrX3llYXI6IDIwMjQsXG4gICAgICAgICAgICByZXF1aXJlZF9xdWFydGVyOiAnMjAyNC0wMy0wMScsXG4gICAgICAgICAgICB0aXRsZTogJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDFcdTA1RDlcdTA1REQgXHUwNUQ3XHUwNUQzXHUwNUU5XHUwNUQ5XHUwNUREJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnXHUwNUU4XHUwNURCXHUwNUU5IDUwIFx1MDVERVx1MDVEN1x1MDVFOVx1MDVEMVx1MDVEOVx1MDVERCBcdTA1RTBcdTA1RDlcdTA1RDlcdTA1RDdcdTA1RDlcdTA1REQgXHUwNURDXHUwNURFXHUwNUU5XHUwNUU4XHUwNUQzXHUwNUQ5IFx1MDVENFx1MDVEN1x1MDVEMVx1MDVFOFx1MDVENCcsXG4gICAgICAgICAgICByZXF1ZXN0ZXJfbmFtZTogJ1x1MDVEM1x1MDVENVx1MDVEMyBcdTA1REJcdTA1RDRcdTA1REYnLFxuICAgICAgICAgICAgZGl2aXNpb25fbmFtZTogJ1x1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCcsXG4gICAgICAgICAgICBkZXBhcnRtZW50X25hbWU6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUQ5XHUwNUQzXHUwNUUyJyxcbiAgICAgICAgICAgIGRvbWFpbl9uYW1lOiAnXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsXG4gICAgICAgICAgICBlc3RpbWF0ZWRfYW1vdW50OiAyNTAwMDAsXG4gICAgICAgICAgICBjdXJyZW5jeTogJ0lMUycsXG4gICAgICAgICAgICBzdXBwbGllcl9saXN0OiAnXHUwNUQzXHUwNURDLCBIUCwgXHUwNURDXHUwNUUwXHUwNUQ1XHUwNUQxXHUwNUQ1JyxcbiAgICAgICAgICAgIGp1c3RpZmljYXRpb246ICdcdTA1RDRcdTA1RDdcdTA1RENcdTA1RTRcdTA1RUEgXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVEOVx1MDVFOVx1MDVERiBcdTA1RDVcdTA1RTlcdTA1RDlcdTA1RTRcdTA1RDVcdTA1RTggXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyXHUwNUQ5XHUwNUREJyxcbiAgICAgICAgICAgIHBsYW5uaW5nX3NvdXJjZTogJ2FubnVhbF9wbGFubmluZycsXG4gICAgICAgICAgICBjb21wbGV4aXR5OiAyLFxuICAgICAgICAgICAgc3RhdHVzOiAnT3BlbicsXG4gICAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX25hbWU6ICdcdTA1RTlcdTA1RThcdTA1RDQgXHUwNURDXHUwNUQ1XHUwNUQ5JyxcbiAgICAgICAgICAgIHRlYW1fbmFtZTogJ1x1MDVFNlx1MDVENVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLFxuICAgICAgICAgICAgcGxhbm5pbmdfbm90ZXM6ICdcdTA1RENcdTA1RDFcdTA1RDNcdTA1RDVcdTA1RTcgXHUwNUVBXHUwNUQwXHUwNUQ5XHUwNURFXHUwNUQ1XHUwNUVBIFx1MDVFMlx1MDVERCBcdTA1RUFcdTA1RDVcdTA1REJcdTA1RTBcdTA1RDVcdTA1RUEgXHUwNUU3XHUwNUQ5XHUwNUQ5XHUwNURFXHUwNUQ1XHUwNUVBJyxcbiAgICAgICAgICAgIG9mZmljZXJfbm90ZXM6ICdcdTA1RDFcdTA1RUFcdTA1RDRcdTA1RENcdTA1RDlcdTA1REEgXHUwNUQwXHUwNUQ5XHUwNUUxXHUwNUQ1XHUwNUUzIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0YXNrX2lkOiAxMDAyLFxuICAgICAgICAgICAgd29ya195ZWFyOiAyMDI0LFxuICAgICAgICAgICAgcmVxdWlyZWRfcXVhcnRlcjogJzIwMjQtMDYtMDEnLFxuICAgICAgICAgICAgdGl0bGU6ICdcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDkgXHUwNUUwXHUwNUQ5XHUwNUU3XHUwNUQ5XHUwNUQ1XHUwNURGIFx1MDVEQ1x1MDVERVx1MDVFOVx1MDVFOFx1MDVEM1x1MDVEOVx1MDVERCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDVEN1x1MDVENVx1MDVENlx1MDVENCBcdTA1RTlcdTA1RTBcdTA1RUFcdTA1RDkgXHUwNURDXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBXHUwNUQ5IFx1MDVFMFx1MDVEOVx1MDVFN1x1MDVEOVx1MDVENVx1MDVERicsXG4gICAgICAgICAgICByZXF1ZXN0ZXJfbmFtZTogJ1x1MDVFOFx1MDVEN1x1MDVEQyBcdTA1RDBcdTA1RDFcdTA1RThcdTA1RDRcdTA1REQnLFxuICAgICAgICAgICAgZGl2aXNpb25fbmFtZTogJ1x1MDVERVx1MDVFOVx1MDVEMFx1MDVEMVx1MDVEOSBcdTA1RDBcdTA1RTBcdTA1RDVcdTA1RTknLFxuICAgICAgICAgICAgZGVwYXJ0bWVudF9uYW1lOiAnXHUwNUVBXHUwNUU0XHUwNUUyXHUwNUQ1XHUwNURDJyxcbiAgICAgICAgICAgIGRvbWFpbl9uYW1lOiAnXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBXHUwNUQ5XHUwNUREJyxcbiAgICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQ6IDEyMDAwMCxcbiAgICAgICAgICAgIGN1cnJlbmN5OiAnSUxTJyxcbiAgICAgICAgICAgIHN1cHBsaWVyX2xpc3Q6ICdcdTA1RDdcdTA1RDFcdTA1RThcdTA1RUEgXHUwNUUwXHUwNUQ5XHUwNUU3XHUwNUQ5XHUwNUQ1XHUwNURGIFx1MDVEMCwgXHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUVBIFx1MDVFMFx1MDVEOVx1MDVFN1x1MDVEOVx1MDVENVx1MDVERiBcdTA1RDEnLFxuICAgICAgICAgICAganVzdGlmaWNhdGlvbjogJ1x1MDVFOVx1MDVERVx1MDVEOVx1MDVFOFx1MDVENCBcdTA1RTJcdTA1REMgXHUwNUUxXHUwNUQxXHUwNUQ5XHUwNUQxXHUwNUVBIFx1MDVFMlx1MDVEMVx1MDVENVx1MDVEM1x1MDVENCBcdTA1RTBcdTA1RTdcdTA1RDlcdTA1RDlcdTA1RDQnLFxuICAgICAgICAgICAgcGxhbm5pbmdfc291cmNlOiAnYW5udWFsX3BsYW5uaW5nJyxcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IDEsXG4gICAgICAgICAgICBzdGF0dXM6ICdQbGFuJyxcbiAgICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZTogJ1x1MDVEMFx1MDVEMVx1MDVEOSBcdTA1REJcdTA1RDRcdTA1REYnLFxuICAgICAgICAgICAgdGVhbV9uYW1lOiAnXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBIFx1MDVFOVx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQVx1MDVEOVx1MDVERCcsXG4gICAgICAgICAgICBwbGFubmluZ19ub3RlczogJ1x1MDVEQ1x1MDVENVx1MDVENVx1MDVEM1x1MDVEMCBcdTA1REJcdTA1RDlcdTA1RTFcdTA1RDVcdTA1RDkgXHUwNURDXHUwNURCXHUwNURDIFx1MDVENFx1MDVFN1x1MDVENVx1MDVERVx1MDVENVx1MDVFQScsXG4gICAgICAgICAgICBvZmZpY2VyX25vdGVzOiAnXHUwNURFXHUwNUQ3XHUwNURCXHUwNUQ0IFx1MDVEQ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTdcdTA1RTZcdTA1RDlcdTA1RDEnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0YXNrX2lkOiAxMDAzLFxuICAgICAgICAgICAgd29ya195ZWFyOiAyMDI0LFxuICAgICAgICAgICAgcmVxdWlyZWRfcXVhcnRlcjogJzIwMjQtMDQtMDEnLFxuICAgICAgICAgICAgdGl0bGU6ICdcdTA1RTRcdTA1RDlcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIENSTScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDVFNFx1MDVEOVx1MDVFQVx1MDVENVx1MDVENyBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUUwXHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNURDIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQSBcdTA1REVcdTA1RDVcdTA1RUFcdTA1RDBcdTA1REVcdTA1RUEnLFxuICAgICAgICAgICAgcmVxdWVzdGVyX25hbWU6ICdcdTA1RDlcdTA1RDVcdTA1RTFcdTA1RDkgXHUwNURDXHUwNUQ1XHUwNUQ5JyxcbiAgICAgICAgICAgIGRpdmlzaW9uX25hbWU6ICdcdTA1REVcdTA1REJcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUEnLFxuICAgICAgICAgICAgZGVwYXJ0bWVudF9uYW1lOiAnXHUwNUU5XHUwNUQ5XHUwNUQ1XHUwNUQ1XHUwNUU3JyxcbiAgICAgICAgICAgIGRvbWFpbl9uYW1lOiAnXHUwNUU0XHUwNUQ5XHUwNUVBXHUwNUQ1XHUwNUQ3IFx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVENCcsXG4gICAgICAgICAgICBlc3RpbWF0ZWRfYW1vdW50OiA1MDAwMDAsXG4gICAgICAgICAgICBjdXJyZW5jeTogJ0lMUycsXG4gICAgICAgICAgICBzdXBwbGllcl9saXN0OiAnXHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUVBIFx1MDVFNFx1MDVEOVx1MDVFQVx1MDVENVx1MDVENyBcdTA1RDAsIFx1MDVEN1x1MDVEMVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RDlcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNUQxJyxcbiAgICAgICAgICAgIGp1c3RpZmljYXRpb246ICdcdTA1RTlcdTA1RDlcdTA1RTRcdTA1RDVcdTA1RTggXHUwNUUwXHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNURDIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQSBcdTA1RDVcdTA1REVcdTA1REJcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUEnLFxuICAgICAgICAgICAgcGxhbm5pbmdfc291cmNlOiAndW5wbGFubmVkJyxcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IDMsXG4gICAgICAgICAgICBzdGF0dXM6ICdJbiBQcm9ncmVzcycsXG4gICAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX25hbWU6ICdcdTA1REVcdTA1RDlcdTA1RThcdTA1RDkgXHUwNUQzXHUwNUQ1XHUwNUQzJyxcbiAgICAgICAgICAgIHRlYW1fbmFtZTogJ1x1MDVFNlx1MDVENVx1MDVENVx1MDVFQSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknLFxuICAgICAgICAgICAgcGxhbm5pbmdfbm90ZXM6ICdcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDggXHUwNUQwXHUwNUUxXHUwNUQ4XHUwNUU4XHUwNUQ4XHUwNUQyXHUwNUQ5IFx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsXG4gICAgICAgICAgICBvZmZpY2VyX25vdGVzOiAnXHUwNUQxXHUwNUU5XHUwNURDXHUwNUQxIFx1MDVFNFx1MDVEOVx1MDVFQVx1MDVENVx1MDVENyBcdTA1RThcdTA1RDBcdTA1RTlcdTA1RDVcdTA1RTBcdTA1RDknXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0YXNrX2lkOiAxMDA0LFxuICAgICAgICAgICAgd29ya195ZWFyOiAyMDI0LFxuICAgICAgICAgICAgcmVxdWlyZWRfcXVhcnRlcjogJzIwMjQtMDItMDEnLFxuICAgICAgICAgICAgdGl0bGU6ICdcdTA1RThcdTA1RDlcdTA1RDRcdTA1RDVcdTA1RDggXHUwNURFXHUwNUU5XHUwNUU4XHUwNUQzXHUwNUQ5IFx1MDVEN1x1MDVEM1x1MDVFOScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RTlcdTA1RDVcdTA1RENcdTA1RDdcdTA1RTBcdTA1RDVcdTA1RUEgXHUwNUQ1XHUwNURCXHUwNUUxXHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVERVx1MDVFOVx1MDVFOFx1MDVEMyBcdTA1RDRcdTA1RDdcdTA1RDNcdTA1RTknLFxuICAgICAgICAgICAgcmVxdWVzdGVyX25hbWU6ICdcdTA1RTBcdTA1RDVcdTA1RTJcdTA1RDQgXHUwNUQyXHUwNUU4XHUwNUQ5XHUwNURGJyxcbiAgICAgICAgICAgIGRpdmlzaW9uX25hbWU6ICdcdTA1RUFcdTA1RTRcdTA1RTJcdTA1RDVcdTA1REMnLFxuICAgICAgICAgICAgZGVwYXJ0bWVudF9uYW1lOiAnXHUwNURFXHUwNUVBXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUREJyxcbiAgICAgICAgICAgIGRvbWFpbl9uYW1lOiAnXHUwNUU4XHUwNUQ5XHUwNUQ0XHUwNUQ1XHUwNUQ4JyxcbiAgICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQ6IDgwMDAwLFxuICAgICAgICAgICAgY3VycmVuY3k6ICdJTFMnLFxuICAgICAgICAgICAgc3VwcGxpZXJfbGlzdDogJ1x1MDVEMFx1MDVEOVx1MDVFN1x1MDVEMFx1MDVENCwgXHUwNURCXHUwNUVBXHUwNUU4IFx1MDVFNFx1MDVEQ1x1MDVFMVx1MDVEOFx1MDVEOVx1MDVFNycsXG4gICAgICAgICAgICBqdXN0aWZpY2F0aW9uOiAnXHUwNUQ0XHUwNUU3XHUwNURFXHUwNUVBIFx1MDVERVx1MDVFOVx1MDVFOFx1MDVEMyBcdTA1RDdcdTA1RDNcdTA1RTknLFxuICAgICAgICAgICAgcGxhbm5pbmdfc291cmNlOiAnY2FycmllZF9vdmVyJyxcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IDEsXG4gICAgICAgICAgICBzdGF0dXM6ICdDb21wbGV0ZScsXG4gICAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX25hbWU6ICdcdTA1RDNcdTA1RTBcdTA1RDkgXHUwNUU4XHUwNUQ1XHUwNUQ2XHUwNURGJyxcbiAgICAgICAgICAgIHRlYW1fbmFtZTogJ1x1MDVFNlx1MDVENVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNURCXHUwNURDXHUwNURDXHUwNUQ5JyxcbiAgICAgICAgICAgIHBsYW5uaW5nX25vdGVzOiAnXHUwNURDXHUwNUQ1XHUwNUQ1XHUwNUQzXHUwNUQwIFx1MDVENFx1MDVFQVx1MDVEMFx1MDVERVx1MDVENCBcdTA1RENcdTA1RTJcdTA1RDlcdTA1RTZcdTA1RDVcdTA1RDEgXHUwNUQ0XHUwNURFXHUwNUU5XHUwNUU4XHUwNUQzJyxcbiAgICAgICAgICAgIG9mZmljZXJfbm90ZXM6ICdcdTA1RDRcdTA1RDVcdTA1RTlcdTA1RENcdTA1REQgXHUwNUQxXHUwNUQ0XHUwNUU2XHUwNURDXHUwNUQ3XHUwNUQ0LCBcdTA1RDRcdTA1RThcdTA1RDlcdTA1RDRcdTA1RDVcdTA1RDggXHUwNUQ0XHUwNUQ1XHUwNUVBXHUwNUU3XHUwNURGJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGFza19pZDogMTAwNSxcbiAgICAgICAgICAgIHdvcmtfeWVhcjogMjAyNCxcbiAgICAgICAgICAgIHJlcXVpcmVkX3F1YXJ0ZXI6ICcyMDI0LTAxLTAxJyxcbiAgICAgICAgICAgIHRpdGxlOiAnXHUwNUU5XHUwNUQzXHUwNUU4XHUwNUQ1XHUwNUQyIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDBcdTA1RDFcdTA1RDhcdTA1RDdcdTA1RDQnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdcdTA1RDRcdTA1RUFcdTA1RTdcdTA1RTBcdTA1RUEgXHUwNURFXHUwNUU2XHUwNURDXHUwNURFXHUwNUQ1XHUwNUVBIFx1MDVEMFx1MDVEMVx1MDVEOFx1MDVEN1x1MDVENCBcdTA1RDdcdTA1RDNcdTA1RTlcdTA1RDVcdTA1RUEnLFxuICAgICAgICAgICAgcmVxdWVzdGVyX25hbWU6ICdcdTA1RDBcdTA1REVcdTA1RDlcdTA1RTggXHUwNUQxXHUwNURGIFx1MDVEM1x1MDVENVx1MDVEMycsXG4gICAgICAgICAgICBkaXZpc2lvbl9uYW1lOiAnXHUwNUQwXHUwNUQxXHUwNUQ4XHUwNUQ3XHUwNUQ0JyxcbiAgICAgICAgICAgIGRlcGFydG1lbnRfbmFtZTogJ1x1MDVEMFx1MDVEMVx1MDVEOFx1MDVEN1x1MDVENCBcdTA1RTRcdTA1RDlcdTA1RDZcdTA1RDlcdTA1RUEnLFxuICAgICAgICAgICAgZG9tYWluX25hbWU6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RDVcdTA1RUEgXHUwNUQwXHUwNUQxXHUwNUQ4XHUwNUQ3XHUwNUQ0JyxcbiAgICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQ6IDE1MDAwMCxcbiAgICAgICAgICAgIGN1cnJlbmN5OiAnSUxTJyxcbiAgICAgICAgICAgIHN1cHBsaWVyX2xpc3Q6ICdcdTA1RDdcdTA1RDFcdTA1RThcdTA1RUEgXHUwNUQwXHUwNUQxXHUwNUQ4XHUwNUQ3XHUwNUQ0IFx1MDVERVx1MDVFQVx1MDVFN1x1MDVEM1x1MDVERVx1MDVFQScsXG4gICAgICAgICAgICBqdXN0aWZpY2F0aW9uOiAnXHUwNUU5XHUwNUQ5XHUwNUU0XHUwNUQ1XHUwNUU4IFx1MDVFOFx1MDVERVx1MDVFQSBcdTA1RDRcdTA1RDBcdTA1RDFcdTA1RDhcdTA1RDdcdTA1RDQgXHUwNUQxXHUwNURFXHUwNUVBXHUwNUU3XHUwNURGJyxcbiAgICAgICAgICAgIHBsYW5uaW5nX3NvdXJjZTogJ2FubnVhbF9wbGFubmluZycsXG4gICAgICAgICAgICBjb21wbGV4aXR5OiAyLFxuICAgICAgICAgICAgc3RhdHVzOiAnRG9uZScsXG4gICAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX25hbWU6ICdcdTA1RUFcdTA1REVcdTA1RTggXHUwNURCXHUwNUQ0XHUwNURGJyxcbiAgICAgICAgICAgIHRlYW1fbmFtZTogJ1x1MDVFNlx1MDVENVx1MDVENVx1MDVFQSBcdTA1RDFcdTA1RDlcdTA1RDhcdTA1RDdcdTA1RDVcdTA1REYnLFxuICAgICAgICAgICAgcGxhbm5pbmdfbm90ZXM6ICdcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDggXHUwNUU3XHUwNUU4XHUwNUQ5XHUwNUQ4XHUwNUQ5IFx1MDVEQ1x1MDVEMFx1MDVEMVx1MDVEOFx1MDVEN1x1MDVENCcsXG4gICAgICAgICAgICBvZmZpY2VyX25vdGVzOiAnXHUwNUQ0XHUwNUQ1XHUwNUU5XHUwNURDXHUwNUREIFx1MDVENVx1MDVFMFx1MDVERVx1MDVFMVx1MDVFOCBcdTA1RENcdTA1RUFcdTA1RTRcdTA1RTJcdTA1RDVcdTA1REMnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0YXNrX2lkOiAxMDA2LFxuICAgICAgICAgICAgd29ya195ZWFyOiAyMDI0LFxuICAgICAgICAgICAgcmVxdWlyZWRfcXVhcnRlcjogJzIwMjQtMDUtMDEnLFxuICAgICAgICAgICAgdGl0bGU6ICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU4XHUwNURCXHUwNUQxXHUwNUQ5IFx1MDVEN1x1MDVEMVx1MDVFOFx1MDVENCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEQlx1MDVFOSA1IFx1MDVFOFx1MDVEQlx1MDVEMVx1MDVEOSBcdTA1RDdcdTA1RDFcdTA1RThcdTA1RDQgXHUwNUQ3XHUwNUQzXHUwNUU5XHUwNUQ5XHUwNUREJyxcbiAgICAgICAgICAgIHJlcXVlc3Rlcl9uYW1lOiAnXHUwNUQyXHUwNUQ5XHUwNURDIFx1MDVFOVx1MDVERVx1MDVENVx1MDVEMFx1MDVEQycsXG4gICAgICAgICAgICBkaXZpc2lvbl9uYW1lOiAnXHUwNUVBXHUwNUU0XHUwNUUyXHUwNUQ1XHUwNURDJyxcbiAgICAgICAgICAgIGRlcGFydG1lbnRfbmFtZTogJ1x1MDVFNlx1MDVEOSBcdTA1RThcdTA1REJcdTA1RDEnLFxuICAgICAgICAgICAgZG9tYWluX25hbWU6ICdcdTA1RThcdTA1REJcdTA1RDFcdTA1RDlcdTA1REQnLFxuICAgICAgICAgICAgZXN0aW1hdGVkX2Ftb3VudDogNDAwMDAwLFxuICAgICAgICAgICAgY3VycmVuY3k6ICdJTFMnLFxuICAgICAgICAgICAgc3VwcGxpZXJfbGlzdDogJ1x1MDVEOVx1MDVENVx1MDVFMFx1MDVEM1x1MDVEMFx1MDVEOSwgXHUwNUQ4XHUwNUQ1XHUwNUQ5XHUwNUQ1XHUwNUQ4XHUwNUQ0LCBcdTA1RTBcdTA1RDlcdTA1RTFcdTA1RDBcdTA1REYnLFxuICAgICAgICAgICAganVzdGlmaWNhdGlvbjogJ1x1MDVENFx1MDVEN1x1MDVEQ1x1MDVFNFx1MDVFQSBcdTA1RThcdTA1REJcdTA1RDFcdTA1RDlcdTA1REQgXHUwNUQ5XHUwNUU5XHUwNUUwXHUwNUQ5XHUwNUREJyxcbiAgICAgICAgICAgIHBsYW5uaW5nX3NvdXJjZTogJ2FubnVhbF9wbGFubmluZycsXG4gICAgICAgICAgICBjb21wbGV4aXR5OiAyLFxuICAgICAgICAgICAgc3RhdHVzOiAnRnJlZXplJyxcbiAgICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZTogJ1x1MDVFOFx1MDVENVx1MDVERiBcdTA1RDBcdTA1RENcdTA1RDVcdTA1REYnLFxuICAgICAgICAgICAgdGVhbV9uYW1lOiAnXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBIFx1MDVFOFx1MDVEQlx1MDVFOSBcdTA1REJcdTA1RENcdTA1RENcdTA1RDknLFxuICAgICAgICAgICAgcGxhbm5pbmdfbm90ZXM6ICdcdTA1RENcdTA1RDFcdTA1RDNcdTA1RDVcdTA1RTcgXHUwNUQwXHUwNUU0XHUwNUU5XHUwNUU4XHUwNUQ1XHUwNUQ5XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVEOVx1MDVFMVx1MDVEOVx1MDVFMFx1MDVEMicsXG4gICAgICAgICAgICBvZmZpY2VyX25vdGVzOiAnXHUwNUQ0XHUwNUQ1XHUwNUU3XHUwNUU0XHUwNUQwIFx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RDdcdTA1RThcdTA1RDlcdTA1RDJcdTA1RDQgXHUwNUQxXHUwNUVBXHUwNUU3XHUwNUU2XHUwNUQ5XHUwNUQxJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGFza19pZDogMTAwNyxcbiAgICAgICAgICAgIHdvcmtfeWVhcjogMjAyNCxcbiAgICAgICAgICAgIHJlcXVpcmVkX3F1YXJ0ZXI6ICcyMDI0LTA3LTAxJyxcbiAgICAgICAgICAgIHRpdGxlOiAnXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBXHUwNUQ5IFx1MDVEOVx1MDVEOVx1MDVFMlx1MDVENVx1MDVFNSBcdTA1REVcdTA1RTlcdTA1RTRcdTA1RDhcdTA1RDknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDkgXHUwNUQ5XHUwNUQ5XHUwNUUyXHUwNUQ1XHUwNUU1IFx1MDVERVx1MDVFOVx1MDVFNFx1MDVEOFx1MDVEOSBcdTA1RTlcdTA1RTBcdTA1RUFcdTA1RDlcdTA1RDlcdTA1REQnLFxuICAgICAgICAgICAgcmVxdWVzdGVyX25hbWU6ICdcdTA1RTJcdTA1RDNcdTA1RDkgXHUwNUU4XHUwNUQ1XHUwNUQ2XHUwNUUwXHUwNUQxXHUwNUU4XHUwNUQyJyxcbiAgICAgICAgICAgIGRpdmlzaW9uX25hbWU6ICdcdTA1REVcdTA1RTlcdTA1RTRcdTA1RDhcdTA1RDknLFxuICAgICAgICAgICAgZGVwYXJ0bWVudF9uYW1lOiAnXHUwNUQ5XHUwNUQ5XHUwNUUyXHUwNUQ1XHUwNUU1IFx1MDVERVx1MDVFOVx1MDVFNFx1MDVEOFx1MDVEOScsXG4gICAgICAgICAgICBkb21haW5fbmFtZTogJ1x1MDVFOVx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQVx1MDVEOVx1MDVERCBcdTA1REVcdTA1RTdcdTA1RTZcdTA1RDVcdTA1RTJcdTA1RDlcdTA1RDlcdTA1REQnLFxuICAgICAgICAgICAgZXN0aW1hdGVkX2Ftb3VudDogMjAwMDAwLFxuICAgICAgICAgICAgY3VycmVuY3k6ICdJTFMnLFxuICAgICAgICAgICAgc3VwcGxpZXJfbGlzdDogJ1x1MDVERVx1MDVFOVx1MDVFOFx1MDVEMyBcdTA1RTJcdTA1RDVcdTA1RThcdTA1REJcdTA1RDkgXHUwNUQzXHUwNUQ5XHUwNURGIFx1MDVEMCwgXHUwNURFXHUwNUU5XHUwNUU4XHUwNUQzIFx1MDVFMlx1MDVENVx1MDVFOFx1MDVEQlx1MDVEOSBcdTA1RDNcdTA1RDlcdTA1REYgXHUwNUQxJyxcbiAgICAgICAgICAgIGp1c3RpZmljYXRpb246ICdcdTA1RDlcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RTUgXHUwNURFXHUwNUU5XHUwNUU0XHUwNUQ4XHUwNUQ5IFx1MDVFOVx1MDVENVx1MDVEOFx1MDVFMycsXG4gICAgICAgICAgICBwbGFubmluZ19zb3VyY2U6ICd1bnBsYW5uZWQnLFxuICAgICAgICAgICAgY29tcGxleGl0eTogMixcbiAgICAgICAgICAgIHN0YXR1czogJ0NhbmNlbCcsXG4gICAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX25hbWU6ICdcdTA1RENcdTA1RDlcdTA1RENcdTA1REEgXHUwNURFXHUwNUQ1XHUwNUU4JyxcbiAgICAgICAgICAgIHRlYW1fbmFtZTogJ1x1MDVFNlx1MDVENVx1MDVENVx1MDVFQSBcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDlcdTA1REQnLFxuICAgICAgICAgICAgcGxhbm5pbmdfbm90ZXM6ICdcdTA1RENcdTA1RDFcdTA1RDNcdTA1RDVcdTA1RTcgXHUwNUQ3XHUwNURDXHUwNUQ1XHUwNUU0XHUwNUQ1XHUwNUVBIFx1MDVFNFx1MDVFMFx1MDVEOVx1MDVERVx1MDVEOVx1MDVENVx1MDVFQScsXG4gICAgICAgICAgICBvZmZpY2VyX25vdGVzOiAnXHUwNUQxXHUwNUQ1XHUwNUQ4XHUwNURDIC0gXHUwNUUwXHUwNURFXHUwNUU2XHUwNUQwIFx1MDVFNFx1MDVFQVx1MDVFOFx1MDVENVx1MDVERiBcdTA1RTRcdTA1RTBcdTA1RDlcdTA1REVcdTA1RDknXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0YXNrX2lkOiAxMDA4LFxuICAgICAgICAgICAgd29ya195ZWFyOiAyMDI0LFxuICAgICAgICAgICAgcmVxdWlyZWRfcXVhcnRlcjogJzIwMjQtMDgtMDEnLFxuICAgICAgICAgICAgdGl0bGU6ICdcdTA1RTlcdTA1RDNcdTA1RThcdTA1RDVcdTA1RDIgXHUwNUVBXHUwNUU5XHUwNUVBXHUwNUQ5XHUwNUVBIFx1MDVFOFx1MDVFOVx1MDVFQScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDVFOVx1MDVEM1x1MDVFOFx1MDVENVx1MDVEMiBcdTA1REVcdTA1RUFcdTA1RDJcdTA1RDkgXHUwNUU4XHUwNUU5XHUwNUVBIFx1MDVENVx1MDVFMFx1MDVFQVx1MDVEMVx1MDVEOVx1MDVERCcsXG4gICAgICAgICAgICByZXF1ZXN0ZXJfbmFtZTogJ1x1MDVEMFx1MDVEQ1x1MDVENVx1MDVERiBcdTA1RDhcdTA1REMnLFxuICAgICAgICAgICAgZGl2aXNpb25fbmFtZTogJ1x1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCcsXG4gICAgICAgICAgICBkZXBhcnRtZW50X25hbWU6ICdcdTA1RUFcdTA1RTlcdTA1RUFcdTA1RDlcdTA1RDVcdTA1RUEnLFxuICAgICAgICAgICAgZG9tYWluX25hbWU6ICdcdTA1RUFcdTA1RTdcdTA1RTlcdTA1RDVcdTA1RThcdTA1RUEnLFxuICAgICAgICAgICAgZXN0aW1hdGVkX2Ftb3VudDogMTgwMDAwLFxuICAgICAgICAgICAgY3VycmVuY3k6ICdJTFMnLFxuICAgICAgICAgICAgc3VwcGxpZXJfbGlzdDogJ1x1MDVFMVx1MDVEOVx1MDVFMVx1MDVFN1x1MDVENSwgSFAsIFx1MDVEMlxcJ1x1MDVENVx1MDVFMFx1MDVEOVx1MDVFNFx1MDVFOCcsXG4gICAgICAgICAgICBqdXN0aWZpY2F0aW9uOiAnXHUwNUU5XHUwNUQ5XHUwNUU0XHUwNUQ1XHUwNUU4IFx1MDVERVx1MDVENFx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQSBcdTA1RDVcdTA1RDlcdTA1RTZcdTA1RDlcdTA1RDFcdTA1RDVcdTA1RUEgXHUwNUQ0XHUwNUU4XHUwNUU5XHUwNUVBJyxcbiAgICAgICAgICAgIHBsYW5uaW5nX3NvdXJjZTogJ2FubnVhbF9wbGFubmluZycsXG4gICAgICAgICAgICBjb21wbGV4aXR5OiAzLFxuICAgICAgICAgICAgc3RhdHVzOiAnSW4gUHJvZ3Jlc3MnLFxuICAgICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lOiAnXHUwNUQ5XHUwNUUyXHUwNURDIFx1MDVEMVx1MDVFOFx1MDVFNycsXG4gICAgICAgICAgICB0ZWFtX25hbWU6ICdcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5JyxcbiAgICAgICAgICAgIHBsYW5uaW5nX25vdGVzOiAnXHUwNURDXHUwNUVBXHUwNUQwXHUwNUREIFx1MDVFMlx1MDVERCBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgSVQnLFxuICAgICAgICAgICAgb2ZmaWNlcl9ub3RlczogJ1x1MDVEMVx1MDVFQVx1MDVENFx1MDVEQ1x1MDVEOVx1MDVEQSBcdTA1RDRcdTA1RUFcdTA1RTdcdTA1RTBcdTA1RDQnXG4gICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgbGV0IHRhc2tzQ3JlYXRlZCA9IDA7XG4gICAgICAgIGRlbW9UYXNrcy5mb3JFYWNoKCh0YXNrLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgIGBJTlNFUlQgSU5UTyBwcm9ncmFtcyBcbiAgICAgICAgICAgICAodGFza19pZCwgd29ya195ZWFyLCByZXF1aXJlZF9xdWFydGVyLCB0aXRsZSwgZGVzY3JpcHRpb24sIHJlcXVlc3Rlcl9uYW1lLCBcbiAgICAgICAgICAgICAgZGl2aXNpb25fbmFtZSwgZGVwYXJ0bWVudF9uYW1lLCBkb21haW5fbmFtZSwgZXN0aW1hdGVkX2Ftb3VudCwgY3VycmVuY3ksIFxuICAgICAgICAgICAgICBzdXBwbGllcl9saXN0LCBqdXN0aWZpY2F0aW9uLCBwbGFubmluZ19zb3VyY2UsIGNvbXBsZXhpdHksIHN0YXR1cywgXG4gICAgICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSwgdGVhbV9uYW1lLCBwbGFubmluZ19ub3Rlcywgb2ZmaWNlcl9ub3RlcykgXG4gICAgICAgICAgICAgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHRhc2sudGFza19pZCwgdGFzay53b3JrX3llYXIsIHRhc2sucmVxdWlyZWRfcXVhcnRlciwgdGFzay50aXRsZSwgXG4gICAgICAgICAgICAgIHRhc2suZGVzY3JpcHRpb24sIHRhc2sucmVxdWVzdGVyX25hbWUsIHRhc2suZGl2aXNpb25fbmFtZSwgXG4gICAgICAgICAgICAgIHRhc2suZGVwYXJ0bWVudF9uYW1lLCB0YXNrLmRvbWFpbl9uYW1lLCB0YXNrLmVzdGltYXRlZF9hbW91bnQsIFxuICAgICAgICAgICAgICB0YXNrLmN1cnJlbmN5LCB0YXNrLnN1cHBsaWVyX2xpc3QsIHRhc2suanVzdGlmaWNhdGlvbiwgXG4gICAgICAgICAgICAgIHRhc2sucGxhbm5pbmdfc291cmNlLCB0YXNrLmNvbXBsZXhpdHksIHRhc2suc3RhdHVzLCBcbiAgICAgICAgICAgICAgdGFzay5hc3NpZ25lZF9vZmZpY2VyX25hbWUsIHRhc2sudGVhbV9uYW1lLCB0YXNrLnBsYW5uaW5nX25vdGVzLCBcbiAgICAgICAgICAgICAgdGFzay5vZmZpY2VyX25vdGVzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgY3JlYXRpbmcgZGVtbyB0YXNrOicsIHRhc2sudGFza19pZCwgZXJyKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgQ3JlYXRlZCBkZW1vIHRhc2s6JywgdGFzay50YXNrX2lkLCAnLScsIHRhc2sudGl0bGUpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgdGFza3NDcmVhdGVkKys7XG4gICAgICAgICAgICAgIGlmICh0YXNrc0NyZWF0ZWQgPT09IGRlbW9UYXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IEFsbCBkZW1vIHRhc2tzIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDQ0EgQ3JlYXRlZCAke3Rhc2tzQ3JlYXRlZH0gZGVtbyB0YXNrcyB3aXRoIHZhcmlvdXMgc3RhdHVzZXNgKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gUnVuIGlmIGNhbGxlZCBkaXJlY3RseVxuaWYgKGltcG9ydC5tZXRhLnVybCA9PT0gYGZpbGU6Ly8ke3Byb2Nlc3MuYXJndlsxXX1gKSB7XG4gIGFkZERlbW9UYXNrcygpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBEZW1vIHRhc2tzIGFkZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEZhaWxlZCB0byBhZGQgZGVtbyB0YXNrczonLCBlcnJvcik7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfSk7XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9leHByZXNzLWFwcC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0IG1vcmdhbiBmcm9tICdtb3JnYW4nO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcbmltcG9ydCByYXRlTGltaXQgZnJvbSAnZXhwcmVzcy1yYXRlLWxpbWl0JztcbmltcG9ydCB7IGluaXRpYWxpemVEYXRhYmFzZSB9IGZyb20gJy4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCBhdXRoUm91dGVzIGZyb20gJy4vcm91dGVzL2F1dGguanMnO1xuaW1wb3J0IHdvcmtlcnNSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvd29ya2Vycy5qcyc7XG5pbXBvcnQgc3lzdGVtUm91dGVzIGZyb20gJy4vcm91dGVzL3N5c3RlbS5qcyc7XG5pbXBvcnQgcGxhbm5pbmdSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvcGxhbm5pbmcuanMnO1xuaW1wb3J0IHByb2dyYW1zUm91dGVzIGZyb20gJy4vcm91dGVzL3Byb2dyYW1zLmpzJztcblxuLy8gRW52aXJvbm1lbnQgdmFyaWFibGVzXG5wcm9jZXNzLmVudi5KV1RfU0VDUkVUID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAneW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtdGhpcy1pbi1wcm9kdWN0aW9uJztcbnByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOID0gcHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gfHwgJzI0aCc7XG5wcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTID0gcHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyB8fCAnMTInO1xuXG5sZXQgZXhwcmVzc0FwcCA9IG51bGw7XG5sZXQgaXNBcHBJbml0aWFsaXplZCA9IGZhbHNlO1xuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeHByZXNzQXBwKCkge1xuICBpZiAoZXhwcmVzc0FwcCkge1xuICAgIHJldHVybiBleHByZXNzQXBwO1xuICB9XG5cbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4gIC8vIFNlY3VyaXR5IG1pZGRsZXdhcmVcbiAgYXBwLnVzZShoZWxtZXQoe1xuICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeTogZmFsc2UsIC8vIERpc2FibGUgQ1NQIGZvciBkZXZlbG9wbWVudFxuICB9KSk7XG4gIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG5cbiAgLy8gUmF0ZSBsaW1pdGluZ1xuICBjb25zdCBsaW1pdGVyID0gcmF0ZUxpbWl0KHtcbiAgICB3aW5kb3dNczogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcbiAgICBtYXg6IDEwMDAsIC8vIEluY3JlYXNlZCBsaW1pdCBmb3IgZGV2ZWxvcG1lbnRcbiAgICBtZXNzYWdlOiB7IGVycm9yOiAnVG9vIG1hbnkgcmVxdWVzdHMgZnJvbSB0aGlzIElQLCBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicgfVxuICB9KTtcbiAgYXBwLnVzZShsaW1pdGVyKTtcblxuICAvLyBDT1JTIGNvbmZpZ3VyYXRpb25cbiAgYXBwLnVzZShjb3JzKHtcbiAgICBvcmlnaW46IHRydWUsIC8vIEFsbG93IGFsbCBvcmlnaW5zIGluIGRldmVsb3BtZW50XG4gICAgY3JlZGVudGlhbHM6IHRydWUsXG4gICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICBhbGxvd2VkSGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbiddXG4gIH0pKTtcblxuICAvLyBCb2R5IHBhcnNpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKGV4cHJlc3MuanNvbih7IGxpbWl0OiAnMTBtYicgfSkpO1xuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcblxuICAvLyBMb2dnaW5nXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2RldicpKTtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgZGF0YWJhc2Ugb25seSBvbmNlXG4gIGlmICghaXNBcHBJbml0aWFsaXplZCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2UgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICBcbiAgICAgIC8vIEFsd2F5cyBzZWVkIGRhdGFiYXNlIHRvIGVuc3VyZSBkZWZhdWx0IHVzZXJzIGV4aXN0XG4gICAgICBjb25zdCB7IHNlZWREYXRhYmFzZSB9ID0gYXdhaXQgaW1wb3J0KCcuL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzJyk7XG4gICAgICBhd2FpdCBzZWVkRGF0YWJhc2UoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICAvLyBBZGQgZGVtbyB0YXNrcyBmb3IgYmV0dGVyIGRlbW9uc3RyYXRpb25cbiAgICAgIGNvbnN0IHsgYWRkRGVtb1Rhc2tzIH0gPSBhd2FpdCBpbXBvcnQoJy4vc2NyaXB0cy9hZGREZW1vVGFza3MuanMnKTtcbiAgICAgIGF3YWl0IGFkZERlbW9UYXNrcygpO1xuICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBEZW1vIHRhc2tzIGFkZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICBpc0FwcEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIERhdGFiYXNlIGluaXRpYWxpemF0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvLyBSb3V0ZXNcbiAgYXBwLnVzZSgnL2F1dGgnLCBhdXRoUm91dGVzKTtcbiAgYXBwLnVzZSgnL3dvcmtlcnMnLCB3b3JrZXJzUm91dGVzKTtcbiAgYXBwLnVzZSgnL3N5c3RlbScsIHN5c3RlbVJvdXRlcyk7XG4gIGFwcC51c2UoJy9wbGFubmluZycsIHBsYW5uaW5nUm91dGVzKTtcbiAgYXBwLnVzZSgnL3Byb2dyYW1zJywgcHJvZ3JhbXNSb3V0ZXMpO1xuXG4gIC8vIEhlYWx0aCBjaGVjayBlbmRwb2ludFxuICBhcHAuZ2V0KCcvaGVhbHRoJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLmpzb24oeyBzdGF0dXM6ICdPSycsIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pO1xuICB9KTtcblxuICAvLyBFcnJvciBoYW5kbGluZyBtaWRkbGV3YXJlXG4gIGFwcC51c2UoKGVyciwgcmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKCdFeHByZXNzIGVycm9yOicsIGVycik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBcbiAgICAgIGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyxcbiAgICAgIG1lc3NhZ2U6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gZXJyLm1lc3NhZ2UgOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcnXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIDQwNCBoYW5kbGVyXG4gIGFwcC51c2UoKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1JvdXRlIG5vdCBmb3VuZCcgfSk7XG4gIH0pO1xuXG4gIGV4cHJlc3NBcHAgPSBhcHA7XG4gIGNvbnNvbGUubG9nKCdcdTI3MDUgRXhwcmVzcyBhcHAgY3JlYXRlZCBhbmQgY29uZmlndXJlZCcpO1xuICByZXR1cm4gYXBwO1xufVxuXG5leHBvcnQgeyBjcmVhdGVFeHByZXNzQXBwIH07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBTZXQgY29uc2lzdGVudCBkYXRhYmFzZSBwYXRoIGJlZm9yZSBhbnkgc2VydmVyIG1vZHVsZXMgYXJlIGltcG9ydGVkXG5wcm9jZXNzLmVudi5EQl9QQVRIID0gJy4vc3JjL3NlcnZlci9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIG1pZGRsZXdhcmVNb2RlOiBmYWxzZSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gaW50ZWdyYXRlIEV4cHJlc3Mgc2VydmVyXG4gICAge1xuICAgICAgbmFtZTogJ2V4cHJlc3MtaW50ZWdyYXRpb24nLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAvLyBJbXBvcnQgYW5kIHNldHVwIEV4cHJlc3Mgcm91dGVzXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGknLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IHRoZSBFeHByZXNzIGFwcFxuICAgICAgICAgICAgY29uc3QgeyBjcmVhdGVFeHByZXNzQXBwIH0gPSBhd2FpdCBpbXBvcnQoJy4vc3JjL3NlcnZlci9leHByZXNzLWFwcC5qcycpO1xuICAgICAgICAgICAgY29uc3QgZXhwcmVzc0FwcCA9IGF3YWl0IGNyZWF0ZUV4cHJlc3NBcHAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSByZXF1ZXN0IHdpdGggRXhwcmVzc1xuICAgICAgICAgICAgZXhwcmVzc0FwcChyZXEsIHJlcywgbmV4dCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cHJlc3MgbWlkZGxld2FyZSBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICBuZXh0KGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTsiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7OztBQUF5USxPQUFPLGFBQWE7QUFDN1IsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sUUFBUTtBQWlCUixTQUFTLGNBQWM7QUFDNUIsTUFBSSxDQUFDLFlBQVk7QUFDZixZQUFRLElBQUksNkJBQTZCLE9BQU87QUFDaEQsaUJBQWEsSUFBSSxRQUFRLFNBQVMsU0FBUyxDQUFDLFFBQVE7QUFDbEQsVUFBSSxLQUFLO0FBQ1AsZ0JBQVEsTUFBTSwyQkFBMkIsR0FBRztBQUM1QyxjQUFNO0FBQUEsTUFDUjtBQUNBLGNBQVEsSUFBSSxvQ0FBb0MsT0FBTztBQUFBLElBQ3pELENBQUM7QUFHRCxlQUFXLElBQUksMEJBQTBCO0FBQUEsRUFDM0M7QUFDQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLGdCQUFnQjtBQUM5QixNQUFJLFlBQVk7QUFDZCxlQUFXLE1BQU0sQ0FBQyxRQUFRO0FBQ3hCLFVBQUksS0FBSztBQUNQLGdCQUFRLE1BQU0sMkJBQTJCLEdBQUc7QUFBQSxNQUM5QyxPQUFPO0FBQ0wsZ0JBQVEsSUFBSSw0QkFBNEI7QUFBQSxNQUMxQztBQUFBLElBQ0YsQ0FBQztBQUNELGlCQUFhO0FBQUEsRUFDZjtBQUNGO0FBZUEsZUFBc0IscUJBQXFCO0FBQ3pDLFFBQU0sS0FBSyxZQUFZO0FBRXZCLFNBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3RDLFlBQVEsSUFBSSw2QkFBNkI7QUFFekMsT0FBRyxVQUFVLE1BQU07QUFFakIsU0FBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELFNBQUcsSUFBSTtBQUFBO0FB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a0I7QUFBQSxZQUNsQixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixZQUFZO0FBQUEsWUFDWixRQUFRO0FBQUEsWUFDUix1QkFBdUI7QUFBQSxZQUN2QixXQUFXO0FBQUEsWUFDWCxnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsVUFDakI7QUFBQSxVQUNBO0FBQUEsWUFDRSxTQUFTO0FBQUEsWUFDVCxXQUFXO0FBQUEsWUFDWCxrQkFBa0I7QUFBQSxZQUNsQixPQUFPO0FBQUEsWUFDUCxhQUFhO0FBQUEsWUFDYixnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixhQUFhO0FBQUEsWUFDYixrQkFBa0I7QUFBQSxZQUNsQixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixZQUFZO0FBQUEsWUFDWixRQUFRO0FBQUEsWUFDUix1QkFBdUI7QUFBQSxZQUN2QixXQUFXO0FBQUEsWUFDWCxnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsVUFDakI7QUFBQSxVQUNBO0FBQUEsWUFDRSxTQUFTO0FBQUEsWUFDVCxXQUFXO0FBQUEsWUFDWCxrQkFBa0I7QUFBQSxZQUNsQixPQUFPO0FBQUEsWUFDUCxhQUFhO0FBQUEsWUFDYixnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixhQUFhO0FBQUEsWUFDYixrQkFBa0I7QUFBQSxZQUNsQixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixZQUFZO0FBQUEsWUFDWixRQUFRO0FBQUEsWUFDUix1QkFBdUI7QUFBQSxZQUN2QixXQUFXO0FBQUEsWUFDWCxnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsVUFDakI7QUFBQSxVQUNBO0FBQUEsWUFDRSxTQUFTO0FBQUEsWUFDVCxXQUFXO0FBQUEsWUFDWCxrQkFBa0I7QUFBQSxZQUNsQixPQUFPO0FBQUEsWUFDUCxhQUFhO0FBQUEsWUFDYixnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixhQUFhO0FBQUEsWUFDYixrQkFBa0I7QUFBQSxZQUNsQixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixZQUFZO0FBQUEsWUFDWixRQUFRO0FBQUEsWUFDUix1QkFBdUI7QUFBQSxZQUN2QixXQUFXO0FBQUEsWUFDWCxnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsVUFDakI7QUFBQSxVQUNBO0FBQUEsWUFDRSxTQUFTO0FBQUEsWUFDVCxXQUFXO0FBQUEsWUFDWCxrQkFBa0I7QUFBQSxZQUNsQixPQUFPO0FBQUEsWUFDUCxhQUFhO0FBQUEsWUFDYixnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixhQUFhO0FBQUEsWUFDYixrQkFBa0I7QUFBQSxZQUNsQixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixZQUFZO0FBQUEsWUFDWixRQUFRO0FBQUEsWUFDUix1QkFBdUI7QUFBQSxZQUN2QixXQUFXO0FBQUEsWUFDWCxnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsVUFDakI7QUFBQSxVQUNBO0FBQUEsWUFDRSxTQUFTO0FBQUEsWUFDVCxXQUFXO0FBQUEsWUFDWCxrQkFBa0I7QUFBQSxZQUNsQixPQUFPO0FBQUEsWUFDUCxhQUFhO0FBQUEsWUFDYixnQkFBZ0I7QUFBQSxZQUNoQixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixhQUFhO0FBQUEsWUFDYixrQkFBa0I7QUFBQSxZQUNsQixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFDZixpQkFBaUI7QUFBQSxZQUNqQixZQUFZO0FBQUEsWUFD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USxNQUFNLDZCQUE2QixLQUFLO0FBQ2hELGlCQUFLLEtBQUs7QUFBQSxVQUNaO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBS0MsTUFBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJfX2Rpcm5hbWUiLCAiand0IiwgImluaXRfYXV0aCIsICJleHByZXNzIiwgImJjcnlwdCIsICJyb3V0ZXIiLCAiZXJyIiwgImJjcnlwdCIsICJlcnIiLCAiZXhwcmVzcyIsICJyb3V0ZXIiLCAiZXJyIiwgImV4cHJlc3MiLCAicm91dGVyIiwgImVyciIsICJleHByZXNzIiwgInJvdXRlciIsICJlcnIiLCAicm93IiwgImVyciIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImV4cHJlc3MiLCAic2VlZERhdGFiYXNlIiwgImFkZERlbW9UYXNrcyIsICJpbml0X2F1dGgiLCAicGF0aCIsICJjcmVhdGVFeHByZXNzQXBwIiwgImV4cHJlc3NBcHAiLCAicGF0aCJdCn0K
