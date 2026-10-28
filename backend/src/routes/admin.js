const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get filtered attendance logs for Admin Dashboard
router.get('/reports', async (req, res) => {
    const { date, status, user_id } = req.query;
    try {
        let query = `
            SELECT al.*, u.name as employee_name, u.email 
            FROM attendance_logs al
            JOIN users u ON al.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (date) {
            query += ` AND al.date = $${paramIndex++}`;
            params.push(date);
        }
        if (status) {
            query += ` AND al.status = $${paramIndex++}`;
            params.push(status);
        }
        if (user_id) {
            query += ` AND al.user_id = $${paramIndex++}`;
            params.push(user_id);
        }

        query += ` ORDER BY al.date DESC, al.clock_in DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch attendance reports' });
    }
});

// Get user QR tokens for admin badge generation
users = router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, qr_token FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;