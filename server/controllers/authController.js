const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      role: user.role
    };

    console.log('Login successful for:', email, 'ID:', user.id, 'Role:', user.role);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        console.log('Token generated with payload ID:', payload.id);
        res.json({ token, user: payload });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/register
// @desc    Register a new employee (Admin only)
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Registering employee:', { name, email, role });
    await db.query(
      'INSERT INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role || 'employee']
    );

    console.log('Employee registered successfully');
    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE employees SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
