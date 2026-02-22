// services/adzunaService.js
// Fetches jobs from the Adzuna API (India) and normalizes them
// into the shared opportunity schema used by the matching pipeline.

const fetch = require('node-fetch');

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/in/search/1';

// ── Basic skill keyword extractor ─────────────────────────────
// Scans the description for common tech / skill keywords.
const SKILL_KEYWORDS = [
  'javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'go', 'rust',
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'supabase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux',
  'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'machine learning', 'deep learning', 'ai', 'nlp', 'tensorflow', 'pytorch',
  'rest', 'graphql', 'api', 'microservices',
  'excel', 'tableau', 'power bi', 'figma',
];

function extractSkills(description = '') {
  const lower = description.toLowerCase();
  return SKILL_KEYWORDS.filter(skill => lower.includes(skill));
}

// ── Detect opportunity type from title ────────────────────────
function detectType(title = '') {
  const lower = title.toLowerCase();
  if (lower.includes('intern')) return 'internship';
  return 'job';
}

// ── Normalize a single Adzuna result ──────────────────────────
function normalizeJob(job) {
  const title = job.title || '';
  const description = job.description || '';

  return {
    title,
    company: job.company?.display_name || 'Unknown',
    description,
    location: job.location?.display_name || 'India',
    type: detectType(title),
    skills: extractSkills(description),
    source: 'Adzuna',
  };
}

// ── Main fetch function ───────────────────────────────────────
/**
 * fetchAdzunaJobs
 * @param {string|string[]} keyword - skills / keyword(s) to search for
 * @param {string} [type]          - optional type hint (not used in query, applied post-fetch)
 * @returns {Promise<Object[]>}    - array of normalized job objects
 */
async function fetchAdzunaJobs(keyword = '', type) {
  try {
    const appId  = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      console.warn('Adzuna credentials missing. Skipping Adzuna fetch.');
      return [];
    }

    // If skills is an array, join into a search string
    const searchTerm = Array.isArray(keyword)
      ? keyword.slice(0, 5).join(' ')   // use first 5 skills to keep query focused
      : keyword;

    const params = new URLSearchParams({
      app_id:           appId,
      app_key:          appKey,
      what:             searchTerm,
      results_per_page: '20',
    });

    const url = `${ADZUNA_BASE_URL}?${params.toString()}`;
    console.log(`Fetching Adzuna jobs for: "${searchTerm}"`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Adzuna API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    const normalized = results.map(normalizeJob);

    // Optional: filter by type after normalization
    if (type) {
      return normalized.filter(job => job.type === type);
    }

    console.log(`Adzuna returned ${normalized.length} jobs`);
    return normalized;
  } catch (err) {
    console.error('fetchAdzunaJobs error:', err.message);
    return []; // never crash the main pipeline
  }
}

module.exports = { fetchAdzunaJobs };
