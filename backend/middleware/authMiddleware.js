// backend/middleware/authMiddleware.js
// Protects routes by verifying the JWT stored in the HttpOnly cookie.
//
// Usage (in any route file):
//   const protect = require('../middleware/authMiddleware');
//   router.get('/protected', protect, (req, res) => { ... });
//
// On success:  req.user = { id: <uuid>, role: <string> }
// On failure:  returns 401 JSON error

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        // ── Read token from HttpOnly cookie ────────────────────────────────────
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'No session found. Please log in.' });
        }

        // ── Verify ────────────────────────────────────────────────────────────────
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded payload to the request
        req.user = { id: decoded.id, role: decoded.role };

        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid session. Access denied.' });
    }
};

module.exports = protect;
