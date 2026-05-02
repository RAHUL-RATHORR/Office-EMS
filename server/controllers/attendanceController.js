const db = require('../config/db');

exports.startSession = async (req, res) => {
  console.log('Attempting to start session for employee:', req.user.id);
  try {
    const checkActive = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND logout_time IS NULL AND date = CURRENT_DATE',
      [req.user.id]
    );

    if (checkActive.rows.length > 0) {
      console.log('Session already active for employee:', req.user.id, 'Session ID:', checkActive.rows[0].id);
      return res.status(400).json({ message: 'Session already active' });
    }

    const now = new Date().toISOString();
    const result = await db.query(
      'INSERT INTO attendance (employee_id, login_time) VALUES ($1, $2)',
      [req.user.id, now]
    );
    
    // Fetch the inserted session to return it
    const newSession = await db.query(
      'SELECT * FROM attendance WHERE id = $1',
      [result.lastID]
    );

    console.log('Session started successfully for employee:', req.user.id, 'New Session ID:', result.lastID);
    res.status(201).json(newSession.rows[0]);
  } catch (err) {
    console.error('Error starting session:', err);
    res.status(500).send('Server error');
  }
};

exports.endSession = async (req, res) => {
  console.log('Attempting to end session for employee:', req.user.id);
  try {
    const activeSession = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1',
      [req.user.id]
    );

    if (activeSession.rows.length === 0) {
      console.log('No active session found for employee:', req.user.id);
      return res.status(400).json({ message: 'No active session found' });
    }

    const sessionId = activeSession.rows[0].id;
    const loginTime = new Date(activeSession.rows[0].login_time);
    const logoutTime = new Date().toISOString(); // Use ISO string for consistency
    
    // Calculate total hours
    const diffMs = new Date(logoutTime) - loginTime;
    const totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2);

    await db.query(
      'UPDATE attendance SET logout_time = $1, total_hours = $2 WHERE id = $3',
      [logoutTime, totalHours, sessionId]
    );
    console.log('Session ended successfully for employee:', req.user.id, 'Session ID:', sessionId);
    res.json({ message: 'Session ended', totalHours });
  } catch (err) {
    console.error('Error ending session:', err);
    res.status(500).send('Server error');
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT a.*, e.name FROM attendance a JOIN employees e ON a.employee_id = e.id ORDER BY a.login_time DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 ORDER BY login_time DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
