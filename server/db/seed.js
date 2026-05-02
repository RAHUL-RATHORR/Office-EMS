const bcrypt = require('bcryptjs');
const db = require('../config/db');

const initAndSeed = async () => {
  try {
    console.log('Initializing SQLite tables...');

    // Create Tables
    await db.query(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      logout_time DATETIME,
      total_hours DECIMAL(5,2),
      active_minutes INTEGER DEFAULT 0,
      idle_minutes INTEGER DEFAULT 0,
      date DATE DEFAULT CURRENT_DATE
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS work_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      report_text TEXT NOT NULL,
      date DATE DEFAULT CURRENT_DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Tables created. Seeding admin user...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await db.query(
      'INSERT OR IGNORE INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Admin User', 'admin@ems.com', hashedPassword, 'admin']
    );

    const empPassword = await bcrypt.hash('password123', salt);
    await db.query(
      'INSERT OR IGNORE INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Test Employee', 'employee@ems.com', empPassword, 'employee']
    );

    console.log('Successfully seeded SQLite database!');
    console.log('Admin: admin@ems.com / admin123');
    console.log('Employee: employee@ems.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Error during initialization:', err);
    process.exit(1);
  }
};

initAndSeed();
