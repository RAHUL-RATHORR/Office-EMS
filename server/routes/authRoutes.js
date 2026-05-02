const express = require('express');
const router = express.Router();
const { login, register, updateProfile } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', adminAuth, register);
router.post('/register-public', register); // Public registration for employees
router.put('/profile', auth, updateProfile);

module.exports = router;
