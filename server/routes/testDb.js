// routes/testDb.js
// Defines a test route that:
//   1. Inserts a sample user into the Supabase "users" table.
//   2. Fetches all users and returns them as JSON.
// Access this route at GET /api/test-db

const express = require('express');
const router = express.Router();

// Import the shared Supabase client
const supabase = require('../services/supabaseClient');

// GET /api/test-db
router.get('/test-db', async (req, res) => {
    try {
        // Step 1: Insert a sample user into the "users" table
        const { error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    name: 'Test User',
                    skills: 'React, Python',
                    interests: 'Internships',
                },
            ]);

        // If insert fails, throw an error
        if (insertError) throw insertError;

        // Step 2: Fetch all users from the "users" table
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('*');

        // If fetch fails, throw an error
        if (fetchError) throw fetchError;

        // Return the list of users as JSON
        res.status(200).json({ success: true, users });
    } catch (error) {
        // Handle any errors and return a 500 response
        console.error('Database error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
