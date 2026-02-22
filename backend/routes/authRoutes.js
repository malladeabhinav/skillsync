// backend/routes/authRoutes.js
// Mounts auth controller handlers on their respective routes.

const express = require('express');
const router = express.Router();
const { signup, login, logout, me } = require('../controllers/authController');

// POST /api/auth/signup — create a new account (sets HttpOnly cookie)
router.post('/signup', signup);

// POST /api/auth/login — authenticate (sets HttpOnly cookie)
router.post('/login', login);

// POST /api/auth/logout — clear the session cookie
router.post('/logout', logout);

// GET /api/auth/me — verify session cookie and return user data
router.get('/me', me);

module.exports = router;
