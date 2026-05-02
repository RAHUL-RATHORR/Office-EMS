const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, deleteEmployee } = require('../controllers/employeeController');
const { adminAuth, auth } = require('../middleware/authMiddleware');

router.get('/', adminAuth, getEmployees);
router.get('/:id', auth, getEmployeeById);
router.delete('/:id', adminAuth, deleteEmployee);

module.exports = router;
