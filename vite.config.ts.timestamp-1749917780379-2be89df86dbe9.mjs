var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/config/database.js
var database_exports = {};
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        throw err;
      }
      console.log("Connected to SQLite database");
    });
    db.run("PRAGMA foreign_keys = ON");
  }
  return db;
}
async function initializeDatabase() {
  const db2 = getDatabase();
  return new Promise((resolve, reject) => {
    db2.serialize(() => {
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
      `);
      db2.run("CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status)");
      db2.run("CREATE INDEX IF NOT EXISTS idx_programs_work_year ON programs(work_year)");
      db2.run("CREATE INDEX IF NOT EXISTS idx_program_tasks_program_id ON program_tasks(program_id)");
      db2.run("CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)");
      console.log("Database tables created successfully");
      resolve();
    });
  });
}
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
      }
    });
    db = null;
  }
}
var sqlite3, path, fs, DB_PATH, dataDir, db;
var init_database = __esm({
  "src/server/config/database.js"() {
    sqlite3 = __require("file:///home/project/node_modules/sqlite3/lib/sqlite3.js").verbose();
    path = __require("path");
    fs = __require("fs");
    DB_PATH = process.env.DB_PATH || "./data/procurement.db";
    dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = null;
    module.exports = {
      getDatabase,
      initializeDatabase,
      closeDatabase
    };
  }
});

// src/server/middleware/auth.js
var auth_exports = {};
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
function validateUserExists(req, res, next) {
  const db2 = getDatabase2();
  const userId = req.user.id;
  db2.get(
    "SELECT id, employee_id, full_name, role_code FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      req.user.currentUser = user;
      next();
    }
  );
}
var jwt, getDatabase2;
var init_auth = __esm({
  "src/server/middleware/auth.js"() {
    jwt = __require("file:///home/project/node_modules/jsonwebtoken/index.js");
    ({ getDatabase: getDatabase2 } = (init_database(), __toCommonJS(database_exports)));
    module.exports = {
      authenticateToken,
      authorizeRoles,
      validateUserExists
    };
  }
});

// src/server/routes/auth.js
var auth_exports2 = {};
var express, bcrypt, jwt2, body, validationResult, getDatabase3, authenticateToken2, router;
var init_auth2 = __esm({
  "src/server/routes/auth.js"() {
    express = __require("file:///home/project/node_modules/express/index.js");
    bcrypt = __require("file:///home/project/node_modules/bcryptjs/index.js");
    jwt2 = __require("file:///home/project/node_modules/jsonwebtoken/index.js");
    ({ body, validationResult } = __require("file:///home/project/node_modules/express-validator/lib/index.js"));
    ({ getDatabase: getDatabase3 } = (init_database(), __toCommonJS(database_exports)));
    ({ authenticateToken: authenticateToken2 } = (init_auth(), __toCommonJS(auth_exports)));
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
        const db2 = getDatabase3();
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
    router.get("/me", authenticateToken2, (req, res) => {
      const db2 = getDatabase3();
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
    module.exports = router;
  }
});

// src/server/scripts/seedDatabase.js
var seedDatabase_exports = {};
async function seedDatabase() {
  try {
    await initializeDatabase2();
    const db2 = getDatabase4();
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
  } finally {
    closeDatabase2();
  }
}
var bcrypt2, getDatabase4, initializeDatabase2, closeDatabase2;
var init_seedDatabase = __esm({
  "src/server/scripts/seedDatabase.js"() {
    bcrypt2 = __require("file:///home/project/node_modules/bcryptjs/index.js");
    ({ getDatabase: getDatabase4, initializeDatabase: initializeDatabase2, closeDatabase: closeDatabase2 } = (init_database(), __toCommonJS(database_exports)));
    if (__require.main === module) {
      seedDatabase();
    }
    module.exports = { seedDatabase };
  }
});

// src/server/index.js
var server_exports = {};
async function createServer() {
  const app = express2();
  app.use(helmet());
  app.use(compression());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
  app.use("/api", limiter);
  app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:3000"],
    credentials: true
  }));
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ extended: true, limit: "10mb" }));
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }
  try {
    await initializeDatabase3();
    console.log("Database initialized successfully");
    const { seedDatabase: seedDatabase2 } = (init_seedDatabase(), __toCommonJS(seedDatabase_exports));
    await seedDatabase2();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
  app.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api", (err, req, res, next) => {
    console.error("API Error:", err);
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
    });
  });
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
  return app;
}
var express2, cors, helmet, morgan, compression, rateLimit, bcrypt3, jwt3, body2, validationResult2, initializeDatabase3, getDatabase5, authRoutes;
var init_server = __esm({
  "src/server/index.js"() {
    express2 = __require("file:///home/project/node_modules/express/index.js");
    cors = __require("file:///home/project/node_modules/cors/lib/index.js");
    helmet = __require("file:///home/project/node_modules/helmet/index.mjs");
    morgan = __require("file:///home/project/node_modules/morgan/index.js");
    compression = __require("file:///home/project/node_modules/compression/index.js");
    rateLimit = __require("file:///home/project/node_modules/express-rate-limit/dist/index.mjs");
    bcrypt3 = __require("file:///home/project/node_modules/bcryptjs/index.js");
    jwt3 = __require("file:///home/project/node_modules/jsonwebtoken/index.js");
    ({ body: body2, validationResult: validationResult2 } = __require("file:///home/project/node_modules/express-validator/lib/index.js"));
    ({ initializeDatabase: initializeDatabase3, getDatabase: getDatabase5 } = (init_database(), __toCommonJS(database_exports)));
    authRoutes = (init_auth2(), __toCommonJS(auth_exports2));
    process.env.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
    process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "12";
    process.env.DB_PATH = process.env.DB_PATH || "./data/procurement.db";
    module.exports = { createServer };
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
      name: "express-server",
      configureServer(server) {
        const { createServer: createServer2 } = (init_server(), __toCommonJS(server_exports));
        createServer2().then((app) => {
          server.middlewares.use("/api", app);
          console.log("Express server integrated with Vite dev server");
        }).catch((error) => {
          console.error("Failed to start Express server:", error);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanMiLCAic3JjL3NlcnZlci9taWRkbGV3YXJlL2F1dGguanMiLCAic3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qcyIsICJzcmMvc2VydmVyL3NjcmlwdHMvc2VlZERhdGFiYXNlLmpzIiwgInNyYy9zZXJ2ZXIvaW5kZXguanMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvY29uZmlnL2RhdGFiYXNlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9jb25maWcvZGF0YWJhc2UuanNcIjtjb25zdCBzcWxpdGUzID0gcmVxdWlyZSgnc3FsaXRlMycpLnZlcmJvc2UoKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNvbnN0IERCX1BBVEggPSBwcm9jZXNzLmVudi5EQl9QQVRIIHx8ICcuL2RhdGEvcHJvY3VyZW1lbnQuZGInO1xuXG4vLyBFbnN1cmUgZGF0YSBkaXJlY3RvcnkgZXhpc3RzXG5jb25zdCBkYXRhRGlyID0gcGF0aC5kaXJuYW1lKERCX1BBVEgpO1xuaWYgKCFmcy5leGlzdHNTeW5jKGRhdGFEaXIpKSB7XG4gIGZzLm1rZGlyU3luYyhkYXRhRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbn1cblxubGV0IGRiID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0RGF0YWJhc2UoKSB7XG4gIGlmICghZGIpIHtcbiAgICBkYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKERCX1BBVEgsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igb3BlbmluZyBkYXRhYmFzZTonLCBlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIFNRTGl0ZSBkYXRhYmFzZScpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIEVuYWJsZSBmb3JlaWduIGtleXNcbiAgICBkYi5ydW4oJ1BSQUdNQSBmb3JlaWduX2tleXMgPSBPTicpO1xuICB9XG4gIHJldHVybiBkYjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZURhdGFiYXNlKCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGRiLnNlcmlhbGl6ZSgoKSA9PiB7XG4gICAgICAvLyBVc2VycyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgdXNlcnMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBlbXBsb3llZV9pZCBURVhUIFVOSVFVRSBOT1QgTlVMTCxcbiAgICAgICAgICBmdWxsX25hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBOT1QgTlVMTCxcbiAgICAgICAgICByb2xlX2Rlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgZGl2aXNpb25faWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X2lkIElOVEVHRVIsXG4gICAgICAgICAgcHJvY3VyZW1lbnRfdGVhbSBURVhULFxuICAgICAgICAgIHBhc3N3b3JkX2hhc2ggVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBhdmFpbGFibGVfd29ya19kYXlzIElOVEVHRVIsXG4gICAgICAgICAgZW1haWwgVEVYVCxcbiAgICAgICAgICBjcmVhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBPcmdhbml6YXRpb25hbCByb2xlcyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgb3JnYW5pemF0aW9uYWxfcm9sZXMgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICByb2xlX2NvZGUgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBwZXJtaXNzaW9ucyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBEaXZpc2lvbnMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRpdmlzaW9ucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTCxcbiAgICAgICAgICBpc19pbnRlcm5hbCBCT09MRUFOIERFRkFVTFQgMVxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRGVwYXJ0bWVudHMgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGRlcGFydG1lbnRzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGRpdmlzaW9uX2lkKSBSRUZFUkVOQ0VTIGRpdmlzaW9ucyhpZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2N1cmVtZW50IHRlYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9jdXJlbWVudF90ZWFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIG5hbWUgVEVYVCBOT1QgTlVMTFxuICAgICAgICApXG4gICAgICBgKTtcblxuICAgICAgLy8gRG9tYWlucyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgZG9tYWlucyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQgTk9UIE5VTExcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIEFjdGl2aXR5IHBvb2wgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFjdGl2aXR5X3Bvb2wgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBuYW1lIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgdG9vbHNfYW5kX3Jlc291cmNlcyBURVhUXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGVzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgbmFtZSBURVhUIE5PVCBOVUxMXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBFbmdhZ2VtZW50IHR5cGUgcHJvY2Vzc2VzIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBlbmdhZ2VtZW50X3R5cGVfcHJvY2Vzc2VzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgZW5nYWdlbWVudF90eXBlX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKGVuZ2FnZW1lbnRfdHlwZV9pZCkgUkVGRVJFTkNFUyBlbmdhZ2VtZW50X3R5cGVzKGlkKSxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoYWN0aXZpdHlfaWQpIFJFRkVSRU5DRVMgYWN0aXZpdHlfcG9vbChpZCksXG4gICAgICAgICAgVU5JUVVFKGVuZ2FnZW1lbnRfdHlwZV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFByb2dyYW1zIHRhYmxlXG4gICAgICBkYi5ydW4oYFxuICAgICAgICBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBwcm9ncmFtcyAoXG4gICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgIHRhc2tfaWQgSU5URUdFUiBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgd29ya195ZWFyIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgcmVxdWlyZWRfcXVhcnRlciBEQVRFIE5PVCBOVUxMLFxuICAgICAgICAgIHRpdGxlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgZGVzY3JpcHRpb24gVEVYVCxcbiAgICAgICAgICByZXF1ZXN0ZXJfaWQgSU5URUdFUixcbiAgICAgICAgICByZXF1ZXN0ZXJfbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRpdmlzaW9uX2lkIElOVEVHRVIsXG4gICAgICAgICAgZGl2aXNpb25fbmFtZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlcGFydG1lbnRfaWQgSU5URUdFUixcbiAgICAgICAgICBkZXBhcnRtZW50X25hbWUgVEVYVCxcbiAgICAgICAgICBkb21haW5faWQgSU5URUdFUixcbiAgICAgICAgICBkb21haW5fbmFtZSBURVhULFxuICAgICAgICAgIGVzdGltYXRlZF9hbW91bnQgREVDSU1BTCgxNSwyKSxcbiAgICAgICAgICBjdXJyZW5jeSBURVhULFxuICAgICAgICAgIHN1cHBsaWVyX2xpc3QgVEVYVCxcbiAgICAgICAgICBqdXN0aWZpY2F0aW9uIFRFWFQsXG4gICAgICAgICAgcGxhbm5pbmdfc291cmNlIFRFWFQgTk9UIE5VTEwsXG4gICAgICAgICAgY29tcGxleGl0eSBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9pZCBJTlRFR0VSLFxuICAgICAgICAgIGVuZ2FnZW1lbnRfdHlwZV9uYW1lIFRFWFQsXG4gICAgICAgICAgc3RhdHVzIFRFWFQgTk9UIE5VTEwgREVGQVVMVCAnT3BlbicsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIHRlYW1faWQgSU5URUdFUixcbiAgICAgICAgICB0ZWFtX25hbWUgVEVYVCxcbiAgICAgICAgICBzdGFydF9kYXRlIERBVEUsXG4gICAgICAgICAgcGxhbm5pbmdfbm90ZXMgVEVYVCxcbiAgICAgICAgICBvZmZpY2VyX25vdGVzIFRFWFQsXG4gICAgICAgICAgY3JlYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QLFxuICAgICAgICAgIHVwZGF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICBGT1JFSUdOIEtFWSAoZW5nYWdlbWVudF90eXBlX2lkKSBSRUZFUkVOQ0VTIGVuZ2FnZW1lbnRfdHlwZXMoaWQpXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBQcm9ncmFtIHRhc2tzIChzdGF0aW9ucykgdGFibGVcbiAgICAgIGRiLnJ1bihgXG4gICAgICAgIENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHByb2dyYW1fdGFza3MgKFxuICAgICAgICAgIGlkIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCxcbiAgICAgICAgICBwcm9ncmFtX2lkIElOVEVHRVIgTk9UIE5VTEwsXG4gICAgICAgICAgc3RhdGlvbl9pZCBJTlRFR0VSIE5PVCBOVUxMLFxuICAgICAgICAgIGFjdGl2aXR5X2lkIElOVEVHRVIsXG4gICAgICAgICAgYXNzaWduZWRfb2ZmaWNlcl9pZCBJTlRFR0VSLFxuICAgICAgICAgIGFzc2lnbmVkX29mZmljZXJfbmFtZSBURVhULFxuICAgICAgICAgIGNvbXBsZXRpb25fZGF0ZSBEQVRFLFxuICAgICAgICAgIHJlcG9ydGluZ191c2VyX2lkIElOVEVHRVIsXG4gICAgICAgICAgcmVwb3J0aW5nX3VzZXJfbmFtZSBURVhULFxuICAgICAgICAgIHJlZmVyZW5jZSBURVhULFxuICAgICAgICAgIG5vdGVzIFRFWFQsXG4gICAgICAgICAgaXNfbGFzdF9zdGF0aW9uIEJPT0xFQU4gREVGQVVMVCAwLFxuICAgICAgICAgIGNyZWF0ZWRfYXQgREFURVRJTUUgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCxcbiAgICAgICAgICB1cGRhdGVkX2F0IERBVEVUSU1FIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAsXG4gICAgICAgICAgRk9SRUlHTiBLRVkgKHByb2dyYW1faWQpIFJFRkVSRU5DRVMgcHJvZ3JhbXMoaWQpLFxuICAgICAgICAgIEZPUkVJR04gS0VZIChhY3Rpdml0eV9pZCkgUkVGRVJFTkNFUyBhY3Rpdml0eV9wb29sKGlkKSxcbiAgICAgICAgICBVTklRVUUocHJvZ3JhbV9pZCwgc3RhdGlvbl9pZClcbiAgICAgICAgKVxuICAgICAgYCk7XG5cbiAgICAgIC8vIFN5c3RlbSBzZXR0aW5ncyB0YWJsZVxuICAgICAgZGIucnVuKGBcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3lzdGVtX3NldHRpbmdzIChcbiAgICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICAgc2V0dGluZ19rZXkgVEVYVCBVTklRVUUgTk9UIE5VTEwsXG4gICAgICAgICAgc2V0dGluZ192YWx1ZSBURVhUIE5PVCBOVUxMLFxuICAgICAgICAgIGRlc2NyaXB0aW9uIFRFWFQsXG4gICAgICAgICAgdXBkYXRlZF9hdCBEQVRFVElNRSBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXG4gICAgICAgIClcbiAgICAgIGApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5kZXhlcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF9wcm9ncmFtc19zdGF0dXMgT04gcHJvZ3JhbXMoc3RhdHVzKScpO1xuICAgICAgZGIucnVuKCdDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfcHJvZ3JhbXNfd29ya195ZWFyIE9OIHByb2dyYW1zKHdvcmtfeWVhciknKTtcbiAgICAgIGRiLnJ1bignQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgaWR4X3Byb2dyYW1fdGFza3NfcHJvZ3JhbV9pZCBPTiBwcm9ncmFtX3Rhc2tzKHByb2dyYW1faWQpJyk7XG4gICAgICBkYi5ydW4oJ0NSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGlkeF91c2Vyc19lbXBsb3llZV9pZCBPTiB1c2VycyhlbXBsb3llZV9pZCknKTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ0RhdGFiYXNlIHRhYmxlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2xvc2VEYXRhYmFzZSgpIHtcbiAgaWYgKGRiKSB7XG4gICAgZGIuY2xvc2UoKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjbG9zaW5nIGRhdGFiYXNlOicsIGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnRGF0YWJhc2UgY29ubmVjdGlvbiBjbG9zZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkYiA9IG51bGw7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldERhdGFiYXNlLFxuICBpbml0aWFsaXplRGF0YWJhc2UsXG4gIGNsb3NlRGF0YWJhc2Vcbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL21pZGRsZXdhcmUvYXV0aC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9hdXRoLmpzXCI7Y29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJyk7XG5jb25zdCB7IGdldERhdGFiYXNlIH0gPSByZXF1aXJlKCcuLi9jb25maWcvZGF0YWJhc2UnKTtcblxuZnVuY3Rpb24gYXV0aGVudGljYXRlVG9rZW4ocmVxLCByZXMsIG5leHQpIHtcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzWydhdXRob3JpemF0aW9uJ107XG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlciAmJiBhdXRoSGVhZGVyLnNwbGl0KCcgJylbMV07XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQWNjZXNzIHRva2VuIHJlcXVpcmVkJyB9KTtcbiAgfVxuXG4gIGp3dC52ZXJpZnkodG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsIChlcnIsIHVzZXIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicgfSk7XG4gICAgfVxuICAgIHJlcS51c2VyID0gdXNlcjtcbiAgICBuZXh0KCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhdXRob3JpemVSb2xlcyguLi5yb2xlcykge1xuICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgaWYgKCFyZXEudXNlcikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdBdXRoZW50aWNhdGlvbiByZXF1aXJlZCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyb2xlcy5pbmNsdWRlcyhyZXEudXNlci5yb2xlQ29kZSkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9KTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlVXNlckV4aXN0cyhyZXEsIHJlcywgbmV4dCkge1xuICBjb25zdCBkYiA9IGdldERhdGFiYXNlKCk7XG4gIGNvbnN0IHVzZXJJZCA9IHJlcS51c2VyLmlkO1xuXG4gIGRiLmdldChcbiAgICAnU0VMRUNUIGlkLCBlbXBsb3llZV9pZCwgZnVsbF9uYW1lLCByb2xlX2NvZGUgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLFxuICAgIFt1c2VySWRdLFxuICAgIChlcnIsIHVzZXIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdEYXRhYmFzZSBlcnJvcicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVxLnVzZXIuY3VycmVudFVzZXIgPSB1c2VyO1xuICAgICAgbmV4dCgpO1xuICAgIH1cbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGF1dGhlbnRpY2F0ZVRva2VuLFxuICBhdXRob3JpemVSb2xlcyxcbiAgdmFsaWRhdGVVc2VyRXhpc3RzXG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3JvdXRlcy9hdXRoLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9yb3V0ZXMvYXV0aC5qc1wiO2NvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBiY3J5cHQgPSByZXF1aXJlKCdiY3J5cHRqcycpO1xuY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJyk7XG5jb25zdCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSA9IHJlcXVpcmUoJ2V4cHJlc3MtdmFsaWRhdG9yJyk7XG5jb25zdCB7IGdldERhdGFiYXNlIH0gPSByZXF1aXJlKCcuLi9jb25maWcvZGF0YWJhc2UnKTtcbmNvbnN0IHsgYXV0aGVudGljYXRlVG9rZW4gfSA9IHJlcXVpcmUoJy4uL21pZGRsZXdhcmUvYXV0aCcpO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXG4vLyBMb2dpbiBlbmRwb2ludFxucm91dGVyLnBvc3QoJy9sb2dpbicsIFtcbiAgYm9keSgnZW1wbG95ZWVJZCcpLmlzTGVuZ3RoKHsgbWluOiA0LCBtYXg6IDQgfSkud2l0aE1lc3NhZ2UoJ0VtcGxveWVlIElEIG11c3QgYmUgNCBkaWdpdHMnKSxcbiAgYm9keSgncGFzc3dvcmQnKS5pc0xlbmd0aCh7IG1pbjogNiwgbWF4OiA2IH0pLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIDYgY2hhcmFjdGVycycpXG5dLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnM6IGVycm9ycy5hcnJheSgpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHsgZW1wbG95ZWVJZCwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcblxuICAgIGRiLmdldChcbiAgICAgICdTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIGVtcGxveWVlX2lkID0gPycsXG4gICAgICBbZW1wbG95ZWVJZF0sXG4gICAgICBhc3luYyAoZXJyLCB1c2VyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1ZhbGlkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgdXNlci5wYXNzd29yZF9oYXNoKTtcbiAgICAgICAgaWYgKCFpc1ZhbGlkUGFzc3dvcmQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcbiAgICAgICAgICB7IFxuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsIFxuICAgICAgICAgICAgZW1wbG95ZWVJZDogdXNlci5lbXBsb3llZV9pZCxcbiAgICAgICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSBcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsXG4gICAgICAgICAgeyBleHBpcmVzSW46IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVTX0lOIHx8ICcyNGgnIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXMuanNvbih7XG4gICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICAgICAgZnVsbE5hbWU6IHVzZXIuZnVsbF9uYW1lLFxuICAgICAgICAgICAgcm9sZUNvZGU6IHVzZXIucm9sZV9jb2RlLFxuICAgICAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBwcm9jdXJlbWVudFRlYW06IHVzZXIucHJvY3VyZW1lbnRfdGVhbVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdMb2dpbiBlcnJvcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG4gIH1cbn0pO1xuXG4vLyBHZXQgY3VycmVudCB1c2VyIGluZm9cbnJvdXRlci5nZXQoJy9tZScsIGF1dGhlbnRpY2F0ZVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZGIgPSBnZXREYXRhYmFzZSgpO1xuICBcbiAgZGIuZ2V0KFxuICAgICdTRUxFQ1QgaWQsIGVtcGxveWVlX2lkLCBmdWxsX25hbWUsIHJvbGVfY29kZSwgcm9sZV9kZXNjcmlwdGlvbiwgcHJvY3VyZW1lbnRfdGVhbSwgZW1haWwgRlJPTSB1c2VycyBXSEVSRSBpZCA9ID8nLFxuICAgIFtyZXEudXNlci5pZF0sXG4gICAgKGVyciwgdXNlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0RhdGFiYXNlIGVycm9yJyB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXMuanNvbih7XG4gICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICBlbXBsb3llZUlkOiB1c2VyLmVtcGxveWVlX2lkLFxuICAgICAgICBmdWxsTmFtZTogdXNlci5mdWxsX25hbWUsXG4gICAgICAgIHJvbGVDb2RlOiB1c2VyLnJvbGVfY29kZSxcbiAgICAgICAgcm9sZURlc2NyaXB0aW9uOiB1c2VyLnJvbGVfZGVzY3JpcHRpb24sXG4gICAgICAgIHByb2N1cmVtZW50VGVhbTogdXNlci5wcm9jdXJlbWVudF90ZWFtLFxuICAgICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgICAgfSk7XG4gICAgfVxuICApO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL3NjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3NlcnZlci9zY3JpcHRzL3NlZWREYXRhYmFzZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvc2NyaXB0cy9zZWVkRGF0YWJhc2UuanNcIjtjb25zdCBiY3J5cHQgPSByZXF1aXJlKCdiY3J5cHRqcycpO1xuY29uc3QgeyBnZXREYXRhYmFzZSwgaW5pdGlhbGl6ZURhdGFiYXNlLCBjbG9zZURhdGFiYXNlIH0gPSByZXF1aXJlKCcuLi9jb25maWcvZGF0YWJhc2UnKTtcblxuYXN5bmMgZnVuY3Rpb24gc2VlZERhdGFiYXNlKCkge1xuICB0cnkge1xuICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgIGNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnU2VlZGluZyBkYXRhYmFzZSB3aXRoIGluaXRpYWwgZGF0YS4uLicpO1xuICAgIFxuICAgIC8vIFNlZWQgb3JnYW5pemF0aW9uYWwgcm9sZXNcbiAgICBjb25zdCByb2xlcyA9IFtcbiAgICAgIHsgcm9sZUNvZGU6IDEsIGRlc2NyaXB0aW9uOiAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVFOFx1MDVEQlx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUU4XHUwNUU5XHUwNUQwXHUwNUQ1XHUwNUVBIFx1MDVERVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RENcdTA1RTBcdTA1RDlcdTA1RDRcdTA1RDVcdTA1REMgXHUwNURCXHUwNURDIFx1MDVFQVx1MDVENFx1MDVEQ1x1MDVEOVx1MDVEQlx1MDVEOSBcdTA1RDRcdTA1RThcdTA1REJcdTA1RTknIH0sXG4gICAgICB7IHJvbGVDb2RlOiAyLCBkZXNjcmlwdGlvbjogJ1x1MDVFOFx1MDVEMFx1MDVFOSBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RTZcdTA1RDVcdTA1RDVcdTA1RUEgXHUwNUU3XHUwNUUwXHUwNUQ5XHUwNUQ5XHUwNUUwXHUwNUQ5XHUwNUREIFx1MDVENVx1MDVERVx1MDVFMlx1MDVFN1x1MDVEMSBcdTA1REVcdTA1RTlcdTA1RDlcdTA1REVcdTA1RDVcdTA1RUEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiAzLCBkZXNjcmlwdGlvbjogJ1x1MDVFN1x1MDVFMFx1MDVEOVx1MDVEOVx1MDVERicsIHBlcm1pc3Npb25zOiAnXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyIFx1MDVFNFx1MDVFMlx1MDVEOVx1MDVEQ1x1MDVENVx1MDVEOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVERVx1MDVFOVx1MDVEOVx1MDVERVx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgcm9sZUNvZGU6IDQsIGRlc2NyaXB0aW9uOiAnXHUwNUQyXHUwNUQ1XHUwNUU4XHUwNUREIFx1MDVEM1x1MDVENVx1MDVFOFx1MDVFOScsIHBlcm1pc3Npb25zOiAnXHUwNUQ0XHUwNUQyXHUwNUU5XHUwNUVBIFx1MDVEMVx1MDVFN1x1MDVFOVx1MDVENVx1MDVFQSBcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ1XHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVEMFx1MDVEN1x1MDVFOCBcdTA1RTFcdTA1RDhcdTA1RDhcdTA1RDVcdTA1RTEnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA1LCBkZXNjcmlwdGlvbjogJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQ1x1MDVERiBcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEnLCBwZXJtaXNzaW9uczogJ1x1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDJcdTA1RDNcdTA1RThcdTA1RDVcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENVx1MDVEOFx1MDVEMVx1MDVEQ1x1MDVEMFx1MDVENVx1MDVFQSBcdTA1RTJcdTA1RDZcdTA1RTgnIH0sXG4gICAgICB7IHJvbGVDb2RlOiA5LCBkZXNjcmlwdGlvbjogJ1x1MDVEMlx1MDVENVx1MDVFOFx1MDVERCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCBwZXJtaXNzaW9uczogJ1x1MDVFQVx1MDVEN1x1MDVENlx1MDVENVx1MDVFN1x1MDVFQSBcdTA1RUFcdTA1RTlcdTA1RUFcdTA1RDlcdTA1RDVcdTA1RUEgXHUwNUQ0XHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBJyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBvcmdhbml6YXRpb25hbF9yb2xlcyAocm9sZV9jb2RlLCBkZXNjcmlwdGlvbiwgcGVybWlzc2lvbnMpIFZBTFVFUyAoPywgPywgPyknLFxuICAgICAgICBbcm9sZS5yb2xlQ29kZSwgcm9sZS5kZXNjcmlwdGlvbiwgcm9sZS5wZXJtaXNzaW9uc11cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZGl2aXNpb25zXG4gICAgY29uc3QgZGl2aXNpb25zID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQwXHUwNUQyXHUwNUUzIFx1MDVFQVx1MDVFNFx1MDVFMlx1MDVENVx1MDVEQycsIGlzSW50ZXJuYWw6IHRydWUgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEMlx1MDVFMyBcdTA1RTlcdTA1RDlcdTA1RDVcdTA1RDVcdTA1RTcnLCBpc0ludGVybmFsOiB0cnVlIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RENcdTA1RTdcdTA1RDVcdTA1RDcgXHUwNUQ3XHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUwXHUwNUQ5IFx1MDVEMCcsIGlzSW50ZXJuYWw6IGZhbHNlIH1cbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZGl2aXNpb24gb2YgZGl2aXNpb25zKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGl2aXNpb25zIChuYW1lLCBpc19pbnRlcm5hbCkgVkFMVUVTICg/LCA/KScsXG4gICAgICAgIFtkaXZpc2lvbi5uYW1lLCBkaXZpc2lvbi5pc0ludGVybmFsXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBkZXBhcnRtZW50c1xuICAgIGNvbnN0IGRlcGFydG1lbnRzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNURFXHUwNUQ3XHUwNURDXHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFMFx1MDVEM1x1MDVFMVx1MDVENCcsIGRpdmlzaW9uSWQ6IDEgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVERVx1MDVEN1x1MDVEQ1x1MDVFN1x1MDVFQSBcdTA1RDBcdTA1RDlcdTA1REJcdTA1RDVcdTA1RUEnLCBkaXZpc2lvbklkOiAxIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RDdcdTA1RENcdTA1RTdcdTA1RUEgXHUwNUU5XHUwNUQ5XHUwNUU4XHUwNUQ1XHUwNUVBIFx1MDVEQ1x1MDVFN1x1MDVENVx1MDVEN1x1MDVENVx1MDVFQScsIGRpdmlzaW9uSWQ6IDIgfVxuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCBkZXB0IG9mIGRlcGFydG1lbnRzKSB7XG4gICAgICBkYi5ydW4oXG4gICAgICAgICdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZGVwYXJ0bWVudHMgKG5hbWUsIGRpdmlzaW9uX2lkKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2RlcHQubmFtZSwgZGVwdC5kaXZpc2lvbklkXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBwcm9jdXJlbWVudCB0ZWFtc1xuICAgIGNvbnN0IHRlYW1zID0gW1xuICAgICAgJ1x1MDVEOVx1MDVFMlx1MDVENVx1MDVEM1x1MDVEOScsICdcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDVcdTA1RENcdTA1RDVcdTA1RDJcdTA1RDknLCAnXHUwNURDXHUwNUQ1XHUwNUQyXHUwNUQ5XHUwNUUxXHUwNUQ4XHUwNUQ5JywgJ1x1MDVERVx1MDVEN1x1MDVFOVx1MDVENVx1MDVEMScsICdcdTA1RDRcdTA1RTBcdTA1RDNcdTA1RTFcdTA1RDknLCAnXHUwNUQxXHUwNUQ5XHUwNUQ4XHUwNUQ3XHUwNUQ1XHUwNUUwXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0ZWFtIG9mIHRlYW1zKSB7XG4gICAgICBkYi5ydW4oJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBwcm9jdXJlbWVudF90ZWFtcyAobmFtZSkgVkFMVUVTICg/KScsIFt0ZWFtXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNlZWQgZG9tYWluc1xuICAgIGNvbnN0IGRvbWFpbnMgPSBbXG4gICAgICAnXHUwNUU4XHUwNURCXHUwNUU5IFx1MDVEOFx1MDVEQlx1MDVFMFx1MDVENVx1MDVEQ1x1MDVENVx1MDVEMlx1MDVEOVx1MDVENCBcdTA1RDVcdTA1REVcdTA1RDdcdTA1RTlcdTA1RDVcdTA1RDEnLFxuICAgICAgJ1x1MDVFOFx1MDVEQlx1MDVFOSBcdTA1RTlcdTA1RDlcdTA1RThcdTA1RDVcdTA1RUFcdTA1RDlcdTA1REQgXHUwNURFXHUwNUU3XHUwNUU2XHUwNUQ1XHUwNUUyXHUwNUQ5XHUwNUQ5XHUwNUREJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUU2XHUwNUQ5XHUwNUQ1XHUwNUQzIFx1MDVERVx1MDVFOVx1MDVFOFx1MDVEM1x1MDVEOSdcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgZG9tYWluIG9mIGRvbWFpbnMpIHtcbiAgICAgIGRiLnJ1bignSU5TRVJUIE9SIElHTk9SRSBJTlRPIGRvbWFpbnMgKGRlc2NyaXB0aW9uKSBWQUxVRVMgKD8pJywgW2RvbWFpbl0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWVkIGFjdGl2aXR5IHBvb2xcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gW1xuICAgICAgeyBuYW1lOiAnXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQSBcdTA1REVcdTA1RDdcdTA1RDlcdTA1RTgnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1RDRcdTA1RTlcdTA1RDVcdTA1RDVcdTA1RDBcdTA1RUEgXHUwNURFXHUwNUQ3XHUwNUQ5XHUwNUU4XHUwNUQ5XHUwNUREJyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNURCXHUwNUUwXHUwNUVBIFx1MDVERVx1MDVFNFx1MDVFOFx1MDVEOCBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknLCB0b29sczogJ1x1MDVFQVx1MDVEMVx1MDVFMFx1MDVEOVx1MDVENVx1MDVFQSBcdTA1REVcdTA1RTRcdTA1RThcdTA1RDgsIFx1MDVEOVx1MDVEOVx1MDVFMlx1MDVENVx1MDVFNSBcdTA1RDhcdTA1REJcdTA1RTBcdTA1RDknIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RTRcdTA1RThcdTA1RTFcdTA1RDVcdTA1REQgXHUwNURFXHUwNURCXHUwNUU4XHUwNUQ2JywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNUU0XHUwNUU4XHUwNUUxXHUwNUQ1XHUwNURELCBcdTA1RDBcdTA1RUFcdTA1RTggXHUwNUQ0XHUwNUQ3XHUwNUQxXHUwNUU4XHUwNUQ0JyB9LFxuICAgICAgeyBuYW1lOiAnXHUwNUQ0XHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVENFx1MDVFNlx1MDVFMlx1MDVENVx1MDVFQScsIHRvb2xzOiAnXHUwNURFXHUwNUQ4XHUwNUU4XHUwNUQ5XHUwNUU2XHUwNUVBIFx1MDVENFx1MDVFMlx1MDVFOFx1MDVEQlx1MDVENCwgXHUwNUQ1XHUwNUUyXHUwNUQzXHUwNUVBIFx1MDVEMVx1MDVEN1x1MDVEOVx1MDVFMFx1MDVENCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMVx1MDVEN1x1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RDZcdTA1RDVcdTA1REJcdTA1RDQnLCB0b29sczogJ1x1MDVFNFx1MDVFOFx1MDVENVx1MDVEOFx1MDVENVx1MDVFN1x1MDVENVx1MDVEQyBcdTA1RDRcdTA1RDdcdTA1RENcdTA1RDhcdTA1RDQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDdcdTA1RUFcdTA1RDlcdTA1REVcdTA1RDQgXHUwNUUyXHUwNURDIFx1MDVENFx1MDVFMVx1MDVEQlx1MDVERCcsIHRvb2xzOiAnXHUwNURFXHUwNUUyXHUwNUU4XHUwNURCXHUwNUVBIFx1MDVFMFx1MDVEOVx1MDVENFx1MDVENVx1MDVEQyBcdTA1RDdcdTA1RDVcdTA1RDZcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDFcdTA1RTdcdTA1RThcdTA1RUEgXHUwNUQwXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUVBJywgdG9vbHM6ICdcdTA1RThcdTA1RTlcdTA1RDlcdTA1REVcdTA1RUEgXHUwNUQxXHUwNUQzXHUwNUQ5XHUwNUU3XHUwNUQ1XHUwNUVBIFx1MDVEMFx1MDVEOVx1MDVEQlx1MDVENVx1MDVFQScgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVEMFx1MDVEOVx1MDVFOVx1MDVENVx1MDVFOCBcdTA1RUFcdTA1RTlcdTA1RENcdTA1RDVcdTA1REQnLCB0b29sczogJ1x1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQSBcdTA1REJcdTA1RTFcdTA1RTRcdTA1RDlcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1REVcdTA1RTJcdTA1RTdcdTA1RDEgXHUwNUQxXHUwNUQ5XHUwNUU2XHUwNUQ1XHUwNUUyJywgdG9vbHM6ICdcdTA1REVcdTA1RTJcdTA1RThcdTA1REJcdTA1RUEgXHUwNURFXHUwNUUyXHUwNUU3XHUwNUQxIFx1MDVFNFx1MDVFOFx1MDVENVx1MDVEOVx1MDVFN1x1MDVEOFx1MDVEOVx1MDVERCcgfSxcbiAgICAgIHsgbmFtZTogJ1x1MDVFMVx1MDVEMlx1MDVEOVx1MDVFOFx1MDVFQSBcdTA1RTRcdTA1RThcdTA1RDVcdTA1RDlcdTA1RTdcdTA1RDgnLCB0b29sczogJ1x1MDVEM1x1MDVENVx1MDVENyBcdTA1RTFcdTA1RDlcdTA1REJcdTA1RDVcdTA1REQnIH0sXG4gICAgICB7IG5hbWU6ICdcdTA1RDNcdTA1RDVcdTA1RDcgXHUwNUUxXHUwNUQ5XHUwNURCXHUwNUQ1XHUwNUREJywgdG9vbHM6ICdcdTA1RUFcdTA1RDFcdTA1RTBcdTA1RDlcdTA1RUEgXHUwNUQzXHUwNUQ1XHUwNUQ3JyB9XG4gICAgXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGFjdGl2aXR5IG9mIGFjdGl2aXRpZXMpIHtcbiAgICAgIGRiLnJ1bihcbiAgICAgICAgJ0lOU0VSVCBPUiBJR05PUkUgSU5UTyBhY3Rpdml0eV9wb29sIChuYW1lLCB0b29sc19hbmRfcmVzb3VyY2VzKSBWQUxVRVMgKD8sID8pJyxcbiAgICAgICAgW2FjdGl2aXR5Lm5hbWUsIGFjdGl2aXR5LnRvb2xzXVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2VlZCBlbmdhZ2VtZW50IHR5cGVzXG4gICAgY29uc3QgZW5nYWdlbWVudFR5cGVzID0gW1xuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RDVcdTA1REVcdTA1RDFcdTA1RDknLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1REVcdTA1RDVcdTA1RDJcdTA1RDFcdTA1REMnLFxuICAgICAgJ1x1MDVERVx1MDVEQlx1MDVFOFx1MDVENiBcdTA1RTRcdTA1RUFcdTA1RDVcdTA1RDcgXHUwNURFXHUwNUQ1XHUwNUQyXHUwNUQxXHUwNURDJyxcbiAgICAgICdcdTA1RThcdTA1REJcdTA1RTkgXHUwNUQ0XHUwNUU5XHUwNUQ1XHUwNUQ1XHUwNUQwXHUwNUVBXHUwNUQ5J1xuICAgIF07XG4gICAgXG4gICAgZm9yIChjb25zdCB0eXBlIG9mIGVuZ2FnZW1lbnRUeXBlcykge1xuICAgICAgZGIucnVuKCdJTlNFUlQgT1IgSUdOT1JFIElOVE8gZW5nYWdlbWVudF90eXBlcyAobmFtZSkgVkFMVUVTICg/KScsIFt0eXBlXSk7XG4gICAgfVxuICAgIFxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IGFkbWluIHVzZXJcbiAgICBjb25zdCBhZG1pblBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgcGFzc3dvcmRfaGFzaCwgZW1haWxcbiAgICAgICkgVkFMVUVTICg/LCA/LCA/LCA/LCA/LCA/KWAsXG4gICAgICBbJzk5OTknLCAnXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDIFx1MDVERVx1MDVFMlx1MDVFOFx1MDVEQlx1MDVFQScsIDksICdcdTA1RDJcdTA1RDVcdTA1RThcdTA1REQgXHUwNUQ4XHUwNURCXHUwNUUwXHUwNUQ5JywgYWRtaW5QYXNzd29yZCwgJ2FkbWluQHN5c3RlbS5jb20nXVxuICAgICk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIHNhbXBsZSBwcm9jdXJlbWVudCBtYW5hZ2VyXG4gICAgY29uc3QgbWFuYWdlclBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goJzEyMzQ1NicsIDEyKTtcbiAgICBkYi5ydW4oXG4gICAgICBgSU5TRVJUIE9SIElHTk9SRSBJTlRPIHVzZXJzIChcbiAgICAgICAgZW1wbG95ZWVfaWQsIGZ1bGxfbmFtZSwgcm9sZV9jb2RlLCByb2xlX2Rlc2NyaXB0aW9uLCBcbiAgICAgICAgcGFzc3dvcmRfaGFzaCwgcHJvY3VyZW1lbnRfdGVhbSwgYXZhaWxhYmxlX3dvcmtfZGF5c1xuICAgICAgKSBWQUxVRVMgKD8sID8sID8sID8sID8sID8sID8pYCxcbiAgICAgIFsnMTAwMScsICdcdTA1RDBcdTA1RDFcdTA1RThcdTA1RDRcdTA1REQgXHUwNURFXHUwNUUwXHUwNUQ0XHUwNURDJywgMSwgJ1x1MDVERVx1MDVFMFx1MDVENFx1MDVEQyBcdTA1RThcdTA1REJcdTA1RTknLCBtYW5hZ2VyUGFzc3dvcmQsICdcdTA1RDlcdTA1RTJcdTA1RDVcdTA1RDNcdTA1RDknLCAyMDBdXG4gICAgKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnRGF0YWJhc2Ugc2VlZGVkIHN1Y2Nlc3NmdWxseSEnKTtcbiAgICBjb25zb2xlLmxvZygnRGVmYXVsdCB1c2VycyBjcmVhdGVkOicpO1xuICAgIGNvbnNvbGUubG9nKCctIEFkbWluOiA5OTk5IC8gMTIzNDU2Jyk7XG4gICAgY29uc29sZS5sb2coJy0gTWFuYWdlcjogMTAwMSAvIDEyMzQ1NicpO1xuICAgIFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZWVkIGRhdGFiYXNlOicsIGVycm9yKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH0gZmluYWxseSB7XG4gICAgY2xvc2VEYXRhYmFzZSgpO1xuICB9XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBzZWVkRGF0YWJhc2UoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHNlZWREYXRhYmFzZSB9OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9zZXJ2ZXIvaW5kZXguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvc2VydmVyL2luZGV4LmpzXCI7Y29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGNvcnMgPSByZXF1aXJlKCdjb3JzJyk7XG5jb25zdCBoZWxtZXQgPSByZXF1aXJlKCdoZWxtZXQnKTtcbmNvbnN0IG1vcmdhbiA9IHJlcXVpcmUoJ21vcmdhbicpO1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuY29uc3QgcmF0ZUxpbWl0ID0gcmVxdWlyZSgnZXhwcmVzcy1yYXRlLWxpbWl0Jyk7XG5jb25zdCBiY3J5cHQgPSByZXF1aXJlKCdiY3J5cHRqcycpO1xuY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJyk7XG5jb25zdCB7IGJvZHksIHZhbGlkYXRpb25SZXN1bHQgfSA9IHJlcXVpcmUoJ2V4cHJlc3MtdmFsaWRhdG9yJyk7XG5jb25zdCB7IGluaXRpYWxpemVEYXRhYmFzZSwgZ2V0RGF0YWJhc2UgfSA9IHJlcXVpcmUoJy4vY29uZmlnL2RhdGFiYXNlJyk7XG5jb25zdCBhdXRoUm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMvYXV0aCcpO1xuXG4vLyBFbnZpcm9ubWVudCB2YXJpYWJsZXNcbnByb2Nlc3MuZW52LkpXVF9TRUNSRVQgPSBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8ICd5b3VyLXN1cGVyLXNlY3JldC1qd3Qta2V5LWNoYW5nZS10aGlzLWluLXByb2R1Y3Rpb24nO1xucHJvY2Vzcy5lbnYuSldUX0VYUElSRVNfSU4gPSBwcm9jZXNzLmVudi5KV1RfRVhQSVJFU19JTiB8fCAnMjRoJztcbnByb2Nlc3MuZW52LkJDUllQVF9ST1VORFMgPSBwcm9jZXNzLmVudi5CQ1JZUFRfUk9VTkRTIHx8ICcxMic7XG5wcm9jZXNzLmVudi5EQl9QQVRIID0gcHJvY2Vzcy5lbnYuREJfUEFUSCB8fCAnLi9kYXRhL3Byb2N1cmVtZW50LmRiJztcblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2VydmVyKCkge1xuICBjb25zdCBhcHAgPSBleHByZXNzKCk7XG5cbiAgLy8gU2VjdXJpdHkgbWlkZGxld2FyZVxuICBhcHAudXNlKGhlbG1ldCgpKTtcbiAgYXBwLnVzZShjb21wcmVzc2lvbigpKTtcblxuICAvLyBSYXRlIGxpbWl0aW5nXG4gIGNvbnN0IGxpbWl0ZXIgPSByYXRlTGltaXQoe1xuICAgIHdpbmRvd01zOiAxNSAqIDYwICogMTAwMCwgLy8gMTUgbWludXRlc1xuICAgIG1heDogMTAwLCAvLyBsaW1pdCBlYWNoIElQIHRvIDEwMCByZXF1ZXN0cyBwZXIgd2luZG93TXNcbiAgICBtZXNzYWdlOiAnVG9vIG1hbnkgcmVxdWVzdHMgZnJvbSB0aGlzIElQLCBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyLidcbiAgfSk7XG4gIGFwcC51c2UoJy9hcGknLCBsaW1pdGVyKTtcblxuICAvLyBDT1JTIGNvbmZpZ3VyYXRpb25cbiAgYXBwLnVzZShjb3JzKHtcbiAgICBvcmlnaW46IFsnaHR0cDovL2xvY2FsaG9zdDo4MDgwJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCddLFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlXG4gIH0pKTtcblxuICAvLyBCb2R5IHBhcnNpbmcgbWlkZGxld2FyZVxuICBhcHAudXNlKGV4cHJlc3MuanNvbih7IGxpbWl0OiAnMTBtYicgfSkpO1xuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcblxuICAvLyBMb2dnaW5nXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2NvbWJpbmVkJykpO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBkYXRhYmFzZVxuICB0cnkge1xuICAgIGF3YWl0IGluaXRpYWxpemVEYXRhYmFzZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHknKTtcbiAgICBcbiAgICAvLyBTZWVkIGRhdGFiYXNlXG4gICAgY29uc3QgeyBzZWVkRGF0YWJhc2UgfSA9IHJlcXVpcmUoJy4vc2NyaXB0cy9zZWVkRGF0YWJhc2UnKTtcbiAgICBhd2FpdCBzZWVkRGF0YWJhc2UoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW5pdGlhbGl6ZSBkYXRhYmFzZTonLCBlcnJvcik7XG4gIH1cblxuICAvLyBIZWFsdGggY2hlY2sgZW5kcG9pbnRcbiAgYXBwLmdldCgnL2FwaS9oZWFsdGgnLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuanNvbih7IFxuICAgICAgc3RhdHVzOiAnT0snLCBcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBBUEkgUm91dGVzXG4gIGFwcC51c2UoJy9hcGkvYXV0aCcsIGF1dGhSb3V0ZXMpO1xuXG4gIC8vIEVycm9yIGhhbmRsaW5nIG1pZGRsZXdhcmVcbiAgYXBwLnVzZSgnL2FwaScsIChlcnIsIHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgY29uc29sZS5lcnJvcignQVBJIEVycm9yOicsIGVycik7XG4gICAgXG4gICAgaWYgKGVyci50eXBlID09PSAnZW50aXR5LnBhcnNlLmZhaWxlZCcpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnSW52YWxpZCBKU09OIGZvcm1hdCcgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlcy5zdGF0dXMoZXJyLnN0YXR1cyB8fCA1MDApLmpzb24oe1xuICAgICAgZXJyb3I6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgXG4gICAgICAgID8gJ0ludGVybmFsIHNlcnZlciBlcnJvcicgXG4gICAgICAgIDogZXJyLm1lc3NhZ2VcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gNDA0IGhhbmRsZXIgZm9yIEFQSSByb3V0ZXNcbiAgYXBwLnVzZSgnL2FwaS8qJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ0FQSSByb3V0ZSBub3QgZm91bmQnIH0pO1xuICB9KTtcblxuICByZXR1cm4gYXBwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgY3JlYXRlU2VydmVyIH07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gICAgLy8gQ3VzdG9tIHBsdWdpbiB0byBpbnRlZ3JhdGUgRXhwcmVzcyBzZXJ2ZXJcbiAgICB7XG4gICAgICBuYW1lOiAnZXhwcmVzcy1zZXJ2ZXInLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAvLyBJbXBvcnQgYW5kIHNldHVwIEV4cHJlc3Mgc2VydmVyXG4gICAgICAgIGNvbnN0IHsgY3JlYXRlU2VydmVyIH0gPSByZXF1aXJlKCcuL3NyYy9zZXJ2ZXIvaW5kZXguanMnKTtcbiAgICAgICAgXG4gICAgICAgIGNyZWF0ZVNlcnZlcigpLnRoZW4oYXBwID0+IHtcbiAgICAgICAgICAvLyBNb3VudCBFeHByZXNzIGFwcCBvbiAvYXBpIHJvdXRlc1xuICAgICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGknLCBhcHApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdFeHByZXNzIHNlcnZlciBpbnRlZ3JhdGVkIHdpdGggVml0ZSBkZXYgc2VydmVyJyk7XG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc3RhcnQgRXhwcmVzcyBzZXJ2ZXI6JywgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFjQSxTQUFTLGNBQWM7QUFDckIsTUFBSSxDQUFDLElBQUk7QUFDUCxTQUFLLElBQUksUUFBUSxTQUFTLFNBQVMsQ0FBQyxRQUFRO0FBQzFDLFVBQUksS0FBSztBQUNQLGdCQUFRLE1BQU0sMkJBQTJCLEdBQUc7QUFDNUMsY0FBTTtBQUFBLE1BQ1I7QUFDQSxjQUFRLElBQUksOEJBQThCO0FBQUEsSUFDNUMsQ0FBQztBQUdELE9BQUcsSUFBSSwwQkFBMEI7QUFBQSxFQUNuQztBQUNBLFNBQU87QUFDVDtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU1BLE1BQUssWUFBWTtBQUV2QixTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxJQUFBQSxJQUFHLFVBQVUsTUFBTTtBQUVqQixNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQWdCTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BT047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FNTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BT047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BS047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BS047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FNTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FLTjtBQUdELE1BQUFBLElBQUcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BVU47QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FvQ047QUFHRCxNQUFBQSxJQUFHLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9B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QUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBO0FBQUEsSUFFaEI7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBRXRCLGNBQU0sRUFBRSxjQUFBQyxjQUFhLElBQUk7QUFFekIsUUFBQUEsY0FBYSxFQUFFLEtBQUssU0FBTztBQUV6QixpQkFBTyxZQUFZLElBQUksUUFBUSxHQUFHO0FBQ2xDLGtCQUFRLElBQUksZ0RBQWdEO0FBQUEsUUFDOUQsQ0FBQyxFQUFFLE1BQU0sV0FBUztBQUNoQixrQkFBUSxNQUFNLG1DQUFtQyxLQUFLO0FBQUEsUUFDeEQsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsiZGIiLCAiZGIiLCAiZ2V0RGF0YWJhc2UiLCAiYXV0aF9leHBvcnRzIiwgImp3dCIsICJnZXREYXRhYmFzZSIsICJhdXRoZW50aWNhdGVUb2tlbiIsICJpbml0X2F1dGgiLCAiZGIiLCAiaW5pdGlhbGl6ZURhdGFiYXNlIiwgImRiIiwgImdldERhdGFiYXNlIiwgImJjcnlwdCIsICJjbG9zZURhdGFiYXNlIiwgImV4cHJlc3MiLCAiaW5pdGlhbGl6ZURhdGFiYXNlIiwgInNlZWREYXRhYmFzZSIsICJiY3J5cHQiLCAiand0IiwgImJvZHkiLCAidmFsaWRhdGlvblJlc3VsdCIsICJnZXREYXRhYmFzZSIsICJwYXRoIiwgImNyZWF0ZVNlcnZlciIsICJwYXRoIl0KfQo=
