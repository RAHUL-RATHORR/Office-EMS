const express = require('express');
const router = express.Router();
const { logActivity, getLatestActivity } = require('../controllers/activityController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

router.post('/log', auth, logActivity);
router.get('/status', adminAuth, getLatestActivity);

module.exports = router;
