const db = require('../config/db');

exports.uploadScreenshot = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No screenshot uploaded' });
  }

  const employeeId = req.user.id;
  let folderName = 'unknown';
  if (req.user && req.user.name) {
    folderName = req.user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  } else {
    folderName = `id_${employeeId}`;
  }
  const filePath = `${folderName}/${req.file.filename}`;

  try {
    await db.query(
      'INSERT INTO screenshots (employee_id, file_path) VALUES ($1, $2)',
      [employeeId, filePath]
    );
    res.json({ message: 'Screenshot uploaded successfully' });
  } catch (err) {
    console.error('Error saving screenshot to DB:', err);
    res.status(500).json({ message: 'Error saving screenshot info' });
  }
};

exports.getScreenshots = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ss.*, e.name as employee_name 
      FROM screenshots ss
      JOIN employees e ON ss.employee_id = e.id
      ORDER BY ss.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching screenshots:', err);
    res.status(500).json({ message: 'Error fetching screenshots' });
  }
};
