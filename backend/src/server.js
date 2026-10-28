const express = require('express');
const cors = require('cors');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');
const { initAbsenceCron } = require('./jobs/absenceChecker');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Start Cron Jobs
initAbsenceCron();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
