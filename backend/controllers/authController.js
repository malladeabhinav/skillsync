// backend/controllers/authController.js
// Handles signup, login, logout, and session verification (/me).
// Cookie flags are environment-aware:
//   Dev  → secure: false, sameSite: "lax"   (works over HTTP localhost)
//   Prod → secure: true,  sameSite: "none"  (required for cross-domain HTTPS)

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const isProd = process.env.NODE_ENV === 'production';

// ─── Cookie options ──────────────────────────────────────────────────────────
// httpOnly: true  → JS cannot read this cookie (XSS protection)
// secure: true    → cookie only sent over HTTPS (production only)
// sameSite:
//   "lax"  → safe default for same-domain setups (dev)
//   "none" → required when frontend and backend are on different domains (prod)
//             NOTE: sameSite "none" REQUIRES secure: true
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProd,                     // false in dev, true in prod (HTTPS)
    sameSite: isProd ? 'none' : 'lax', // "none" for cross-domain prod, "lax" for dev
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days (matches JWT expiry)
};

// ─── Helper: sign a JWT ──────────────────────────────────────────────────────
function signToken(userId, role = 'user') {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
            [name, email, hashedPassword]
        );

        const user = result.rows[0];
        const token = signToken(user.id, user.role || 'user');

        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(201).json({
            message: 'Signup successful.',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });

    } catch (error) {
        console.error('[signup] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required.' });
        }

        const result = await pool.query(
            'SELECT id, name, email, password, role FROM public.users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = signToken(user.id, user.role || 'user');

        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: 'Login successful.',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });

    } catch (err) {
        console.error('[login] Error:', err.message);
        return res.status(500).json({ error: 'Server error during login. Please try again.' });
    }
};

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
    });
    return res.status(200).json({ message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
exports.me = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            'SELECT id, name, email, role FROM public.users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found.' });
        }

        return res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        // Clear stale cookie on token error
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        });
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
