// services/hackathonService.js
// Fetches live hackathon listings from the Devpost public API and normalizes
// them into the shared opportunity schema used by the matching pipeline.

const fetch = require('node-fetch');

const DEVPOST_API = 'https://devpost.com/api/hackathons';

// ── Skill keyword extractor ───────────────────────────────────
const SKILL_KEYWORDS = [
    'ai', 'machine learning', 'web', 'blockchain', 'data', 'cloud',
    'python', 'javascript', 'react', 'node', 'api', 'mobile',
    'iot', 'ar', 'vr', 'cybersecurity', 'healthcare', 'fintech',
    'sql', 'java', 'c++', 'typescript', 'flutter', 'swift',
];

/**
 * Extracts matched skill keywords from a description string.
 * @param {string} description
 * @returns {string[]}
 */
function extractSkills(description = '') {
    const lower = description.toLowerCase();
    return SKILL_KEYWORDS.filter(skill => lower.includes(skill));
}

// ── Normalize a single Devpost hackathon entry ────────────────
function normalizeHackathon(hackathon) {
    const title = hackathon.title || 'Hackathon';
    const description = hackathon.displayed_location?.location
        || hackathon.tagline
        || hackathon.description
        || '';
    const location = hackathon.displayed_location?.location
        || (hackathon.open_state === 'open' ? 'Online' : 'Varies');
    const themes = (hackathon.themes || []).map(t => t.name || t.slug || '');

    return {
        title,
        company: 'Devpost',
        description: hackathon.tagline || description,
        location,
        type: 'hackathon',
        skills: [...new Set([...extractSkills(description), ...themes])],
        source: 'Devpost',
        url: hackathon.url || '',
        prize: hackathon.prize_amount || null,
        deadline: hackathon.submission_period_dates || null,
    };
}

// ── Main fetch function ───────────────────────────────────────

/**
 * fetchHackathons
 * @param {string|string[]} skills - user skills (used for future keyword query support)
 * @returns {Promise<Object[]>}    - array of normalized hackathon objects (max 20)
 */
async function fetchHackathons(skills = []) {
    try {
        console.log('Fetching Hackathons from Devpost...');

        const params = new URLSearchParams({
            status: 'open',       // only open/upcoming hackathons
            order_by: 'deadline',   // soonest deadline first
            per_page: '20',
        });

        const url = `${DEVPOST_API}?${params.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SkillSync/1.0',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Devpost API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const hackathons = data.hackathons || [];

        const normalized = hackathons.slice(0, 20).map(normalizeHackathon);

        console.log(`Hackathons fetched: ${normalized.length}`);
        return normalized;

    } catch (err) {
        console.error('fetchHackathons error:', err.message);
        return []; // never crash the pipeline
    }
}

module.exports = { fetchHackathons };
