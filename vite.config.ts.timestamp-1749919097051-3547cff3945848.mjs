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

// src/server/scripts/seedDatabase.js
var seedDatabase_exports = {};
__export(seedDatabase_exports, {
  seedDatabase: () => seedDatabase
});
import bcrypt2 from "file:///home/project/node_modules/bcryptjs/index.js";
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
    const adminPassword = await bcrypt2.hash("123456", 12);
    db2.run(
      `INSERT OR IGNORE INTO users (
        employee_id, full_name, role_code, role_description, 
        password_hash, email
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      ["9999", "\u05DE\u05E0\u05D4\u05DC \u05DE\u05E2\u05E8\u05DB\u05EA", 9, "\u05D2\u05D5\u05E8\u05DD \u05D8\u05DB\u05E0\u05D9", adminPassword, "admin@system.com"]
    );
    const managerPassword = await bcrypt2.hash("123456", 12);
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
import express2 from "file:///home/project/node_modules/express/index.js";
import cors from "file:///home/project/node_modules/cors/lib/index.js";
import helmet from "file:///home/project/node_modules/helmet/index.mjs";
import morgan from "file:///home/project/node_modules/morgan/index.js";
import compression from "file:///home/project/node_modules/compression/index.js";
import rateLimit from "file:///home/project/node_modules/express-rate-limit/dist/index.mjs";
async function createExpressApp() {
  if (expressApp) {
    return expressApp;
  }
  const app = express2();
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
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ extended: true, limit: "10mb" }));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzIiwgInNyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtpbXBvcnQgc3FsaXRlMyBmcm9tICdzcWxpdGUzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgREJfUEFUSCA9IHByb2Nlc3MuZW52LkRCX1BBVEggfHwgJy4vZGF0YS9wcm9jdXJlbWVudC5kYic7XG5cbi8vIEVuc3VyZSBkYXRhIGRpcmVjdG9yeSBleGlzdHNcbmNvbnN0IGRhdGFEaXIgPSBwYXRoLmRpcm5hbWUoREJfUEFUSCk7XG5pZiAoIWZzLmV4aXN0c1N5bmMoZGF0YURpcikpIHtcbiAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGEgZGlyZWN0b3J5OicsIGRhdGFEaXIpO1xuICBmcy5ta2RpclN5bmMoZGF0YURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG59XG5cbmxldCBkYiA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldERhdGFiYXNlKCkge1xuICBpZiAoIWRiKSB7XG4gICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBkYXRhYmFzZSBhdDonLCBEQl9QQVRIKTtcbiAgICBkYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKERCX1BBVEgsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igb3BlbmluZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIFNRTGl0ZSBkYXRhYmFzZSBhdDonLCBEQl9QQVRIKTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBFbmFibGUgZm9yZWlnbiBrZXlzXG4gICAgZGIucnVuKCdQUkFHTUEgZm9yZWlnbl9rZXlzID0gT04nKTtcbiAgfVxuICByZXR1cm4gZGI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVEYXRhYmFzZSgpIHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBkYi5zZXJpYWxpemUoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRhdGFiYXNlIHRhYmxlcy4uLicpO1xuICAgICAgXG4gICAgICAvLyBVc2VycyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgdXNlcnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbXBsb3llZV9pZCBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBmdWxsX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSBURVhULFxuICAgICAgICAgIHBhc3N3b3JkX2hhc2ggVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBhdmFpbGFibGVfd29ya19kYXlzIElOVEVHRVIsXG4gICAgICAgICAgZW1haWwgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBPcmdhbml6YXRpb25hbCByb2xlcyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgb3JnYW5pemF0aW9uYWxfcm9sZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBwZXJtaXNzaW9ucyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEaXZpc2lvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGVwYXJ0bWVudHMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRlcGFydG1lbnRzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRpdmlzaW9uX2lkKSBSRUZFUkVOQ0VTIGRpdmlzaW9ucyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2N1cmVtZW50IHRlYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9jdXJlbWVudF90ZWFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRG9tYWlucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZG9tYWlucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEFjdGl2aXR5IHBvb2wgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjdGl2aXR5X3Bvb2wgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgdG9vbHNfYW5kX3Jlc291cmNlcyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGUgcHJvY2Vzc2VzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVfcHJvY2Vzc2VzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGVuZ2FnZW1lbnRfdHlwZV9pZCkgUkVGRVJFTkNFUyBlbmdhZ2VtZW50X3R5cGVzKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoYWN0aXZpdHlfaWQpIFJFRkVSRU5DRVMgYWN0aXZpdHlfcG9vbChpZCksXG4gICAgICAgICAgVU5JUVVFKGVuZ2FnZW1lbnRfdHlwZV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHRhc2tfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgd29ya195ZWFyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgcmVxdWlyZWRfcXVhcnRlciBEQVRFIE5PVCBOVUxMLFxuICAgICAgICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICByZXF1ZXN0ZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXF1ZXN0ZXJfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgZGl2aXNpb25fbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X25hbWUgVEVYVCxcbiAgICAgICAgICBkb21haW5faWQgSU5URUdFUixcbiAgICAgICAgICBkb21haW5fbmFtZSBURVhULFxuICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQgREVDSU1BTCgxNSwyKSxcbiAgICAgICAgICBjdXJyZW5jeSBURVhULFxuICAgICAgICAgIHN1cHBsaWVyX2xpc3QgVEVYVCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uIFRFWFQsXG4gICAgICAgICAgcGxhbm5pbmdfc291cmNlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9ncmFtIHRhc2tzIChzdGF0aW9ucykgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1fdGFza3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBwcm9ncmFtX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIGNvbXBsZXRpb25fZGF0ZSBEQVRFLFxuICAgICAgICAgIHJlcG9ydGluZ191c2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfbmFtZSBURVhULFxuICAgICAgICAgIHJlZmVyZW5jZSBURVhULFxuICAgICAgICAgIG5vdGVzIFRFWFQsXG4gICAgICAgICAgaXNfbGFzdF9zdGF0aW9uIEJPT0xFQU4gREVGQVVMVCAwLFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHByb2dyYW1faWQpIFJFRkVSRU5DRVMgcHJvZ3JhbXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUocHJvZ3JhbV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFN5c3RlbSBzZXR0aW5ncyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3lzdGVtX3NldHRpbmdzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgc2V0dGluZ19rZXkgVEVYVCBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgc2V0dGluZ192YWx1ZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGAsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHN5c3RlbV9zZXR0aW5ncyB0YWJsZTonLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBpbmRleGVzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfc3RhdHVzIE9OIHByb2dyYW1zKHN0YXR1cyknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfd29ya195ZWFyIE9OIHByb2dyYW1zKHdvcmtfeWVhciknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbV90YXNrc19wcm9ncmFtX2lkIE9OIHByb2dyYW1fdGFza3MocHJvZ3JhbV9pZCknKTtcbiAgICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfdXNlcnNfZW1wbG95ZWVfaWQgT04gdXNlcnMoZW1wbG95ZWVfaWQpJywgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIGluZGV4ZXM6JywgZXJyKTtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBjb25zb2xlLmxvZygnRGF0YWJhc2UgdGFibGVzIGFuZCBpbmRleGVzIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2xvc2VEYXRhYmFzZSgpIHtcbiAgaWYgKGRiKSB7XG4gICAgZGIuY2xvc2UoKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjbG9zaW5nIGRhdGFiYXNlOicsIGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnRGF0YWJhc2UgY29ubmVjdGlvbiBjbG9zZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkYiA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgZ2V0RGF0YWJhc2UsXG4gIGluaXRpYWxpemVEYXRhYmFzZSxcbiAgY2xvc2VEYXRhYmFzZVxufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9taWRkbGV3YXJlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanNcIjtpbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS5qcyc7XG5cbmZ1bmN0aW9uIGF1dGhlbnRpY2F0ZVRva2VuKHJlcSwgcmVzLCBuZXh0KSB7XG4gIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVyc1snYXV0aG9yaXphdGlvbiddO1xuICBjb25zdCB0b2tlbiA9IGF1dGhIZWFkZXIgJiYgYXV0aEhlYWRlci5zcGxpdCgnICcpWzFdO1xuXG4gIGlmICghdG9rZW4pIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0FjY2VzcyB0b2tlbiByZXF1aXJlZCcgfSk7XG4gIH1cblxuICBqd3QudmVyaWZ5KHRva2VuLCBwcm9jZXNzLmVudi5KV1RfU0VDUkVULCAoZXJyLCB1c2VyKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIG9yIGV4cGlyZWQgdG9rZW4nIH0pO1xuICAgIH1cbiAgICByZXEudXNlciA9IHVzZXI7XG4gICAgbmV4dCgpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYXV0aG9yaXplUm9sZXMoLi4ucm9sZXMpIHtcbiAgcmV0dXJuIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGlmICghcmVxLnVzZXIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQXV0aGVudGljYXRpb24gcmVxdWlyZWQnIH0pO1xuICAgIH1cblxuICAgIGlmICghcm9sZXMuaW5jbHVkZXMocmVxLnVzZXIucm9sZUNvZGUpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0luc3VmZmljaWVudCBwZXJtaXNzaW9ucycgfSk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVVzZXJFeGlzdHMocmVxLCByZXMsIG5leHQpIHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBjb25zdCB1c2VySWQgPSByZXEudXNlci5pZDtcblxuICBkYi5nZXQoXG4gICAgJ1NFTEVDVCBpZCwgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlIEZST00gdXNlcnMgV0hFUkUgaWQgPSA/JyxcbiAgICBbdXNlcklkXSxcbiAgICAoZXJyLCB1c2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRGF0YWJhc2UgZXJyb3InIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdVc2VyIG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJlcS51c2VyLmN1cnJlbnRVc2VyID0gdXNlcjtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gICk7XG59XG5cbmV4cG9ydCB7XG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcyxcbiAgdmFsaWRhdGVVc2VyRXhpc3RzXG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9hdXRoLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2ltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgeyBib2R5LCB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgYXV0aGVudGljYXRlVG9rZW4gfSBmcm9tICcuLi9taWRkbGV3YXJlL2F1dGguanMnO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBMb2dpbiBlbmRwb2ludFxucm91dGVyLnBvc3QoJy9sb2dpbicsIFtcbiAgYm9keSgnZW1wbG95ZWVJZCcpLmlzTGVuZ3RoKHsgbWluOiA0LCBtYXg6IDQgfSkud2l0aE1lc3NhZ2UoJ0VtcGxveWVlIElEIG11c3QgYmUgNCBkaWdpdHMnKSxcbiAgYm9keSgncGFzc3dvcmQnKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHsgZW1wbG95ZWVJZCwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIGRiLmdldChcbiAgICAgICdTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIGVtcGxveWVlX2lkID0gPycsXG4gICAgICBbZW1wbG95ZWVJZF0sXG4gICAgICBhc3luYyAoZXJyLCB1c2VyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1ZhbGlkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgdXNlci5wYXNzd29yZF9oYXNoKTtcbiAgICAgICAgaWYgKCFpc1ZhbGlkUGFzc3dvcmQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcbiAgICAgICAgICB7IFxuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsIFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSBcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsXG4gICAgICAgICAgeyBleHBpcmVzSW46IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOIHx8ICcyNGgnIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXMuanNvbih7XG4gICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdMb2dpbiBlcnJvcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBHZXQgY3VycmVudCB1c2VyIGluZm9cbnJvdXRlci5nZXQoJy9tZScsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuZ2V0KFxuICAgICdTRUxFQ1QgaWQsIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgcHJvY3VyZW1lbnRfdGVhbSwgZW1haWwgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLFxuICAgIFtyZXEudXNlci5pZF0sXG4gICAgKGVyciwgdXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXMuanNvbih7XG4gICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgIHByb2N1cmVtZW50VGVhbTogdXNlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzXCI7aW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgeyBnZXREYXRhYmFzZSwgaW5pdGlhbGl6ZURhdGFiYXNlLCBjbG9zZURhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gc2VlZERhdGFiYXNlKCkge1xuICB0cnkge1xuICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnU2VlZGluZyBkYXRhYmFzZSB3aXRoIGluaXRpYWwgZGF0YS4uLicpO1xuICAgIFxuICAgIC8vIFNlZWQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbiAgICBjb25zdCByb2xlcyA9IFtcbiAgICAgIHsgcm9sZUNvZGU6IDEsIGRlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUU4XHUwNUU5XHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNURCXHUwNURDIFx1MDVFQVx1MDVENFx1MDVEQ1x1MDVEOVx1MDVEQlx1MDVEOSBcdTA1RDRcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICB7IHJvbGVDb2RlOiAyLCBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEMFx1MDVFOSBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNUUwXHUwNUQ5XHUwNUREIFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiAzLCBkZXNjcmlwdGlvbjogJ1x1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVERicsIHBlcm1pc3Npb25zOiAnXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyIFx1MDVFNFx1MDVFMlx1MDVEOVx1MDVEQ1x1MDVENVx1MDVEOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVERVx1MDVFOVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEMVx1MDVFN1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMFx1MDVEN1x1MDVFOCBcdTA1RTFcdTA1RDhcdTA1RDhcdTA1RDVcdTA1RTEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDJcdTA1RDNcdTA1RThcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENVx1MDVEOFx1MDVEMVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RTJcdTA1RDZcdTA1RTgnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVFQSBcdTA1RUFcdTA1RTlcdTA1RUFcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUQ0XHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICBbcm9sZS5yb2xlQ29kZSwgcm9sZS5kZXNjcmlwdGlvbiwgcm9sZS5wZXJtaXNzaW9uc11cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZGl2aXNpb25zXG4gICAgY29uc3QgZGl2aXNpb25zID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQwXHUwNUQyXHUwNUUzIFx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycsIGlzSW50ZXJuYWw6IHRydWUgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RTlcdTA1RDlcdTA1RDVcdTA1RDVcdTA1RTcnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDcgXHUwNUQ3XHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUwXHUwNUQ5IFx1MDVEMCcsIGlzSW50ZXJuYWw6IGZhbHNlIH1cbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZGl2aXNpb24gb2YgZGl2aXNpb25zKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgIFtkaXZpc2lvbi5uYW1lLCBkaXZpc2lvbi5pc0ludGVybmFsXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBkZXBhcnRtZW50c1xuICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVENCcsIGRpdmlzaW9uSWQ6IDEgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQScsIGRpdmlzaW9uSWQ6IDIgfVxuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCBkZXB0IG9mIGRlcGFydG1lbnRzKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2RlcHQubmFtZSwgZGVwdC5kaXZpc2lvbklkXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBwcm9jdXJlbWVudCB0ZWFtc1xuICAgIGNvbnN0IHRlYW1zID0gW1xuICAgICAgJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScsICdcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknLCAnXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JywgJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsICdcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDknLCAnXHUwNUQxXHUwNUQ5XHUwNUQ4XHUwNUQ3XHUwNUQ1XHUwNUUwXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0ZWFtIG9mIHRlYW1zKSB7XG4gICAgICBkYi5ydW4oJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsIFt0ZWFtXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZG9tYWluc1xuICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCBcdTA1RDVcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLFxuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDlcdTA1REQgXHUwNURFXHUwNUU3XHUwNUU2XHUwNUQ1XHUwNUUyXHUwNUQ5XHUwNUQ5XHUwNUREJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVERVx1MDVFOVx1MDVFOFx1MDVEM1x1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZG9tYWluIG9mIGRvbWFpbnMpIHtcbiAgICAgIGRiLnJ1bignSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJywgW2RvbWFpbl0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTlcdTA1RDVcdTA1RDVcdTA1RDBcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNURCXHUwNUUwXHUwNUVBIFx1MDVERVx1MDVFNFx1MDVFOFx1MDVEOCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCB0b29sczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDgsIFx1MDVEOVx1MDVEOVx1MDVFMlx1MDVENVx1MDVFNSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQgXHUwNURFXHUwNURCXHUwNUU4XHUwNUQ2JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNURELCBcdTA1RDBcdTA1RUFcdTA1RTggXHUwNUQ0XHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNURFXHUwNUQ4XHUwNUU4XHUwNUQ5XHUwNUU2XHUwNUVBIFx1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENCwgXHUwNUQ1XHUwNUUyXHUwNUQzXHUwNUVBIFx1MDVEMVx1MDVEN1x1MDVEOVx1MDVFMFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RDZcdTA1RDVcdTA1REJcdTA1RDQnLCB0b29sczogJ1x1MDVFNFx1MDVFOFx1MDVENVx1MDVEOFx1MDVENVx1MDVFN1x1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDdcdTA1RENcdTA1RDhcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDdcdTA1RUFcdTA1RDlcdTA1REVcdTA1RDQgXHUwNUUyXHUwNURDIFx1MDVENFx1MDVFMVx1MDVEQlx1MDVERCcsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDdcdTA1RDVcdTA1RDZcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RTdcdTA1RThcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgdG9vbHM6ICdcdTA1RThcdTA1RTlcdTA1RDlcdTA1REVcdTA1RUEgXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUQ1XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1REJcdTA1RTFcdTA1RTRcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVFNFx1MDVFOFx1MDVENVx1MDVEOVx1MDVFN1x1MDVEOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sczogJ1x1MDVEM1x1MDVENVx1MDVENyBcdTA1RTFcdTA1RDlcdTA1REJcdTA1RDVcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGFjdGl2aXR5IG9mIGFjdGl2aXRpZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2FjdGl2aXR5Lm5hbWUsIGFjdGl2aXR5LnRvb2xzXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBlbmdhZ2VtZW50IHR5cGVzXG4gICAgY29uc3QgZW5nYWdlbWVudFR5cGVzID0gW1xuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RDVcdTA1REVcdTA1RDFcdTA1RDknLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1REVcdTA1RDVcdTA1RDJcdTA1RDFcdTA1REMnLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0eXBlIG9mIGVuZ2FnZW1lbnRUeXBlcykge1xuICAgICAgZGIucnVuKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZW5nYWdlbWVudF90eXBlcyAobmFtZSkgVkFMVUVTICg/KScsIFt0eXBlXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IGFkbWluIHVzZXJcbiAgICBjb25zdCBhZG1pblBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgcGFzc3dvcmRfaGFzaCwgZW1haWxcbiAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICBbJzk5OTknLCAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScsIDksICdcdTA1RDJcdTA1RDVcdTA1RThcdTA1REQgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgYWRtaW5QYXNzd29yZCwgJ2FkbWluQHN5c3RlbS5jb20nXVxuICAgICk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIHNhbXBsZSBwcm9jdXJlbWVudCBtYW5hZ2VyXG4gICAgY29uc3QgbWFuYWdlclBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgcGFzc3dvcmRfaGFzaCwgcHJvY3VyZW1lbnRfdGVhbSwgYXZhaWxhYmxlX3dvcmtfZGF5c1xuICAgICAgKSBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8pYCxcbiAgICAgIFsnMTAwMScsICdcdTA1RDBcdTA1RDFcdTA1RThcdTA1RDRcdTA1REQgXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDJywgMSwgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBtYW5hZ2VyUGFzc3dvcmQsICdcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RDNcdTA1RDknLCAyMDBdXG4gICAgKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseSEnKTtcbiAgICBjb25zb2xlLmxvZygnRGVmYXVsdCB1c2VycyBjcmVhdGVkOicpO1xuICAgIGNvbnNvbGUubG9nKCctIEFkbWluOiA5OTk5IC8gMTIzNDU2Jyk7XG4gICAgY29uc29sZS5sb2coJy0gTWFuYWdlcjogMTAwMSAvIDEyMzQ1NicpO1xuICAgIFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZWVkIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgc2VlZERhdGFiYXNlIH07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9leHByZXNzLWFwcC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanNcIjtpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0IG1vcmdhbiBmcm9tICdtb3JnYW4nO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcbmltcG9ydCByYXRlTGltaXQgZnJvbSAnZXhwcmVzcy1yYXRlLWxpbWl0JztcbmltcG9ydCB7IGluaXRpYWxpemVEYXRhYmFzZSB9IGZyb20gJy4vY29uZmlnL2RhdGFiYXNlLmpzJztcbmltcG9ydCBhdXRoUm91dGVzIGZyb20gJy4vcm91dGVzL2F1dGguanMnO1xuXG4vLyBFbnZpcm9ubWVudCB2YXJpYWJsZXNcbnByb2Nlc3MuZW52LkpXVF9TRUNSRVQgPSBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICd5b3VyLXN1cGVyLXNlY3JldC1qd3Qta2V5LWNoYW5nZS10aGlzLWluLXByb2R1Y3Rpb24nO1xucHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gPSBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB8fCAnMjRoJztcbnByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMgPSBwcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTIHx8ICcxMic7XG5wcm9jZXNzLmVudi5EQl9QQVRIID0gcHJvY2Vzcy5lbnYuREJfUEFUSCB8fCAnLi9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxubGV0IGV4cHJlc3NBcHAgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeHByZXNzQXBwKCkge1xuICBpZiAoZXhwcmVzc0FwcCkge1xuICAgIHJldHVybiBleHByZXNzQXBwO1xuICB9XG5cbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4gIC8vIFNlY3VyaXR5IG1pZGRsZXdhcmVcbiAgYXBwLnVzZShoZWxtZXQoe1xuICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeTogZmFsc2UsIC8vIERpc2FibGUgQ1NQIGZvciBkZXZlbG9wbWVudFxuICB9KSk7XG4gIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG5cbiAgLy8gUmF0ZSBsaW1pdGluZ1xuICBjb25zdCBsaW1pdGVyID0gcmF0ZUxpbWl0KHtcbiAgICB3aW5kb3dNczogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcbiAgICBtYXg6IDEwMCwgLy8gbGltaXQgZWFjaCBJUCB0byAxMDAgcmVxdWVzdHMgcGVyIHdpbmRvd01zXG4gICAgbWVzc2FnZTogeyBlcnJvcjogJ1RvbyBtYW55IHJlcXVlc3RzIGZyb20gdGhpcyBJUCwgcGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nIH1cbiAgfSk7XG4gIGFwcC51c2UobGltaXRlcik7XG5cbiAgLy8gQ09SUyBjb25maWd1cmF0aW9uXG4gIGFwcC51c2UoY29ycyh7XG4gICAgb3JpZ2luOiB0cnVlLCAvLyBBbGxvdyBhbGwgb3JpZ2lucyBpbiBkZXZlbG9wbWVudFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlXG4gIH0pKTtcblxuICAvLyBCb2R5IHBhcnNpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKGV4cHJlc3MuanNvbih7IGxpbWl0OiAnMTBtYicgfSkpO1xuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcblxuICAvLyBMb2dnaW5nXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2NvbWJpbmVkJykpO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBkYXRhYmFzZVxuICB0cnkge1xuICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHknKTtcbiAgICBcbiAgICAvLyBTZWVkIGRhdGFiYXNlXG4gICAgY29uc3QgeyBzZWVkRGF0YWJhc2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zY3JpcHRzL3NlZWREYXRhYmFzZS5qcycpO1xuICAgIGF3YWl0IHNlZWREYXRhYmFzZSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgfVxuXG4gIC8vIEhlYWx0aCBjaGVjayBlbmRwb2ludFxuICBhcHAuZ2V0KCcvaGVhbHRoJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLmpzb24oeyBcbiAgICAgIHN0YXR1czogJ09LJywgXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gQVBJIFJvdXRlc1xuICBhcHAudXNlKCcvYXV0aCcsIGF1dGhSb3V0ZXMpO1xuXG4gIC8vIEVycm9yIGhhbmRsaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZSgoZXJyLCByZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSBFcnJvcjonLCBlcnIpO1xuICAgIFxuICAgIGlmIChlcnIudHlwZSA9PT0gJ2VudGl0eS5wYXJzZS5mYWlsZWQnKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgSlNPTiBmb3JtYXQnIH0pO1xuICAgIH1cbiAgICBcbiAgICByZXMuc3RhdHVzKGVyci5zdGF0dXMgfHwgNTAwKS5qc29uKHtcbiAgICAgIGVycm9yOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nIFxuICAgICAgICA/ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIFxuICAgICAgICA6IGVyci5tZXNzYWdlXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIDQwNCBoYW5kbGVyIGZvciBBUEkgcm91dGVzXG4gIGFwcC51c2UoJyonLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnQVBJIHJvdXRlIG5vdCBmb3VuZCcgfSk7XG4gIH0pO1xuXG4gIGV4cHJlc3NBcHAgPSBhcHA7XG4gIHJldHVybiBhcHA7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZUV4cHJlc3NBcHAgfTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBDdXN0b20gcGx1Z2luIHRvIGludGVncmF0ZSBFeHByZXNzIHNlcnZlclxuICAgIHtcbiAgICAgIG5hbWU6ICdleHByZXNzLWludGVncmF0aW9uJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgLy8gSW1wb3J0IGFuZCBzZXR1cCBFeHByZXNzIHJvdXRlc1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCB0aGUgRXhwcmVzcyBhcHBcbiAgICAgICAgICAgIGNvbnN0IHsgY3JlYXRlRXhwcmVzc0FwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL3NyYy9zZXJ2ZXIvZXhwcmVzcy1hcHAuanMnKTtcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGF3YWl0IGNyZWF0ZUV4cHJlc3NBcHAoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSByZXF1ZXN0IHdpdGggRXhwcmVzc1xuICAgICAgICAgICAgYXBwKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwcmVzcyBtaWRkbGV3YXJlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBeVEsT0FBTyxhQUFhO0FBQzdSLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFhZixTQUFTLGNBQWM7QUFDckIsTUFBSSxDQUFDLElBQUk7QUFDUCxZQUFRLElBQUksNkJBQTZCLE9BQU87QUFDaEQsU0FBSyxJQUFJLFFBQVEsU0FBUyxTQUFTLENBQUMsUUFBUTtBQUMxQyxVQUFJLEtBQUs7QUFDUCxnQkFBUSxNQUFNLDJCQUEyQixHQUFHO0FBQzVDLGNBQU07QUFBQSxNQUNSO0FBQ0EsY0FBUSxJQUFJLG9DQUFvQyxPQUFPO0FBQUEsSUFDekQsQ0FBQztBQUdELE9BQUcsSUFBSSwwQkFBMEI7QUFBQSxFQUNuQztBQUNBLFNBQU87QUFDVDtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU1BLE1BQUssWUFBWTtBQUV2QixTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxJQUFBQSxJQUFHLFVBQVUsTUFBTTtBQUNqQixjQUFRLElBQUksNkJBQTZCO0FBR3pDLE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BZ0JOO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQU1OO0FBR0QsTUFBQUEsSUFBRyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FPTjtBQUdELE1BQUFB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QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBO0FBQUEsSUFFaEI7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBRXRCLGVBQU8sWUFBWSxJQUFJLFFBQVEsT0FBTyxLQUFLLEtBQUssU0FBUztBQUN2RCxjQUFJO0FBRUYsa0JBQU0sRUFBRSxrQkFBQUMsa0JBQWlCLElBQUksTUFBTTtBQUNuQyxrQkFBTSxNQUFNLE1BQU1BLGtCQUFpQjtBQUduQyxnQkFBSSxLQUFLLEtBQUssSUFBSTtBQUFBLFVBQ3BCLFNBQVMsT0FBTztBQUNkLG9CQUFRLE1BQU0sNkJBQTZCLEtBQUs7QUFDaEQsZ0JBQUksYUFBYTtBQUNqQixnQkFBSSxJQUFJLHVCQUF1QjtBQUFBLFVBQ2pDO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBS0MsTUFBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJkYiIsICJlcnIiLCAiand0IiwgImluaXRfYXV0aCIsICJkYiIsICJiY3J5cHQiLCAiZGIiLCAiZXhwcmVzcyIsICJzZWVkRGF0YWJhc2UiLCAiaW5pdF9hdXRoIiwgInBhdGgiLCAiY3JlYXRlRXhwcmVzc0FwcCIsICJwYXRoIl0KfQo=
