const express = require('express');
const router = express.Router();
const { applyLeave, getAllLeaves, updateLeaveStatus, getMyLeaves } = require('../controllers/leaveController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

router.post('/', auth, applyLeave);
router.get('/', adminAuth, getAllLeaves);
router.put('/:id', adminAuth, updateLeaveStatus);
router.get('/my', auth, getMyLeaves);

module.exports = router;
