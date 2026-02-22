// routes/match.js
// Strict type-based matching pipeline.
//
// Architecture:
//   Step 1  → Read `type` from query (default: 'job')
//   Step 2  → Fetch ONLY from APIs relevant to that type
//   Step 3  → Strict post-fetch filter  (opportunity.type === selectedType)
//   Step 4  → Score every result with calculateMatch
//   Step 5  → AI re-ranking via Gemini  (optional, non-blocking)
//   Step 6  → Sort desc by aiScore → score, return top 10
//
// API routing:
//   job        → RemoteOK (smartFetch) + Adzuna
//   internship → Adzuna (internship-filtered)
//   hackathon  → Devpost (fetchHackathons)
//   govt       → data.gov.in / curated fallback (fetchGovtJobs)

const express = require('express');
const router = express.Router();

const supabase = require('../services/supabaseClient');
const { calculateMatch, refineMatchesWithAI } = require('../services/matchingService');
const { smartFetch } = require('../services/smartFetcher');
const { fetchAdzunaJobs } = require('../services/adzunaService');
const { fetchGovtJobs } = require('../services/govtFetcher');
const { fetchHackathons } = require('../services/hackathonService');
const authMiddleware = require('../middleware/authMiddleware');


// ── Valid types ────────────────────────────────────────────────
const VALID_TYPES = ['job', 'internship', 'hackathon', 'govt'];

// ── Safe fetcher wrapper ───────────────────────────────────────
// Never lets a single API failure crash the pipeline.
async function safeCall(label, fn) {
    try {
        const results = await fn();
        console.log(`  ✓ [${label}] returned ${results.length} results`);
        return Array.isArray(results) ? results : [];
    } catch (err) {
        console.error(`  ✗ [${label}] failed:`, err.message);
        return [];
    }
}

// ── Type → API dispatch map ────────────────────────────────────
function getAPIsByType(type, userSkills) {
    const jobAPIs = [
        () => safeCall('RemoteOK', () => smartFetch(userSkills)),
        () => safeCall('Adzuna', () => fetchAdzunaJobs(userSkills, type)),
    ];
    const govtAPIs = [() => safeCall('GovtJobs', () => fetchGovtJobs(userSkills))];
    const hackathonAPIs = [() => safeCall('Devpost', () => fetchHackathons(userSkills))];

    if (type === 'govt') return govtAPIs;
    if (type === 'hackathon') return hackathonAPIs;
    if (type === 'job' || type === 'internship') return jobAPIs;

    // Default (no type provided) -> call all sources
    return [...jobAPIs, ...govtAPIs, ...hackathonAPIs];
}

// ── Rich opportunity scorer ───────────────────────────────────
// Computes matchedSkills, score %, confidence, matchLevel and explanation.
// Uses centralized calculateMatch logic from matchingService.js.
function enrichOpportunity(userSkills, opportunity) {
    const { matchedSkills, score } = calculateMatch(userSkills, opportunity.skills);

    // Confidence label
    const confidence = score >= 75 ? 'High'
        : score >= 50 ? 'Medium'
            : score >= 25 ? 'Low'
                : 'Very Low';

    // Match level
    const matchLevel = score >= 75 ? 'Strong Match'
        : score >= 50 ? 'Good Match'
            : score >= 25 ? 'Average Match'
                : 'Weak Match';

    // Human-readable explanation
    const skillList = matchedSkills.length > 0
        ? matchedSkills.join(', ')
        : 'none of the listed skills';
    const explanation = matchedSkills.length > 0
        ? `Your profile aligns professionally with this role, matching ${score}% of required technologies including ${skillList}.`
        : 'Your profile does not directly match the listed skills for this role, but you may still apply.';

    return {
        ...opportunity,
        matchedSkills,
        score,
        confidence,
        matchLevel,
        explanation,
    };
}

