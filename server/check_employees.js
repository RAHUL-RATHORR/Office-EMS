const db = require('./config/db');

async function checkUsers() {
  try {
    const result = await db.query('SELECT id, name, email, role FROM employees');
    console.log('Employees:', JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Error checking users:', err);
  }
}

checkUsers();
