// services/smartFetcher.js
// 3-level smart fallback fetching system using RemoteOK API.
// Level 1: Exact keyword match
// Level 2: Broader keyword mapping
// Level 3: General fallback (first 30 jobs)
// Also pulls in Government job opportunities from govtFetcher.

const REMOTEOK_API = "https://remoteok.com/api";

// ──────────────────────────────────────────────
// HELPER 1: Extract top 3 keywords from skills
// ──────────────────────────────────────────────

/**
 * Split comma-separated skills and return the first 3 as clean keywords.
 * @param {string} userSkills - e.g. "React, Node.js, Python, CSS"
 * @returns {string[]} - e.g. ["react", "node.js", "python"]
 */
function extractKeywords(userSkills) {
    if (!userSkills || userSkills.trim() === "") return [];

    return userSkills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0)
        .slice(0, 3);
}

// ──────────────────────────────────────────────
// HELPER 2: Fetch all jobs from RemoteOK
// ──────────────────────────────────────────────

/**
 * Fetches jobs from RemoteOK API and maps them into a clean structure.
 * Skips the first element (metadata object).
 * @returns {Array} - Array of job objects
 */
async function fetchRemoteOK() {
    const response = await fetch(REMOTEOK_API, {
        headers: {
            // RemoteOK requires a User-Agent header
            "User-Agent": "SkillSync/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(`RemoteOK API error (${response.status})`);
    }

    const data = await response.json();

    // First element is metadata, skip it
    const jobs = data.slice(1);

    // Map into clean structure
    return jobs.map((job) => ({
        title: job.position || job.title || "Untitled",
        company: job.company || "Unknown",
        description: job.description || "",
        skills: Array.isArray(job.tags) ? job.tags.join(", ") : "",
        source: "RemoteOK",
        type: "job",
    }));
}

// ──────────────────────────────────────────────
// HELPER 3: Filter jobs by a keyword
// ──────────────────────────────────────────────

/**
 * Returns jobs where title, description, or skills contain the keyword.
 * Case-insensitive search.
 * @param {Array}  jobs    - Array of job objects
 * @param {string} keyword - Keyword to search for
 * @returns {Array} - Filtered jobs
 */
function filterByKeyword(jobs, keyword) {
    const lowerKeyword = keyword.toLowerCase();

    return jobs.filter((job) => {
        const title = (job.title || "").toLowerCase();
        const description = (job.description || "").toLowerCase();
        const skills = (job.skills || "").toLowerCase();

        return title.includes(lowerKeyword) ||
            description.includes(lowerKeyword) ||
            skills.includes(lowerKeyword);
    });
}

// ──────────────────────────────────────────────
// HELPER: Remove duplicate jobs (by title + company)
// ──────────────────────────────────────────────

/**
 * Removes duplicate jobs based on title + company combo.
 * @param {Array} jobs
 * @returns {Array} - De-duplicated jobs
 */
function removeDuplicates(jobs) {
    const seen = new Set();

    return jobs.filter((job) => {
        const key = `${(job.title || "").toLowerCase()}__${(job.company || "").toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ──────────────────────────────────────────────
// MAIN: smartFetch – 3-level fallback system
// ──────────────────────────────────────────────

// Broader keyword mapping for Level 2
const KEYWORD_MAP = {
    "machine learning": "developer",
    "ai": "software",
    "cybersecurity": "security",
    "data science": "data",
};

/**
 * Smart 3-level fetching:
 *   Level 1 → Exact keyword match (needs ≥ 10 results)
 *   Level 2 → Broader mapped keywords (needs ≥ 10 results)
 *   Level 3 → General fallback (first 30 jobs)
 *
 * @param {string} userSkills - Comma-separated user skills
 * @returns {Array} - Array of matched job objects
 */
async function smartFetch(userSkills) {
    try {
        // A) Extract top 3 keywords
        const keywords = extractKeywords(userSkills);

        // Fetch RemoteOK jobs (dedicated to jobs)
        const allJobs = await fetchRemoteOK();

        // ── LEVEL 1: Exact keyword match ────────────
        if (keywords.length > 0) {
            let level1Results = [];

            for (const keyword of keywords) {
                const matched = filterByKeyword(allJobs, keyword);
                level1Results = level1Results.concat(matched);
            }

            level1Results = removeDuplicates(level1Results);

            if (level1Results.length >= 10) {
                console.log(`SmartFetch: Level 1 hit — ${level1Results.length} jobs found`);
                return level1Results;
            }
        }

        // ── LEVEL 2: Broader keyword mapping ────────
        if (keywords.length > 0) {
            let level2Results = [];

            for (const keyword of keywords) {
                // Use the mapped keyword if it exists, otherwise skip
                const mappedKeyword = KEYWORD_MAP[keyword];
                if (mappedKeyword) {
                    const matched = filterByKeyword(allJobs, mappedKeyword);
                    level2Results = level2Results.concat(matched);
                }
            }

            level2Results = removeDuplicates(level2Results);

            if (level2Results.length >= 10) {
                console.log(`SmartFetch: Level 2 hit — ${level2Results.length} jobs found`);
                return level2Results;
            }
        }

        // ── LEVEL 3: General fallback ───────────────
        console.log("SmartFetch: Level 3 fallback — returning first 30 jobs");
        const fallback = removeDuplicates(allJobs).slice(0, 30);
        return fallback;

    } catch (error) {
        console.error("SmartFetch error:", error.message);
        // Never crash the server — return empty array on failure
        return [];
    }
}

module.exports = { smartFetch };
