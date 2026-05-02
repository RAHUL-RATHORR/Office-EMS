const { app, BrowserWindow, powerMonitor, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const activeWin = require('active-win');
const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

let mainWindow;
let screenshotInterval;

// RESTRICTED APPS
const RESTRICTED_APPS = ['WhatsApp', 'Telegram', 'Facebook', 'Instagram'];

async function captureAndUpload(token) {
  console.log('--- Attempting to capture screenshot ---');
  try {
    let window;
    try {
      window = await activeWin();
      console.log('Active window:', window ? window.title : 'None');
    } catch (e) {
      console.log('Could not get active window:', e.message);
    }

    const isRestricted = window && RESTRICTED_APPS.some(app => 
      window.title.includes(app) || (window.owner && window.owner.name.includes(app))
    );

    console.log('Capturing screen...');
    const imgBuffer = await screenshot();
    let finalBuffer = imgBuffer;

    if (isRestricted) {
      console.log('Restricted app detected! Blurring screenshot...');
      finalBuffer = await sharp(imgBuffer).blur(50).toBuffer();
    }

    const tempPath = path.join(app.getPath('temp'), `ss-${Date.now()}.png`);
    fs.writeFileSync(tempPath, finalBuffer);
    console.log('Screenshot saved locally to:', tempPath);

    const formData = new FormData();
    formData.append('screenshot', fs.createReadStream(tempPath));

    console.log('Uploading to server...');
    const response = await axios.post('http://localhost:5000/api/screenshots/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Upload SUCCESS! Server response:', response.data);
    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error('ERROR during capture/upload:', err.response ? err.response.data : err.message);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe')
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC to start monitoring
ipcMain.on('start-monitoring', (event, token) => {
  console.log('Monitoring started...');
  if (screenshotInterval) clearInterval(screenshotInterval);
  
  // Initial capture
  captureAndUpload(token);
  
  // Every 1 minute (60,000 ms) for testing
  screenshotInterval = setInterval(() => captureAndUpload(token), 60000);
});

ipcMain.on('stop-monitoring', () => {
  console.log('Monitoring stopped.');
  if (screenshotInterval) clearInterval(screenshotInterval);
});

ipcMain.handle('get-idle-time', () => {
  return powerMonitor.getSystemIdleTime();
});
