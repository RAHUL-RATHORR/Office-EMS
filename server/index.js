const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (to be implemented)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/screenshots', require('./routes/screenshotRoutes'));

// Serve static files
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Employee Monitoring System API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