// GET /api/match/:userId?type=job|internship|hackathon|govt
// Protected: Only authenticated users
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Security Check: Verify user can only access their own data
        if (req.user.id !== userId) {
            return res.status(403).json({ success: false, error: 'Access denied. You can only view your own matches.' });
        }

        // ── Step 1: Resolve type ──────────────────────────────────
        const selectedType = req.query.type; // Undefined = all sources

        if (selectedType && !VALID_TYPES.includes(selectedType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid type "${selectedType}". Valid types: ${VALID_TYPES.join(', ')}.`,
            });
        }

        console.log(`\n── Match request ──────────────────────────`);
        console.log(`Source selected: ${selectedType || 'all'}`);

        // ── Step 2: Fetch user ─────────────────────────────────────
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        // ── Step 3: Call ONLY APIs relevant to the selected type ───
        const apiFns = getAPIsByType(selectedType, user.skills);
        console.log(`Calling APIs: [${apiFns.map((_, i) => i).join(', ')}] (${apiFns.length} source(s))`);

        // Run all relevant fetchers in parallel
        const results = await Promise.all(apiFns.map(fn => fn()));
        let allJobs = results.flat();

        console.log(`Raw results before filter: ${allJobs.length}`);

        const apiCount = allJobs.length;
        console.log(`API count: ${apiCount}`);

        // ── Step 4b: DB fallback (if API returned < 5 results) ────
        let dbCount = 0;

        if (apiCount < 5) {
            console.log(`API results < 5 — triggering DB fallback (type: ${selectedType || 'all'})...`);
            try {
                let query = supabase
                    .from('opportunities')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (selectedType) {
                    query = query.eq('type', selectedType);
                }

                const { data: dbRows, error: dbError } = await query;

                if (dbError) throw dbError;

                const dbJobs = (dbRows || []).map(row => ({ ...row, source: 'database' }));
                dbCount = dbJobs.length;
                console.log(`DB fallback count: ${dbCount}`);

                // Deduplicate: skip DB entries already present from API
                const seen = new Set(
                    allJobs.map(j => `${(j.title || '').toLowerCase()}__${(j.company || '').toLowerCase()}`)
                );

                for (const dbJob of dbJobs) {
                    const key = `${(dbJob.title || '').toLowerCase()}__${(dbJob.company || '').toLowerCase()}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        allJobs.push(dbJob);
                    }
                }

                console.log(`After merge + dedup: ${allJobs.length} total opportunities`);
            } catch (dbErr) {
                console.error('DB fallback failed — continuing with API results only:', dbErr.message);
            }
        }

        // ── Step 4c: Logging results ─────────────────────────────
        if (allJobs.length === 0) {
            console.log('No opportunities found from any source.');
        }

        // ── Step 5: Enrich every opportunity with scoring fields ──
        // Uses enrichOpportunity() for matchedSkills, score%, confidence,
        // matchLevel and explanation. Safe if skills are empty on either side.
        const matches = allJobs.map(job => enrichOpportunity(user.skills, job));

        // ── Step 6: Deduplicate by company + title ────────────────
        // Keeps the highest-scoring version of each unique role.
        // When scores tie and one result is from the DB, the API result wins.
        const jobMap = new Map();

        for (const job of matches) {
            const uniqueKey = `${(job.company || '').toLowerCase()}-${(job.title || '').toLowerCase()}`;
            const existing = jobMap.get(uniqueKey);

            if (!existing) {
                jobMap.set(uniqueKey, job);
            } else {
                const effectiveScore = j => j.aiScore || j.score;
                const newScore = effectiveScore(job);
                const existingScore = effectiveScore(existing);

                if (newScore > existingScore) {
                    // New entry scores higher → replace
                    jobMap.set(uniqueKey, job);
                } else if (
                    newScore === existingScore &&
                    existing.source === 'database' &&
                    job.source !== 'database'
                ) {
                    // Equal score, prefer API result over DB result
                    jobMap.set(uniqueKey, job);
                }
                // Otherwise keep existing — no update
            }
        }

        const deduped = Array.from(jobMap.values());
        console.log(`After deduplication: ${deduped.length} unique opportunities (was ${matches.length})`);

        // ── Step 7: AI re-ranking (optional, non-blocking) ────────
        // refineMatchesWithAI decorates entries with .aiScore when available.
        try {
            await refineMatchesWithAI(user.skills, deduped);
        } catch (aiError) {
            console.warn('AI ranking unavailable, using skill-based score:', aiError.message);
        }

        // ── Step 8: Sort descending — aiScore preferred, else score ─
        deduped.sort((a, b) => (b.aiScore || b.score) - (a.aiScore || a.score));
        const topMatches = deduped.slice(0, 20);

        // Strip internal aiScore — callers only need score, confidence, matchLevel
        const cleanMatches = topMatches.map(({ aiScore, ...rest }) => rest);

        console.log(`Returning ${cleanMatches.length} top matches for type "${selectedType}"`);
        console.log(`──────────────────────────────────────────\n`);

        return res.json({
            success: true,
            type: selectedType || 'all',
            source: dbCount > 0 ? 'api+database' : 'api',
            apiCount,
            dbCount,
            total: cleanMatches.length,
            matches: cleanMatches,
        });


    } catch (error) {
        console.error('Match route error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
