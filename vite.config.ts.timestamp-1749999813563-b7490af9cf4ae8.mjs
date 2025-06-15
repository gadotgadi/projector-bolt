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
        console.log("Ensuring default users exist...");
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
        db.get("SELECT COUNT(*) as count FROM organizational_roles", (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (row.count > 0) {
            console.log("Basic data already exists, only ensuring default users...");
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
          db.run(
            "INSERT OR IGNORE INTO complexity_estimates (id, estimate_level_1, estimate_level_2, estimate_level_3) VALUES (1, 5, 10, 20)"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzIiwgInNyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvc3lzdGVtLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3BsYW5uaW5nLmpzIiwgInNyYy9zZXJ2ZXIvcm91dGVzL3Byb2dyYW1zLmpzIiwgInNyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtpbXBvcnQgc3FsaXRlMyBmcm9tICdzcWxpdGUzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8vIFVzZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBvciBkZWZhdWx0IHBhdGhcbmNvbnN0IERCX1BBVEggPSBwcm9jZXNzLmVudi5EQl9QQVRIIHx8IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9kYXRhL3Byb2N1cmVtZW50LmRiJyk7XG5cbmxldCBkYkluc3RhbmNlID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERhdGFiYXNlKCkge1xuICBpZiAoIWRiSW5zdGFuY2UpIHtcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIGRhdGFiYXNlIGF0OicsIERCX1BBVEgpO1xuICAgIGRiSW5zdGFuY2UgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZShEQl9QQVRILCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG9wZW5pbmcgZGF0YWJhc2U6JywgZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBTUUxpdGUgZGF0YWJhc2UgYXQ6JywgREJfUEFUSCk7XG4gICAgfSk7XG5cbiAgICAvLyBFbmFibGUgZm9yZWlnbiBrZXlzXG4gICAgZGJJbnN0YW5jZS5ydW4oJ1BSQUdNQSBmb3JlaWduX2tleXMgPSBPTicpO1xuICB9XG4gIHJldHVybiBkYkluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VEYXRhYmFzZSgpIHtcbiAgaWYgKGRiSW5zdGFuY2UpIHtcbiAgICBkYkluc3RhbmNlLmNsb3NlKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xvc2luZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGJJbnN0YW5jZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gR3JhY2VmdWwgc2h1dGRvd25cbnByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFNJR0lOVCwgY2xvc2luZyBkYXRhYmFzZS4uLicpO1xuICBjbG9zZURhdGFiYXNlKCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn0pO1xuXG5wcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4ge1xuICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgU0lHVEVSTSwgY2xvc2luZyBkYXRhYmFzZS4uLicpO1xuICBjbG9zZURhdGFiYXNlKCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFiYXNlKCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBkYXRhYmFzZSB0YWJsZXMuLi4nKTtcbiAgICBcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIG9yZ2FuaXphdGlvbmFsX3JvbGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBvcmdhbml6YXRpb25hbF9yb2xlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHJvbGVfY29kZSBJTlRFR0VSIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBkZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIHBlcm1pc3Npb25zIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBkaXZpc2lvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGRlcGFydG1lbnRzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkZXBhcnRtZW50cyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChkaXZpc2lvbl9pZCkgUkVGRVJFTkNFUyBkaXZpc2lvbnMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgcHJvY3VyZW1lbnRfdGVhbXMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2N1cmVtZW50X3RlYW1zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMIFVOSVFVRVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIHdvcmtlcnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHdvcmtlcnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbXBsb3llZV9pZCBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBmdWxsX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSBURVhULFxuICAgICAgICAgIHBhc3N3b3JkIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgYXZhaWxhYmxlX3dvcmtfZGF5cyBURVhULFxuICAgICAgICAgIGVtYWlsIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAocm9sZV9jb2RlKSBSRUZFUkVOQ0VTIG9yZ2FuaXphdGlvbmFsX3JvbGVzKHJvbGVfY29kZSksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRpdmlzaW9uX2lkKSBSRUZFUkVOQ0VTIGRpdmlzaW9ucyhpZCksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRlcGFydG1lbnRfaWQpIFJFRkVSRU5DRVMgZGVwYXJ0bWVudHMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgYWN0aXZpdHlfcG9vbCB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgYWN0aXZpdHlfcG9vbCAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICB0b29sc19hbmRfcmVzb3VyY2VzIFRFWFRcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIENyZWF0ZSBkb21haW5zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkb21haW5zIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIHByb2dyYW1zIHRhYmxlIChtYWluIHRhc2tzKVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvZ3JhbXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICB0YXNrX2lkIElOVEVHRVIgVU5JUVVFIE5PVCBOVUxMLFxuICAgICAgICAgIHdvcmtfeWVhciBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIHJlcXVpcmVkX3F1YXJ0ZXIgREFURSxcbiAgICAgICAgICB0aXRsZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgcmVxdWVzdGVyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVxdWVzdGVyX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkaXZpc2lvbl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGRpdmlzaW9uX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgZGVwYXJ0bWVudF9uYW1lIFRFWFQsXG4gICAgICAgICAgZG9tYWluX2lkIElOVEVHRVIsXG4gICAgICAgICAgZG9tYWluX25hbWUgVEVYVCxcbiAgICAgICAgICBlc3RpbWF0ZWRfYW1vdW50IFJFQUwsXG4gICAgICAgICAgY3VycmVuY3kgVEVYVCxcbiAgICAgICAgICBzdXBwbGllcl9saXN0IFRFWFQsXG4gICAgICAgICAganVzdGlmaWNhdGlvbiBURVhULFxuICAgICAgICAgIHBsYW5uaW5nX3NvdXJjZSBURVhUIE5PVCBOVUxMIERFRkFVTFQgJ2FubnVhbF9wbGFubmluZycsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGl2aXNpb25faWQpIFJFRkVSRU5DRVMgZGl2aXNpb25zKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZGVwYXJ0bWVudF9pZCkgUkVGRVJFTkNFUyBkZXBhcnRtZW50cyhpZCksXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRvbWFpbl9pZCkgUkVGRVJFTkNFUyBkb21haW5zKGlkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIHByb2dyYW1fdGFza3MgdGFibGUgKHN0YXRpb25zKVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgcHJvZ3JhbV90YXNrcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHByb2dyYW1faWQgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICBzdGF0aW9uX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgYWN0aXZpdHlfaWQgSU5URUdFUixcbiAgICAgICAgICBhc3NpZ25lZF9vZmZpY2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgY29tcGxldGlvbl9kYXRlIERBVEUsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXBvcnRpbmdfdXNlcl9uYW1lIFRFWFQsXG4gICAgICAgICAgcmVmZXJlbmNlIFRFWFQsXG4gICAgICAgICAgbm90ZXMgVEVYVCxcbiAgICAgICAgICBpc19sYXN0X3N0YXRpb24gQk9PTEVBTiBERUZBVUxUIDAsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAocHJvZ3JhbV9pZCkgUkVGRVJFTkNFUyBwcm9ncmFtcyhpZCkgT04gREVMRVRFIENBU0NBREUsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGFjdGl2aXR5X2lkKSBSRUZFUkVOQ0VTIGFjdGl2aXR5X3Bvb2woaWQpLFxuICAgICAgICAgIFVOSVFVRShwcm9ncmFtX2lkLCBzdGF0aW9uX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGNvbXBsZXhpdHlfZXN0aW1hdGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBjb21wbGV4aXR5X2VzdGltYXRlcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGVzdGltYXRlX2xldmVsXzEgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDUsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMiBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMTAsXG4gICAgICAgICAgZXN0aW1hdGVfbGV2ZWxfMyBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMjAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgYWNjZXB0YW5jZV9vcHRpb25zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBhY2NlcHRhbmNlX29wdGlvbnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICB5ZWFyX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgdXBsb2FkX2NvZGUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGJyb2FkX21lYW5pbmcgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIFVOSVFVRSh5ZWFyX2lkKVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gQ3JlYXRlIGluZGV4ZXMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfd29ya2Vyc19lbXBsb3llZV9pZCBPTiB3b3JrZXJzKGVtcGxveWVlX2lkKScpO1xuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfd29ya2Vyc19yb2xlX2NvZGUgT04gd29ya2Vycyhyb2xlX2NvZGUpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc190YXNrX2lkIE9OIHByb2dyYW1zKHRhc2tfaWQpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc19zdGF0dXMgT04gcHJvZ3JhbXMoc3RhdHVzKScpO1xuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19wcm9ncmFtX2lkIE9OIHByb2dyYW1fdGFza3MocHJvZ3JhbV9pZCknKTtcbiAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X3Byb2dyYW1fdGFza3Nfc3RhdGlvbl9pZCBPTiBwcm9ncmFtX3Rhc2tzKHN0YXRpb25faWQpJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSB0YWJsZXMgYW5kIGluZGV4ZXMgY3JlYXRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcblxuICAgIGRiLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0RhdGFiYXNlIGVycm9yOicsIGVycik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgfSk7XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7aW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuXG5leHBvcnQgY29uc3QgYXV0aGVudGljYXRlVG9rZW4gPSAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzWydhdXRob3JpemF0aW9uJ107XG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlciAmJiBhdXRoSGVhZGVyLnNwbGl0KCcgJylbMV07XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQWNjZXNzIHRva2VuIHJlcXVpcmVkJyB9KTtcbiAgfVxuXG4gIGp3dC52ZXJpZnkodG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsIChlcnIsIHVzZXIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUb2tlbiB2ZXJpZmljYXRpb24gZmFpbGVkOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcS51c2VyID0gdXNlcjtcbiAgICBuZXh0KCk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcXVpcmVSb2xlID0gKGFsbG93ZWRSb2xlcykgPT4ge1xuICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgaWYgKCFyZXEudXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFhbGxvd2VkUm9sZXMuaW5jbHVkZXMocmVxLnVzZXIucm9sZUNvZGUpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0luc3VmZmljaWVudCBwZXJtaXNzaW9ucycgfSk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFVzZXJGcm9tVG9rZW4gPSBhc3luYyAodG9rZW4pID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkID0gand0LnZlcmlmeSh0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCk7XG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkYi5nZXQoXG4gICAgICAgIGBTRUxFQ1Qgdy4qLCBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSBcbiAgICAgICAgIEZST00gd29ya2VycyB3IFxuICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgIFdIRVJFIHcuaWQgPSA/YCxcbiAgICAgICAgW2RlY29kZWQuaWRdLFxuICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShyb3cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdG9rZW4nKTtcbiAgfVxufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL2F1dGguanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIGdldFVzZXJGcm9tVG9rZW4gfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBMb2dpbiBlbmRwb2ludFxucm91dGVyLnBvc3QoJy9sb2dpbicsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgZW1wbG95ZWVJZCwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBMb2dpbiBhdHRlbXB0OicsIHsgZW1wbG95ZWVJZCwgcGFzc3dvcmRMZW5ndGg6IHBhc3N3b3JkPy5sZW5ndGggfSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgIGlmICghZW1wbG95ZWVJZCB8fCAhcGFzc3dvcmQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgTWlzc2luZyBjcmVkZW50aWFscycpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbmQgcGFzc3dvcmQgYXJlIHJlcXVpcmVkJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZW1wbG95ZWVJZC5sZW5ndGggIT09IDQgfHwgIS9eXFxkezR9JC8udGVzdChlbXBsb3llZUlkKSkge1xuICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBJbnZhbGlkIGVtcGxveWVlIElEIGZvcm1hdCcpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBtdXN0IGJlIGV4YWN0bHkgNCBkaWdpdHMnIH0pO1xuICAgIH1cblxuICAgIGlmIChwYXNzd29yZC5sZW5ndGggIT09IDYpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgSW52YWxpZCBwYXNzd29yZCBsZW5ndGgnKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnUGFzc3dvcmQgbXVzdCBiZSBleGFjdGx5IDYgY2hhcmFjdGVycycgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgLy8gRmlyc3QsIGxldCdzIGNoZWNrIHdoYXQgdXNlcnMgZXhpc3QgaW4gdGhlIGRhdGFiYXNlXG4gICAgZGIuYWxsKCdTRUxFQ1QgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSBGUk9NIHdvcmtlcnMnLCAoZXJyLCBhbGxVc2VycykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgY2hlY2tpbmcgdXNlcnM6JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0IgQXZhaWxhYmxlIHVzZXJzIGluIGRhdGFiYXNlOicsIGFsbFVzZXJzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEZpbmQgdXNlciBieSBlbXBsb3llZSBJRFxuICAgIGRiLmdldChcbiAgICAgIGBTRUxFQ1Qgdy4qLCBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgZGVwdC5uYW1lIGFzIGRlcGFydG1lbnRfbmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlX2Rlc2NyaXB0aW9uXG4gICAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHcuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgICAgTEVGVCBKT0lOIG9yZ2FuaXphdGlvbmFsX3JvbGVzIG9yX3JvbGUgT04gdy5yb2xlX2NvZGUgPSBvcl9yb2xlLnJvbGVfY29kZVxuICAgICAgIFdIRVJFIHcuZW1wbG95ZWVfaWQgPSA/YCxcbiAgICAgIFtlbXBsb3llZUlkXSxcbiAgICAgIGFzeW5jIChlcnIsIHVzZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBEYXRhYmFzZSBlcnJvciBkdXJpbmcgbG9naW46JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgVXNlciBmb3VuZCBpbiBkYXRhYmFzZTonLCB1c2VyID8gJ1lFUycgOiAnTk8nKTtcbiAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQzY0IFVzZXIgZGV0YWlsczonLCB7XG4gICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgIGVtcGxveWVlSWQ6IHVzZXIuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUsXG4gICAgICAgICAgICBoYXNQYXNzd29yZDogISF1c2VyLnBhc3N3b3JkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIFVzZXIgbm90IGZvdW5kIGZvciBlbXBsb3llZSBJRDonLCBlbXBsb3llZUlkKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmVyaWZ5IHBhc3N3b3JkXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgVmVyaWZ5aW5nIHBhc3N3b3JkLi4uJyk7XG4gICAgICAgIGNvbnN0IGlzVmFsaWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBQYXNzd29yZCB2YWxpZDonLCBpc1ZhbGlkUGFzc3dvcmQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFpc1ZhbGlkUGFzc3dvcmQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIEludmFsaWQgcGFzc3dvcmQgZm9yIHVzZXI6JywgZW1wbG95ZWVJZCk7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgTG9naW4gc3VjY2Vzc2Z1bCBmb3IgdXNlcjonLCBlbXBsb3llZUlkKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBKV1QgdG9rZW5cbiAgICAgICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcbiAgICAgICAgICB7IFxuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsIFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCwgXG4gICAgICAgICAgICByb2xlQ29kZTogdXNlci5yb2xlX2NvZGUgXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVULFxuICAgICAgICAgIHsgZXhwaXJlc0luOiBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB9XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gUmV0dXJuIHVzZXIgZGF0YSBhbmQgdG9rZW5cbiAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0ge1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiB1c2VyLmZ1bGxfbmFtZSxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogdXNlci5yb2xlX2Rlc2NyaXB0aW9uIHx8ICdVbmtub3duIFJvbGUnLFxuICAgICAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiB1c2VyLnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgIGRpdmlzaW9uTmFtZTogdXNlci5kaXZpc2lvbl9uYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHVzZXIuZGVwYXJ0bWVudF9uYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgU2VuZGluZyByZXNwb25zZTonLCByZXNwb25zZURhdGEpO1xuICAgICAgICByZXMuanNvbihyZXNwb25zZURhdGEpO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignXHUyNzRDIExvZ2luIGVycm9yOicsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcbiAgfVxufSk7XG5cbi8vIEdldCBjdXJyZW50IHVzZXIgZW5kcG9pbnRcbnJvdXRlci5nZXQoJy9tZScsIGF1dGhlbnRpY2F0ZVRva2VuLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckZyb21Ub2tlbihyZXEuaGVhZGVycy5hdXRob3JpemF0aW9uLnNwbGl0KCcgJylbMV0pO1xuICAgIFxuICAgIGlmICghdXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdVc2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oe1xuICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgZGl2aXNpb25OYW1lOiB1c2VyLmRpdmlzaW9uX25hbWUsXG4gICAgICBkZXBhcnRtZW50TmFtZTogdXNlci5kZXBhcnRtZW50X25hbWVcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdHZXQgdXNlciBlcnJvcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3dvcmtlcnMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy93b3JrZXJzLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZSB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIEdldCBhbGwgd29ya2Vyc1xucm91dGVyLmdldCgnLycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKFxuICAgIGBTRUxFQ1Qgdy4qLCBkLm5hbWUgYXMgZGl2aXNpb25OYW1lLCBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudE5hbWUsIG9yX3JvbGUuZGVzY3JpcHRpb24gYXMgcm9sZURlc2NyaXB0aW9uXG4gICAgIEZST00gd29ya2VycyB3IFxuICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gdy5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHcuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgIExFRlQgSk9JTiBvcmdhbml6YXRpb25hbF9yb2xlcyBvcl9yb2xlIE9OIHcucm9sZV9jb2RlID0gb3Jfcm9sZS5yb2xlX2NvZGVcbiAgICAgT1JERVIgQlkgdy5mdWxsX25hbWVgLFxuICAgIChlcnIsIHJvd3MpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd29ya2VyczonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVHJhbnNmb3JtIGRhdGEgdG8gbWF0Y2ggZnJvbnRlbmQgZm9ybWF0XG4gICAgICBjb25zdCB3b3JrZXJzID0gcm93cy5tYXAocm93ID0+ICh7XG4gICAgICAgIGlkOiByb3cuaWQsXG4gICAgICAgIGVtcGxveWVlSWQ6IHJvdy5lbXBsb3llZV9pZCxcbiAgICAgICAgcm9sZUNvZGU6IHJvdy5yb2xlX2NvZGUsXG4gICAgICAgIGZ1bGxOYW1lOiByb3cuZnVsbF9uYW1lLFxuICAgICAgICByb2xlRGVzY3JpcHRpb246IHJvdy5yb2xlRGVzY3JpcHRpb24sXG4gICAgICAgIGRpdmlzaW9uSWQ6IHJvdy5kaXZpc2lvbl9pZCxcbiAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgcHJvY3VyZW1lbnRUZWFtOiByb3cucHJvY3VyZW1lbnRfdGVhbSxcbiAgICAgICAgcGFzc3dvcmQ6ICcqKioqKionLCAvLyBOZXZlciBzZW5kIGFjdHVhbCBwYXNzd29yZFxuICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogcm93LmF2YWlsYWJsZV93b3JrX2RheXMsXG4gICAgICAgIGVtYWlsOiByb3cuZW1haWwsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogcm93LmRpdmlzaW9uTmFtZSxcbiAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50TmFtZVxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICByZXMuanNvbih3b3JrZXJzKTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gQ3JlYXRlIG5ldyB3b3JrZXJcbnJvdXRlci5wb3N0KCcvJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHtcbiAgICAgIGVtcGxveWVlSWQsXG4gICAgICByb2xlQ29kZSxcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgcm9sZURlc2NyaXB0aW9uLFxuICAgICAgZGl2aXNpb25JZCxcbiAgICAgIGRlcGFydG1lbnRJZCxcbiAgICAgIHByb2N1cmVtZW50VGVhbSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXZhaWxhYmxlV29ya0RheXMsXG4gICAgICBlbWFpbFxuICAgIH0gPSByZXEuYm9keTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghZW1wbG95ZWVJZCB8fCAhcm9sZUNvZGUgfHwgIWZ1bGxOYW1lIHx8ICFwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycgfSk7XG4gICAgfVxuXG4gICAgLy8gSGFzaCBwYXNzd29yZFxuICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEyKTtcblxuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIGRiLnJ1bihcbiAgICAgIGBJTlNFUlQgSU5UTyB3b3JrZXJzIFxuICAgICAgIChlbXBsb3llZV9pZCwgcm9sZV9jb2RlLCBmdWxsX25hbWUsIHJvbGVfZGVzY3JpcHRpb24sIGRpdmlzaW9uX2lkLCBkZXBhcnRtZW50X2lkLCBcbiAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSwgcGFzc3dvcmQsIGF2YWlsYWJsZV93b3JrX2RheXMsIGVtYWlsKSBcbiAgICAgICBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8sID8sID8sID8pYCxcbiAgICAgIFtlbXBsb3llZUlkLCByb2xlQ29kZSwgZnVsbE5hbWUsIHJvbGVEZXNjcmlwdGlvbiwgZGl2aXNpb25JZCwgZGVwYXJ0bWVudElkLCBcbiAgICAgICBwcm9jdXJlbWVudFRlYW0sIGhhc2hlZFBhc3N3b3JkLCBhdmFpbGFibGVXb3JrRGF5cywgZW1haWxdLFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ1VOSVFVRSBjb25zdHJhaW50IGZhaWxlZCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0VtcGxveWVlIElEIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGZXRjaCB0aGUgY3JlYXRlZCB3b3JrZXIgd2l0aCBqb2luZWQgZGF0YVxuICAgICAgICBkYi5nZXQoXG4gICAgICAgICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbk5hbWUsIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50TmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlRGVzY3JpcHRpb25cbiAgICAgICAgICAgRlJPTSB3b3JrZXJzIHcgXG4gICAgICAgICAgIExFRlQgSk9JTiBkaXZpc2lvbnMgZCBPTiB3LmRpdmlzaW9uX2lkID0gZC5pZCBcbiAgICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgICAgTEVGVCBKT0lOIG9yZ2FuaXphdGlvbmFsX3JvbGVzIG9yX3JvbGUgT04gdy5yb2xlX2NvZGUgPSBvcl9yb2xlLnJvbGVfY29kZVxuICAgICAgICAgICBXSEVSRSB3LmlkID0gP2AsXG4gICAgICAgICAgW3RoaXMubGFzdElEXSxcbiAgICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHdvcmtlciA9IHtcbiAgICAgICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICAgICAgZW1wbG95ZWVJZDogcm93LmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgICByb2xlQ29kZTogcm93LnJvbGVfY29kZSxcbiAgICAgICAgICAgICAgZnVsbE5hbWU6IHJvdy5mdWxsX25hbWUsXG4gICAgICAgICAgICAgIHJvbGVEZXNjcmlwdGlvbjogcm93LnJvbGVEZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgICBkZXBhcnRtZW50SWQ6IHJvdy5kZXBhcnRtZW50X2lkLFxuICAgICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHJvdy5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgICAgICAgIGF2YWlsYWJsZVdvcmtEYXlzOiByb3cuYXZhaWxhYmxlX3dvcmtfZGF5cyxcbiAgICAgICAgICAgICAgZW1haWw6IHJvdy5lbWFpbCxcbiAgICAgICAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25OYW1lLFxuICAgICAgICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnROYW1lXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih3b3JrZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBVcGRhdGUgd29ya2VyXG5yb3V0ZXIucHV0KCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgY29uc3Qge1xuICAgICAgZW1wbG95ZWVJZCxcbiAgICAgIHJvbGVDb2RlLFxuICAgICAgZnVsbE5hbWUsXG4gICAgICByb2xlRGVzY3JpcHRpb24sXG4gICAgICBkaXZpc2lvbklkLFxuICAgICAgZGVwYXJ0bWVudElkLFxuICAgICAgcHJvY3VyZW1lbnRUZWFtLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhdmFpbGFibGVXb3JrRGF5cyxcbiAgICAgIGVtYWlsXG4gICAgfSA9IHJlcS5ib2R5O1xuXG4gICAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gICAgLy8gUHJlcGFyZSB1cGRhdGUgcXVlcnlcbiAgICBsZXQgdXBkYXRlUXVlcnkgPSBgXG4gICAgICBVUERBVEUgd29ya2VycyBTRVQgXG4gICAgICAgIGVtcGxveWVlX2lkID0gPywgcm9sZV9jb2RlID0gPywgZnVsbF9uYW1lID0gPywgcm9sZV9kZXNjcmlwdGlvbiA9ID8sXG4gICAgICAgIGRpdmlzaW9uX2lkID0gPywgZGVwYXJ0bWVudF9pZCA9ID8sIHByb2N1cmVtZW50X3RlYW0gPSA/LCBcbiAgICAgICAgYXZhaWxhYmxlX3dvcmtfZGF5cyA9ID8sIGVtYWlsID0gPywgdXBkYXRlZF9hdCA9IENVUlJFTlRfVElNRVNUQU1QXG4gICAgYDtcbiAgICBcbiAgICBsZXQgcGFyYW1zID0gW2VtcGxveWVlSWQsIHJvbGVDb2RlLCBmdWxsTmFtZSwgcm9sZURlc2NyaXB0aW9uLCBkaXZpc2lvbklkLCBcbiAgICAgICAgICAgICAgICAgIGRlcGFydG1lbnRJZCwgcHJvY3VyZW1lbnRUZWFtLCBhdmFpbGFibGVXb3JrRGF5cywgZW1haWxdO1xuXG4gICAgLy8gT25seSB1cGRhdGUgcGFzc3dvcmQgaWYgcHJvdmlkZWQgYW5kIG5vdCB0aGUgcGxhY2Vob2xkZXJcbiAgICBpZiAocGFzc3dvcmQgJiYgcGFzc3dvcmQgIT09ICcqKioqKionKSB7XG4gICAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMik7XG4gICAgICB1cGRhdGVRdWVyeSArPSAnLCBwYXNzd29yZCA9ID8nO1xuICAgICAgcGFyYW1zLnB1c2goaGFzaGVkUGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHVwZGF0ZVF1ZXJ5ICs9ICcgV0hFUkUgaWQgPSA/JztcbiAgICBwYXJhbXMucHVzaChpZCk7XG5cbiAgICBkYi5ydW4odXBkYXRlUXVlcnksIHBhcmFtcywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ1VOSVFVRSBjb25zdHJhaW50IGZhaWxlZCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbXBsb3llZSBJRCBhbHJlYWR5IGV4aXN0cycgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRmV0Y2ggdXBkYXRlZCB3b3JrZXJcbiAgICAgIGRiLmdldChcbiAgICAgICAgYFNFTEVDVCB3LiosIGQubmFtZSBhcyBkaXZpc2lvbk5hbWUsIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50TmFtZSwgb3Jfcm9sZS5kZXNjcmlwdGlvbiBhcyByb2xlRGVzY3JpcHRpb25cbiAgICAgICAgIEZST00gd29ya2VycyB3IFxuICAgICAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHcuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gdy5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICAgIExFRlQgSk9JTiBvcmdhbml6YXRpb25hbF9yb2xlcyBvcl9yb2xlIE9OIHcucm9sZV9jb2RlID0gb3Jfcm9sZS5yb2xlX2NvZGVcbiAgICAgICAgIFdIRVJFIHcuaWQgPSA/YCxcbiAgICAgICAgW2lkXSxcbiAgICAgICAgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCB3b3JrZXI6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHdvcmtlciA9IHtcbiAgICAgICAgICAgIGlkOiByb3cuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiByb3cuZW1wbG95ZWVfaWQsXG4gICAgICAgICAgICByb2xlQ29kZTogcm93LnJvbGVfY29kZSxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiByb3cuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiByb3cucm9sZURlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgIHByb2N1cmVtZW50VGVhbTogcm93LnByb2N1cmVtZW50X3RlYW0sXG4gICAgICAgICAgICBwYXNzd29yZDogJyoqKioqKicsXG4gICAgICAgICAgICBhdmFpbGFibGVXb3JrRGF5czogcm93LmF2YWlsYWJsZV93b3JrX2RheXMsXG4gICAgICAgICAgICBlbWFpbDogcm93LmVtYWlsLFxuICAgICAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25OYW1lLFxuICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50TmFtZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuanNvbih3b3JrZXIpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHdvcmtlcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBEZWxldGUgd29ya2VyXG5yb3V0ZXIuZGVsZXRlKCcvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSB3b3JrZXJzIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHdvcmtlcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdXb3JrZXIgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdXb3JrZXIgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbnJvdXRlci5nZXQoJy9vcmdhbml6YXRpb25hbC1yb2xlcycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBBUEk6IEdldHRpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXMuLi4nKTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzIE9SREVSIEJZIHJvbGVfY29kZScsIChlcnIsIHJvd3MpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgZmV0Y2hpbmcgb3JnYW5pemF0aW9uYWwgcm9sZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZygnXHUyNzA1IEZldGNoZWQgb3JnYW5pemF0aW9uYWwgcm9sZXMgZnJvbSBEQjonLCByb3dzKTtcbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IGRpdmlzaW9uc1xucm91dGVyLmdldCgnL2RpdmlzaW9ucycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRpdmlzaW9ucyBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRpdmlzaW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHJvd3MpO1xuICB9KTtcbn0pO1xuXG4vLyBHZXQgZGVwYXJ0bWVudHNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKCdTRUxFQ1QgKiBGUk9NIGRlcGFydG1lbnRzIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGVwYXJ0bWVudHM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxuLy8gR2V0IHByb2N1cmVtZW50IHRlYW1zXG5yb3V0ZXIuZ2V0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHByb2N1cmVtZW50IHRlYW1zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7aW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWVkRGF0YWJhc2UoKSB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1NlZWRpbmcgZGF0YWJhc2Ugd2l0aCBpbml0aWFsIGRhdGEuLi4nKTtcbiAgICBcbiAgICBkYi5zZXJpYWxpemUoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQWx3YXlzIGVuc3VyZSBkZWZhdWx0IHVzZXJzIGV4aXN0ICh1cHNlcnQgYXBwcm9hY2gpXG4gICAgICAgIGNvbnNvbGUubG9nKCdFbnN1cmluZyBkZWZhdWx0IHVzZXJzIGV4aXN0Li4uJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBkZWZhdWx0UGFzc3dvcmQgPSAnMTIzNDU2JztcbiAgICAgICAgY29uc3QgaGFzaGVkUGFzc3dvcmQgPSBiY3J5cHQuaGFzaFN5bmMoZGVmYXVsdFBhc3N3b3JkLCAxMik7XG5cbiAgICAgICAgY29uc3QgZGVmYXVsdFVzZXJzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGVtcGxveWVlX2lkOiAnOTk5OScsXG4gICAgICAgICAgICByb2xlX2NvZGU6IDAsXG4gICAgICAgICAgICBmdWxsX25hbWU6ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1REMgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyxcbiAgICAgICAgICAgIHJvbGVfZGVzY3JpcHRpb246ICdcdTA1REVcdTA1RTBcdTA1RDRcdTA1RENcdTA1REYgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZW1wbG95ZWVfaWQ6ICcxMDAxJyxcbiAgICAgICAgICAgIHJvbGVfY29kZTogMSxcbiAgICAgICAgICAgIGZ1bGxfbmFtZTogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLFxuICAgICAgICAgICAgcm9sZV9kZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU4XHUwNUQwXHUwNUU5XHUwNUQ5JyxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZFxuICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBJbnNlcnQgb3IgdXBkYXRlIGRlZmF1bHQgdXNlcnNcbiAgICAgICAgZGVmYXVsdFVzZXJzLmZvckVhY2goKHVzZXIpID0+IHtcbiAgICAgICAgICBkYi5ydW4oXG4gICAgICAgICAgICBgSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyB3b3JrZXJzIFxuICAgICAgICAgICAgIChlbXBsb3llZV9pZCwgcm9sZV9jb2RlLCBmdWxsX25hbWUsIHJvbGVfZGVzY3JpcHRpb24sIHBhc3N3b3JkKSBcbiAgICAgICAgICAgICBWQUxVRVMgKD8sID8sID8sID8sID8pYCxcbiAgICAgICAgICAgIFt1c2VyLmVtcGxveWVlX2lkLCB1c2VyLnJvbGVfY29kZSwgdXNlci5mdWxsX25hbWUsIHVzZXIucm9sZV9kZXNjcmlwdGlvbiwgdXNlci5wYXNzd29yZF0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBlbnN1cmluZyB1c2VyIGV4aXN0czonLCB1c2VyLmVtcGxveWVlX2lkLCBlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRW5zdXJlZCB1c2VyIGV4aXN0czonLCB1c2VyLmVtcGxveWVlX2lkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIG90aGVyIGRhdGEgYWxyZWFkeSBleGlzdHMgdG8gYXZvaWQgZHVwbGljYXRlc1xuICAgICAgICBkYi5nZXQoJ1NFTEVDVCBDT1VOVCgqKSBhcyBjb3VudCBGUk9NIG9yZ2FuaXphdGlvbmFsX3JvbGVzJywgKGVyciwgcm93KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIChyb3cuY291bnQgPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQmFzaWMgZGF0YSBhbHJlYWR5IGV4aXN0cywgb25seSBlbnN1cmluZyBkZWZhdWx0IHVzZXJzLi4uJyk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFNlZWQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbiAgICAgICAgICBjb25zdCByb2xlcyA9IFtcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiAwLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVERVx1MDVEQ1x1MDVEMCcgfSxcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiAxLCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICAgICAgICB7IHJvbGVfY29kZTogMiwgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1RDBcdTA1RTkgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBJywgcGVybWlzc2lvbnM6ICdcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNUU2XHUwNUQ1XHUwNUQ1XHUwNUVBJyB9LFxuICAgICAgICAgICAgeyByb2xlX2NvZGU6IDMsIGRlc2NyaXB0aW9uOiAnXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNURGJywgcGVybWlzc2lvbnM6ICdcdTA1RDFcdTA1RDlcdTA1RTZcdTA1RDVcdTA1RTIgXHUwNUU4XHUwNURCXHUwNUU5JyB9LFxuICAgICAgICAgICAgeyByb2xlX2NvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEM1x1MDVFOFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFQScgfSxcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVERVx1MDVEQ1x1MDVEMCcgfSxcbiAgICAgICAgICAgIHsgcm9sZV9jb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVENCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDlcdTA1RUEnIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcm9sZXMuZm9yRWFjaChyb2xlID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICAgICAgICBbcm9sZS5yb2xlX2NvZGUsIHJvbGUuZGVzY3JpcHRpb24sIHJvbGUucGVybWlzc2lvbnNdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBkaXZpc2lvbnNcbiAgICAgICAgICBjb25zdCBkaXZpc2lvbnMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDlcdTA1RTFcdTA1RDhcdTA1RDlcdTA1RTdcdTA1RDQnLCBpc19pbnRlcm5hbDogMSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUQ0JywgaXNfaW50ZXJuYWw6IDEgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVFN1x1MDVFOCBcdTA1RDVcdTA1RTRcdTA1RDlcdTA1RUFcdTA1RDVcdTA1RDcnLCBpc19pbnRlcm5hbDogMSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUU5XHUwNUQwXHUwNUQxXHUwNUQ5IFx1MDVEMFx1MDVFMFx1MDVENVx1MDVFOScsIGlzX2ludGVybmFsOiAxIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgZGl2aXNpb25zLmZvckVhY2goZGl2aXNpb24gPT4ge1xuICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRpdmlzaW9ucyAobmFtZSwgaXNfaW50ZXJuYWwpIFZBTFVFUyAoPywgPyknLFxuICAgICAgICAgICAgICBbZGl2aXNpb24ubmFtZSwgZGl2aXNpb24uaXNfaW50ZXJuYWxdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBkZXBhcnRtZW50c1xuICAgICAgICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVENVx1MDVEN1x1MDVENVx1MDVENlx1MDVEOVx1MDVERCcsIGRpdmlzaW9uX2lkOiAxIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RUFcdTA1RTRcdTA1RTJcdTA1RDVcdTA1REMgXHUwNUQ1XHUwNUVBXHUwNUQ3XHUwNUQ2XHUwNUQ1XHUwNUU3XHUwNUQ0JywgZGl2aXNpb25faWQ6IDEgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDlcdTA1RDNcdTA1RTInLCBkaXZpc2lvbl9pZDogMiB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUU0XHUwNUQ5XHUwNUVBXHUwNUQ1XHUwNUQ3IFx1MDVFQVx1MDVENVx1MDVEQlx1MDVFMFx1MDVENCcsIGRpdmlzaW9uX2lkOiAyIH1cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgZGVwYXJ0bWVudHMuZm9yRWFjaChkZXB0ID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBkZXBhcnRtZW50cyAobmFtZSwgZGl2aXNpb25faWQpIFZBTFVFUyAoPywgPyknLFxuICAgICAgICAgICAgICBbZGVwdC5uYW1lLCBkZXB0LmRpdmlzaW9uX2lkXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNlZWQgcHJvY3VyZW1lbnQgdGVhbXNcbiAgICAgICAgICBjb25zdCB0ZWFtcyA9IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEOVx1MDVEOFx1MDVEN1x1MDVENVx1MDVFMFx1MDVEOScgfVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICB0ZWFtcy5mb3JFYWNoKHRlYW0gPT4ge1xuICAgICAgICAgICAgZGIucnVuKFxuICAgICAgICAgICAgICAnSU5TRVJUIE9SIElHTk9SRSBJTlRPIHByb2N1cmVtZW50X3RlYW1zIChuYW1lKSBWQUxVRVMgKD8pJyxcbiAgICAgICAgICAgICAgW3RlYW0ubmFtZV1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICAgICAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFOVx1MDVENVx1MDVENVx1MDVEMFx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RThcdTA1RDlcdTA1REQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdcdTA1RDRcdTA1REJcdTA1RTBcdTA1RUEgXHUwNURFXHUwNUU0XHUwNUU4XHUwNUQ4IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVEOScsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUU0XHUwNUU4XHUwNUQ4JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNUREIFx1MDVERVx1MDVEQlx1MDVFOFx1MDVENicsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNUREJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1REVcdTA1RDhcdTA1RThcdTA1RDlcdTA1RTZcdTA1RUEgXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUQ0JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUVBIFx1MDVENlx1MDVENVx1MDVEQlx1MDVENCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RDVcdTA1RTJcdTA1RDNcdTA1RUEgXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUQ0JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnXHUwNUQ3XHUwNUVBXHUwNUQ5XHUwNURFXHUwNUQ0IFx1MDVFMlx1MDVEQyBcdTA1RDRcdTA1RTFcdTA1REJcdTA1REQnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVEN1x1MDVFQVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVFN1x1MDVFOFx1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNUU4XHUwNUU5XHUwNUQ5XHUwNURFXHUwNUVBIFx1MDVEMVx1MDVEM1x1MDVEOVx1MDVFN1x1MDVENVx1MDVFQScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVEQlx1MDVFMVx1MDVFNFx1MDVEOVx1MDVERCcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1RDFcdTA1RDlcdTA1RTZcdTA1RDVcdTA1RTInLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sc19hbmRfcmVzb3VyY2VzOiAnXHUwNUQzXHUwNUQ1XHUwNUQ3IFx1MDVFMVx1MDVEOVx1MDVEQlx1MDVENVx1MDVERCcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1x1MDVEM1x1MDVENVwiXHUwNUQ3IFx1MDVFMVx1MDVEOVx1MDVEQlx1MDVENVx1MDVERCcsIHRvb2xzX2FuZF9yZXNvdXJjZXM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGFjdGl2aXRpZXMuZm9yRWFjaChhY3Rpdml0eSA9PiB7XG4gICAgICAgICAgICBkYi5ydW4oXG4gICAgICAgICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gYWN0aXZpdHlfcG9vbCAobmFtZSwgdG9vbHNfYW5kX3Jlc291cmNlcykgVkFMVUVTICg/LCA/KScsXG4gICAgICAgICAgICAgIFthY3Rpdml0eS5uYW1lLCBhY3Rpdml0eS50b29sc19hbmRfcmVzb3VyY2VzXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNlZWQgZG9tYWluc1xuICAgICAgICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uOiAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVFMVx1MDVEOFx1MDVEOScgfSxcbiAgICAgICAgICAgIHsgZGVzY3JpcHRpb246ICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ1XHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5JyB9LFxuICAgICAgICAgICAgeyBkZXNjcmlwdGlvbjogJ1x1MDVFOVx1MDVEOVx1MDVFOFx1MDVENVx1MDVFQVx1MDVEOVx1MDVERCBcdTA1REVcdTA1RTdcdTA1RTZcdTA1RDVcdTA1RTJcdTA1RDlcdTA1RDlcdTA1REQnIH0sXG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uOiAnXHUwNUVBXHUwNUQ3XHUwNUQ2XHUwNUQ1XHUwNUU3XHUwNUQ0IFx1MDVENVx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycgfVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBkb21haW5zLmZvckVhY2goZG9tYWluID0+IHtcbiAgICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBkb21haW5zIChkZXNjcmlwdGlvbikgVkFMVUVTICg/KScsXG4gICAgICAgICAgICAgIFtkb21haW4uZGVzY3JpcHRpb25dXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VlZCBjb21wbGV4aXR5IGVzdGltYXRlc1xuICAgICAgICAgIGRiLnJ1bihcbiAgICAgICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gY29tcGxleGl0eV9lc3RpbWF0ZXMgKGlkLCBlc3RpbWF0ZV9sZXZlbF8xLCBlc3RpbWF0ZV9sZXZlbF8yLCBlc3RpbWF0ZV9sZXZlbF8zKSBWQUxVRVMgKDEsIDUsIDEwLCAyMCknXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseSEnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRGVmYXVsdCB1c2VycyBhdmFpbGFibGU6Jyk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0gQWRtaW46IDk5OTkgLyAxMjM0NTYnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnLSBNYW5hZ2VyOiAxMDAxIC8gMTIzNDU2Jyk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBzZWVkaW5nIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3N5c3RlbS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3N5c3RlbS5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcbmltcG9ydCB7IHNlZWREYXRhYmFzZSB9IGZyb20gJy4uL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gU2VlZCBkYXRhYmFzZSBlbmRwb2ludCAtIHB1YmxpY2x5IGF2YWlsYWJsZSB3aXRob3V0IGF1dGhlbnRpY2F0aW9uXG5yb3V0ZXIuZ2V0KCcvc2VlZF9kYicsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0NcdURGMzEgTWFudWFsIGRhdGFiYXNlIHNlZWRpbmcgcmVxdWVzdGVkIChwdWJsaWMgZW5kcG9pbnQpJyk7XG4gICAgXG4gICAgYXdhaXQgc2VlZERhdGFiYXNlKCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBNYW51YWwgZGF0YWJhc2Ugc2VlZGluZyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgcmVzLmpzb24oeyBcbiAgICAgIG1lc3NhZ2U6ICdEYXRhYmFzZSBzZWVkZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignXHUyNzRDIE1hbnVhbCBkYXRhYmFzZSBzZWVkaW5nIGZhaWxlZDonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBcbiAgICAgIGVycm9yOiAnRGF0YWJhc2Ugc2VlZGluZyBmYWlsZWQnLFxuICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZVxuICAgIH0pO1xuICB9XG59KTtcblxuLy8gQWN0aXZpdHkgUG9vbCByb3V0ZXNcbnJvdXRlci5nZXQoJy9hY3Rpdml0eS1wb29sJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gYWN0aXZpdHlfcG9vbCBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGFjdGl2aXR5IHBvb2w6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxucm91dGVyLnBvc3QoJy9hY3Rpdml0eS1wb29sJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IG5hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gYWN0aXZpdHlfcG9vbCAobmFtZSwgdG9vbHNfYW5kX3Jlc291cmNlcykgVkFMVUVTICg/LCA/KScsXG4gICAgW25hbWUsIHRvb2xzQW5kUmVzb3VyY2VzXSxcbiAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgYWN0aXZpdHk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBhY3Rpdml0eTonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLnB1dCgnL2FjdGl2aXR5LXBvb2wvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUsIHRvb2xzQW5kUmVzb3VyY2VzIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGFjdGl2aXR5X3Bvb2wgU0VUIG5hbWUgPSA/LCB0b29sc19hbmRfcmVzb3VyY2VzID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCB0b29sc0FuZFJlc291cmNlcywgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBhY3Rpdml0eTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjdGl2aXR5IG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFtpZF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXBkYXRlZCBhY3Rpdml0eTonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLmRlbGV0ZSgnL2FjdGl2aXR5LXBvb2wvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBhY3Rpdml0eV9wb29sIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGFjdGl2aXR5OicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjdGl2aXR5IG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnQWN0aXZpdHkgZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBEb21haW5zIHJvdXRlc1xucm91dGVyLmdldCgnL2RvbWFpbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBkb21haW5zIE9SREVSIEJZIGRlc2NyaXB0aW9uJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRvbWFpbnM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cbiAgICByZXMuanNvbihyb3dzKTtcbiAgfSk7XG59KTtcblxucm91dGVyLnBvc3QoJy9kb21haW5zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGRlc2NyaXB0aW9uIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnSU5TRVJUIElOVE8gZG9tYWlucyAoZGVzY3JpcHRpb24pIFZBTFVFUyAoPyknLFxuICAgIFtkZXNjcmlwdGlvbl0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgV0hFUkUgaWQgPSA/JywgW3RoaXMubGFzdElEXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIGRvbWFpbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLnB1dCgnL2RvbWFpbnMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IGRlc2NyaXB0aW9uIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIGRvbWFpbnMgU0VUIGRlc2NyaXB0aW9uID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtkZXNjcmlwdGlvbiwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBkb21haW46JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEb21haW4gbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIGRvbWFpbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLmRlbGV0ZSgnL2RvbWFpbnMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkb21haW5zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRvbWFpbjonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdEb21haW4gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEb21haW4gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBEaXZpc2lvbnMgcm91dGVzXG5yb3V0ZXIuZ2V0KCcvZGl2aXNpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICBkYi5hbGwoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIE9SREVSIEJZIG5hbWUnLCAoZXJyLCByb3dzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGl2aXNpb25zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbnJvdXRlci5wb3N0KCcvZGl2aXNpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IG5hbWUsIGlzSW50ZXJuYWwgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBkaXZpc2lvbnMgKG5hbWUsIGlzX2ludGVybmFsKSBWQUxVRVMgKD8sID8pJyxcbiAgICBbbmFtZSwgaXNJbnRlcm5hbF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGRpdmlzaW9uOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoJ1NFTEVDVCAqIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFt0aGlzLmxhc3RJRF0sIChlcnIsIHJvdykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLnB1dCgnL2RpdmlzaW9ucy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IHsgbmFtZSwgaXNJbnRlcm5hbCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ1VQREFURSBkaXZpc2lvbnMgU0VUIG5hbWUgPSA/LCBpc19pbnRlcm5hbCA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgaXNJbnRlcm5hbCwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBkaXZpc2lvbjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RpdmlzaW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBkaXZpc2lvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIGRpdmlzaW9uOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLmpzb24ocm93KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIuZGVsZXRlKCcvZGl2aXNpb25zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gZGl2aXNpb25zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGRpdmlzaW9uOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RpdmlzaW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnRGl2aXNpb24gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBEZXBhcnRtZW50cyByb3V0ZXNcbnJvdXRlci5nZXQoJy9kZXBhcnRtZW50cycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuYWxsKFxuICAgIGBTRUxFQ1QgZC4qLCBkaXYubmFtZSBhcyBkaXZpc2lvbk5hbWUgXG4gICAgIEZST00gZGVwYXJ0bWVudHMgZCBcbiAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkaXYgT04gZC5kaXZpc2lvbl9pZCA9IGRpdi5pZCBcbiAgICAgT1JERVIgQlkgZC5uYW1lYCxcbiAgICAoZXJyLCByb3dzKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGRlcGFydG1lbnRzOicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgcmVzLmpzb24ocm93cyk7XG4gICAgfVxuICApO1xufSk7XG5cbnJvdXRlci5wb3N0KCcvZGVwYXJ0bWVudHMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgbmFtZSwgZGl2aXNpb25JZCB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIGRlcGFydG1lbnRzIChuYW1lLCBkaXZpc2lvbl9pZCkgVkFMVUVTICg/LCA/KScsXG4gICAgW25hbWUsIGRpdmlzaW9uSWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBkZXBhcnRtZW50OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoXG4gICAgICAgIGBTRUxFQ1QgZC4qLCBkaXYubmFtZSBhcyBkaXZpc2lvbk5hbWUgXG4gICAgICAgICBGUk9NIGRlcGFydG1lbnRzIGQgXG4gICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGRpdiBPTiBkLmRpdmlzaW9uX2lkID0gZGl2LmlkIFxuICAgICAgICAgV0hFUkUgZC5pZCA9ID9gLFxuICAgICAgICBbdGhpcy5sYXN0SURdLFxuICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjcmVhdGVkIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyb3cpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIucHV0KCcvZGVwYXJ0bWVudHMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IG5hbWUsIGRpdmlzaW9uSWQgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgZGVwYXJ0bWVudHMgU0VUIG5hbWUgPSA/LCBkaXZpc2lvbl9pZCA9ID8gV0hFUkUgaWQgPSA/JyxcbiAgICBbbmFtZSwgZGl2aXNpb25JZCwgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBkZXBhcnRtZW50OicsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnRGVwYXJ0bWVudCBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuXG4gICAgICBkYi5nZXQoXG4gICAgICAgIGBTRUxFQ1QgZC4qLCBkaXYubmFtZSBhcyBkaXZpc2lvbk5hbWUgXG4gICAgICAgICBGUk9NIGRlcGFydG1lbnRzIGQgXG4gICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGRpdiBPTiBkLmRpdmlzaW9uX2lkID0gZGl2LmlkIFxuICAgICAgICAgV0hFUkUgZC5pZCA9ID9gLFxuICAgICAgICBbaWRdLFxuICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIGRlcGFydG1lbnQ6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuanNvbihyb3cpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgKTtcbn0pO1xuXG5yb3V0ZXIuZGVsZXRlKCcvZGVwYXJ0bWVudHMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgZGIucnVuKCdERUxFVEUgRlJPTSBkZXBhcnRtZW50cyBXSEVSRSBpZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBkZXBhcnRtZW50OicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0RlcGFydG1lbnQgbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdEZXBhcnRtZW50IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuLy8gUHJvY3VyZW1lbnQgVGVhbXMgcm91dGVzXG5yb3V0ZXIuZ2V0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBPUkRFUiBCWSBuYW1lJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHByb2N1cmVtZW50IHRlYW1zOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG4gICAgcmVzLmpzb24ocm93cyk7XG4gIH0pO1xufSk7XG5cbnJvdXRlci5wb3N0KCcvcHJvY3VyZW1lbnQtdGVhbXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgbmFtZSB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICBkYi5ydW4oXG4gICAgJ0lOU0VSVCBJTlRPIHByb2N1cmVtZW50X3RlYW1zIChuYW1lKSBWQUxVRVMgKD8pJyxcbiAgICBbbmFtZV0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLnB1dCgnL3Byb2N1cmVtZW50LXRlYW1zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgeyBuYW1lIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bihcbiAgICAnVVBEQVRFIHByb2N1cmVtZW50X3RlYW1zIFNFVCBuYW1lID0gPyBXSEVSRSBpZCA9ID8nLFxuICAgIFtuYW1lLCBpZF0sXG4gICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHByb2N1cmVtZW50IHRlYW06JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9jdXJlbWVudCB0ZWFtIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBwcm9jdXJlbWVudF90ZWFtcyBXSEVSRSBpZCA9ID8nLCBbaWRdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5qc29uKHJvdyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxucm91dGVyLmRlbGV0ZSgnL3Byb2N1cmVtZW50LXRlYW1zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gcHJvY3VyZW1lbnRfdGVhbXMgV0hFUkUgaWQgPSA/JywgW2lkXSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGVsZXRpbmcgcHJvY3VyZW1lbnQgdGVhbTonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9jdXJlbWVudCB0ZWFtIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnUHJvY3VyZW1lbnQgdGVhbSBkZWxldGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvcGxhbm5pbmcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9wbGFubmluZy5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9hdXRoLmpzJztcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuLy8gR2V0IGNvbXBsZXhpdHkgZXN0aW1hdGVzXG5yb3V0ZXIuZ2V0KCcvY29tcGxleGl0eS1lc3RpbWF0ZXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmdldCgnU0VMRUNUICogRlJPTSBjb21wbGV4aXR5X2VzdGltYXRlcyBPUkRFUiBCWSBpZCBERVNDIExJTUlUIDEnLCAoZXJyLCByb3cpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBjb21wbGV4aXR5IGVzdGltYXRlczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFJldHVybiBkZWZhdWx0IHZhbHVlcyBpZiBubyByZWNvcmQgZXhpc3RzXG4gICAgY29uc3QgZXN0aW1hdGVzID0gcm93IHx8IHtcbiAgICAgIGVzdGltYXRlTGV2ZWwxOiA1LFxuICAgICAgZXN0aW1hdGVMZXZlbDI6IDEwLFxuICAgICAgZXN0aW1hdGVMZXZlbDM6IDIwXG4gICAgfTtcbiAgICBcbiAgICByZXMuanNvbih7XG4gICAgICBlc3RpbWF0ZUxldmVsMTogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzEsXG4gICAgICBlc3RpbWF0ZUxldmVsMjogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzIsXG4gICAgICBlc3RpbWF0ZUxldmVsMzogZXN0aW1hdGVzLmVzdGltYXRlX2xldmVsXzNcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8gVXBkYXRlIGNvbXBsZXhpdHkgZXN0aW1hdGVzXG5yb3V0ZXIucHV0KCcvY29tcGxleGl0eS1lc3RpbWF0ZXMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgZXN0aW1hdGVMZXZlbDEsIGVzdGltYXRlTGV2ZWwyLCBlc3RpbWF0ZUxldmVsMyB9ID0gcmVxLmJvZHk7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAvLyBGaXJzdCBjaGVjayBpZiBhIHJlY29yZCBleGlzdHNcbiAgZGIuZ2V0KCdTRUxFQ1QgaWQgRlJPTSBjb21wbGV4aXR5X2VzdGltYXRlcyBMSU1JVCAxJywgKGVyciwgcm93KSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgY29tcGxleGl0eSBlc3RpbWF0ZXM6JywgZXJyKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgIH1cblxuICAgIGlmIChyb3cpIHtcbiAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyByZWNvcmRcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ1VQREFURSBjb21wbGV4aXR5X2VzdGltYXRlcyBTRVQgZXN0aW1hdGVfbGV2ZWxfMSA9ID8sIGVzdGltYXRlX2xldmVsXzIgPSA/LCBlc3RpbWF0ZV9sZXZlbF8zID0gPywgdXBkYXRlZF9hdCA9IENVUlJFTlRfVElNRVNUQU1QIFdIRVJFIGlkID0gPycsXG4gICAgICAgIFtlc3RpbWF0ZUxldmVsMSwgZXN0aW1hdGVMZXZlbDIsIGVzdGltYXRlTGV2ZWwzLCByb3cuaWRdLFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBjb21wbGV4aXR5IGVzdGltYXRlczonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0NvbXBsZXhpdHkgZXN0aW1hdGVzIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW5zZXJ0IG5ldyByZWNvcmRcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBJTlRPIGNvbXBsZXhpdHlfZXN0aW1hdGVzIChlc3RpbWF0ZV9sZXZlbF8xLCBlc3RpbWF0ZV9sZXZlbF8yLCBlc3RpbWF0ZV9sZXZlbF8zKSBWQUxVRVMgKD8sID8sID8pJyxcbiAgICAgICAgW2VzdGltYXRlTGV2ZWwxLCBlc3RpbWF0ZUxldmVsMiwgZXN0aW1hdGVMZXZlbDNdLFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBjb21wbGV4aXR5IGVzdGltYXRlczonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5qc29uKHsgbWVzc2FnZTogJ0NvbXBsZXhpdHkgZXN0aW1hdGVzIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbi8vIEdldCBhY2NlcHRhbmNlIG9wdGlvbnNcbnJvdXRlci5nZXQoJy9hY2NlcHRhbmNlLW9wdGlvbnMnLCBhdXRoZW50aWNhdGVUb2tlbiwgcmVxdWlyZVJvbGUoWzAsIDEsIDldKSwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbCgnU0VMRUNUICogRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgT1JERVIgQlkgeWVhcl9pZCBERVNDJywgKGVyciwgcm93cykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGFjY2VwdGFuY2Ugb3B0aW9uczonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYW5zZm9ybSBkYXRhIHRvIG1hdGNoIGZyb250ZW5kIGZvcm1hdFxuICAgIGNvbnN0IG9wdGlvbnMgPSByb3dzLm1hcChyb3cgPT4gKHtcbiAgICAgIGlkOiByb3cuaWQsXG4gICAgICB5ZWFySWQ6IHJvdy55ZWFyX2lkLFxuICAgICAgdXBsb2FkQ29kZTogcm93LnVwbG9hZF9jb2RlLFxuICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiByb3cudXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICBicm9hZE1lYW5pbmc6IHJvdy5icm9hZF9tZWFuaW5nXG4gICAgfSkpO1xuICAgIFxuICAgIHJlcy5qc29uKG9wdGlvbnMpO1xuICB9KTtcbn0pO1xuXG4vLyBDcmVhdGUgYWNjZXB0YW5jZSBvcHRpb25cbnJvdXRlci5wb3N0KCcvYWNjZXB0YW5jZS1vcHRpb25zJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHllYXJJZCwgdXBsb2FkQ29kZSwgYnJvYWRNZWFuaW5nIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIE1hcCB1cGxvYWQgY29kZXMgdG8gZGVzY3JpcHRpb25zXG4gIGNvbnN0IHVwbG9hZENvZGVEZXNjcmlwdGlvbnMgPSB7XG4gICAgJ1BsYW4nOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAnTGF0ZSc6ICdcdTA1REVcdTA1RDBcdTA1RDdcdTA1RTgnLFxuICAgICdCbG9jayc6ICdcdTA1RDdcdTA1RTFcdTA1RDVcdTA1REQnLFxuICAgICdGaW5pc2gnOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJ1xuICB9O1xuXG4gIGNvbnN0IHVwbG9hZENvZGVEZXNjcmlwdGlvbiA9IHVwbG9hZENvZGVEZXNjcmlwdGlvbnNbdXBsb2FkQ29kZV07XG5cbiAgZGIucnVuKFxuICAgICdJTlNFUlQgSU5UTyBhY2NlcHRhbmNlX29wdGlvbnMgKHllYXJfaWQsIHVwbG9hZF9jb2RlLCB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiwgYnJvYWRfbWVhbmluZykgVkFMVUVTICg/LCA/LCA/LCA/KScsXG4gICAgW3llYXJJZCwgdXBsb2FkQ29kZSwgdXBsb2FkQ29kZURlc2NyaXB0aW9uLCBicm9hZE1lYW5pbmddLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ1VOSVFVRSBjb25zdHJhaW50IGZhaWxlZCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBmb3IgdGhpcyB5ZWFyIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgZGIuZ2V0KCdTRUxFQ1QgKiBGUk9NIGFjY2VwdGFuY2Vfb3B0aW9ucyBXSEVSRSBpZCA9ID8nLCBbdGhpcy5sYXN0SURdLCAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGNyZWF0ZWQgYWNjZXB0YW5jZSBvcHRpb246JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3Qgb3B0aW9uID0ge1xuICAgICAgICAgIGlkOiByb3cuaWQsXG4gICAgICAgICAgeWVhcklkOiByb3cueWVhcl9pZCxcbiAgICAgICAgICB1cGxvYWRDb2RlOiByb3cudXBsb2FkX2NvZGUsXG4gICAgICAgICAgdXBsb2FkQ29kZURlc2NyaXB0aW9uOiByb3cudXBsb2FkX2NvZGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgYnJvYWRNZWFuaW5nOiByb3cuYnJvYWRfbWVhbmluZ1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ob3B0aW9uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vLyBVcGRhdGUgYWNjZXB0YW5jZSBvcHRpb25cbnJvdXRlci5wdXQoJy9hY2NlcHRhbmNlLW9wdGlvbnMvOmlkJywgYXV0aGVudGljYXRlVG9rZW4sIHJlcXVpcmVSb2xlKFswLCAxLCA5XSksIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICBjb25zdCB7IHllYXJJZCwgdXBsb2FkQ29kZSwgYnJvYWRNZWFuaW5nIH0gPSByZXEuYm9keTtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIC8vIE1hcCB1cGxvYWQgY29kZXMgdG8gZGVzY3JpcHRpb25zXG4gIGNvbnN0IHVwbG9hZENvZGVEZXNjcmlwdGlvbnMgPSB7XG4gICAgJ1BsYW4nOiAnXHUwNURFXHUwNUVBXHUwNUQ1XHUwNURCXHUwNUUwXHUwNURGJyxcbiAgICAnTGF0ZSc6ICdcdTA1REVcdTA1RDBcdTA1RDdcdTA1RTgnLFxuICAgICdCbG9jayc6ICdcdTA1RDdcdTA1RTFcdTA1RDVcdTA1REQnLFxuICAgICdGaW5pc2gnOiAnXHUwNUQ0XHUwNUUxXHUwNUVBXHUwNUQ5XHUwNUQ5XHUwNUREJ1xuICB9O1xuXG4gIGNvbnN0IHVwbG9hZENvZGVEZXNjcmlwdGlvbiA9IHVwbG9hZENvZGVEZXNjcmlwdGlvbnNbdXBsb2FkQ29kZV07XG5cbiAgZGIucnVuKFxuICAgICdVUERBVEUgYWNjZXB0YW5jZV9vcHRpb25zIFNFVCB5ZWFyX2lkID0gPywgdXBsb2FkX2NvZGUgPSA/LCB1cGxvYWRfY29kZV9kZXNjcmlwdGlvbiA9ID8sIGJyb2FkX21lYW5pbmcgPSA/LCB1cGRhdGVkX2F0ID0gQ1VSUkVOVF9USU1FU1RBTVAgV0hFUkUgaWQgPSA/JyxcbiAgICBbeWVhcklkLCB1cGxvYWRDb2RlLCB1cGxvYWRDb2RlRGVzY3JpcHRpb24sIGJyb2FkTWVhbmluZywgaWRdLFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBhY2NlcHRhbmNlIG9wdGlvbjonLCBlcnIpO1xuICAgICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ1VOSVFVRSBjb25zdHJhaW50IGZhaWxlZCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdBY2NlcHRhbmNlIG9wdGlvbiBmb3IgdGhpcyB5ZWFyIGFscmVhZHkgZXhpc3RzJyB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjY2VwdGFuY2Ugb3B0aW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGRiLmdldCgnU0VMRUNUICogRlJPTSBhY2NlcHRhbmNlX29wdGlvbnMgV0hFUkUgaWQgPSA/JywgW2lkXSwgKGVyciwgcm93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1cGRhdGVkIGFjY2VwdGFuY2Ugb3B0aW9uOicsIGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHtcbiAgICAgICAgICBpZDogcm93LmlkLFxuICAgICAgICAgIHllYXJJZDogcm93LnllYXJfaWQsXG4gICAgICAgICAgdXBsb2FkQ29kZTogcm93LnVwbG9hZF9jb2RlLFxuICAgICAgICAgIHVwbG9hZENvZGVEZXNjcmlwdGlvbjogcm93LnVwbG9hZF9jb2RlX2Rlc2NyaXB0aW9uLFxuICAgICAgICAgIGJyb2FkTWVhbmluZzogcm93LmJyb2FkX21lYW5pbmdcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHJlcy5qc29uKG9wdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gRGVsZXRlIGFjY2VwdGFuY2Ugb3B0aW9uXG5yb3V0ZXIuZGVsZXRlKCcvYWNjZXB0YW5jZS1vcHRpb25zLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gYWNjZXB0YW5jZV9vcHRpb25zIFdIRVJFIGlkID0gPycsIFtpZF0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGFjY2VwdGFuY2Ugb3B0aW9uOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FjY2VwdGFuY2Ugb3B0aW9uIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiAnQWNjZXB0YW5jZSBvcHRpb24gZGVsZXRlZCBzdWNjZXNzZnVsbHknIH0pO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvcm91dGVzL3Byb2dyYW1zLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvcHJvZ3JhbXMuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IGdldERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZSB9IGZyb20gJy4uL21pZGRsZXdhcmUvYXV0aC5qcyc7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIEdldCBhbGwgcHJvZ3JhbXNcbnJvdXRlci5nZXQoJy8nLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmFsbChcbiAgICBgU0VMRUNUIHAuKiwgXG4gICAgICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgXG4gICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICAgICAgZG9tLmRlc2NyaXB0aW9uIGFzIGRvbWFpbl9uYW1lXG4gICAgIEZST00gcHJvZ3JhbXMgcCBcbiAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHAuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiBwLmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICBMRUZUIEpPSU4gZG9tYWlucyBkb20gT04gcC5kb21haW5faWQgPSBkb20uaWRcbiAgICAgT1JERVIgQlkgcC5jcmVhdGVkX2F0IERFU0NgLFxuICAgIChlcnIsIHJvd3MpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvZ3JhbXM6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFRyYW5zZm9ybSBkYXRhIHRvIG1hdGNoIGZyb250ZW5kIGZvcm1hdFxuICAgICAgY29uc3QgcHJvZ3JhbXMgPSByb3dzLm1hcChyb3cgPT4gKHtcbiAgICAgICAgdGFza0lkOiByb3cudGFza19pZCxcbiAgICAgICAgd29ya1llYXI6IHJvdy53b3JrX3llYXIsXG4gICAgICAgIHJlcXVpcmVkUXVhcnRlcjogcm93LnJlcXVpcmVkX3F1YXJ0ZXIgPyBuZXcgRGF0ZShyb3cucmVxdWlyZWRfcXVhcnRlcikgOiBudWxsLFxuICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICBkZXNjcmlwdGlvbjogcm93LmRlc2NyaXB0aW9uLFxuICAgICAgICByZXF1ZXN0ZXJJZDogcm93LnJlcXVlc3Rlcl9pZCxcbiAgICAgICAgcmVxdWVzdGVyTmFtZTogcm93LnJlcXVlc3Rlcl9uYW1lLFxuICAgICAgICBkaXZpc2lvbklkOiByb3cuZGl2aXNpb25faWQsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogcm93LmRpdmlzaW9uX25hbWUgfHwgcm93LmRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcGFydG1lbnRJZDogcm93LmRlcGFydG1lbnRfaWQsXG4gICAgICAgIGRlcGFydG1lbnROYW1lOiByb3cuZGVwYXJ0bWVudF9uYW1lIHx8IHJvdy5kZXBhcnRtZW50X25hbWUsXG4gICAgICAgIGRvbWFpbklkOiByb3cuZG9tYWluX2lkLFxuICAgICAgICBkb21haW5OYW1lOiByb3cuZG9tYWluX25hbWUgfHwgcm93LmRvbWFpbl9uYW1lLFxuICAgICAgICBlc3RpbWF0ZWRBbW91bnQ6IHJvdy5lc3RpbWF0ZWRfYW1vdW50LFxuICAgICAgICBjdXJyZW5jeTogcm93LmN1cnJlbmN5LFxuICAgICAgICBzdXBwbGllckxpc3Q6IHJvdy5zdXBwbGllcl9saXN0LFxuICAgICAgICBqdXN0aWZpY2F0aW9uOiByb3cuanVzdGlmaWNhdGlvbixcbiAgICAgICAgcGxhbm5pbmdTb3VyY2U6IHJvdy5wbGFubmluZ19zb3VyY2UsXG4gICAgICAgIGNvbXBsZXhpdHk6IHJvdy5jb21wbGV4aXR5LFxuICAgICAgICBlbmdhZ2VtZW50VHlwZUlkOiByb3cuZW5nYWdlbWVudF90eXBlX2lkLFxuICAgICAgICBlbmdhZ2VtZW50VHlwZU5hbWU6IHJvdy5lbmdhZ2VtZW50X3R5cGVfbmFtZSxcbiAgICAgICAgc3RhdHVzOiByb3cuc3RhdHVzLFxuICAgICAgICBhc3NpZ25lZE9mZmljZXJJZDogcm93LmFzc2lnbmVkX29mZmljZXJfaWQsXG4gICAgICAgIGFzc2lnbmVkT2ZmaWNlck5hbWU6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX25hbWUsXG4gICAgICAgIHRlYW1JZDogcm93LnRlYW1faWQsXG4gICAgICAgIHRlYW1OYW1lOiByb3cudGVhbV9uYW1lLFxuICAgICAgICBzdGFydERhdGU6IHJvdy5zdGFydF9kYXRlID8gbmV3IERhdGUocm93LnN0YXJ0X2RhdGUpIDogbnVsbCxcbiAgICAgICAgcGxhbm5pbmdOb3Rlczogcm93LnBsYW5uaW5nX25vdGVzLFxuICAgICAgICBvZmZpY2VyTm90ZXM6IHJvdy5vZmZpY2VyX25vdGVzLFxuICAgICAgICBsYXN0VXBkYXRlOiBuZXcgRGF0ZShyb3cudXBkYXRlZF9hdCksXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUocm93LmNyZWF0ZWRfYXQpXG4gICAgICB9KSk7XG4gICAgICBcbiAgICAgIHJlcy5qc29uKHByb2dyYW1zKTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gR2V0IHByb2dyYW0gYnkgSURcbnJvdXRlci5nZXQoJy86aWQnLCBhdXRoZW50aWNhdGVUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgXG4gIGRiLmdldChcbiAgICBgU0VMRUNUIHAuKiwgXG4gICAgICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgXG4gICAgICAgICAgICBkZXB0Lm5hbWUgYXMgZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICAgICAgZG9tLmRlc2NyaXB0aW9uIGFzIGRvbWFpbl9uYW1lXG4gICAgIEZST00gcHJvZ3JhbXMgcCBcbiAgICAgTEVGVCBKT0lOIGRpdmlzaW9ucyBkIE9OIHAuZGl2aXNpb25faWQgPSBkLmlkIFxuICAgICBMRUZUIEpPSU4gZGVwYXJ0bWVudHMgZGVwdCBPTiBwLmRlcGFydG1lbnRfaWQgPSBkZXB0LmlkIFxuICAgICBMRUZUIEpPSU4gZG9tYWlucyBkb20gT04gcC5kb21haW5faWQgPSBkb20uaWRcbiAgICAgV0hFUkUgcC50YXNrX2lkID0gP2AsXG4gICAgW2lkXSxcbiAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvZ3JhbTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9ncmFtIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFRyYW5zZm9ybSBkYXRhIHRvIG1hdGNoIGZyb250ZW5kIGZvcm1hdFxuICAgICAgY29uc3QgcHJvZ3JhbSA9IHtcbiAgICAgICAgdGFza0lkOiByb3cudGFza19pZCxcbiAgICAgICAgd29ya1llYXI6IHJvdy53b3JrX3llYXIsXG4gICAgICAgIHJlcXVpcmVkUXVhcnRlcjogcm93LnJlcXVpcmVkX3F1YXJ0ZXIgPyBuZXcgRGF0ZShyb3cucmVxdWlyZWRfcXVhcnRlcikgOiBudWxsLFxuICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICBkZXNjcmlwdGlvbjogcm93LmRlc2NyaXB0aW9uLFxuICAgICAgICByZXF1ZXN0ZXJJZDogcm93LnJlcXVlc3Rlcl9pZCxcbiAgICAgICAgcmVxdWVzdGVyTmFtZTogcm93LnJlcXVlc3Rlcl9uYW1lLFxuICAgICAgICBkaXZpc2lvbklkOiByb3cuZGl2aXNpb25faWQsXG4gICAgICAgIGRpdmlzaW9uTmFtZTogcm93LmRpdmlzaW9uX25hbWUgfHwgcm93LmRpdmlzaW9uX25hbWUsXG4gICAgICAgIGRlcGFydG1lbnRJZDogcm93LmRlcGFydG1lbnRfaWQsXG4gICAgICAgIGRlcGFydG1lbnROYW1lOiByb3cuZGVwYXJ0bWVudF9uYW1lIHx8IHJvdy5kZXBhcnRtZW50X25hbWUsXG4gICAgICAgIGRvbWFpbklkOiByb3cuZG9tYWluX2lkLFxuICAgICAgICBkb21haW5OYW1lOiByb3cuZG9tYWluX25hbWUgfHwgcm93LmRvbWFpbl9uYW1lLFxuICAgICAgICBlc3RpbWF0ZWRBbW91bnQ6IHJvdy5lc3RpbWF0ZWRfYW1vdW50LFxuICAgICAgICBjdXJyZW5jeTogcm93LmN1cnJlbmN5LFxuICAgICAgICBzdXBwbGllckxpc3Q6IHJvdy5zdXBwbGllcl9saXN0LFxuICAgICAgICBqdXN0aWZpY2F0aW9uOiByb3cuanVzdGlmaWNhdGlvbixcbiAgICAgICAgcGxhbm5pbmdTb3VyY2U6IHJvdy5wbGFubmluZ19zb3VyY2UsXG4gICAgICAgIGNvbXBsZXhpdHk6IHJvdy5jb21wbGV4aXR5LFxuICAgICAgICBlbmdhZ2VtZW50VHlwZUlkOiByb3cuZW5nYWdlbWVudF90eXBlX2lkLFxuICAgICAgICBlbmdhZ2VtZW50VHlwZU5hbWU6IHJvdy5lbmdhZ2VtZW50X3R5cGVfbmFtZSxcbiAgICAgICAgc3RhdHVzOiByb3cuc3RhdHVzLFxuICAgICAgICBhc3NpZ25lZE9mZmljZXJJZDogcm93LmFzc2lnbmVkX29mZmljZXJfaWQsXG4gICAgICAgIGFzc2lnbmVkT2ZmaWNlck5hbWU6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX25hbWUsXG4gICAgICAgIHRlYW1JZDogcm93LnRlYW1faWQsXG4gICAgICAgIHRlYW1OYW1lOiByb3cudGVhbV9uYW1lLFxuICAgICAgICBzdGFydERhdGU6IHJvdy5zdGFydF9kYXRlID8gbmV3IERhdGUocm93LnN0YXJ0X2RhdGUpIDogbnVsbCxcbiAgICAgICAgcGxhbm5pbmdOb3Rlczogcm93LnBsYW5uaW5nX25vdGVzLFxuICAgICAgICBvZmZpY2VyTm90ZXM6IHJvdy5vZmZpY2VyX25vdGVzLFxuICAgICAgICBsYXN0VXBkYXRlOiBuZXcgRGF0ZShyb3cudXBkYXRlZF9hdCksXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUocm93LmNyZWF0ZWRfYXQpXG4gICAgICB9O1xuICAgICAgXG4gICAgICByZXMuanNvbihwcm9ncmFtKTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gQ3JlYXRlIG5ldyBwcm9ncmFtXG5yb3V0ZXIucG9zdCgnLycsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMSwgNF0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3Qge1xuICAgIHdvcmtZZWFyLFxuICAgIHJlcXVpcmVkUXVhcnRlcixcbiAgICB0aXRsZSxcbiAgICBkZXNjcmlwdGlvbixcbiAgICByZXF1ZXN0ZXJOYW1lLFxuICAgIGRpdmlzaW9uTmFtZSxcbiAgICBkZXBhcnRtZW50TmFtZSxcbiAgICBkb21haW5OYW1lLFxuICAgIGVzdGltYXRlZEFtb3VudCxcbiAgICBjdXJyZW5jeSxcbiAgICBzdXBwbGllckxpc3QsXG4gICAganVzdGlmaWNhdGlvbixcbiAgICBwbGFubmluZ1NvdXJjZSxcbiAgICBjb21wbGV4aXR5XG4gIH0gPSByZXEuYm9keTtcblxuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gR2VuZXJhdGUgbmV3IHRhc2sgSURcbiAgZGIuZ2V0KCdTRUxFQ1QgTUFYKHRhc2tfaWQpIGFzIG1heElkIEZST00gcHJvZ3JhbXMnLCAoZXJyLCByb3cpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIG1heCB0YXNrIElEOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdUYXNrSWQgPSAocm93Lm1heElkIHx8IDApICsgMTtcblxuICAgIC8vIENvbnZlcnQgdW5kZWZpbmVkIHZhbHVlcyB0byBudWxsIGZvciBTUUxpdGUgY29tcGF0aWJpbGl0eVxuICAgIGNvbnN0IHNhZmVFc3RpbWF0ZWRBbW91bnQgPSBlc3RpbWF0ZWRBbW91bnQgIT09IHVuZGVmaW5lZCA/IGVzdGltYXRlZEFtb3VudCA6IG51bGw7XG4gICAgY29uc3Qgc2FmZUN1cnJlbmN5ID0gY3VycmVuY3kgIT09IHVuZGVmaW5lZCA/IGN1cnJlbmN5IDogbnVsbDtcbiAgICBjb25zdCBzYWZlQ29tcGxleGl0eSA9IGNvbXBsZXhpdHkgIT09IHVuZGVmaW5lZCA/IGNvbXBsZXhpdHkgOiBudWxsO1xuXG4gICAgZGIucnVuKFxuICAgICAgYElOU0VSVCBJTlRPIHByb2dyYW1zIFxuICAgICAgICh0YXNrX2lkLCB3b3JrX3llYXIsIHJlcXVpcmVkX3F1YXJ0ZXIsIHRpdGxlLCBkZXNjcmlwdGlvbiwgcmVxdWVzdGVyX25hbWUsIFxuICAgICAgICBkaXZpc2lvbl9uYW1lLCBkZXBhcnRtZW50X25hbWUsIGRvbWFpbl9uYW1lLCBlc3RpbWF0ZWRfYW1vdW50LCBjdXJyZW5jeSwgXG4gICAgICAgIHN1cHBsaWVyX2xpc3QsIGp1c3RpZmljYXRpb24sIHBsYW5uaW5nX3NvdXJjZSwgY29tcGxleGl0eSwgc3RhdHVzKSBcbiAgICAgICBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8sID8sID8sID8sID8sID8sID8sID8sID8sID8pYCxcbiAgICAgIFtuZXdUYXNrSWQsIHdvcmtZZWFyLCByZXF1aXJlZFF1YXJ0ZXIsIHRpdGxlLCBkZXNjcmlwdGlvbiwgcmVxdWVzdGVyTmFtZSxcbiAgICAgICBkaXZpc2lvbk5hbWUsIGRlcGFydG1lbnROYW1lLCBkb21haW5OYW1lLCBzYWZlRXN0aW1hdGVkQW1vdW50LCBzYWZlQ3VycmVuY3ksXG4gICAgICAgc3VwcGxpZXJMaXN0LCBqdXN0aWZpY2F0aW9uLCBwbGFubmluZ1NvdXJjZSwgc2FmZUNvbXBsZXhpdHksICdPcGVuJ10sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHByb2dyYW06JywgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZldGNoIHRoZSBjcmVhdGVkIHByb2dyYW1cbiAgICAgICAgZGIuZ2V0KFxuICAgICAgICAgIGBTRUxFQ1QgcC4qLCBcbiAgICAgICAgICAgICAgICAgIGQubmFtZSBhcyBkaXZpc2lvbl9uYW1lLCBcbiAgICAgICAgICAgICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWUsXG4gICAgICAgICAgICAgICAgICBkb20uZGVzY3JpcHRpb24gYXMgZG9tYWluX25hbWVcbiAgICAgICAgICAgRlJPTSBwcm9ncmFtcyBwIFxuICAgICAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gcC5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgICAgICAgIExFRlQgSk9JTiBkZXBhcnRtZW50cyBkZXB0IE9OIHAuZGVwYXJ0bWVudF9pZCA9IGRlcHQuaWQgXG4gICAgICAgICAgIExFRlQgSk9JTiBkb21haW5zIGRvbSBPTiBwLmRvbWFpbl9pZCA9IGRvbS5pZFxuICAgICAgICAgICBXSEVSRSBwLnRhc2tfaWQgPSA/YCxcbiAgICAgICAgICBbbmV3VGFza0lkXSxcbiAgICAgICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY3JlYXRlZCBwcm9ncmFtOicsIGVycik7XG4gICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm9ncmFtID0ge1xuICAgICAgICAgICAgICB0YXNrSWQ6IHJvdy50YXNrX2lkLFxuICAgICAgICAgICAgICB3b3JrWWVhcjogcm93LndvcmtfeWVhcixcbiAgICAgICAgICAgICAgcmVxdWlyZWRRdWFydGVyOiByb3cucmVxdWlyZWRfcXVhcnRlciA/IG5ldyBEYXRlKHJvdy5yZXF1aXJlZF9xdWFydGVyKSA6IG51bGwsXG4gICAgICAgICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiByb3cuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgIHJlcXVlc3RlcklkOiByb3cucmVxdWVzdGVyX2lkLFxuICAgICAgICAgICAgICByZXF1ZXN0ZXJOYW1lOiByb3cucmVxdWVzdGVyX25hbWUsXG4gICAgICAgICAgICAgIGRpdmlzaW9uSWQ6IHJvdy5kaXZpc2lvbl9pZCxcbiAgICAgICAgICAgICAgZGl2aXNpb25OYW1lOiByb3cuZGl2aXNpb25fbmFtZSB8fCByb3cuZGl2aXNpb25fbmFtZSxcbiAgICAgICAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICAgICAgZGVwYXJ0bWVudE5hbWU6IHJvdy5kZXBhcnRtZW50X25hbWUgfHwgcm93LmRlcGFydG1lbnRfbmFtZSxcbiAgICAgICAgICAgICAgZG9tYWluSWQ6IHJvdy5kb21haW5faWQsXG4gICAgICAgICAgICAgIGRvbWFpbk5hbWU6IHJvdy5kb21haW5fbmFtZSB8fCByb3cuZG9tYWluX25hbWUsXG4gICAgICAgICAgICAgIGVzdGltYXRlZEFtb3VudDogcm93LmVzdGltYXRlZF9hbW91bnQsXG4gICAgICAgICAgICAgIGN1cnJlbmN5OiByb3cuY3VycmVuY3ksXG4gICAgICAgICAgICAgIHN1cHBsaWVyTGlzdDogcm93LnN1cHBsaWVyX2xpc3QsXG4gICAgICAgICAgICAgIGp1c3RpZmljYXRpb246IHJvdy5qdXN0aWZpY2F0aW9uLFxuICAgICAgICAgICAgICBwbGFubmluZ1NvdXJjZTogcm93LnBsYW5uaW5nX3NvdXJjZSxcbiAgICAgICAgICAgICAgY29tcGxleGl0eTogcm93LmNvbXBsZXhpdHksXG4gICAgICAgICAgICAgIGVuZ2FnZW1lbnRUeXBlSWQ6IHJvdy5lbmdhZ2VtZW50X3R5cGVfaWQsXG4gICAgICAgICAgICAgIGVuZ2FnZW1lbnRUeXBlTmFtZTogcm93LmVuZ2FnZW1lbnRfdHlwZV9uYW1lLFxuICAgICAgICAgICAgICBzdGF0dXM6IHJvdy5zdGF0dXMsXG4gICAgICAgICAgICAgIGFzc2lnbmVkT2ZmaWNlcklkOiByb3cuYXNzaWduZWRfb2ZmaWNlcl9pZCxcbiAgICAgICAgICAgICAgYXNzaWduZWRPZmZpY2VyTmFtZTogcm93LmFzc2lnbmVkX29mZmljZXJfbmFtZSxcbiAgICAgICAgICAgICAgdGVhbUlkOiByb3cudGVhbV9pZCxcbiAgICAgICAgICAgICAgdGVhbU5hbWU6IHJvdy50ZWFtX25hbWUsXG4gICAgICAgICAgICAgIHN0YXJ0RGF0ZTogcm93LnN0YXJ0X2RhdGUgPyBuZXcgRGF0ZShyb3cuc3RhcnRfZGF0ZSkgOiBudWxsLFxuICAgICAgICAgICAgICBwbGFubmluZ05vdGVzOiByb3cucGxhbm5pbmdfbm90ZXMsXG4gICAgICAgICAgICAgIG9mZmljZXJOb3Rlczogcm93Lm9mZmljZXJfbm90ZXMsXG4gICAgICAgICAgICAgIGxhc3RVcGRhdGU6IG5ldyBEYXRlKHJvdy51cGRhdGVkX2F0KSxcbiAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZShyb3cuY3JlYXRlZF9hdClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHByb2dyYW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn0pO1xuXG4vLyBVcGRhdGUgcHJvZ3JhbVxucm91dGVyLnB1dCgnLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgdXBkYXRlRGF0YSA9IHJlcS5ib2R5O1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG5cbiAgLy8gQnVpbGQgZHluYW1pYyB1cGRhdGUgcXVlcnlcbiAgY29uc3QgZmllbGRzID0gW107XG4gIGNvbnN0IHZhbHVlcyA9IFtdO1xuXG4gIC8vIE1hcCBmcm9udGVuZCBmaWVsZCBuYW1lcyB0byBkYXRhYmFzZSBjb2x1bW4gbmFtZXNcbiAgY29uc3QgZmllbGRNYXBwaW5nID0ge1xuICAgIHdvcmtZZWFyOiAnd29ya195ZWFyJyxcbiAgICByZXF1aXJlZFF1YXJ0ZXI6ICdyZXF1aXJlZF9xdWFydGVyJyxcbiAgICB0aXRsZTogJ3RpdGxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ2Rlc2NyaXB0aW9uJyxcbiAgICByZXF1ZXN0ZXJOYW1lOiAncmVxdWVzdGVyX25hbWUnLFxuICAgIGRpdmlzaW9uTmFtZTogJ2RpdmlzaW9uX25hbWUnLFxuICAgIGRlcGFydG1lbnROYW1lOiAnZGVwYXJ0bWVudF9uYW1lJyxcbiAgICBkb21haW5OYW1lOiAnZG9tYWluX25hbWUnLFxuICAgIGVzdGltYXRlZEFtb3VudDogJ2VzdGltYXRlZF9hbW91bnQnLFxuICAgIGN1cnJlbmN5OiAnY3VycmVuY3knLFxuICAgIHN1cHBsaWVyTGlzdDogJ3N1cHBsaWVyX2xpc3QnLFxuICAgIGp1c3RpZmljYXRpb246ICdqdXN0aWZpY2F0aW9uJyxcbiAgICBwbGFubmluZ1NvdXJjZTogJ3BsYW5uaW5nX3NvdXJjZScsXG4gICAgY29tcGxleGl0eTogJ2NvbXBsZXhpdHknLFxuICAgIGVuZ2FnZW1lbnRUeXBlSWQ6ICdlbmdhZ2VtZW50X3R5cGVfaWQnLFxuICAgIGVuZ2FnZW1lbnRUeXBlTmFtZTogJ2VuZ2FnZW1lbnRfdHlwZV9uYW1lJyxcbiAgICBzdGF0dXM6ICdzdGF0dXMnLFxuICAgIGFzc2lnbmVkT2ZmaWNlcklkOiAnYXNzaWduZWRfb2ZmaWNlcl9pZCcsXG4gICAgYXNzaWduZWRPZmZpY2VyTmFtZTogJ2Fzc2lnbmVkX29mZmljZXJfbmFtZScsXG4gICAgdGVhbUlkOiAndGVhbV9pZCcsXG4gICAgdGVhbU5hbWU6ICd0ZWFtX25hbWUnLFxuICAgIHN0YXJ0RGF0ZTogJ3N0YXJ0X2RhdGUnLFxuICAgIHBsYW5uaW5nTm90ZXM6ICdwbGFubmluZ19ub3RlcycsXG4gICAgb2ZmaWNlck5vdGVzOiAnb2ZmaWNlcl9ub3RlcydcbiAgfTtcblxuICBPYmplY3Qua2V5cyh1cGRhdGVEYXRhKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGZpZWxkTWFwcGluZ1trZXldKSB7XG4gICAgICBmaWVsZHMucHVzaChgJHtmaWVsZE1hcHBpbmdba2V5XX0gPSA/YCk7XG4gICAgICAvLyBDb252ZXJ0IHVuZGVmaW5lZCB0byBudWxsIGZvciBTUUxpdGUgY29tcGF0aWJpbGl0eVxuICAgICAgY29uc3QgdmFsdWUgPSB1cGRhdGVEYXRhW2tleV0gIT09IHVuZGVmaW5lZCA/IHVwZGF0ZURhdGFba2V5XSA6IG51bGw7XG4gICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnTm8gdmFsaWQgZmllbGRzIHRvIHVwZGF0ZScgfSk7XG4gIH1cblxuICAvLyBBZGQgdXBkYXRlZF9hdFxuICBmaWVsZHMucHVzaCgndXBkYXRlZF9hdCA9IENVUlJFTlRfVElNRVNUQU1QJyk7XG4gIHZhbHVlcy5wdXNoKGlkKTtcblxuICBjb25zdCBxdWVyeSA9IGBVUERBVEUgcHJvZ3JhbXMgU0VUICR7ZmllbGRzLmpvaW4oJywgJyl9IFdIRVJFIHRhc2tfaWQgPSA/YDtcblxuICBkYi5ydW4ocXVlcnksIHZhbHVlcywgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgcHJvZ3JhbTonLCBlcnIpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2hhbmdlcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdQcm9ncmFtIG5vdCBmb3VuZCcgfSk7XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggdXBkYXRlZCBwcm9ncmFtXG4gICAgZGIuZ2V0KFxuICAgICAgYFNFTEVDVCBwLiosIFxuICAgICAgICAgICAgICBkLm5hbWUgYXMgZGl2aXNpb25fbmFtZSwgXG4gICAgICAgICAgICAgIGRlcHQubmFtZSBhcyBkZXBhcnRtZW50X25hbWUsXG4gICAgICAgICAgICAgIGRvbS5kZXNjcmlwdGlvbiBhcyBkb21haW5fbmFtZVxuICAgICAgIEZST00gcHJvZ3JhbXMgcCBcbiAgICAgICBMRUZUIEpPSU4gZGl2aXNpb25zIGQgT04gcC5kaXZpc2lvbl9pZCA9IGQuaWQgXG4gICAgICAgTEVGVCBKT0lOIGRlcGFydG1lbnRzIGRlcHQgT04gcC5kZXBhcnRtZW50X2lkID0gZGVwdC5pZCBcbiAgICAgICBMRUZUIEpPSU4gZG9tYWlucyBkb20gT04gcC5kb21haW5faWQgPSBkb20uaWRcbiAgICAgICBXSEVSRSBwLnRhc2tfaWQgPSA/YCxcbiAgICAgIFtpZF0sXG4gICAgICAoZXJyLCByb3cpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVwZGF0ZWQgcHJvZ3JhbTonLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHtcbiAgICAgICAgICB0YXNrSWQ6IHJvdy50YXNrX2lkLFxuICAgICAgICAgIHdvcmtZZWFyOiByb3cud29ya195ZWFyLFxuICAgICAgICAgIHJlcXVpcmVkUXVhcnRlcjogcm93LnJlcXVpcmVkX3F1YXJ0ZXIgPyBuZXcgRGF0ZShyb3cucmVxdWlyZWRfcXVhcnRlcikgOiBudWxsLFxuICAgICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IHJvdy5kZXNjcmlwdGlvbixcbiAgICAgICAgICByZXF1ZXN0ZXJJZDogcm93LnJlcXVlc3Rlcl9pZCxcbiAgICAgICAgICByZXF1ZXN0ZXJOYW1lOiByb3cucmVxdWVzdGVyX25hbWUsXG4gICAgICAgICAgZGl2aXNpb25JZDogcm93LmRpdmlzaW9uX2lkLFxuICAgICAgICAgIGRpdmlzaW9uTmFtZTogcm93LmRpdmlzaW9uX25hbWUgfHwgcm93LmRpdmlzaW9uX25hbWUsXG4gICAgICAgICAgZGVwYXJ0bWVudElkOiByb3cuZGVwYXJ0bWVudF9pZCxcbiAgICAgICAgICBkZXBhcnRtZW50TmFtZTogcm93LmRlcGFydG1lbnRfbmFtZSB8fCByb3cuZGVwYXJ0bWVudF9uYW1lLFxuICAgICAgICAgIGRvbWFpbklkOiByb3cuZG9tYWluX2lkLFxuICAgICAgICAgIGRvbWFpbk5hbWU6IHJvdy5kb21haW5fbmFtZSB8fCByb3cuZG9tYWluX25hbWUsXG4gICAgICAgICAgZXN0aW1hdGVkQW1vdW50OiByb3cuZXN0aW1hdGVkX2Ftb3VudCxcbiAgICAgICAgICBjdXJyZW5jeTogcm93LmN1cnJlbmN5LFxuICAgICAgICAgIHN1cHBsaWVyTGlzdDogcm93LnN1cHBsaWVyX2xpc3QsXG4gICAgICAgICAganVzdGlmaWNhdGlvbjogcm93Lmp1c3RpZmljYXRpb24sXG4gICAgICAgICAgcGxhbm5pbmdTb3VyY2U6IHJvdy5wbGFubmluZ19zb3VyY2UsXG4gICAgICAgICAgY29tcGxleGl0eTogcm93LmNvbXBsZXhpdHksXG4gICAgICAgICAgZW5nYWdlbWVudFR5cGVJZDogcm93LmVuZ2FnZW1lbnRfdHlwZV9pZCxcbiAgICAgICAgICBlbmdhZ2VtZW50VHlwZU5hbWU6IHJvdy5lbmdhZ2VtZW50X3R5cGVfbmFtZSxcbiAgICAgICAgICBzdGF0dXM6IHJvdy5zdGF0dXMsXG4gICAgICAgICAgYXNzaWduZWRPZmZpY2VySWQ6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX2lkLFxuICAgICAgICAgIGFzc2lnbmVkT2ZmaWNlck5hbWU6IHJvdy5hc3NpZ25lZF9vZmZpY2VyX25hbWUsXG4gICAgICAgICAgdGVhbUlkOiByb3cudGVhbV9pZCxcbiAgICAgICAgICB0ZWFtTmFtZTogcm93LnRlYW1fbmFtZSxcbiAgICAgICAgICBzdGFydERhdGU6IHJvdy5zdGFydF9kYXRlID8gbmV3IERhdGUocm93LnN0YXJ0X2RhdGUpIDogbnVsbCxcbiAgICAgICAgICBwbGFubmluZ05vdGVzOiByb3cucGxhbm5pbmdfbm90ZXMsXG4gICAgICAgICAgb2ZmaWNlck5vdGVzOiByb3cub2ZmaWNlcl9ub3RlcyxcbiAgICAgICAgICBsYXN0VXBkYXRlOiBuZXcgRGF0ZShyb3cudXBkYXRlZF9hdCksXG4gICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZShyb3cuY3JlYXRlZF9hdClcbiAgICAgICAgfTtcblxuICAgICAgICByZXMuanNvbihwcm9ncmFtKTtcbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn0pO1xuXG4vLyBEZWxldGUgcHJvZ3JhbVxucm91dGVyLmRlbGV0ZSgnLzppZCcsIGF1dGhlbnRpY2F0ZVRva2VuLCByZXF1aXJlUm9sZShbMCwgMSwgOV0pLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuXG4gIGRiLnJ1bignREVMRVRFIEZST00gcHJvZ3JhbXMgV0hFUkUgdGFza19pZCA9ID8nLCBbaWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBwcm9ncmFtOicsIGVycik7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFuZ2VzID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1Byb2dyYW0gbm90IGZvdW5kJyB9KTtcbiAgICB9XG5cbiAgICByZXMuanNvbih7IG1lc3NhZ2U6ICdQcm9ncmFtIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgfSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2V4cHJlc3MtYXBwLmpzXCI7aW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCBoZWxtZXQgZnJvbSAnaGVsbWV0JztcbmltcG9ydCBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgcmF0ZUxpbWl0IGZyb20gJ2V4cHJlc3MtcmF0ZS1saW1pdCc7XG5pbXBvcnQgeyBpbml0aWFsaXplRGF0YWJhc2UgfSBmcm9tICcuL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5pbXBvcnQgYXV0aFJvdXRlcyBmcm9tICcuL3JvdXRlcy9hdXRoLmpzJztcbmltcG9ydCB3b3JrZXJzUm91dGVzIGZyb20gJy4vcm91dGVzL3dvcmtlcnMuanMnO1xuaW1wb3J0IHN5c3RlbVJvdXRlcyBmcm9tICcuL3JvdXRlcy9zeXN0ZW0uanMnO1xuaW1wb3J0IHBsYW5uaW5nUm91dGVzIGZyb20gJy4vcm91dGVzL3BsYW5uaW5nLmpzJztcbmltcG9ydCBwcm9ncmFtc1JvdXRlcyBmcm9tICcuL3JvdXRlcy9wcm9ncmFtcy5qcyc7XG5cbi8vIEVudmlyb25tZW50IHZhcmlhYmxlc1xucHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQgfHwgJ3lvdXItc3VwZXItc2VjcmV0LWp3dC1rZXktY2hhbmdlLXRoaXMtaW4tcHJvZHVjdGlvbic7XG5wcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiA9IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOIHx8ICcyNGgnO1xucHJvY2Vzcy5lbnYuQkNSWVBUX1JPVU5EUyA9IHByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMgfHwgJzEyJztcblxubGV0IGV4cHJlc3NBcHAgPSBudWxsO1xubGV0IGlzQXBwSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRXhwcmVzc0FwcCgpIHtcbiAgaWYgKGV4cHJlc3NBcHApIHtcbiAgICByZXR1cm4gZXhwcmVzc0FwcDtcbiAgfVxuXG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcblxuICAvLyBTZWN1cml0eSBtaWRkbGV3YXJlXG4gIGFwcC51c2UoaGVsbWV0KHtcbiAgICBjb250ZW50U2VjdXJpdHlQb2xpY3k6IGZhbHNlLCAvLyBEaXNhYmxlIENTUCBmb3IgZGV2ZWxvcG1lbnRcbiAgfSkpO1xuICBhcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuXG4gIC8vIFJhdGUgbGltaXRpbmdcbiAgY29uc3QgbGltaXRlciA9IHJhdGVMaW1pdCh7XG4gICAgd2luZG93TXM6IDE1ICogNjAgKiAxMDAwLCAvLyAxNSBtaW51dGVzXG4gICAgbWF4OiAxMDAwLCAvLyBJbmNyZWFzZWQgbGltaXQgZm9yIGRldmVsb3BtZW50XG4gICAgbWVzc2FnZTogeyBlcnJvcjogJ1RvbyBtYW55IHJlcXVlc3RzIGZyb20gdGhpcyBJUCwgcGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nIH1cbiAgfSk7XG4gIGFwcC51c2UobGltaXRlcik7XG5cbiAgLy8gQ09SUyBjb25maWd1cmF0aW9uXG4gIGFwcC51c2UoY29ycyh7XG4gICAgb3JpZ2luOiB0cnVlLCAvLyBBbGxvdyBhbGwgb3JpZ2lucyBpbiBkZXZlbG9wbWVudFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxuICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXG4gICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXVxuICB9KSk7XG5cbiAgLy8gQm9keSBwYXJzaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZShleHByZXNzLmpzb24oeyBsaW1pdDogJzEwbWInIH0pKTtcbiAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSwgbGltaXQ6ICcxMG1iJyB9KSk7XG5cbiAgLy8gTG9nZ2luZ1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIGFwcC51c2UobW9yZ2FuKCdkZXYnKSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIGRhdGFiYXNlIG9ubHkgb25jZVxuICBpZiAoIWlzQXBwSW5pdGlhbGl6ZWQpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgaW5pdGlhbGl6ZURhdGFiYXNlKCk7XG4gICAgICBjb25zb2xlLmxvZygnXHUyNzA1IERhdGFiYXNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgXG4gICAgICAvLyBBbHdheXMgc2VlZCBkYXRhYmFzZSB0byBlbnN1cmUgZGVmYXVsdCB1c2VycyBleGlzdFxuICAgICAgY29uc3QgeyBzZWVkRGF0YWJhc2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zY3JpcHRzL3NlZWREYXRhYmFzZS5qcycpO1xuICAgICAgYXdhaXQgc2VlZERhdGFiYXNlKCk7XG4gICAgICBjb25zb2xlLmxvZygnXHUyNzA1IERhdGFiYXNlIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIFxuICAgICAgaXNBcHBJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBEYXRhYmFzZSBpbml0aWFsaXphdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLy8gUm91dGVzXG4gIGFwcC51c2UoJy9hdXRoJywgYXV0aFJvdXRlcyk7XG4gIGFwcC51c2UoJy93b3JrZXJzJywgd29ya2Vyc1JvdXRlcyk7XG4gIGFwcC51c2UoJy9zeXN0ZW0nLCBzeXN0ZW1Sb3V0ZXMpO1xuICBhcHAudXNlKCcvcGxhbm5pbmcnLCBwbGFubmluZ1JvdXRlcyk7XG4gIGFwcC51c2UoJy9wcm9ncmFtcycsIHByb2dyYW1zUm91dGVzKTtcblxuICAvLyBIZWFsdGggY2hlY2sgZW5kcG9pbnRcbiAgYXBwLmdldCgnL2hlYWx0aCcsIChyZXEsIHJlcykgPT4ge1xuICAgIHJlcy5qc29uKHsgc3RhdHVzOiAnT0snLCB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KTtcbiAgfSk7XG5cbiAgLy8gRXJyb3IgaGFuZGxpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKChlcnIsIHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgY29uc29sZS5lcnJvcignRXhwcmVzcyBlcnJvcjonLCBlcnIpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgXG4gICAgICBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsXG4gICAgICBtZXNzYWdlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IGVyci5tZXNzYWdlIDogJ1NvbWV0aGluZyB3ZW50IHdyb25nJ1xuICAgIH0pO1xuICB9KTtcblxuICAvLyA0MDQgaGFuZGxlclxuICBhcHAudXNlKChyZXEsIHJlcykgPT4ge1xuICAgIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdSb3V0ZSBub3QgZm91bmQnIH0pO1xuICB9KTtcblxuICBleHByZXNzQXBwID0gYXBwO1xuICBjb25zb2xlLmxvZygnXHUyNzA1IEV4cHJlc3MgYXBwIGNyZWF0ZWQgYW5kIGNvbmZpZ3VyZWQnKTtcbiAgcmV0dXJuIGFwcDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRXhwcmVzc0FwcCB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gU2V0IGNvbnNpc3RlbnQgZGF0YWJhc2UgcGF0aCBiZWZvcmUgYW55IHNlcnZlciBtb2R1bGVzIGFyZSBpbXBvcnRlZFxucHJvY2Vzcy5lbnYuREJfUEFUSCA9ICcuL3NyYy9zZXJ2ZXIvZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2UsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBDdXN0b20gcGx1Z2luIHRvIGludGVncmF0ZSBFeHByZXNzIHNlcnZlclxuICAgIHtcbiAgICAgIG5hbWU6ICdleHByZXNzLWludGVncmF0aW9uJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gSW1wb3J0IGFuZCBzZXR1cCBFeHByZXNzIHJvdXRlc1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCB0aGUgRXhwcmVzcyBhcHBcbiAgICAgICAgICAgIGNvbnN0IHsgY3JlYXRlRXhwcmVzc0FwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4cHJlc3NBcHAgPSBhd2FpdCBjcmVhdGVFeHByZXNzQXBwKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgcmVxdWVzdCB3aXRoIEV4cHJlc3NcbiAgICAgICAgICAgIGV4cHJlc3NBcHAocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHByZXNzIG1pZGRsZXdhcmUgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgbmV4dChlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBeVEsT0FBTyxhQUFhO0FBQzdSLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQVV2QixTQUFTLGNBQWM7QUFDNUIsTUFBSSxDQUFDLFlBQVk7QUFDZixZQUFRLElBQUksNkJBQTZCLE9BQU87QUFDaEQsaUJBQWEsSUFBSSxRQUFRLFNBQVMsU0FBUyxDQUFDLFFBQVE7QUFDbEQsVUFBSSxLQUFLO0FBQ1AsZ0JBQVEsTUFBTSwyQkFBMkIsR0FBRztBQUM1QyxjQUFNO0FBQUEsTUFDUjtBQUNBLGNBQVEsSUFBSSxvQ0FBb0MsT0FBTztBQUFBLElBQ3pELENBQUM7QUFHRCxlQUFXLElBQUksMEJBQTBCO0FBQUEsRUFDM0M7QUFDQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLGdCQUFnQjtBQUM5QixNQUFJLFlBQVk7QUFDZCxlQUFXLE1BQU0sQ0FBQyxRQUFRO0FBQ3hCLFVBQUksS0FBSztBQUNQLGdCQUFRLE1BQU0sMkJBQTJCLEdBQUc7QUFBQSxNQUM5QyxPQUFPO0FBQ0wsZ0JBQVEsSUFBSSw0QkFBNEI7QUFBQSxNQUMxQztBQUFBLElBQ0YsQ0FB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QkFBa0IsQ0FBQztBQUFBLEVBQ25ELENBQUM7QUFFRCxlQUFhO0FBQ2IsVUFBUSxJQUFJLDJDQUFzQztBQUNsRCxTQUFPO0FBQ1Q7QUExR0EsSUFrQkksWUFDQTtBQW5CSjtBQUFBO0FBTUE7QUFDQSxJQUFBQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0EsWUFBUSxJQUFJLGFBQWEsUUFBUSxJQUFJLGNBQWM7QUFDbkQsWUFBUSxJQUFJLGlCQUFpQixRQUFRLElBQUksa0JBQWtCO0FBQzNELFlBQVEsSUFBSSxnQkFBZ0IsUUFBUSxJQUFJLGlCQUFpQjtBQUV6RCxJQUFJLGFBQWE7QUFDakIsSUFBSSxtQkFBbUI7QUFBQTtBQUFBOzs7QUNuQmtNLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPQyxXQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLFFBQVEsSUFBSSxVQUFVO0FBR3RCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sZ0JBQWdCO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUE7QUFBQSxJQUVoQjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFFdEIsZUFBTyxZQUFZLElBQUksUUFBUSxPQUFPLEtBQUssS0FBSyxTQUFTO0FBQ3ZELGNBQUk7QUFFRixrQkFBTSxFQUFFLGtCQUFBQyxrQkFBaUIsSUFBSSxNQUFNO0FBQ25DLGtCQUFNQyxjQUFhLE1BQU1ELGtCQUFpQjtBQUcxQyxZQUFBQyxZQUFXLEtBQUssS0FBSyxJQUFJO0FBQUEsVUFDM0IsU0FBUyxPQUFPO0FBQ2Qsb0JBQVEsTUFBTSw2QkFBNkIsS0FBSztBQUNoRCxpQkFBSyxLQUFLO0FBQUEsVUFDWjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsiX19kaXJuYW1lIiwgImp3dCIsICJpbml0X2F1dGgiLCAiZXhwcmVzcyIsICJiY3J5cHQiLCAicm91dGVyIiwgImVyciIsICJiY3J5cHQiLCAiZXhwcmVzcyIsICJyb3V0ZXIiLCAiZXJyIiwgImV4cHJlc3MiLCAicm91dGVyIiwgImVyciIsICJleHByZXNzIiwgInJvdXRlciIsICJlcnIiLCAicm93IiwgImV4cHJlc3MiLCAic2VlZERhdGFiYXNlIiwgImluaXRfYXV0aCIsICJwYXRoIiwgImNyZWF0ZUV4cHJlc3NBcHAiLCAiZXhwcmVzc0FwcCIsICJwYXRoIl0KfQo=
