// routes/jobs.js
// Defines the GET /api/jobs/fetch-remoteok endpoint.
// Triggers fetching jobs from RemoteOK and storing them in Supabase.

const express = require('express');
const router = express.Router();

const { fetchAndStoreRemoteJobs } = require('../services/remoteokFetcher');

// GET /api/jobs/fetch-remoteok
// Fetches remote jobs from RemoteOK API and stores new ones in Supabase
router.get('/fetch-remoteok', async (req, res) => {
    try {
        const result = await fetchAndStoreRemoteJobs();

        res.status(200).json({
            success: true,
            message: 'Jobs fetched and stored',
            inserted: result.inserted,
            skipped: result.skipped,
        });
    } catch (error) {
        console.error('Job fetch route error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
