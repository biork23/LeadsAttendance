const cron = require('node-cron');
const pool = require('../config/db');

function initAbsenceCron() {
    // Runs every day at 11:59 PM
    cron.schedule('59 23 * * *', async () => {
        console.log('Running nightly absence check...');
        const today = new Date().toISOString().split('T')[0];

        try {
            const query = `
                INSERT INTO attendance_logs (user_id, date, status)
                SELECT u.id, $1, 'Absent'
                FROM users u
                WHERE u.role = 'employee' 
                  AND u.id NOT IN (
                      SELECT user_id 
                      FROM attendance_logs 
                      WHERE date = $1
                  );
            `;
            const result = await pool.query(query, [today]);
            console.log(`Nightly check complete. Marked ${result.rowCount} employees as Absent for ${today}.`);
        } catch (err) {
            console.error('Error running absence check cron:', err);
        }
    });
}

module.exports = { initAbsenceCron };
