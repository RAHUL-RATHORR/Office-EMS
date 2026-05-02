let trackingInterval;
let statusInterval;
let token = '';

// On load, check if we have a saved token
/* 
window.onload = () => {
  const savedToken = localStorage.getItem('ems_token');
  if (savedToken) {
    document.getElementById('token').value = savedToken;
    startTracking();
  }
};
*/

async function startTracking() {
  token = document.getElementById('token').value;
  if (!token) return alert('Please enter a token');

  // Save token for auto-start next time
  localStorage.setItem('ems_token', token);

  // Start Attendance Session on Server
  try {
    const response = await fetch('http://localhost:5000/api/attendance/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Attendance started:', data);
  } catch (err) {
    console.error('Failed to start attendance session', err);
  }

  document.getElementById('login-section').style.display = 'none';
  document.getElementById('tracking-section').style.display = 'block';
  
  // Show who is being tracked
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('employee-name').innerText = `Employee: ${payload.name || 'Unknown'}`;
  } catch (e) {
    document.getElementById('employee-name').innerText = 'Employee: Unknown';
  }

  // Heartbeat every 60 seconds
  trackingInterval = setInterval(sendHeartbeat, 60000);
  
  // Update UI every 5 seconds
  statusInterval = setInterval(updateUI, 5000);

  // Tell main process to start screenshot monitoring
  window.electronAPI.send('start-monitoring', token);
}

async function updateUI() {
  const idleTime = await window.electronAPI.getIdleTime();
  const statusEl = document.getElementById('status');
  const idleInfoEl = document.getElementById('idle-info');

  idleInfoEl.innerText = `Idle Time: ${idleTime}s`;

  if (idleTime > 300) {
    statusEl.innerText = 'Tracking: IDLE';
    statusEl.className = 'status idle';
  } else {
    statusEl.innerText = 'Tracking: ACTIVE';
    statusEl.className = 'status active';
  }
}

async function sendHeartbeat() {
  const idleTime = await window.electronAPI.getIdleTime();
  const status = idleTime > 300 ? 'idle' : 'active';

  try {
    await fetch('http://localhost:5000/api/activity/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    console.log('Heartbeat sent:', status);
  } catch (err) {
    console.error('Failed to send heartbeat', err);
  }
}

async function stopTracking() {
  clearInterval(trackingInterval);
  clearInterval(statusInterval);
  window.electronAPI.send('stop-monitoring');

  // Remove saved token so it doesn't auto-start next time if manually stopped
  localStorage.removeItem('ems_token');

  try {
    await fetch('http://localhost:5000/api/attendance/end', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Attendance ended');
  } catch (err) {
    console.error('Failed to end attendance session', err);
  }

  document.getElementById('login-section').style.display = 'block';
  document.getElementById('tracking-section').style.display = 'none';
}
