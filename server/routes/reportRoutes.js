const express = require('express');
const router = express.Router();
const { submitReport, getAllReports, getMyReports, updateReport, getMonthlyReport } = require('../controllers/reportController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

router.post('/', auth, submitReport);
router.get('/', adminAuth, getAllReports);
router.get('/my', auth, getMyReports);
router.put('/:id', auth, updateReport);
router.get('/monthly', adminAuth, getMonthlyReport);

module.exports = router;
