const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, 'database.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing file or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Save helper — writes DB back to disk after every change
  db.save = () => {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  };

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      role        TEXT NOT NULL,
      dept        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      status      TEXT DEFAULT 'absent',
      lat         REAL,
      lng         REAL,
      lastIn      TEXT DEFAULT '—',
      hoursToday  REAL DEFAULT 0,
      createdAt   TEXT DEFAULT (datetime('now')),
      updatedAt   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId  TEXT NOT NULL,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      lat         REAL,
      lng         REAL,
      accuracy    REAL,
      note        TEXT DEFAULT '',
      createdAt   TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed demo data if empty
  const count = db.exec('SELECT COUNT(*) as c FROM employees')[0];
  const rowCount = count ? count.values[0][0] : 0;

  if (rowCount === 0) {
    const employees = [
      ['EMP001','Aisha Patel',   'Engineer',        'Engineering',    'aisha@corp.com',  'present', 12.9716, 77.5946, '09:02', 7.5],
      ['EMP002','James Chen',    'Designer',        'Design',         'james@corp.com',  'present', 12.9756, 77.5860, '08:55', 8.1],
      ['EMP003','Maria Santos',  'Product Manager', 'Product',        'maria@corp.com',  'late',    12.9614, 77.6083, '10:32', 5.5],
      ['EMP004','David Kim',     'Data Analyst',    'Data',           'david@corp.com',  'present', 12.9698, 77.7500, '09:15', 7.0],
      ['EMP005','Sara Okonkwo',  'HR Specialist',   'HR',             'sara@corp.com',   'absent',  null,    null,    '—',    0],
      ['EMP006','Ravi Mehta',    'DevOps',          'Infrastructure', 'ravi@corp.com',   'present', 12.9784, 77.6408, '08:30', 8.6],
      ['EMP007','Emily Torres',  'QA Engineer',     'Quality',        'emily@corp.com',  'leave',   null,    null,    '—',    0],
      ['EMP008','Luca Ferrari',  'Engineer',        'Engineering',    'luca@corp.com',   'present', 12.9352, 77.6245, '09:45', 6.2],
    ];

    employees.forEach(e => {
      db.run(
        `INSERT INTO employees (id,name,role,dept,email,status,lat,lng,lastIn,hoursToday)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        e
      );
    });

    db.save();
    console.log('✓ Demo data seeded — 8 employees');
  }

  return db;
}

// Helper: run a query and return all rows as objects
function all(db, sql, params = []) {
  try {
    const result = db.exec(sql.replace(/\?/g, () => {
      const val = params.shift();
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    }));
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
    );
  } catch (e) {
    console.error('SQL error:', e.message, '\nSQL:', sql);
    throw e;
  }
}

// Helper: run INSERT/UPDATE/DELETE
function run(db, sql, params = []) {
  let i = 0;
  const filled = sql.replace(/\?/g, () => {
    const val = params[i++];
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  });
  db.run(filled);
  db.save();
  return { changes: db.getRowsModified(), lastInsertRowid: all(db, 'SELECT last_insert_rowid() as id')[0]?.id };
}

module.exports = { getDb, all, run };