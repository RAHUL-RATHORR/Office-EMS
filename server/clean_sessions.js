const db = require('./config/db');

async function cleanSessions() {
  try {
    const now = new Date().toISOString();
    console.log('Closing all open sessions...');
    const result = await db.query(
      'UPDATE attendance SET logout_time = $1, total_hours = 0 WHERE logout_time IS NULL',
      [now]
    );
    console.log('Clean up successful. Rows affected:', result.changes);
  } catch (err) {
    console.error('Clean up failed:', err);
  }
}

cleanSessions();
