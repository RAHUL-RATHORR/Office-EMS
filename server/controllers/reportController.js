const db = require('../config/db');

exports.submitReport = async (req, res) => {
  const { report_text } = req.body;
  try {
    const now = new Date().toISOString();
    await db.query(
      'INSERT INTO work_reports (employee_id, report_text, created_at) VALUES ($1, $2, $3)',
      [req.user.id, report_text, now]
    );
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateReport = async (req, res) => {
  const { report_text } = req.body;
  try {
    const reportId = parseInt(req.params.id);
    await db.query(
      'UPDATE work_reports SET report_text = $1 WHERE id = $2 AND employee_id = $3',
      [report_text, reportId, req.user.id]
    );
    res.json({ message: 'Report updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT r.*, e.name AS employee_name FROM work_reports r JOIN employees e ON r.employee_id = e.id ORDER BY r.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        e.id as employee_id,
        e.name as employee_name,
        a.login_time,
        a.logout_time,
        a.active_minutes,
        a.idle_minutes,
        a.total_hours,
        r.report_text,
        COALESCE(a.login_time, r.created_at) as date
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id
      LEFT JOIN work_reports r ON e.id = r.employee_id AND date(a.login_time) = date(r.created_at)
      WHERE e.role != 'admin'
      ORDER BY date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM work_reports WHERE employee_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
