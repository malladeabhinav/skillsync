// backend/server.js
// Main entry point for the SkillSync Auth backend.
// Runs on PORT 4000 by default (separate from the main server on 5000).

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

// ── CORS ──────────────────────────────────────────────────────────────────────
// CLIENT_ORIGIN must be set in .env — no wildcards when credentials: true.
// Dev:  http://localhost:5173
// Prod: https://yourdomain.com
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
// In development allow the null origin (e.g., scripts run via node) alongside the usual dev origin.
const devOrigins = isProd ? allowedOrigin : [allowedOrigin, 'null'];

app.use(cors({
  origin: devOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,   // Required for cookies to cross origins
}));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SkillSync Auth API',
        env: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', authRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('[Unhandled Error]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀  SkillSync Auth API running → http://localhost:${PORT}`);
    console.log(`   ENV:            ${isProd ? 'production 🔒' : 'development'}`);
    console.log(`   Allowed origin: ${allowedOrigin}`);
    console.log(`   POST /api/auth/signup`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/logout`);
    console.log(`   GET  /api/auth/me\n`);
});
