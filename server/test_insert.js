const db = require('./config/db');

async function testInsert() {
  const employeeId = 11; // Rahul
  const now = new Date().toISOString();
  try {
    console.log('Testing INSERT for employee 11...');
    const result = await db.query(
      'INSERT INTO attendance (employee_id, login_time) VALUES ($1, $2)',
      [employeeId, now]
    );
    console.log('INSERT successful:', result);
  } catch (err) {
    console.error('INSERT failed:', err);
  }
}

testInsert();
