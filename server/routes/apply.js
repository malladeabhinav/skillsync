// server/routes/apply.js
// Handles job/opportunity applications.
// Protected by authMiddleware — user identity is read from JWT, never from the request body.

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../services/supabaseClient');

// ── POST /api/apply ───────────────────────────────────────────────────────────
// Apply to an opportunity. Prevents duplicate applications.
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { opportunity_id, status, title, company, type } = req.body;
        const user_id = req.user.id;

        if (!opportunity_id) {
            return res.status(400).json({ success: false, error: 'opportunity_id is required.' });
        }

        // Prevent duplicate application
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('user_id', user_id)
            .eq('opportunity_id', opportunity_id)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already applied to this opportunity.' });
        }

        // Insert new application
        const { error } = await supabase
            .from('applications')
            .insert([{
                user_id,
                opportunity_id,
                status: status || 'pending',
                opportunity_title: title || null,
                company: company || null,
                opportunity_type: type || null,
            }]);

        if (error) throw error;

        console.log(`[Apply] User ${user_id} applied to ${opportunity_id}`);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('APPLY ERROR:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ── GET /api/apply/:userId ────────────────────────────────────────────────────
// Fetch all applications for the authenticated user.
// The :userId param is ignored — we always use the JWT identity for security.
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ applications: data || [] });

    } catch (error) {
        console.error('FETCH APPLICATIONS ERROR:', error);
        return res.status(500).json({ applications: [], error: error.message });
    }
});

module.exports = router;
