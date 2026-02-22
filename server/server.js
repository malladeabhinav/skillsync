// server/server.js
// Main entry point for the SkillSync backend server.
// Sets up Express, enables CORS, JSON parsing, cookie parsing, and registers routes.

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ── CORS ──────────────────────────────────────────────────────────────────────
// CLIENT_ORIGIN must be set in .env — no wildcards allowed with credentials: true.
// Dev:  http://localhost:5173
// Prod: https://yourdomain.com
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Parse cookies (needed to read the HttpOnly auth cookie)
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Root route - simple health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillSync Matching API',
    env: process.env.NODE_ENV || 'development',
  });
});

// Import and use the testDb route
const testDbRoute = require('./routes/testDb');
app.use('/api', testDbRoute);

// Import and use the resume analysis route (Gemini AI)
const resumeRoutes = require('./routes/resume');
app.use('/api/resume', resumeRoutes);

// Import and use the jobs route (RemoteOK fetcher)
const jobsRoutes = require('./routes/jobs');
app.use('/api/jobs', jobsRoutes);

// Import and use the match route (skill matching)
const matchRoutes = require('./routes/match');
app.use('/api/match', matchRoutes);

// Import and use the apply route (job applications)
const applyRoutes = require('./routes/apply');
app.use('/api/apply', applyRoutes);

// Start the server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillSync matching server running → http://localhost:${PORT}`);
  console.log(`  ENV:            ${isProd ? 'production 🔒' : 'development'}`);
  console.log(`  Allowed origin: ${allowedOrigin}`);
});
