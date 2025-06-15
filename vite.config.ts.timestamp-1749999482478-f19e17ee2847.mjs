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
var __vite_injected_original_import_meta_url, __filename, __dirname2, DB_PATH, dbInstance;
var init_database = __esm({
  "src/server/config/database.js"() {
    __vite_injected_original_import_meta_url = "file:///home/project/src/server/config/database.js";
    __filename = fileURLToPath(__vite_injected_original_import_meta_url);
    __dirname2 = path.dirname(__filename);
    DB_PATH = process.env.DB_PATH || path.join(__dirname2, "../data/procurement.db");
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
    db.serialize(async () => {
      try {
        db.get("SELECT COUNT(*) as count FROM organizational_roles", (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (row.count > 0) {
            console.log("Database already seeded, skipping...");
            resolve();
            return;
          }
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
              "INSERT OR IGNORE INTO organizational_roles (role_code, description, permissions) VALUES (?, ?, ?)",
              [role.role_code, role.description, role.permissions]
            );
          });
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
          const defaultPassword = "123456";
          console.log("\u{1F50D} Creating default users with password:", defaultPassword);
          const hashedPassword = bcrypt3.hashSync(defaultPassword, 12);
          console.log("\u{1F50D} Hashed password created, length:", hashedPassword.length);
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
          let usersCreated = 0;
          defaultUsers.forEach((user, index) => {
            db.run(
              `INSERT OR REPLACE INTO workers 
               (employee_id, role_code, full_name, role_description, password) 
               VALUES (?, ?, ?, ?, ?)`,
              [user.employee_id, user.role_code, user.full_name, user.role_description, user.password],
              function(err2) {
                if (err2) {
                  console.error("\u274C Error creating user:", user.employee_id, err2);
                } else {
                  console.log("\u2705 Created user:", user.employee_id, "with ID:", this.lastID);
                }
                usersCreated++;
                if (usersCreated === defaultUsers.length) {
                  db.all("SELECT employee_id, full_name, role_code FROM workers", (err3, rows) => {
                    if (err3) {
                      console.error("\u274C Error verifying users:", err3);
                    } else {
                      console.log("\u2705 Users in database after seeding:", rows);
                    }
                  });
                  db.run(
                    "INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) VALUES (1, 5, 10, 20)"
                  );
                  console.log("\u2705 Database seeded successfully!");
                  console.log("Default users created:");
                  console.log("- Admin: 9999 / 123456");
                  console.log("- Manager: 1001 / 123456");
                  resolve();
                }
              }
            );
          });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3Byb2dyYW1zLmpzIiwgInNyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtpbXBvcnQgc3FsaXRlMyBmcm9tICdzcWxpdGUzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8vIFVzZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBvciBkZWZhdWx0IHBhdGhcbmNvbnN0IERCX1BBVEggPSBwcm9jZXNzLmVudi5EQl9QQVRIIHx8IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9kYXRhL3Byb2N1cmVtZW50LmRiJyk7XG5cbmxldCBkYkluc3RhbmNlID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERhdGFiYXNlKCkge1xuICBpZiAoIWRiSW5zdGFuY2UpIHtcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIGRhdGFiYXNlIGF0OicsIERCX1BBVEgpO1xuICAgIGRiSW5zdGFuY2UgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZShEQl9QQVRILCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgZGF0YWJhc2U6JywgZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBTUUxpdGUgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgfSk7XG5cbiAgICAvLyBFbmFibGUgZm9yZWlnbiBrZXlzXG4gICAgZGJJbnN0YW5jZS5ydW4oJ1BSQUdNQSBmb3JlaWduX2tleXMgPSBPTicpO1xuICB9XG4gIHJldHVybiBkYkluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VEYXRhYmFzZSgpIHtcbiAgaWYgKGRiSW5zdGFuY2UpIHtcbiAgICBkYkluc3RhbmNlLmNsb3NlKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xvc2luZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGJJbnN0YW5jZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gR3JhY2VmdWwgc2h1dGRvd25cbnByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFNJR0lOVCwgY2xvc2luZyBkYXRhYmFzZS4uLicpO1xuICBjbG9zZURhdGFiYXNlKCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn0pO1xuXG5wcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4ge1xuICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgU0lHVEVSTSwgY2xvc2luZyBkYXRhYmFzZS4uLicpO1xuICBjbG9zZURhdGFiYXNlKCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFiYXNlKCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBkYXRhYmFzZSB0YWJsZXMuLi4nKTtcbiAgICBcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIG9yZ2FuaXphdGlvbmFsX3JvbGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBvcmdhbml6YXRpb25hbF9yb2xlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHBlcm1pc3Npb25zIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBkaXZpc2lvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGRlcGFydG1lbnRzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkZXBhcnRtZW50cyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgcHJvY3VyZW1lbnRfdGVhbXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2N1cmVtZW50X3RlYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMIFVOSVFVRVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIHdvcmtlcnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHdvcmtlcnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbXBsb3llZV9pZCBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBmdWxsX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSBURVhULFxuICAgICAgICAgIHBhc3N3b3JkIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgYXZhaWxhYmxlX3dvcmtfZGF5cyBURVhULFxuICAgICAgICAgIGVtYWlsIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAocm9sZV9jb2RlKSBSRUZFUkVOQ0VTIG9yZ2FuaXphdGlvbmFsX3JvbGVzKHJvbGVfY29kZSksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRpdmlzaW9uX2lkKSBSRUZFUkVOQ0VTIGRpdmlzaW9ucyhpZCksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRlcGFydG1lbnRfaWQpIFJFRkVSRU5DRVMgZGVwYXJ0bWVudHMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgYWN0aXZpdHlfcG9vbCB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgYWN0aXZpdHlfcG9vbCAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICB0b29sc19hbmRfcmVzb3VyY2VzIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBkb21haW5zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkb21haW5zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIHByb2dyYW1zIHRhYmxlIChtYWluIHRhc2tzKVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvZ3JhbXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICB0YXNrX2lkIElOVEVHRVIgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIHdvcmtfeWVhciBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHJlcXVpcmVkX3F1YXJ0ZXIgREFURSxcbiAgICAgICAgICB0aXRsZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgcmVxdWVzdGVyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVxdWVzdGVyX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRpdmlzaW9uX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgZGVwYXJ0bWVudF9uYW1lIFRFWFQsXG4gICAgICAgICAgZG9tYWluX2lkIElOVEVHRVIsXG4gICAgICAgICAgZG9tYWluX25hbWUgVEVYVCxcbiAgICAgICAgICBlc3RpbWF0ZWRfYW1vdW50IFJFQUwsXG4gICAgICAgICAgY3VycmVuY3kgVEVYVCxcbiAgICAgICAgICBzdXBwbGllcl9saXN0IFRFWFQsXG4gICAgICAgICAganVzdGlmaWNhdGlvbiBURVhULFxuICAgICAgICAgIHBsYW5uaW5nX3NvdXJjZSBURVhUIE5PVCBOVUxMIERFRkFVTFQgJ2FubnVhbF9wbGFubmluZycsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGl2aXNpb25faWQpIFJFRkVSRU5DRVMgZGl2aXNpb25zKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGVwYXJ0bWVudF9pZCkgUkVGRVJFTkNFUyBkZXBhcnRtZW50cyhpZCksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRvbWFpbl9pZCkgUkVGRVJFTkNFUyBkb21haW5zKGlkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIHByb2dyYW1fdGFza3MgdGFibGUgKHN0YXRpb25zKVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvZ3JhbV90YXNrcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHByb2dyYW1faWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBzdGF0aW9uX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgYWN0aXZpdHlfaWQgSU5URUdFUixcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgY29tcGxldGlvbl9kYXRlIERBVEUsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXBvcnRpbmdfdXNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgcmVmZXJlbmNlIFRFWFQsXG4gICAgICAgICAgbm90ZXMgVEVYVCxcbiAgICAgICAgICBpc19sYXN0X3N0YXRpb24gQk9PTEVBTiBERUZBVUxUIDAsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAocHJvZ3JhbV9pZCkgUkVGRVJFTkNFUyBwcm9ncmFtcyhpZCkgT04gREVMRVRFIENBU0NBREUsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGFjdGl2aXR5X2lkKSBSRUZFUkVOQ0VTIGFjdGl2aXR5X3Bvb2woaWQpLFxuICAgICAgICAgIFVOSVFVRShwcm9ncmFtX2lkLCBzdGF0aW9uX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGNvbXBsZXhpdHlfZXN0aW1hdGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBjb21wbGV4aXR5X2VzdGltYXRlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVzdGltYXRlX2xldmVsXzEgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDUsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMiBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMTAsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMyBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMjAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgYWNjZXB0YW5jZV9vcHRpb25zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBhY2NlcHRhbmNlX29wdGlvbnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICB5ZWFyX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgdXBsb2FkX2NvZGUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGJyb2FkX21lYW5pbmcgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIFVOSVFVRSh5ZWFyX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGluZGV4ZXMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfd29ya2Vyc19lbXBsb3llZV9pZCBPTiB3b3JrZXJzKGVtcGxveWVlX2lkKScpO1xuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfd29ya2Vyc19yb2xlX2NvZGUgT04gd29ya2Vycyhyb2xlX2NvZGUpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc190YXNrX2lkIE9OIHByb2dyYW1zKHRhc2tfaWQpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc19zdGF0dXMgT04gcHJvZ3JhbXMoc3RhdHVzKScpO1xuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19wcm9ncmFtX2lkIE9OIHByb2dyYW1fdGFza3MocHJvZ3JhbV9pZCknKTtcbiAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X3Byb2dyYW1fdGFza3Nfc3RhdGlvbl9pZCBPTiBwcm9ncmFtX3Rhc2tzKHN0YXRpb25faWQpJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSB0YWJsZXMgYW5kIGluZGV4ZXMgY3JlYXRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcblxuICAgIGRiLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0RhdGFiYXNlIGVycm9yOicsIGVycik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgfSk7XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7aW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5leHBvcnQgY29uc3QgYXV0aGVudGljYXRlVG9rZW4gPSAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzWydhdXRob3JpemF0aW9uJ107XG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlciAmJiBhdXRoSGVhZGVyLnNwbGl0KCcgJylbMV07XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQWNjZXNzIHRva2VuIHJlcXVpcmVkJyB9KTtcbiAgfVxuXG4gIGp3dC52ZXJpZnkodG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsIChlcnIsIHVzZXIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUb2tlbiB2ZXJpZmljYXRpb24gZmFpbGVkOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcS51c2VyID0gdXNlcjtcbiAgICBuZXh0KCk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcXVpcmVSb2xlID0gKGFsbG93ZWRSb2xlcykgPT4ge1xuICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgaWYgKCFyZXEudXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFhbGxvd2VkUm9sZXMuaW5jbHVkZXMocmVxLnVzZXIucm9sZUNvZGUpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0luc3VmZmljaWVudCBwZXJtaXNzaW9ucycgfSk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFVzZXJGcm9tVG9rZW4gPSBhc3luYyAodG9rZW4pID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkID0gand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCk7XG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5nZXQoXG4gICAgICAgIGBTRUxFQ1Qgdy4qLCBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSBcbiAgICAgICAgIEZST00gd29ya2VycyB3IFxuICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgIFdIRVJFIHcuaWQgPSA/YCxcbiAgICAgICAgW2RlY29kZWQuaWRdLFxuICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShyb3cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdG9rZW4nKTtcbiAgfVxufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGdldFVzZXJGcm9tVG9rZW4gfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBMb2dpbiBlbmRwb2ludFxucm91dGVyLnBvc3QoJy9sb2dpbicsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgZW1wbG95ZWVJZCwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBMb2dpbiBhdHRlbXB0OicsIHsgZW1wbG95ZWVJZCwgcGFzc3dvcmRMZW5ndGg6IHBhc3N3b3JkPy5sZW5ndGggfSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgIGlmICghZW1wbG95ZWVJZCB8fCAhcGFzc3dvcmQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgTWlzc2luZyBjcmVkZW50aWFscycpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbmQgcGFzc3dvcmQgYXJlIHJlcXVpcmVkJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZW1wbG95ZWVJZC5sZW5ndGggIT09IDQgfHwgIS9eXFxkezR9JC8udGVzdChlbXBsb3llZUlkKSkge1xuICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBJbnZhbGlkIGVtcGxveWVlIElEIGZvcm1hdCcpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBtdXN0IGJlIGV4YWN0bHkgNCBkaWdpdHMnIH0pO1xuICAgIH1cblxuICAgIGlmIChwYXNzd29yZC5sZW5ndGggIT09IDYpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgSW52YWxpZCBwYXNzd29yZCBsZW5ndGgnKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnUGFzc3dvcmQgbXVzdCBiZSBleGFjdGx5IDYgY2hhcmFjdGVycycgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgLy8gRmlyc3QsIGxldCdzIGNoZWNrIHdoYXQgdXNlcnMgZXhpc3QgaW4gdGhlIGRhdGFiYXNlXG4gICAgZGIuYWxsKCdTRUxFQ1QgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSBGUk9NIHdvcmtlcnMnLCAoZXJyLCBhbGxVc2VycykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgY2hlY2tpbmcgdXNlcnM6JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0IgQXZhaWxhYmxlIHVzZXJzIGluIGRhdGFiYXNlOicsIGFsbFVzZXJzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEZpbmQgdXNlciBieSBlbXBsb3llZSBJRFxuICAgIGRiLmdldChcbiAgICAgIGBTRUxFQ1Qgdy4qLCBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlX2Rlc2NyaXB0aW9uXG4gICAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHcuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgICAgTEVGVCBKT0lOIG9yZ2FuaXphdGlvbmFsX3JvbGVzIG9yX3JvbGUgT04gdy5yb2xlX2NvZGUgPSBvcl9yb2xlLnJvbGVfY29kZVxuICAgICAgIFdIRVJFIHcuZW1wbG95ZWVfaWQgPSA/YCxcbiAgICAgIFtlbXBsb3llZUlkXSxcbiAgICAgIGFzeW5jIChlcnIsIHVzZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBEYXRhYmFzZSBlcnJvciBkdXJpbmcgbG9naW46JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgVXNlciBmb3VuZCBpbiBkYXRhYmFzZTonLCB1c2VyID8gJ1lFUycgOiAnTk8nKTtcbiAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQzY0IFVzZXIgZGV0YWlsczonLCB7XG4gICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgICAgICBoYXNQYXNzd29yZDogISF1c2VyLnBhc3N3b3JkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIFVzZXIgbm90IGZvdW5kIGZvciBlbXBsb3llZSBJRDonLCBlbXBsb3llZUlkKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmVyaWZ5IHBhc3N3b3JkXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgVmVyaWZ5aW5nIHBhc3N3b3JkLi4uJyk7XG4gICAgICAgIGNvbnN0IGlzVmFsaWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBQYXNzd29yZCB2YWxpZDonLCBpc1ZhbGlkUGFzc3dvcmQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFpc1ZhbGlkUGFzc3dvcmQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIEludmFsaWQgcGFzc3dvcmQgZm9yIHVzZXI6JywgZW1wbG95ZWVJZCk7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgTG9naW4gc3VjY2Vzc2Z1bCBmb3IgdXNlcjonLCBlbXBsb3llZUlkKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBKV1QgdG9rZW5cbiAgICAgICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcbiAgICAgICAgICB7IFxuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsIFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCwgXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUgXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVULFxuICAgICAgICAgIHsgZXhwaXJlc0luOiBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB9XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gUmV0dXJuIHVzZXIgZGF0YSBhbmQgdG9rZW5cbiAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0ge1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uIHx8ICdVbmtub3duIFJvbGUnLFxuICAgICAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogdXNlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHVzZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgU2VuZGluZyByZXNwb25zZTonLCByZXNwb25zZURhdGEpO1xuICAgICAgICByZXMuanNvbihyZXNwb25zZURhdGEpO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignXHUyNzRDIExvZ2luIGVycm9yOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCBjdXJyZW50IHVzZXIgZW5kcG9pbnRcbnJvdXRlci5nZXQoJy9tZScsIGF1dGhlbnRpY2F0ZVRva2VuLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckZyb21Ub2tlbihyZXEuaGVhZGVycy5hdXRob3JpemF0aW9uLnNwbGl0KCcgJylbMV0pO1xuICAgIFxuICAgIGlmICghdXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdVc2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oe1xuICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgZGl2aXNpb25OYW1lOiB1c2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICBkZXBhcnRtZW50TmFtZTogdXNlci5kZXBhcnRtZW50X25hbWVcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdHZXQgdXNlciBlcnJvcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3dvcmtlcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZSB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIEdldCBhbGwgd29ya2Vyc1xucm91dGVyLmdldCgnLycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKFxuICAgIGBTRUxFQ1Qgdy4qLCBkLm5hbWUgYXMgZGl2aXNpb25OYW1lLCBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudE5hbWUsIG9yX3JvbGUuZGVzY3JpcHRpb24gYXMgcm9sZURlc2NyaXB0aW9uXG4gICAgIEZST00gd29ya2VycyB3IFxuICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdy5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHcuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgIExFRlQgSk9JTiBvcmdhbml6YXRpb25hbF9yb2xlcyBvcl9yb2xlIE9OIHcucm9sZV9jb2RlID0gb3Jfcm9sZS5yb2xlX2NvZGVcbiAgICAgT1JERVIgQlkgdy5mdWxsX25hbWVgLFxuICAgIChlcnIsIHJvd3MpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyczonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVHJhbnNmb3JtIGRhdGEgdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgICBjb25zdCB3b3JrZXJzID0gcm93cy5tYXAocm93ID0+ICh7XG4gICAgICAgIGlkOiByb3cuaWQsXG4gICAgICAgIGVtcGxveWVlSWQ6IHJvdy5lbXBsb3llZV9pZCxcbiAgICAgICAgcm9sZUNvZGU6IHJvdy5yb2xlX2NvZGUsXG4gICAgICAgIGZ1bGxOYW1lOiByb3cuZnVsbF9uYW1lLFxuICAgICAgICByb2xlRGVzY3JpcHRpb246IHJvdy5yb2xlRGVzY3JpcHRpb24sXG4gICAgICAgIGRpdmlzaW9uSWQ6IHJvdy5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiByb3cucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLCAvLyBOZXZlciBzZW5kIGFjdHVhbCBwYXNzd29yZFxuICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogcm93LmF2YWlsYWJsZV93b3JrX2RheXMsXG4gICAgICAgIGVtYWlsOiByb3cuZW1haWwsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogcm93LmRpdmlzaW9uTmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50TmFtZVxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICByZXMuanNvbih3b3JrZXJzKTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gQ3JlYXRlIG5ldyB3b3JrZXJcbnJvdXRlci5wb3N0KCcvJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXZhaWxhYmxlV29ya0RheXMsXG4gICAgICBlbWFpbFxuICAgIH0gPSByZXEuYm9keTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghZW1wbG95ZWVJZCB8fCAhcm9sZUNvZGUgfHwgIWZ1bGxOYW1lIHx8ICFwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycgfSk7XG4gICAgfVxuXG4gICAgLy8gSGFzaCBwYXNzd29yZFxuICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEyKTtcblxuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIGRiLnJ1bihcbiAgICAgIGBJTlNFUlQgSU5UTyB3b3JrZXJzIFxuICAgICAgIChlbXBsb3llZV9pZCwgcm9sZV9jb2RlLCBmdWxsX25hbWUsIHJvbGVfZGVzY3JpcHRpb24sIGRpdmlzaW9uX2lkLCBkZXBhcnRtZW50X2lkLCBcbiAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSwgcGFzc3dvcmQsIGF2YWlsYWJsZV93b3JrX2RheXMsIGVtYWlsKSBcbiAgICAgICBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8sID8sID8sID8pYCxcbiAgICAgIFtlbXBsb3llZUlkLCByb2xlQ29kZSwgZnVsbE5hbWUsIHJvbGVEZXNjcmlwdGlvbiwgZGl2aXNpb25JZCwgZGVwYXJ0bWVudElkLCBcbiAgICAgICBwcm9jdXJlbWVudFRlYW0sIGhhc2hlZFBhc3N3b3JkLCBhdmFpbGFibGVXb3JrRGF5cywgZW1haWxdLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ1VOSVFVRSBjb25zdHJhaW50IGZhaWxlZCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGZXRjaCB0aGUgY3JlYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoXG4gICAgICAgICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbk5hbWUsIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50TmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlRGVzY3JpcHRpb25cbiAgICAgICAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB3LmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgICAgTEVGVCBKT0lOIG9yZ2FuaXphdGlvbmFsX3JvbGVzIG9yX3JvbGUgT04gdy5yb2xlX2NvZGUgPSBvcl9yb2xlLnJvbGVfY29kZVxuICAgICAgICAgICBXSEVSRSB3LmlkID0gP2AsXG4gICAgICAgICAgW3RoaXMubGFzdElEXSxcbiAgICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHdvcmtlciA9IHtcbiAgICAgICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICAgICAgZW1wbG95ZWVJZDogcm93LmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgICByb2xlQ29kZTogcm93LnJvbGVfY29kZSxcbiAgICAgICAgICAgICAgZnVsbE5hbWU6IHJvdy5mdWxsX25hbWUsXG4gICAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogcm93LnJvbGVEZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHJvdy5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiByb3cuYXZhaWxhYmxlX3dvcmtfZGF5cyxcbiAgICAgICAgICAgICAgZW1haWw6IHJvdy5lbWFpbCxcbiAgICAgICAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25OYW1lLFxuICAgICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnROYW1lXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih3b3JrZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBVcGRhdGUgd29ya2VyXG5yb3V0ZXIucHV0KCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgY29uc3Qge1xuICAgICAgZW1wbG95ZWVJZCxcbiAgICAgIHJvbGVDb2RlLFxuICAgICAgZnVsbE5hbWUsXG4gICAgICByb2xlRGVzY3JpcHRpb24sXG4gICAgICBkaXZpc2lvbklkLFxuICAgICAgZGVwYXJ0bWVudElkLFxuICAgICAgcHJvY3VyZW1lbnRUZWFtLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhdmFpbGFibGVXb3JrRGF5cyxcbiAgICAgIGVtYWlsXG4gICAgfSA9IHJlcS5ib2R5O1xuXG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgLy8gUHJlcGFyZSB1cGRhdGUgcXVlcnlcbiAgICBsZXQgdXBkYXRlUXVlcnkgPSBgXG4gICAgICBVUERBVEUgd29ya2VycyBTRVQgXG4gICAgICAgIGVtcGxveWVlX2lkID0gPywgcm9sZV9jb2RlID0gPywgZnVsbF9uYW1lID0gPywgcm9sZV9kZXNjcmlwdGlvbiA9ID8sXG4gICAgICAgIGRpdmlzaW9uX2lkID0gPywgZGVwYXJ0bWVudF9pZCA9ID8sIHByb2N1cmVtZW50X3RlYW0gPSA/LCBcbiAgICAgICAgYXZhaWxhYmxlX3dvcmtfZGF5cyA9ID8sIGVtYWlsID0gPywgdXBkYXRlZF9hdCA9IENVUlJFTlRfVElNRVNUQU1QXG4gICAgYDtcbiAgICBcbiAgICBsZXQgcGFyYW1zID0gW2VtcGxveWVlSWQsIHJvbGVDb2RlLCBmdWxsTmFtZSwgcm9sZURlc2NyaXB0aW9uLCBkaXZpc2lvbklkLCBcbiAgICAgICAgICAgICAgICAgIGRlcGFydG1lbnRJZCwgcHJvY3VyZW1lbnRUZWFtLCBhdmFpbGFibGVXb3JrRGF5cywgZW1haWxdO1xuXG4gICAgLy8gT25seSB1cGRhdGUgcGFzc3dvcmQgaWYgcHJvdmlkZWQgYW5kIG5vdCB0aGUgcGxhY2Vob2xkZXJcbiAgICBpZiAocGFzc3dvcmQgJiYgcGFzc3dvcmQgIT09ICcqKioqKionKSB7XG4gICAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMik7XG4gICAgICB1cGRhdGVRdWVyeSArPSAnLCBwYXNzd29yZCA9ID8nO1xuICAgICAgcGFyYW1zLnB1c2goaGFzaGVkUGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHVwZGF0ZVF1ZXJ5ICs9ICcgV0hFUkUgaWQgPSA/JztcbiAgICBwYXJhbXMucHVzaChpZCk7XG5cbiAgICBkYi5ydW4odXBkYXRlUXVlcnksIHBhcmFtcywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ1VOSVFVRSBjb25zdHJhaW50IGZhaWxlZCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRmV0Y2ggdXBkYXRlZCB3b3JrZXJcbiAgICAgIGRiLmdldChcbiAgICAgICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbk5hbWUsIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50TmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlRGVzY3JpcHRpb25cbiAgICAgICAgIEZST00gd29ya2VycyB3IFxuICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgIExFRlQgSk9JTiBvcmdhbml6YXRpb25hbF9yb2xlcyBvcl9yb2xlIE9OIHcucm9sZV9jb2RlID0gb3Jfcm9sZS5yb2xlX2NvZGVcbiAgICAgICAgIFdIRVJFIHcuaWQgPSA/YCxcbiAgICAgICAgW2lkXSxcbiAgICAgICAgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHdvcmtlciA9IHtcbiAgICAgICAgICAgIGlkOiByb3cuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiByb3cuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogcm93LnJvbGVfY29kZSxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiByb3cuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiByb3cucm9sZURlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogcm93LnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogcm93LmF2YWlsYWJsZV93b3JrX2RheXMsXG4gICAgICAgICAgICBlbWFpbDogcm93LmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25OYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50TmFtZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuanNvbih3b3JrZXIpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBEZWxldGUgd29ya2VyXG5yb3V0ZXIuZGVsZXRlKCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSB3b3JrZXJzIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdXb3JrZXIgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbnJvdXRlci5nZXQoJy9vcmdhbml6YXRpb25hbC1yb2xlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBBUEk6IEdldHRpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXMuLi4nKTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzIE9SREVSIEJZIHJvbGVfY29kZScsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgZmV0Y2hpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZygnXHUyNzA1IEZldGNoZWQgb3JnYW5pemF0aW9uYWwgcm9sZXMgZnJvbSBEQjonLCByb3dzKTtcbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRpdmlzaW9uc1xucm91dGVyLmdldCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgZGVwYXJ0bWVudHNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGVwYXJ0bWVudHM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IHByb2N1cmVtZW50IHRlYW1zXG5yb3V0ZXIuZ2V0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHByb2N1cmVtZW50IHRlYW1zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7aW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWVkRGF0YWJhc2UoKSB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1NlZWRpbmcgZGF0YWJhc2Ugd2l0aCBpbml0aWFsIGRhdGEuLi4nKTtcbiAgICBcbiAgICBkYi5zZXJpYWxpemUoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgZGF0YSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBkYi5nZXQoJ1NFTEVDVCBDT1VOVCgqKSBhcyBjb3VudCBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzJywgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIChyb3cuY291bnQgPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRGF0YWJhc2UgYWxyZWFkeSBzZWVkZWQsIHNraXBwaW5nLi4uJyk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFNlZWQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbiAgICAgICAgICBjb25zdCByb2xlcyA9IFtcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiAwLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVERVx1MDVEQ1x1MDVEMCcgfSxcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiAxLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICAgICAgICB7IHJvbGVfY29kZTogMiwgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1RDBcdTA1RTkgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBJyB9LFxuICAgICAgICAgICAgeyByb2xlX2NvZGU6IDMsIGRlc2NyaXB0aW9uOiAnXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNURGJywgcGVybWlzc2lvbnM6ICdcdTA1RDFcdTA1RDlcdTA1RTZcdTA1RDVcdTA1RTIgXHUwNUU4XHUwNURCXHUwNUU5JyB9LFxuICAgICAgICAgICAgeyByb2xlX2NvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEM1x1MDVFOFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFQScgfSxcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVERVx1MDVEQ1x1MDVEMCcgfSxcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVENCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDlcdTA1RUEnIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcm9sZXMuZm9yRWFjaChyb2xlID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICAgICAgICBbcm9sZS5yb2xlX2NvZGUsIHJvbGUuZGVzY3JpcHRpb24sIHJvbGUucGVybWlzc2lvbnNdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBkaXZpc2lvbnNcbiAgICAgICAgICBjb25zdCBkaXZpc2lvbnMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDlcdTA1RTFcdTA1RDhcdTA1RDlcdTA1RTdcdTA1RDQnLCBpc19pbnRlcm5hbDogMSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUQ0JywgaXNfaW50ZXJuYWw6IDEgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVFN1x1MDVFOCBcdTA1RDVcdTA1RTRcdTA1RDlcdTA1RUFcdTA1RDVcdTA1RDcnLCBpc19pbnRlcm5hbDogMSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUU5XHUwNUQwXHUwNUQxXHUwNUQ5IFx1MDVEMFx1MDVFMFx1MDVENVx1MDVFOScsIGlzX2ludGVybmFsOiAxIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgZGl2aXNpb25zLmZvckVhY2goZGl2aXNpb24gPT4ge1xuICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknLFxuICAgICAgICAgICAgICBbZGl2aXNpb24ubmFtZSwgZGl2aXNpb24uaXNfaW50ZXJuYWxdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBkZXBhcnRtZW50c1xuICAgICAgICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENVx1MDVEN1x1MDVENVx1MDVENlx1MDVEOVx1MDVERCcsIGRpdmlzaW9uX2lkOiAxIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RUFcdTA1RTRcdTA1RTJcdTA1RDVcdTA1REMgXHUwNUQ1XHUwNUVBXHUwNUQ3XHUwNUQ2XHUwNUQ1XHUwNUU3XHUwNUQ0JywgZGl2aXNpb25faWQ6IDEgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDlcdTA1RDNcdTA1RTInLCBkaXZpc2lvbl9pZDogMiB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUU0XHUwNUQ5XHUwNUVBXHUwNUQ1XHUwNUQ3IFx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVENCcsIGRpdmlzaW9uX2lkOiAyIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgZGVwYXJ0bWVudHMuZm9yRWFjaChkZXB0ID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBkZXBhcnRtZW50cyAobmFtZSwgZGl2aXNpb25faWQpIFZBTFVFUyAoPywgPyknLFxuICAgICAgICAgICAgICBbZGVwdC5uYW1lLCBkZXB0LmRpdmlzaW9uX2lkXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNlZWQgcHJvY3VyZW1lbnQgdGVhbXNcbiAgICAgICAgICBjb25zdCB0ZWFtcyA9IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEOVx1MDVEOFx1MDVEN1x1MDVENVx1MDVFMFx1MDVEOScgfVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICB0ZWFtcy5mb3JFYWNoKHRlYW0gPT4ge1xuICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIHByb2N1cmVtZW50X3RlYW1zIChuYW1lKSBWQUxVRVMgKD8pJyxcbiAgICAgICAgICAgICAgW3RlYW0ubmFtZV1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICAgICAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFOVx1MDVENVx1MDVENVx1MDVEMFx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RThcdTA1RDlcdTA1REQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDRcdTA1REJcdTA1RTBcdTA1RUEgXHUwNURFXHUwNUU0XHUwNUU4XHUwNUQ4IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVEOScsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUU0XHUwNUU4XHUwNUQ4JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNUREIFx1MDVERVx1MDVEQlx1MDVFOFx1MDVENicsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNUREJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RDhcdTA1RThcdTA1RDlcdTA1RTZcdTA1RUEgXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUQ0JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUVBIFx1MDVENlx1MDVENVx1MDVEQlx1MDVENCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RDVcdTA1RTJcdTA1RDNcdTA1RUEgXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUQ0JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ3XHUwNUVBXHUwNUQ5XHUwNURFXHUwNUQ0IFx1MDVFMlx1MDVEQyBcdTA1RDRcdTA1RTFcdTA1REJcdTA1REQnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVEN1x1MDVFQVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVFN1x1MDVFOFx1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNUU4XHUwNUU5XHUwNUQ5XHUwNURFXHUwNUVBIFx1MDVEMVx1MDVEM1x1MDVEOVx1MDVFN1x1MDVENVx1MDVFQScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVEQlx1MDVFMVx1MDVFNFx1MDVEOVx1MDVERCcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RDFcdTA1RDlcdTA1RTZcdTA1RDVcdTA1RTInLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNUQzXHUwNUQ1XHUwNUQ3IFx1MDVFMVx1MDVEOVx1MDVEQlx1MDVENVx1MDVERCcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEM1x1MDVENVwiXHUwNUQ3IFx1MDVFMVx1MDVEOVx1MDVEQlx1MDVENVx1MDVERCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGFjdGl2aXRpZXMuZm9yRWFjaChhY3Rpdml0eSA9PiB7XG4gICAgICAgICAgICBkYi5ydW4oXG4gICAgICAgICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gYWN0aXZpdHlfcG9vbCAobmFtZSwgdG9vbHNfYW5kX3Jlc291cmNlcykgVkFMVUVTICg/LCA/KScsXG4gICAgICAgICAgICAgIFthY3Rpdml0eS5uYW1lLCBhY3Rpdml0eS50b29sc19hbmRfcmVzb3VyY2VzXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNlZWQgZG9tYWluc1xuICAgICAgICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uOiAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBkZXNjcmlwdGlvbjogJ1x1MDVFOVx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQVx1MDVEOVx1MDVERCBcdTA1REVcdTA1RTdcdTA1RTZcdTA1RDVcdTA1RTJcdTA1RDlcdTA1RDlcdTA1REQnIH0sXG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uOiAnXHUwNUVBXHUwNUQ3XHUwNUQ2XHUwNUQ1XHUwNUU3XHUwNUQ0IFx1MDVENVx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycgfVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBkb21haW5zLmZvckVhY2goZG9tYWluID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBkb21haW5zIChkZXNjcmlwdGlvbikgVkFMVUVTICg/KScsXG4gICAgICAgICAgICAgIFtkb21haW4uZGVzY3JpcHRpb25dXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGRlZmF1bHQgdXNlcnMgd2l0aCBwcm9wZXIgcGFzc3dvcmQgaGFzaGluZ1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRQYXNzd29yZCA9ICcxMjM0NTYnO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgQ3JlYXRpbmcgZGVmYXVsdCB1c2VycyB3aXRoIHBhc3N3b3JkOicsIGRlZmF1bHRQYXNzd29yZCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gSGFzaCB0aGUgcGFzc3dvcmQgc3luY2hyb25vdXNseSB0byBlbnN1cmUgaXQncyByZWFkeVxuICAgICAgICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYmNyeXB0Lmhhc2hTeW5jKGRlZmF1bHRQYXNzd29yZCwgMTIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgSGFzaGVkIHBhc3N3b3JkIGNyZWF0ZWQsIGxlbmd0aDonLCBoYXNoZWRQYXNzd29yZC5sZW5ndGgpO1xuXG4gICAgICAgICAgY29uc3QgZGVmYXVsdFVzZXJzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBlbXBsb3llZV9pZDogJzk5OTknLFxuICAgICAgICAgICAgICByb2xlX2NvZGU6IDAsXG4gICAgICAgICAgICAgIGZ1bGxfbmFtZTogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLFxuICAgICAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDXHUwNURGIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZW1wbG95ZWVfaWQ6ICcxMDAxJyxcbiAgICAgICAgICAgICAgcm9sZV9jb2RlOiAxLFxuICAgICAgICAgICAgICBmdWxsX25hbWU6ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNUU4XHUwNURCXHUwNUU5JyxcbiAgICAgICAgICAgICAgcm9sZV9kZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU4XHUwNUQwXHUwNUU5XHUwNUQ5JyxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXTtcblxuICAgICAgICAgIC8vIEluc2VydCB1c2VycyBvbmUgYnkgb25lIHRvIGVuc3VyZSB0aGV5J3JlIGNyZWF0ZWRcbiAgICAgICAgICBsZXQgdXNlcnNDcmVhdGVkID0gMDtcbiAgICAgICAgICBkZWZhdWx0VXNlcnMuZm9yRWFjaCgodXNlciwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgYElOU0VSVCBPUiBSRVBMQUNFIElOVE8gd29ya2VycyBcbiAgICAgICAgICAgICAgIChlbXBsb3llZV9pZCwgcm9sZV9jb2RlLCBmdWxsX25hbWUsIHJvbGVfZGVzY3JpcHRpb24sIHBhc3N3b3JkKSBcbiAgICAgICAgICAgICAgIFZBTFVFUyAoPywgPywgPywgPywgPylgLFxuICAgICAgICAgICAgICBbdXNlci5lbXBsb3llZV9pZCwgdXNlci5yb2xlX2NvZGUsIHVzZXIuZnVsbF9uYW1lLCB1c2VyLnJvbGVfZGVzY3JpcHRpb24sIHVzZXIucGFzc3dvcmRdLFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgY3JlYXRpbmcgdXNlcjonLCB1c2VyLmVtcGxveWVlX2lkLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IENyZWF0ZWQgdXNlcjonLCB1c2VyLmVtcGxveWVlX2lkLCAnd2l0aCBJRDonLCB0aGlzLmxhc3RJRCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHVzZXJzQ3JlYXRlZCsrO1xuICAgICAgICAgICAgICAgIGlmICh1c2Vyc0NyZWF0ZWQgPT09IGRlZmF1bHRVc2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFZlcmlmeSB1c2VycyB3ZXJlIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgIGRiLmFsbCgnU0VMRUNUIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSBGUk9NIHdvcmtlcnMnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgdmVyaWZ5aW5nIHVzZXJzOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBVc2VycyBpbiBkYXRhYmFzZSBhZnRlciBzZWVkaW5nOicsIHJvd3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgLy8gU2VlZCBjb21wbGV4aXR5IGVzdGltYXRlc1xuICAgICAgICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGNvbXBsZXhpdHlfZXN0aW1hdGVzIChpZCwgZXN0aW1hdGVfbGV2ZWxfMSwgZXN0aW1hdGVfbGV2ZWxfMiwgZXN0aW1hdGVfbGV2ZWxfMykgVkFMVUVTICgxLCA1LCAxMCwgMjApJ1xuICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBEYXRhYmFzZSBzZWVkZWQgc3VjY2Vzc2Z1bGx5IScpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RlZmF1bHQgdXNlcnMgY3JlYXRlZDonKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCctIEFkbWluOiA5OTk5IC8gMTIzNDU2Jyk7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnLSBNYW5hZ2VyOiAxMDAxIC8gMTIzNDU2Jyk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEVycm9yIHNlZWRpbmcgZGF0YWJhc2U6JywgZXJyb3IpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuaW1wb3J0IHsgc2VlZERhdGFiYXNlIH0gZnJvbSAnLi4vc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBTZWVkIGRhdGFiYXNlIGVuZHBvaW50IC0gcHVibGljbHkgYXZhaWxhYmxlIHdpdGhvdXQgYXV0aGVudGljYXRpb25cbnJvdXRlci5nZXQoJy9zZWVkX2RiJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ1x1RDgzQ1x1REYzMSBNYW51YWwgZGF0YWJhc2Ugc2VlZGluZyByZXF1ZXN0ZWQgKHB1YmxpYyBlbmRwb2ludCknKTtcbiAgICBcbiAgICBhd2FpdCBzZWVkRGF0YWJhc2UoKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnXHUyNzA1IE1hbnVhbCBkYXRhYmFzZSBzZWVkaW5nIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICByZXMuanNvbih7IFxuICAgICAgbWVzc2FnZTogJ0RhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgTWFudWFsIGRhdGFiYXNlIHNlZWRpbmcgZmFpbGVkOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IFxuICAgICAgZXJyb3I6ICdEYXRhYmFzZSBzZWVkaW5nIGZhaWxlZCcsXG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlXG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBBY3Rpdml0eSBQb29sIHJvdXRlc1xucm91dGVyLmdldCgnL2FjdGl2aXR5LXBvb2wnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgYWN0aXZpdHkgcG9vbDonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG5yb3V0ZXIucG9zdCgnL2FjdGl2aXR5LXBvb2wnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXNdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBhY3Rpdml0eTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjdGl2aXR5X3Bvb2wgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIucHV0KCcvYWN0aXZpdHktcG9vbC86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSwgdG9vbHNBbmRSZXNvdXJjZXMgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgYWN0aXZpdHlfcG9vbCBTRVQgbmFtZSA9ID8sIHRvb2xzX2FuZF9yZXNvdXJjZXMgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIHRvb2xzQW5kUmVzb3VyY2VzLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQWN0aXZpdHkgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjdGl2aXR5X3Bvb2wgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIGFjdGl2aXR5OicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIuZGVsZXRlKCcvYWN0aXZpdHktcG9vbC86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGFjdGl2aXR5X3Bvb2wgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQWN0aXZpdHkgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdBY3Rpdml0eSBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vIERvbWFpbnMgcm91dGVzXG5yb3V0ZXIuZ2V0KCcvZG9tYWlucycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgT1JERVIgQlkgZGVzY3JpcHRpb24nLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZG9tYWluczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG5yb3V0ZXIucG9zdCgnL2RvbWFpbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgZGVzY3JpcHRpb24gfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBkb21haW5zIChkZXNjcmlwdGlvbikgVkFMVUVTICg/KScsXG4gICAgW2Rlc2NyaXB0aW9uXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgZG9tYWluOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIucHV0KCcvZG9tYWlucy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgZGVzY3JpcHRpb24gfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgZG9tYWlucyBTRVQgZGVzY3JpcHRpb24gPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW2Rlc2NyaXB0aW9uLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RvbWFpbiBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZG9tYWlucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgZG9tYWluOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIuZGVsZXRlKCcvZG9tYWlucy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGRvbWFpbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZG9tYWluOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RvbWFpbiBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RvbWFpbiBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vIERpdmlzaW9ucyByb3V0ZXNcbnJvdXRlci5nZXQoJy9kaXZpc2lvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgT1JERVIgQlkgbmFtZScsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBkaXZpc2lvbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxucm91dGVyLnBvc3QoJy9kaXZpc2lvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgbmFtZSwgaXNJbnRlcm5hbCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknLFxuICAgIFtuYW1lLCBpc0ludGVybmFsXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIGRpdmlzaW9uOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIucHV0KCcvZGl2aXNpb25zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lLCBpc0ludGVybmFsIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGRpdmlzaW9ucyBTRVQgbmFtZSA9ID8sIGlzX2ludGVybmFsID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCBpc0ludGVybmFsLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRpdmlzaW9uOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGl2aXNpb24gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgZGl2aXNpb246JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihyb3cpO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5kZWxldGUoJy9kaXZpc2lvbnMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgZGl2aXNpb246JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGl2aXNpb24gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEaXZpc2lvbiBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbi8vIERlcGFydG1lbnRzIHJvdXRlc1xucm91dGVyLmdldCgnL2RlcGFydG1lbnRzJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoXG4gICAgYFNFTEVDVCBkLiosIGRpdi5uYW1lIGFzIGRpdmlzaW9uTmFtZSBcbiAgICAgRlJPTSBkZXBhcnRtZW50cyBkIFxuICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGRpdiBPTiBkLmRpdmlzaW9uX2lkID0gZGl2LmlkIFxuICAgICBPUkRFUiBCWSBkLm5hbWVgLFxuICAgIChlcnIsIHJvd3MpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGVwYXJ0bWVudHM6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICByZXMuanNvbihyb3dzKTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLnBvc3QoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBuYW1lLCBkaXZpc2lvbklkIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgZGl2aXNpb25JZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldChcbiAgICAgICAgYFNFTEVDVCBkLiosIGRpdi5uYW1lIGFzIGRpdmlzaW9uTmFtZSBcbiAgICAgICAgIEZST00gZGVwYXJ0bWVudHMgZCBcbiAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZGl2IE9OIGQuZGl2aXNpb25faWQgPSBkaXYuaWQgXG4gICAgICAgICBXSEVSRSBkLmlkID0gP2AsXG4gICAgICAgIFt0aGlzLmxhc3RJRF0sXG4gICAgICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHJvdyk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5wdXQoJy9kZXBhcnRtZW50cy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSwgZGl2aXNpb25JZCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBkZXBhcnRtZW50cyBTRVQgbmFtZSA9ID8sIGRpdmlzaW9uX2lkID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCBkaXZpc2lvbklkLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEZXBhcnRtZW50IG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldChcbiAgICAgICAgYFNFTEVDVCBkLiosIGRpdi5uYW1lIGFzIGRpdmlzaW9uTmFtZSBcbiAgICAgICAgIEZST00gZGVwYXJ0bWVudHMgZCBcbiAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZGl2IE9OIGQuZGl2aXNpb25faWQgPSBkaXYuaWQgXG4gICAgICAgICBXSEVSRSBkLmlkID0gP2AsXG4gICAgICAgIFtpZF0sXG4gICAgICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgZGVwYXJ0bWVudDonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5qc29uKHJvdyk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5kZWxldGUoJy9kZXBhcnRtZW50cy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oJ0RFTEVURSBGUk9NIGRlcGFydG1lbnRzIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGVwYXJ0bWVudCBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0RlcGFydG1lbnQgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBQcm9jdXJlbWVudCBUZWFtcyByb3V0ZXNcbnJvdXRlci5nZXQoJy9wcm9jdXJlbWVudC10ZWFtcycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvY3VyZW1lbnQgdGVhbXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxucm91dGVyLnBvc3QoJy9wcm9jdXJlbWVudC10ZWFtcycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBuYW1lIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gcHJvY3VyZW1lbnRfdGVhbXMgKG5hbWUpIFZBTFVFUyAoPyknLFxuICAgIFtuYW1lXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIucHV0KCcvcHJvY3VyZW1lbnQtdGVhbXMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgcHJvY3VyZW1lbnRfdGVhbXMgU0VUIG5hbWUgPSA/IFdIRVJFIGlkID0gPycsXG4gICAgW25hbWUsIGlkXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2N1cmVtZW50IHRlYW0gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIHByb2N1cmVtZW50X3RlYW1zIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIuZGVsZXRlKCcvcHJvY3VyZW1lbnQtdGVhbXMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBwcm9jdXJlbWVudCB0ZWFtOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2N1cmVtZW50IHRlYW0gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdQcm9jdXJlbWVudCB0ZWFtIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgeyBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUgfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBHZXQgY29tcGxleGl0eSBlc3RpbWF0ZXNcbnJvdXRlci5nZXQoJy9jb21wbGV4aXR5LWVzdGltYXRlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGNvbXBsZXhpdHlfZXN0aW1hdGVzIE9SREVSIEJZIGlkIERFU0MgTElNSVQgMScsIChlcnIsIHJvdykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gUmV0dXJuIGRlZmF1bHQgdmFsdWVzIGlmIG5vIHJlY29yZCBleGlzdHNcbiAgICBjb25zdCBlc3RpbWF0ZXMgPSByb3cgfHwge1xuICAgICAgZXN0aW1hdGVMZXZlbDE6IDUsXG4gICAgICBlc3RpbWF0ZUxldmVsMjogMTAsXG4gICAgICBlc3RpbWF0ZUxldmVsMzogMjBcbiAgICB9O1xuICAgIFxuICAgIHJlcy5qc29uKHtcbiAgICAgIGVzdGltYXRlTGV2ZWwxOiBlc3RpbWF0ZXMuZXN0aW1hdGVfbGV2ZWxfMSxcbiAgICAgIGVzdGltYXRlTGV2ZWwyOiBlc3RpbWF0ZXMuZXN0aW1hdGVfbGV2ZWxfMixcbiAgICAgIGVzdGltYXRlTGV2ZWwzOiBlc3RpbWF0ZXMuZXN0aW1hdGVfbGV2ZWxfM1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBVcGRhdGUgY29tcGxleGl0eSBlc3RpbWF0ZXNcbnJvdXRlci5wdXQoJy9jb21wbGV4aXR5LWVzdGltYXRlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBlc3RpbWF0ZUxldmVsMSwgZXN0aW1hdGVMZXZlbDIsIGVzdGltYXRlTGV2ZWwzIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIEZpcnN0IGNoZWNrIGlmIGEgcmVjb3JkIGV4aXN0c1xuICBkYi5nZXQoJ1NFTEVDVCBpZCBGUk9NIGNvbXBsZXhpdHlfZXN0aW1hdGVzIExJTUlUIDEnLCAoZXJyLCByb3cpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjaGVja2luZyBjb21wbGV4aXR5IGVzdGltYXRlczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJvdykge1xuICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIHJlY29yZFxuICAgICAgZGIucnVuKFxuICAgICAgICAnVVBEQVRFIGNvbXBsZXhpdHlfZXN0aW1hdGVzIFNFVCBlc3RpbWF0ZV9sZXZlbF8xID0gPywgZXN0aW1hdGVfbGV2ZWxfMiA9ID8sIGVzdGltYXRlX2xldmVsXzMgPSA/LCB1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAgV0hFUkUgaWQgPSA/JyxcbiAgICAgICAgW2VzdGltYXRlTGV2ZWwxLCBlc3RpbWF0ZUxldmVsMiwgZXN0aW1hdGVMZXZlbDMsIHJvdy5pZF0sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnQ29tcGxleGl0eSBlc3RpbWF0ZXMgdXBkYXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnNlcnQgbmV3IHJlY29yZFxuICAgICAgZGIucnVuKFxuICAgICAgICAnSU5TRVJUIElOVE8gY29tcGxleGl0eV9lc3RpbWF0ZXMgKGVzdGltYXRlX2xldmVsXzEsIGVzdGltYXRlX2xldmVsXzIsIGVzdGltYXRlX2xldmVsXzMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICBbZXN0aW1hdGVMZXZlbDEsIGVzdGltYXRlTGV2ZWwyLCBlc3RpbWF0ZUxldmVsM10sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGNvbXBsZXhpdHkgZXN0aW1hdGVzOicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnQ29tcGxleGl0eSBlc3RpbWF0ZXMgY3JlYXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59KTtcblxuLy8gR2V0IGFjY2VwdGFuY2Ugb3B0aW9uc1xucm91dGVyLmdldCgnL2FjY2VwdGFuY2Utb3B0aW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBPUkRFUiBCWSB5ZWFyX2lkIERFU0MnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgYWNjZXB0YW5jZSBvcHRpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gVHJhbnNmb3JtIGRhdGEgdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgY29uc3Qgb3B0aW9ucyA9IHJvd3MubWFwKHJvdyA9PiAoe1xuICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgIHllYXJJZDogcm93LnllYXJfaWQsXG4gICAgICB1cGxvYWRDb2RlOiByb3cudXBsb2FkX2NvZGUsXG4gICAgICB1cGxvYWRDb2RlRGVzY3JpcHRpb246IHJvdy51cGxvYWRfY29kZV9kZXNjcmlwdGlvbixcbiAgICAgIGJyb2FkTWVhbmluZzogcm93LmJyb2FkX21lYW5pbmdcbiAgICB9KSk7XG4gICAgXG4gICAgcmVzLmpzb24ob3B0aW9ucyk7XG4gIH0pO1xufSk7XG5cbi8vIENyZWF0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLnBvc3QoJy9hY2NlcHRhbmNlLW9wdGlvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgeWVhcklkLCB1cGxvYWRDb2RlLCBicm9hZE1lYW5pbmcgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gTWFwIHVwbG9hZCBjb2RlcyB0byBkZXNjcmlwdGlvbnNcbiAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9ucyA9IHtcbiAgICAnUGxhbic6ICdcdTA1REVcdTA1RUFcdTA1RDVcdTA1REJcdTA1RTBcdTA1REYnLFxuICAgICdMYXRlJzogJ1x1MDVERVx1MDVEMFx1MDVEN1x1MDVFOCcsXG4gICAgJ0Jsb2NrJzogJ1x1MDVEN1x1MDVFMVx1MDVENVx1MDVERCcsXG4gICAgJ0ZpbmlzaCc6ICdcdTA1RDRcdTA1RTFcdTA1RUFcdTA1RDlcdTA1RDlcdTA1REQnXG4gIH07XG5cbiAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9uID0gdXBsb2FkQ29kZURlc2NyaXB0aW9uc1t1cGxvYWRDb2RlXTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGFjY2VwdGFuY2Vfb3B0aW9ucyAoeWVhcl9pZCwgdXBsb2FkX2NvZGUsIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLCBicm9hZF9tZWFuaW5nKSBWQUxVRVMgKD8sID8sID8sID8pJyxcbiAgICBbeWVhcklkLCB1cGxvYWRDb2RlLCB1cGxvYWRDb2RlRGVzY3JpcHRpb24sIGJyb2FkTWVhbmluZ10sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGFjY2VwdGFuY2Ugb3B0aW9uOicsIGVycik7XG4gICAgICAgIGlmIChlcnIubWVzc2FnZS5pbmNsdWRlcygnVU5JUVVFIGNvbnN0cmFpbnQgZmFpbGVkJykpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0FjY2VwdGFuY2Ugb3B0aW9uIGZvciB0aGlzIHllYXIgYWxyZWFkeSBleGlzdHMnIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBvcHRpb24gPSB7XG4gICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICB5ZWFySWQ6IHJvdy55ZWFyX2lkLFxuICAgICAgICAgIHVwbG9hZENvZGU6IHJvdy51cGxvYWRfY29kZSxcbiAgICAgICAgICB1cGxvYWRDb2RlRGVzY3JpcHRpb246IHJvdy51cGxvYWRfY29kZV9kZXNjcmlwdGlvbixcbiAgICAgICAgICBicm9hZE1lYW5pbmc6IHJvdy5icm9hZF9tZWFuaW5nXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihvcHRpb24pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbi8vIFVwZGF0ZSBhY2NlcHRhbmNlIG9wdGlvblxucm91dGVyLnB1dCgnL2FjY2VwdGFuY2Utb3B0aW9ucy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgeWVhcklkLCB1cGxvYWRDb2RlLCBicm9hZE1lYW5pbmcgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gTWFwIHVwbG9hZCBjb2RlcyB0byBkZXNjcmlwdGlvbnNcbiAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9ucyA9IHtcbiAgICAnUGxhbic6ICdcdTA1REVcdTA1RUFcdTA1RDVcdTA1REJcdTA1RTBcdTA1REYnLFxuICAgICdMYXRlJzogJ1x1MDVERVx1MDVEMFx1MDVEN1x1MDVFOCcsXG4gICAgJ0Jsb2NrJzogJ1x1MDVEN1x1MDVFMVx1MDVENVx1MDVERCcsXG4gICAgJ0ZpbmlzaCc6ICdcdTA1RDRcdTA1RTFcdTA1RUFcdTA1RDlcdTA1RDlcdTA1REQnXG4gIH07XG5cbiAgY29uc3QgdXBsb2FkQ29kZURlc2NyaXB0aW9uID0gdXBsb2FkQ29kZURlc2NyaXB0aW9uc1t1cGxvYWRDb2RlXTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBhY2NlcHRhbmNlX29wdGlvbnMgU0VUIHllYXJfaWQgPSA/LCB1cGxvYWRfY29kZSA9ID8sIHVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uID0gPywgYnJvYWRfbWVhbmluZyA9ID8sIHVwZGF0ZWRfYXQgPSBDVVJSRU5UX1RJTUVTVEFNUCBXSEVSRSBpZCA9ID8nLFxuICAgIFt5ZWFySWQsIHVwbG9hZENvZGUsIHVwbG9hZENvZGVEZXNjcmlwdGlvbiwgYnJvYWRNZWFuaW5nLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGFjY2VwdGFuY2Ugb3B0aW9uOicsIGVycik7XG4gICAgICAgIGlmIChlcnIubWVzc2FnZS5pbmNsdWRlcygnVU5JUVVFIGNvbnN0cmFpbnQgZmFpbGVkJykpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0FjY2VwdGFuY2Ugb3B0aW9uIGZvciB0aGlzIHllYXIgYWxyZWFkeSBleGlzdHMnIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQWNjZXB0YW5jZSBvcHRpb24gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3Qgb3B0aW9uID0ge1xuICAgICAgICAgIGlkOiByb3cuaWQsXG4gICAgICAgICAgeWVhcklkOiByb3cueWVhcl9pZCxcbiAgICAgICAgICB1cGxvYWRDb2RlOiByb3cudXBsb2FkX2NvZGUsXG4gICAgICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiByb3cudXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgYnJvYWRNZWFuaW5nOiByb3cuYnJvYWRfbWVhbmluZ1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgcmVzLmpzb24ob3B0aW9uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBEZWxldGUgYWNjZXB0YW5jZSBvcHRpb25cbnJvdXRlci5kZWxldGUoJy9hY2NlcHRhbmNlLW9wdGlvbnMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQWNjZXB0YW5jZSBvcHRpb24gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdBY2NlcHRhbmNlIG9wdGlvbiBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvcHJvZ3JhbXMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wcm9ncmFtcy5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gR2V0IGFsbCBwcm9ncmFtc1xucm91dGVyLmdldCgnLycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKFxuICAgIGBTRUxFQ1QgcC4qLCBcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLCBcbiAgICAgICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWUsXG4gICAgICAgICAgICBkb20uZGVzY3JpcHRpb24gYXMgZG9tYWluX25hbWVcbiAgICAgRlJPTSBwcm9ncmFtcyBwIFxuICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gcC5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHAuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgIExFRlQgSk9JTiBkb21haW5zIGRvbSBPTiBwLmRvbWFpbl9pZCA9IGRvbS5pZFxuICAgICBPUkRFUiBCWSBwLmNyZWF0ZWRfYXQgREVTQ2AsXG4gICAgKGVyciwgcm93cykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBwcm9ncmFtczonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVHJhbnNmb3JtIGRhdGEgdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgICBjb25zdCBwcm9ncmFtcyA9IHJvd3MubWFwKHJvdyA9PiAoe1xuICAgICAgICB0YXNrSWQ6IHJvdy50YXNrX2lkLFxuICAgICAgICB3b3JrWWVhcjogcm93LndvcmtfeWVhcixcbiAgICAgICAgcmVxdWlyZWRRdWFydGVyOiByb3cucmVxdWlyZWRfcXVhcnRlciA/IG5ldyBEYXRlKHJvdy5yZXF1aXJlZF9xdWFydGVyKSA6IG51bGwsXG4gICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiByb3cuZGVzY3JpcHRpb24sXG4gICAgICAgIHJlcXVlc3RlcklkOiByb3cucmVxdWVzdGVyX2lkLFxuICAgICAgICByZXF1ZXN0ZXJOYW1lOiByb3cucmVxdWVzdGVyX25hbWUsXG4gICAgICAgIGRpdmlzaW9uSWQ6IHJvdy5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25fbmFtZSB8fCByb3cuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50X25hbWUgfHwgcm93LmRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgZG9tYWluSWQ6IHJvdy5kb21haW5faWQsXG4gICAgICAgIGRvbWFpbk5hbWU6IHJvdy5kb21haW5fbmFtZSB8fCByb3cuZG9tYWluX25hbWUsXG4gICAgICAgIGVzdGltYXRlZEFtb3VudDogcm93LmVzdGltYXRlZF9hbW91bnQsXG4gICAgICAgIGN1cnJlbmN5OiByb3cuY3VycmVuY3ksXG4gICAgICAgIHN1cHBsaWVyTGlzdDogcm93LnN1cHBsaWVyX2xpc3QsXG4gICAgICAgIGp1c3RpZmljYXRpb246IHJvdy5qdXN0aWZpY2F0aW9uLFxuICAgICAgICBwbGFubmluZ1NvdXJjZTogcm93LnBsYW5uaW5nX3NvdXJjZSxcbiAgICAgICAgY29tcGxleGl0eTogcm93LmNvbXBsZXhpdHksXG4gICAgICAgIGVuZ2FnZW1lbnRUeXBlSWQ6IHJvdy5lbmdhZ2VtZW50X3R5cGVfaWQsXG4gICAgICAgIGVuZ2FnZW1lbnRUeXBlTmFtZTogcm93LmVuZ2FnZW1lbnRfdHlwZV9uYW1lLFxuICAgICAgICBzdGF0dXM6IHJvdy5zdGF0dXMsXG4gICAgICAgIGFzc2lnbmVkT2ZmaWNlcklkOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9pZCxcbiAgICAgICAgYXNzaWduZWRPZmZpY2VyTmFtZTogcm93LmFzc2lnbmVkX29mZmljZXJfbmFtZSxcbiAgICAgICAgdGVhbUlkOiByb3cudGVhbV9pZCxcbiAgICAgICAgdGVhbU5hbWU6IHJvdy50ZWFtX25hbWUsXG4gICAgICAgIHN0YXJ0RGF0ZTogcm93LnN0YXJ0X2RhdGUgPyBuZXcgRGF0ZShyb3cuc3RhcnRfZGF0ZSkgOiBudWxsLFxuICAgICAgICBwbGFubmluZ05vdGVzOiByb3cucGxhbm5pbmdfbm90ZXMsXG4gICAgICAgIG9mZmljZXJOb3Rlczogcm93Lm9mZmljZXJfbm90ZXMsXG4gICAgICAgIGxhc3RVcGRhdGU6IG5ldyBEYXRlKHJvdy51cGRhdGVkX2F0KSxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZShyb3cuY3JlYXRlZF9hdClcbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgcmVzLmpzb24ocHJvZ3JhbXMpO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBHZXQgcHJvZ3JhbSBieSBJRFxucm91dGVyLmdldCgnLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuZ2V0KFxuICAgIGBTRUxFQ1QgcC4qLCBcbiAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLCBcbiAgICAgICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWUsXG4gICAgICAgICAgICBkb20uZGVzY3JpcHRpb24gYXMgZG9tYWluX25hbWVcbiAgICAgRlJPTSBwcm9ncmFtcyBwIFxuICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gcC5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHAuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgIExFRlQgSk9JTiBkb21haW5zIGRvbSBPTiBwLmRvbWFpbl9pZCA9IGRvbS5pZFxuICAgICBXSEVSRSBwLnRhc2tfaWQgPSA/YCxcbiAgICBbaWRdLFxuICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBwcm9ncmFtOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXJvdykge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2dyYW0gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVHJhbnNmb3JtIGRhdGEgdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgICBjb25zdCBwcm9ncmFtID0ge1xuICAgICAgICB0YXNrSWQ6IHJvdy50YXNrX2lkLFxuICAgICAgICB3b3JrWWVhcjogcm93LndvcmtfeWVhcixcbiAgICAgICAgcmVxdWlyZWRRdWFydGVyOiByb3cucmVxdWlyZWRfcXVhcnRlciA/IG5ldyBEYXRlKHJvdy5yZXF1aXJlZF9xdWFydGVyKSA6IG51bGwsXG4gICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiByb3cuZGVzY3JpcHRpb24sXG4gICAgICAgIHJlcXVlc3RlcklkOiByb3cucmVxdWVzdGVyX2lkLFxuICAgICAgICByZXF1ZXN0ZXJOYW1lOiByb3cucmVxdWVzdGVyX25hbWUsXG4gICAgICAgIGRpdmlzaW9uSWQ6IHJvdy5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25fbmFtZSB8fCByb3cuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50X25hbWUgfHwgcm93LmRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgZG9tYWluSWQ6IHJvdy5kb21haW5faWQsXG4gICAgICAgIGRvbWFpbk5hbWU6IHJvdy5kb21haW5fbmFtZSB8fCByb3cuZG9tYWluX25hbWUsXG4gICAgICAgIGVzdGltYXRlZEFtb3VudDogcm93LmVzdGltYXRlZF9hbW91bnQsXG4gICAgICAgIGN1cnJlbmN5OiByb3cuY3VycmVuY3ksXG4gICAgICAgIHN1cHBsaWVyTGlzdDogcm93LnN1cHBsaWVyX2xpc3QsXG4gICAgICAgIGp1c3RpZmljYXRpb246IHJvdy5qdXN0aWZpY2F0aW9uLFxuICAgICAgICBwbGFubmluZ1NvdXJjZTogcm93LnBsYW5uaW5nX3NvdXJjZSxcbiAgICAgICAgY29tcGxleGl0eTogcm93LmNvbXBsZXhpdHksXG4gICAgICAgIGVuZ2FnZW1lbnRUeXBlSWQ6IHJvdy5lbmdhZ2VtZW50X3R5cGVfaWQsXG4gICAgICAgIGVuZ2FnZW1lbnRUeXBlTmFtZTogcm93LmVuZ2FnZW1lbnRfdHlwZV9uYW1lLFxuICAgICAgICBzdGF0dXM6IHJvdy5zdGF0dXMsXG4gICAgICAgIGFzc2lnbmVkT2ZmaWNlcklkOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9pZCxcbiAgICAgICAgYXNzaWduZWRPZmZpY2VyTmFtZTogcm93LmFzc2lnbmVkX29mZmljZXJfbmFtZSxcbiAgICAgICAgdGVhbUlkOiByb3cudGVhbV9pZCxcbiAgICAgICAgdGVhbU5hbWU6IHJvdy50ZWFtX25hbWUsXG4gICAgICAgIHN0YXJ0RGF0ZTogcm93LnN0YXJ0X2RhdGUgPyBuZXcgRGF0ZShyb3cuc3RhcnRfZGF0ZSkgOiBudWxsLFxuICAgICAgICBwbGFubmluZ05vdGVzOiByb3cucGxhbm5pbmdfbm90ZXMsXG4gICAgICAgIG9mZmljZXJOb3Rlczogcm93Lm9mZmljZXJfbm90ZXMsXG4gICAgICAgIGxhc3RVcGRhdGU6IG5ldyBEYXRlKHJvdy51cGRhdGVkX2F0KSxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZShyb3cuY3JlYXRlZF9hdClcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHByb2dyYW0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBDcmVhdGUgbmV3IHByb2dyYW1cbnJvdXRlci5wb3N0KCcvJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFsxLCA0XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7XG4gICAgd29ya1llYXIsXG4gICAgcmVxdWlyZWRRdWFydGVyLFxuICAgIHRpdGxlLFxuICAgIGRlc2NyaXB0aW9uLFxuICAgIHJlcXVlc3Rlck5hbWUsXG4gICAgZGl2aXNpb25OYW1lLFxuICAgIGRlcGFydG1lbnROYW1lLFxuICAgIGRvbWFpbk5hbWUsXG4gICAgZXN0aW1hdGVkQW1vdW50LFxuICAgIGN1cnJlbmN5LFxuICAgIHN1cHBsaWVyTGlzdCxcbiAgICBqdXN0aWZpY2F0aW9uLFxuICAgIHBsYW5uaW5nU291cmNlLFxuICAgIGNvbXBsZXhpdHlcbiAgfSA9IHJlcS5ib2R5O1xuXG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBHZW5lcmF0ZSBuZXcgdGFzayBJRFxuICBkYi5nZXQoJ1NFTEVDVCBNQVgodGFza19pZCkgYXMgbWF4SWQgRlJPTSBwcm9ncmFtcycsIChlcnIsIHJvdykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgbWF4IHRhc2sgSUQ6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld1Rhc2tJZCA9IChyb3cubWF4SWQgfHwgMCkgKyAxO1xuXG4gICAgLy8gQ29udmVydCB1bmRlZmluZWQgdmFsdWVzIHRvIG51bGwgZm9yIFNRTGl0ZSBjb21wYXRpYmlsaXR5XG4gICAgY29uc3Qgc2FmZUVzdGltYXRlZEFtb3VudCA9IGVzdGltYXRlZEFtb3VudCAhPT0gdW5kZWZpbmVkID8gZXN0aW1hdGVkQW1vdW50IDogbnVsbDtcbiAgICBjb25zdCBzYWZlQ3VycmVuY3kgPSBjdXJyZW5jeSAhPT0gdW5kZWZpbmVkID8gY3VycmVuY3kgOiBudWxsO1xuICAgIGNvbnN0IHNhZmVDb21wbGV4aXR5ID0gY29tcGxleGl0eSAhPT0gdW5kZWZpbmVkID8gY29tcGxleGl0eSA6IG51bGw7XG5cbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIElOVE8gcHJvZ3JhbXMgXG4gICAgICAgKHRhc2tfaWQsIHdvcmtfeWVhciwgcmVxdWlyZWRfcXVhcnRlciwgdGl0bGUsIGRlc2NyaXB0aW9uLCByZXF1ZXN0ZXJfbmFtZSwgXG4gICAgICAgIGRpdmlzaW9uX25hbWUsIGRlcGFydG1lbnRfbmFtZSwgZG9tYWluX25hbWUsIGVzdGltYXRlZF9hbW91bnQsIGN1cnJlbmN5LCBcbiAgICAgICAgc3VwcGxpZXJfbGlzdCwganVzdGlmaWNhdGlvbiwgcGxhbm5pbmdfc291cmNlLCBjb21wbGV4aXR5LCBzdGF0dXMpIFxuICAgICAgIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPywgPywgPywgPywgPywgPywgPywgPywgPywgPylgLFxuICAgICAgW25ld1Rhc2tJZCwgd29ya1llYXIsIHJlcXVpcmVkUXVhcnRlciwgdGl0bGUsIGRlc2NyaXB0aW9uLCByZXF1ZXN0ZXJOYW1lLFxuICAgICAgIGRpdmlzaW9uTmFtZSwgZGVwYXJ0bWVudE5hbWUsIGRvbWFpbk5hbWUsIHNhZmVFc3RpbWF0ZWRBbW91bnQsIHNhZmVDdXJyZW5jeSxcbiAgICAgICBzdXBwbGllckxpc3QsIGp1c3RpZmljYXRpb24sIHBsYW5uaW5nU291cmNlLCBzYWZlQ29tcGxleGl0eSwgJ09wZW4nXSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgcHJvZ3JhbTonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGNyZWF0ZWQgcHJvZ3JhbVxuICAgICAgICBkYi5nZXQoXG4gICAgICAgICAgYFNFTEVDVCBwLiosIFxuICAgICAgICAgICAgICAgICAgZC5uYW1lIGFzIGRpdmlzaW9uX25hbWUsIFxuICAgICAgICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgIGRvbS5kZXNjcmlwdGlvbiBhcyBkb21haW5fbmFtZVxuICAgICAgICAgICBGUk9NIHByb2dyYW1zIHAgXG4gICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiBwLmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gcC5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgICAgTEVGVCBKT0lOIGRvbWFpbnMgZG9tIE9OIHAuZG9tYWluX2lkID0gZG9tLmlkXG4gICAgICAgICAgIFdIRVJFIHAudGFza19pZCA9ID9gLFxuICAgICAgICAgIFtuZXdUYXNrSWRdLFxuICAgICAgICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIHByb2dyYW06JywgZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgICAgIHRhc2tJZDogcm93LnRhc2tfaWQsXG4gICAgICAgICAgICAgIHdvcmtZZWFyOiByb3cud29ya195ZWFyLFxuICAgICAgICAgICAgICByZXF1aXJlZFF1YXJ0ZXI6IHJvdy5yZXF1aXJlZF9xdWFydGVyID8gbmV3IERhdGUocm93LnJlcXVpcmVkX3F1YXJ0ZXIpIDogbnVsbCxcbiAgICAgICAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHJvdy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgcmVxdWVzdGVySWQ6IHJvdy5yZXF1ZXN0ZXJfaWQsXG4gICAgICAgICAgICAgIHJlcXVlc3Rlck5hbWU6IHJvdy5yZXF1ZXN0ZXJfbmFtZSxcbiAgICAgICAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgICBkaXZpc2lvbk5hbWU6IHJvdy5kaXZpc2lvbl9uYW1lIHx8IHJvdy5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnRfbmFtZSB8fCByb3cuZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICAgICAgICBkb21haW5JZDogcm93LmRvbWFpbl9pZCxcbiAgICAgICAgICAgICAgZG9tYWluTmFtZTogcm93LmRvbWFpbl9uYW1lIHx8IHJvdy5kb21haW5fbmFtZSxcbiAgICAgICAgICAgICAgZXN0aW1hdGVkQW1vdW50OiByb3cuZXN0aW1hdGVkX2Ftb3VudCxcbiAgICAgICAgICAgICAgY3VycmVuY3k6IHJvdy5jdXJyZW5jeSxcbiAgICAgICAgICAgICAgc3VwcGxpZXJMaXN0OiByb3cuc3VwcGxpZXJfbGlzdCxcbiAgICAgICAgICAgICAganVzdGlmaWNhdGlvbjogcm93Lmp1c3RpZmljYXRpb24sXG4gICAgICAgICAgICAgIHBsYW5uaW5nU291cmNlOiByb3cucGxhbm5pbmdfc291cmNlLFxuICAgICAgICAgICAgICBjb21wbGV4aXR5OiByb3cuY29tcGxleGl0eSxcbiAgICAgICAgICAgICAgZW5nYWdlbWVudFR5cGVJZDogcm93LmVuZ2FnZW1lbnRfdHlwZV9pZCxcbiAgICAgICAgICAgICAgZW5nYWdlbWVudFR5cGVOYW1lOiByb3cuZW5nYWdlbWVudF90eXBlX25hbWUsXG4gICAgICAgICAgICAgIHN0YXR1czogcm93LnN0YXR1cyxcbiAgICAgICAgICAgICAgYXNzaWduZWRPZmZpY2VySWQ6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX2lkLFxuICAgICAgICAgICAgICBhc3NpZ25lZE9mZmljZXJOYW1lOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9uYW1lLFxuICAgICAgICAgICAgICB0ZWFtSWQ6IHJvdy50ZWFtX2lkLFxuICAgICAgICAgICAgICB0ZWFtTmFtZTogcm93LnRlYW1fbmFtZSxcbiAgICAgICAgICAgICAgc3RhcnREYXRlOiByb3cuc3RhcnRfZGF0ZSA/IG5ldyBEYXRlKHJvdy5zdGFydF9kYXRlKSA6IG51bGwsXG4gICAgICAgICAgICAgIHBsYW5uaW5nTm90ZXM6IHJvdy5wbGFubmluZ19ub3RlcyxcbiAgICAgICAgICAgICAgb2ZmaWNlck5vdGVzOiByb3cub2ZmaWNlcl9ub3RlcyxcbiAgICAgICAgICAgICAgbGFzdFVwZGF0ZTogbmV3IERhdGUocm93LnVwZGF0ZWRfYXQpLFxuICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKHJvdy5jcmVhdGVkX2F0KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocHJvZ3JhbSk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufSk7XG5cbi8vIFVwZGF0ZSBwcm9ncmFtXG5yb3V0ZXIucHV0KCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB1cGRhdGVEYXRhID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBCdWlsZCBkeW5hbWljIHVwZGF0ZSBxdWVyeVxuICBjb25zdCBmaWVsZHMgPSBbXTtcbiAgY29uc3QgdmFsdWVzID0gW107XG5cbiAgLy8gTWFwIGZyb250ZW5kIGZpZWxkIG5hbWVzIHRvIGRhdGFiYXNlIGNvbHVtbiBuYW1lc1xuICBjb25zdCBmaWVsZE1hcHBpbmcgPSB7XG4gICAgd29ya1llYXI6ICd3b3JrX3llYXInLFxuICAgIHJlcXVpcmVkUXVhcnRlcjogJ3JlcXVpcmVkX3F1YXJ0ZXInLFxuICAgIHRpdGxlOiAndGl0bGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnZGVzY3JpcHRpb24nLFxuICAgIHJlcXVlc3Rlck5hbWU6ICdyZXF1ZXN0ZXJfbmFtZScsXG4gICAgZGl2aXNpb25OYW1lOiAnZGl2aXNpb25fbmFtZScsXG4gICAgZGVwYXJ0bWVudE5hbWU6ICdkZXBhcnRtZW50X25hbWUnLFxuICAgIGRvbWFpbk5hbWU6ICdkb21haW5fbmFtZScsXG4gICAgZXN0aW1hdGVkQW1vdW50OiAnZXN0aW1hdGVkX2Ftb3VudCcsXG4gICAgY3VycmVuY3k6ICdjdXJyZW5jeScsXG4gICAgc3VwcGxpZXJMaXN0OiAnc3VwcGxpZXJfbGlzdCcsXG4gICAganVzdGlmaWNhdGlvbjogJ2p1c3RpZmljYXRpb24nLFxuICAgIHBsYW5uaW5nU291cmNlOiAncGxhbm5pbmdfc291cmNlJyxcbiAgICBjb21wbGV4aXR5OiAnY29tcGxleGl0eScsXG4gICAgZW5nYWdlbWVudFR5cGVJZDogJ2VuZ2FnZW1lbnRfdHlwZV9pZCcsXG4gICAgZW5nYWdlbWVudFR5cGVOYW1lOiAnZW5nYWdlbWVudF90eXBlX25hbWUnLFxuICAgIHN0YXR1czogJ3N0YXR1cycsXG4gICAgYXNzaWduZWRPZmZpY2VySWQ6ICdhc3NpZ25lZF9vZmZpY2VyX2lkJyxcbiAgICBhc3NpZ25lZE9mZmljZXJOYW1lOiAnYXNzaWduZWRfb2ZmaWNlcl9uYW1lJyxcbiAgICB0ZWFtSWQ6ICd0ZWFtX2lkJyxcbiAgICB0ZWFtTmFtZTogJ3RlYW1fbmFtZScsXG4gICAgc3RhcnREYXRlOiAnc3RhcnRfZGF0ZScsXG4gICAgcGxhbm5pbmdOb3RlczogJ3BsYW5uaW5nX25vdGVzJyxcbiAgICBvZmZpY2VyTm90ZXM6ICdvZmZpY2VyX25vdGVzJ1xuICB9O1xuXG4gIE9iamVjdC5rZXlzKHVwZGF0ZURhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoZmllbGRNYXBwaW5nW2tleV0pIHtcbiAgICAgIGZpZWxkcy5wdXNoKGAke2ZpZWxkTWFwcGluZ1trZXldfSA9ID9gKTtcbiAgICAgIC8vIENvbnZlcnQgdW5kZWZpbmVkIHRvIG51bGwgZm9yIFNRTGl0ZSBjb21wYXRpYmlsaXR5XG4gICAgICBjb25zdCB2YWx1ZSA9IHVwZGF0ZURhdGFba2V5XSAhPT0gdW5kZWZpbmVkID8gdXBkYXRlRGF0YVtrZXldIDogbnVsbDtcbiAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChmaWVsZHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdObyB2YWxpZCBmaWVsZHMgdG8gdXBkYXRlJyB9KTtcbiAgfVxuXG4gIC8vIEFkZCB1cGRhdGVkX2F0XG4gIGZpZWxkcy5wdXNoKCd1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAnKTtcbiAgdmFsdWVzLnB1c2goaWQpO1xuXG4gIGNvbnN0IHF1ZXJ5ID0gYFVQREFURSBwcm9ncmFtcyBTRVQgJHtmaWVsZHMuam9pbignLCAnKX0gV0hFUkUgdGFza19pZCA9ID9gO1xuXG4gIGRiLnJ1bihxdWVyeSwgdmFsdWVzLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBwcm9ncmFtOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2dyYW0gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICAvLyBGZXRjaCB1cGRhdGVkIHByb2dyYW1cbiAgICBkYi5nZXQoXG4gICAgICBgU0VMRUNUIHAuKiwgXG4gICAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLCBcbiAgICAgICAgICAgICAgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgICAgICAgZG9tLmRlc2NyaXB0aW9uIGFzIGRvbWFpbl9uYW1lXG4gICAgICAgRlJPTSBwcm9ncmFtcyBwIFxuICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiBwLmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiBwLmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICAgIExFRlQgSk9JTiBkb21haW5zIGRvbSBPTiBwLmRvbWFpbl9pZCA9IGRvbS5pZFxuICAgICAgIFdIRVJFIHAudGFza19pZCA9ID9gLFxuICAgICAgW2lkXSxcbiAgICAgIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBwcm9ncmFtOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9ncmFtID0ge1xuICAgICAgICAgIHRhc2tJZDogcm93LnRhc2tfaWQsXG4gICAgICAgICAgd29ya1llYXI6IHJvdy53b3JrX3llYXIsXG4gICAgICAgICAgcmVxdWlyZWRRdWFydGVyOiByb3cucmVxdWlyZWRfcXVhcnRlciA/IG5ldyBEYXRlKHJvdy5yZXF1aXJlZF9xdWFydGVyKSA6IG51bGwsXG4gICAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogcm93LmRlc2NyaXB0aW9uLFxuICAgICAgICAgIHJlcXVlc3RlcklkOiByb3cucmVxdWVzdGVyX2lkLFxuICAgICAgICAgIHJlcXVlc3Rlck5hbWU6IHJvdy5yZXF1ZXN0ZXJfbmFtZSxcbiAgICAgICAgICBkaXZpc2lvbklkOiByb3cuZGl2aXNpb25faWQsXG4gICAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25fbmFtZSB8fCByb3cuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICAgIGRlcGFydG1lbnROYW1lOiByb3cuZGVwYXJ0bWVudF9uYW1lIHx8IHJvdy5kZXBhcnRtZW50X25hbWUsXG4gICAgICAgICAgZG9tYWluSWQ6IHJvdy5kb21haW5faWQsXG4gICAgICAgICAgZG9tYWluTmFtZTogcm93LmRvbWFpbl9uYW1lIHx8IHJvdy5kb21haW5fbmFtZSxcbiAgICAgICAgICBlc3RpbWF0ZWRBbW91bnQ6IHJvdy5lc3RpbWF0ZWRfYW1vdW50LFxuICAgICAgICAgIGN1cnJlbmN5OiByb3cuY3VycmVuY3ksXG4gICAgICAgICAgc3VwcGxpZXJMaXN0OiByb3cuc3VwcGxpZXJfbGlzdCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uOiByb3cuanVzdGlmaWNhdGlvbixcbiAgICAgICAgICBwbGFubmluZ1NvdXJjZTogcm93LnBsYW5uaW5nX3NvdXJjZSxcbiAgICAgICAgICBjb21wbGV4aXR5OiByb3cuY29tcGxleGl0eSxcbiAgICAgICAgICBlbmdhZ2VtZW50VHlwZUlkOiByb3cuZW5nYWdlbWVudF90eXBlX2lkLFxuICAgICAgICAgIGVuZ2FnZW1lbnRUeXBlTmFtZTogcm93LmVuZ2FnZW1lbnRfdHlwZV9uYW1lLFxuICAgICAgICAgIHN0YXR1czogcm93LnN0YXR1cyxcbiAgICAgICAgICBhc3NpZ25lZE9mZmljZXJJZDogcm93LmFzc2lnbmVkX29mZmljZXJfaWQsXG4gICAgICAgICAgYXNzaWduZWRPZmZpY2VyTmFtZTogcm93LmFzc2lnbmVkX29mZmljZXJfbmFtZSxcbiAgICAgICAgICB0ZWFtSWQ6IHJvdy50ZWFtX2lkLFxuICAgICAgICAgIHRlYW1OYW1lOiByb3cudGVhbV9uYW1lLFxuICAgICAgICAgIHN0YXJ0RGF0ZTogcm93LnN0YXJ0X2RhdGUgPyBuZXcgRGF0ZShyb3cuc3RhcnRfZGF0ZSkgOiBudWxsLFxuICAgICAgICAgIHBsYW5uaW5nTm90ZXM6IHJvdy5wbGFubmluZ19ub3RlcyxcbiAgICAgICAgICBvZmZpY2VyTm90ZXM6IHJvdy5vZmZpY2VyX25vdGVzLFxuICAgICAgICAgIGxhc3RVcGRhdGU6IG5ldyBEYXRlKHJvdy51cGRhdGVkX2F0KSxcbiAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKHJvdy5jcmVhdGVkX2F0KVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlcy5qc29uKHByb2dyYW0pO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufSk7XG5cbi8vIERlbGV0ZSBwcm9ncmFtXG5yb3V0ZXIuZGVsZXRlKCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBwcm9ncmFtcyBXSEVSRSB0YXNrX2lkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHByb2dyYW06JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnUHJvZ3JhbSBub3QgZm91bmQnIH0pO1xuICAgIH1cblxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ1Byb2dyYW0gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9leHByZXNzLWFwcC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0IG1vcmdhbiBmcm9tICdtb3JnYW4nO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcbmltcG9ydCByYXRlTGltaXQgZnJvbSAnZXhwcmVzcy1yYXRlLWxpbWl0JztcbmltcG9ydCB7IGluaXRpYWxpemVEYXRhYmFzZSB9IGZyb20gJy4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCBhdXRoUm91dGVzIGZyb20gJy4vcm91dGVzL2F1dGguanMnO1xuaW1wb3J0IHdvcmtlcnNSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvd29ya2Vycy5qcyc7XG5pbXBvcnQgc3lzdGVtUm91dGVzIGZyb20gJy4vcm91dGVzL3N5c3RlbS5qcyc7XG5pbXBvcnQgcGxhbm5pbmdSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMvcGxhbm5pbmcuanMnO1xuaW1wb3J0IHByb2dyYW1zUm91dGVzIGZyb20gJy4vcm91dGVzL3Byb2dyYW1zLmpzJztcblxuLy8gRW52aXJvbm1lbnQgdmFyaWFibGVzXG5wcm9jZXNzLmVudi5KV1RfU0VDUkVUID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAneW91ci1zdXBlci1zZWNyZXQtand0LWtleS1jaGFuZ2UtdGhpcy1pbi1wcm9kdWN0aW9uJztcbnByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOID0gcHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gfHwgJzI0aCc7XG5wcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTID0gcHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyB8fCAnMTInO1xuXG5sZXQgZXhwcmVzc0FwcCA9IG51bGw7XG5sZXQgaXNBcHBJbml0aWFsaXplZCA9IGZhbHNlO1xuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeHByZXNzQXBwKCkge1xuICBpZiAoZXhwcmVzc0FwcCkge1xuICAgIHJldHVybiBleHByZXNzQXBwO1xuICB9XG5cbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4gIC8vIFNlY3VyaXR5IG1pZGRsZXdhcmVcbiAgYXBwLnVzZShoZWxtZXQoe1xuICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeTogZmFsc2UsIC8vIERpc2FibGUgQ1NQIGZvciBkZXZlbG9wbWVudFxuICB9KSk7XG4gIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG5cbiAgLy8gUmF0ZSBsaW1pdGluZ1xuICBjb25zdCBsaW1pdGVyID0gcmF0ZUxpbWl0KHtcbiAgICB3aW5kb3dNczogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcbiAgICBtYXg6IDEwMDAsIC8vIEluY3JlYXNlZCBsaW1pdCBmb3IgZGV2ZWxvcG1lbnRcbiAgICBtZXNzYWdlOiB7IGVycm9yOiAnVG9vIG1hbnkgcmVxdWVzdHMgZnJvbSB0aGlzIElQLCBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicgfVxuICB9KTtcbiAgYXBwLnVzZShsaW1pdGVyKTtcblxuICAvLyBDT1JTIGNvbmZpZ3VyYXRpb25cbiAgYXBwLnVzZShjb3JzKHtcbiAgICBvcmlnaW46IHRydWUsIC8vIEFsbG93IGFsbCBvcmlnaW5zIGluIGRldmVsb3BtZW50XG4gICAgY3JlZGVudGlhbHM6IHRydWUsXG4gICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICBhbGxvd2VkSGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbiddXG4gIH0pKTtcblxuICAvLyBCb2R5IHBhcnNpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKGV4cHJlc3MuanNvbih7IGxpbWl0OiAnMTBtYicgfSkpO1xuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcblxuICAvLyBMb2dnaW5nXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2RldicpKTtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgZGF0YWJhc2Ugb25seSBvbmNlXG4gIGlmICghaXNBcHBJbml0aWFsaXplZCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2UgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICBcbiAgICAgIC8vIFNlZWQgZGF0YWJhc2VcbiAgICAgIGNvbnN0IHsgc2VlZERhdGFiYXNlIH0gPSBhd2FpdCBpbXBvcnQoJy4vc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMnKTtcbiAgICAgIGF3YWl0IHNlZWREYXRhYmFzZSgpO1xuICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBEYXRhYmFzZSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICBcbiAgICAgIGlzQXBwSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRGF0YWJhc2UgaW5pdGlhbGl6YXRpb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJvdXRlc1xuICBhcHAudXNlKCcvYXV0aCcsIGF1dGhSb3V0ZXMpO1xuICBhcHAudXNlKCcvd29ya2VycycsIHdvcmtlcnNSb3V0ZXMpO1xuICBhcHAudXNlKCcvc3lzdGVtJywgc3lzdGVtUm91dGVzKTtcbiAgYXBwLnVzZSgnL3BsYW5uaW5nJywgcGxhbm5pbmdSb3V0ZXMpO1xuICBhcHAudXNlKCcvcHJvZ3JhbXMnLCBwcm9ncmFtc1JvdXRlcyk7XG5cbiAgLy8gSGVhbHRoIGNoZWNrIGVuZHBvaW50XG4gIGFwcC5nZXQoJy9oZWFsdGgnLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuanNvbih7IHN0YXR1czogJ09LJywgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSk7XG4gIH0pO1xuXG4gIC8vIEVycm9yIGhhbmRsaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZSgoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0V4cHJlc3MgZXJyb3I6JywgZXJyKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IFxuICAgICAgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLFxuICAgICAgbWVzc2FnZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyBlcnIubWVzc2FnZSA6ICdTb21ldGhpbmcgd2VudCB3cm9uZydcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gNDA0IGhhbmRsZXJcbiAgYXBwLnVzZSgocmVxLCByZXMpID0+IHtcbiAgICByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnUm91dGUgbm90IGZvdW5kJyB9KTtcbiAgfSk7XG5cbiAgZXhwcmVzc0FwcCA9IGFwcDtcbiAgY29uc29sZS5sb2coJ1x1MjcwNSBFeHByZXNzIGFwcCBjcmVhdGVkIGFuZCBjb25maWd1cmVkJyk7XG4gIHJldHVybiBhcHA7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZUV4cHJlc3NBcHAgfTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIFNldCBjb25zaXN0ZW50IGRhdGFiYXNlIHBhdGggYmVmb3JlIGFueSBzZXJ2ZXIgbW9kdWxlcyBhcmUgaW1wb3J0ZWRcbnByb2Nlc3MuZW52LkRCX1BBVEggPSAnLi9zcmMvc2VydmVyL2RhdGEvcHJvY3VyZW1lbnQuZGInO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgbWlkZGxld2FyZU1vZGU6IGZhbHNlLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gICAgLy8gQ3VzdG9tIHBsdWdpbiB0byBpbnRlZ3JhdGUgRXhwcmVzcyBzZXJ2ZXJcbiAgICB7XG4gICAgICBuYW1lOiAnZXhwcmVzcy1pbnRlZ3JhdGlvbicsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIC8vIEltcG9ydCBhbmQgc2V0dXAgRXhwcmVzcyByb3V0ZXNcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaScsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgdGhlIEV4cHJlc3MgYXBwXG4gICAgICAgICAgICBjb25zdCB7IGNyZWF0ZUV4cHJlc3NBcHAgfSA9IGF3YWl0IGltcG9ydCgnLi9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzJyk7XG4gICAgICAgICAgICBjb25zdCBleHByZXNzQXBwID0gYXdhaXQgY3JlYXRlRXhwcmVzc0FwcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBIYW5kbGUgdGhlIHJlcXVlc3Qgd2l0aCBFeHByZXNzXG4gICAgICAgICAgICBleHByZXNzQXBwKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwcmVzcyBtaWRkbGV3YXJlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIG5leHQoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQXlRLE9BQU8sYUFBYTtBQUM3UixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFVdkIsU0FBUyxjQUFjO0FBQzVCLE1BQUksQ0FBQyxZQUFZO0FBQ2YsWUFBUSxJQUFJLDZCQUE2QixPQUFPO0FBQ2hELGlCQUFhLElBQUksUUFBUSxTQUFTLFNBQVMsQ0FBQyxRQUFRO0FBQ2xELFVBQUksS0FBSztBQUNQLGdCQUFRLE1BQU0sMkJBQTJCLEdBQUc7QUFDNUMsY0FBTTtBQUFBLE1BQ1I7QUFDQSxjQUFRLElBQUksb0NBQW9DLE9BQU87QUFBQSxJQUN6RCxDQUFDO0FBR0QsZUFBVyxJQUFJLDBCQUEwQjtBQUFBLEVBQzNDO0FBQ0EsU0FBTztBQUNUO0FBRU8sU0FBUyxnQkFBZ0I7QUFDOUIsTUFBSSxZQUFZO0FBQ2QsZUFBVyxNQUFNLENBQUMsUUFBUTtBQUN4QixVQUFJLEtBQUs7QUFDUCxnQkFBUSxNQUFNLDJCQUEyQixHQUFHO0FBQUEsTUFDOUMsT0FBTztBQUNMLGdCQUFRLElBQUksNEJBQTRCO0FBQUEsTUFDMUM7QUFBQSxJQUNGLENB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TUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFFdEIsZUFBTyxZQUFZLElBQUksUUFBUSxPQUFPLEtBQUssS0FBSyxTQUFTO0FBQ3ZELGNBQUk7QUFFRixrQkFBTSxFQUFFLGtCQUFBQyxrQkFBaUIsSUFBSSxNQUFNO0FBQ25DLGtCQUFNQyxjQUFhLE1BQU1ELGtCQUFpQjtBQUcxQyxZQUFBQyxZQUFXLEtBQUssS0FBSyxJQUFJO0FBQUEsVUFDM0IsU0FBUyxPQUFPO0FBQ2Qsb0JBQVEsTUFBTSw2QkFBNkIsS0FBSztBQUNoRCxpQkFBSyxLQUFLO0FBQUEsVUFDWjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsiX19kaXJuYW1lIiwgImp3dCIsICJpbml0X2F1dGgiLCAiZXhwcmVzcyIsICJiY3J5cHQiLCAicm91dGVyIiwgImVyciIsICJiY3J5cHQiLCAiZXJyIiwgImV4cHJlc3MiLCAicm91dGVyIiwgImVyciIsICJleHByZXNzIiwgInJvdXRlciIsICJlcnIiLCAiZXhwcmVzcyIsICJyb3V0ZXIiLCAiZXJyIiwgInJvdyIsICJleHByZXNzIiwgInNlZWREYXRhYmFzZSIsICJpbml0X2F1dGgiLCAicGF0aCIsICJjcmVhdGVFeHByZXNzQXBwIiwgImV4cHJlc3NBcHAiLCAicGF0aCJdCn0K
