const express = require('express');
const router = express.Router();
const { startSession, endSession, getAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

router.post('/start', auth, startSession);
router.post('/end', auth, endSession);
router.get('/', adminAuth, getAttendance);
router.get('/my', auth, getMyAttendance);

module.exports = router;
