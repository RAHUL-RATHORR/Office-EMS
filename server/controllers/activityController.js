const db = require('../config/db');

exports.logActivity = async (req, res) => {
  const { status } = req.body; // 'active' or 'idle'
  try {
    const now = new Date().toISOString();
    // Insert activity log
    await db.query(
      'INSERT INTO activity_logs (employee_id, status, timestamp) VALUES ($1, $2, $3)',
      [req.user.id, status, now]
    );

    // Update attendance minutes
    const activeSession = await db.query(
      'SELECT id FROM attendance WHERE employee_id = $1 AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1',
      [req.user.id]
    );

    if (activeSession.rows.length > 0) {
      const sessionId = activeSession.rows[0].id;
      if (status === 'active') {
        await db.query('UPDATE attendance SET active_minutes = active_minutes + 1 WHERE id = $1', [sessionId]);
      } else {
        await db.query('UPDATE attendance SET idle_minutes = idle_minutes + 1 WHERE id = $1', [sessionId]);
      }
    }

    res.status(201).json({ message: 'Activity logged' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getLatestActivity = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        e.id, 
        e.name, 
        CASE 
          WHEN att.id IS NOT NULL THEN 'active'
          ELSE COALESCE(al.status, 'offline')
        END as status,
        COALESCE(al.timestamp, att.login_time) as timestamp
      FROM employees e
      LEFT JOIN attendance att ON e.id = att.employee_id AND att.logout_time IS NULL
      LEFT JOIN (
        SELECT employee_id, status, timestamp
        FROM activity_logs
        WHERE id IN (SELECT MAX(id) FROM activity_logs GROUP BY employee_id)
      ) al ON e.id = al.employee_id
      WHERE e.role != 'admin'
      GROUP BY e.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
