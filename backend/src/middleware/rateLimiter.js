const rateLimit = require('express-rate-limit');

// Prevent double scanning within 10 seconds per IP or token attempt
const scanLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 1, // Limit each IP to 1 request per windowMs
    message: { error: 'Please wait a few seconds before scanning again (Double-scan protection).' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { scanLimiter };
