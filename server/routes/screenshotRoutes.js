const express = require('express');
const router = express.Router();
const screenshotController = require('../controllers/screenshotController');
const { auth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/screenshots');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Robust folder name: Use name if exists, otherwise use ID
    let folderName = 'unknown';
    if (req.user && req.user.name) {
      folderName = req.user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    } else if (req.user && req.user.id) {
      folderName = `id_${req.user.id}`;
    }
    
    const userDir = path.join(uploadDir, folderName);
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    cb(null, `ss-${Date.now()}.png`);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', auth, upload.single('screenshot'), screenshotController.uploadScreenshot);
router.get('/', auth, screenshotController.getScreenshots);

module.exports = router;
