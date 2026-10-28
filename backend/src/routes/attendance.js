const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { scanLimiter } = require('../middleware/rateLimiter');

// QR Scan endpoint (Clock In / Clock Out) with rate limiter
router.post('/scan', scanLimiter, async (req, res) => {
    const { qr_token } = req.body;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE qr_token = $1', [qr_token]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid QR Code' });
        }
        const user = userResult.rows[0];

        const logResult = await pool.query(
            'SELECT * FROM attendance_logs WHERE user_id = $1 AND date = $2',
            [user.id, today]
        );

        if (logResult.rows.length === 0) {
            // Clock In
            const shiftResult = await pool.query('SELECT * FROM shifts LIMIT 1');
            const shift = shiftResult.rows[0];

            const [shiftHours, shiftMinutes] = shift.start_time.split(':');
            const shiftStartTime = new Date();
            shiftStartTime.setHours(parseInt(shiftHours), parseInt(shiftMinutes) + shift.grace_period_minutes, 0);

            let status = 'Present';
            if (now > shiftStartTime) {
                status = 'Late';
            }

            const newLog = await pool.query(
                `INSERT INTO attendance_logs (user_id, date, clock_in, status) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [user.id, today, now, status]
            );

            return res.json({ message: `Welcome ${user.name}! Clocked In (${status})`, data: newLog.rows[0] });
        } else {
            // Clock Out
            const log = logResult.rows[0];
            if (log.clock_out) {
                return res.status(400).json({ error: `${user.name}, you have already clocked out today.` });
            }

            const updatedLog = await pool.query(
                `UPDATE attendance_logs SET clock_out = $1 WHERE id = $2 RETURNING *`,
                [now, log.id]
            );

            return res.json({ message: `Goodbye ${user.name}! Clocked Out successfully.`, data: updatedLog.rows[0] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
