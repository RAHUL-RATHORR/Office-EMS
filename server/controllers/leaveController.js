const db = require('../config/db');

exports.applyLeave = async (req, res) => {
  const { reason, start_date, end_date } = req.body;
  try {
    const now = new Date().toISOString();
    await db.query(
      'INSERT INTO leaves (employee_id, reason, start_date, end_date, created_at) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, reason, start_date, end_date, now]
    );
    res.status(201).json({ message: 'Leave applied successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT l.*, e.name AS employee_name FROM leaves l JOIN employees e ON l.employee_id = e.id ORDER BY l.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateLeaveStatus = async (req, res) => {
  const { status } = req.body; // 'approved', 'rejected'
  try {
    const leaveId = parseInt(req.params.id);
    await db.query(
      'UPDATE leaves SET status = $1 WHERE id = $2',
      [status, leaveId]
    );
    res.json({ message: 'Leave status updated successfully', id: leaveId, status });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).send('Server error');
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    console.log('Fetching leaves for user ID:', req.user.id);
    const result = await db.query(
      'SELECT * FROM leaves WHERE employee_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    console.log('Found', result.rows.length, 'leaves for user ID:', req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
