const db = require('../config/db');

exports.getEmployees = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM employees WHERE role != $1', ['admin']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM employees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const empId = parseInt(req.params.id);
    console.log('Attempting to delete employee ID:', empId);
    
    // Delete related records first to avoid foreign key issues
    console.log('Deleting attendance for ID:', empId);
    await db.query('DELETE FROM attendance WHERE employee_id = $1', [empId]);
    
    console.log('Deleting leaves for ID:', empId);
    await db.query('DELETE FROM leaves WHERE employee_id = $1', [empId]);
    
    console.log('Deleting reports for ID:', empId);
    await db.query('DELETE FROM work_reports WHERE employee_id = $1', [empId]);
    
    console.log('Deleting activity for ID:', empId);
    await db.query('DELETE FROM activity_logs WHERE employee_id = $1', [empId]);

    console.log('Deleting screenshots for ID:', empId);
    await db.query('DELETE FROM screenshots WHERE employee_id = $1', [empId]);
    
    // Finally delete the employee
    console.log('Deleting employee from employees table ID:', empId);
    await db.query('DELETE FROM employees WHERE id = $1', [empId]);
    
    console.log('Successfully deleted employee ID:', empId);
    res.json({ message: 'Employee and all associated records removed' });
  } catch (err) {
    console.error('CRITICAL Delete error:', err);
    res.status(500).send('Server error: ' + err.message);
  }
};
