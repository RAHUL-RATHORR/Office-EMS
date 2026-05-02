const db = require('./config/db');

async function checkAttendance() {
  try {
    const result = await db.query('SELECT * FROM attendance');
    console.log('Attendance Records:', JSON.stringify(result.rows, null, 2));
    
    const active = await db.query('SELECT * FROM attendance WHERE logout_time IS NULL');
    console.log('Active Sessions:', JSON.stringify(active.rows, null, 2));
  } catch (err) {
    console.error('Error checking attendance:', err);
  }
}

checkAttendance();
