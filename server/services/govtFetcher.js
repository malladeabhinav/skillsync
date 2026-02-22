// services/govtFetcher.js
// Fetches Government job listings from data.gov.in and normalizes them
// into the shared opportunity schema used by the matching pipeline.

const fetch = require('node-fetch');

// ── Skill keyword extractor ───────────────────────────────────
// Scans description text for common skill / domain keywords.
const SKILL_KEYWORDS = [
    'java', 'python', 'sql', 'c++', 'c#', 'javascript', 'typescript',
    'engineering', 'data', 'analysis', 'software', 'it',
    'networking', 'linux', 'aws', 'cloud', 'machine learning',
    'ai', 'html', 'css', 'react', 'node', 'api', 'database',
    'mysql', 'postgresql', 'mongodb', 'excel', 'tableau',
    'cybersecurity', 'embedded', 'gis', 'automation',
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

// ── Main fetch function ───────────────────────────────────────

/**
 * fetchGovtJobs
 * Calls the data.gov.in API and returns normalized govt job opportunities.
 *
 * @param {string|string[]} skills - user skills (passed from smartFetcher, not used for filtering)
 * @returns {Promise<Object[]>}    - array of normalized opportunity objects
 */
async function fetchGovtJobs(skills = []) {
    try {
        const apiKey = process.env.DATA_GOV_API_KEY;

        if (!apiKey) {
            console.warn('DATA_GOV_API_KEY missing. Skipping data.gov.in fetch.');
            return [];
        }

        // data.gov.in resource for government job notifications
        // Resource ID: government vacancies / employment notifications dataset
        const resourceId = '27468e5c-f6f1-4d29-a9bd-3ab3c90f4bc7';

        const params = new URLSearchParams({
            'api-key': apiKey,
            format: 'json',
            limit: '20',
        });

        const url = `https://api.data.gov.in/resource/${resourceId}?${params.toString()}`;
        console.log('Fetching Govt jobs from data.gov.in...');

        const response = await fetch(url, {
            headers: { 'User-Agent': 'SkillSync/1.0' },
        });

        if (!response.ok) {
            console.error(`data.gov.in API error: ${response.status} ${response.statusText}`);
            return getFallbackGovtJobs();
        }

        const data = await response.json();
        const records = data.records || data.fields || [];

        if (!records.length) {
            console.warn('data.gov.in returned 0 records — using fallback dataset.');
            return getFallbackGovtJobs();
        }

        // Normalize each record into the shared opportunity schema
        const normalized = records.map(record => {
            // Field names vary by dataset; attempt common aliases
            const title = record.post_name || record.title || record.position || 'Govt Job';
            const company = record.department_name || record.department || record.ministry || 'Government of India';
            const description = record.description || record.details || record.remarks || '';
            const location = record.location || record.state || 'India';

            return {
                title: String(title).trim(),
                company: String(company).trim(),
                description: String(description).trim(),
                location: String(location).trim(),
                type: 'govt',
                skills: extractSkills(description),
                source: 'data.gov.in',
            };
        });

        console.log(`data.gov.in returned ${normalized.length} govt jobs`);
        return normalized;

    } catch (err) {
        console.error('fetchGovtJobs error:', err.message);
        return getFallbackGovtJobs(); // never crash the pipeline
    }
}

// ── Fallback dataset ──────────────────────────────────────────
// Used when API credentials are missing or the request fails.
// Ensures the pipeline always has govt data available.
function getFallbackGovtJobs() {
    console.log('GovtFetcher: using curated fallback dataset.');
    return [
        {
            title: 'Junior Software Engineer - NIC',
            company: 'National Informatics Centre',
            description: 'Looking for candidates with skills in Java, Python, SQL, and Web Technologies.',
            location: 'India',
            type: 'govt',
            skills: ['java', 'python', 'sql', 'html', 'css'],
            source: 'Govt Portal',
        },
        {
            title: 'Data Analyst - ISRO',
            company: 'ISRO',
            description: 'Data analysis, Python, Machine Learning required for satellite data processing.',
            location: 'India',
            type: 'govt',
            skills: ['python', 'machine learning', 'data', 'analysis'],
            source: 'Govt Portal',
        },
        {
            title: 'Cybersecurity Analyst - CERT-In',
            company: 'CERT-In (Govt of India)',
            description: 'Monitor and respond to cybersecurity threats. Networking, Linux, security tools.',
            location: 'India',
            type: 'govt',
            skills: ['cybersecurity', 'linux', 'networking', 'python'],
            source: 'Govt Portal',
        },
        {
            title: 'Full Stack Developer - MeitY',
            company: 'Ministry of Electronics & IT',
            description: 'Build digital public services using React, Node.js, and PostgreSQL.',
            location: 'India',
            type: 'govt',
            skills: ['react', 'node', 'postgresql', 'javascript'],
            source: 'Govt Portal',
        },
        {
            title: 'AI/ML Engineer - C-DAC',
            company: 'Centre for Development of Advanced Computing',
            description: 'Work on national AI initiatives. Python, TensorFlow, PyTorch, NLP required.',
            location: 'India',
            type: 'govt',
            skills: ['python', 'machine learning', 'ai', 'data'],
            source: 'Govt Portal',
        },
        {
            title: 'Cloud Infrastructure Engineer - NIC',
            company: 'National Informatics Centre',
            description: 'Manage cloud infrastructure for e-governance services. AWS, Docker, Kubernetes.',
            location: 'India',
            type: 'govt',
            skills: ['aws', 'cloud', 'linux', 'python'],
            source: 'Govt Portal',
        },
        {
            title: 'Database Administrator - RBI',
            company: 'Reserve Bank of India',
            description: 'Design and maintain large-scale databases. Oracle, MySQL, PostgreSQL.',
            location: 'India',
            type: 'govt',
            skills: ['sql', 'mysql', 'postgresql', 'database'],
            source: 'Govt Portal',
        },
        {
            title: 'Mobile App Developer - UIDAI',
            company: 'UIDAI (Aadhaar)',
            description: 'Build secure mobile apps for citizen services using React Native and APIs.',
            location: 'India',
            type: 'govt',
            skills: ['react', 'javascript', 'api'],
            source: 'Govt Portal',
        },
        {
            title: 'Systems Analyst - DRDO',
            company: 'Defence Research & Development Organisation',
            description: 'Analyse and design embedded systems and software for defence. C++, Java, Linux.',
            location: 'India',
            type: 'govt',
            skills: ['c++', 'java', 'linux', 'engineering'],
            source: 'Govt Portal',
        },
        {
            title: 'IT Officer - UPSC',
            company: 'Union Public Service Commission',
            description: 'Manage IT infrastructure, software development, and data management systems.',
            location: 'India',
            type: 'govt',
            skills: ['it', 'software', 'data', 'database', 'networking'],
            source: 'Govt Portal',
        },
    ];
}

module.exports = { fetchGovtJobs };
