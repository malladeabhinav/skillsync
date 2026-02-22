// server/middleware/authMiddleware.js
// Verifies the JWT stored in the HttpOnly cookie sent by the browser.
// Ensures that only authenticated users can access specific routes.

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // 1. Get the token from HttpOnly cookie (automatically sent by browser)
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No session found. Please log in.',
            });
        }

        // 2. Verify the token
        // Note: JWT_SECRET must be the same as used in the Auth service.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user data to request
        // decoded contains { id: 'user-uuid', role: 'user' }
        req.user = decoded;

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Session expired. Please log in again.',
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Invalid session. Access denied.',
        });
    }
};

module.exports = authMiddleware;
