// matchingService.js
// Hybrid matching system:
//   1. calculateMatch()        → fast keyword-overlap scoring
//   2. refineMatchesWithAI()   → semantic ranking via Gemini 2.5 Flash

// Gemini API setup (same pattern as geminiService.js)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ──────────────────────────────────────────────
// 1. BASIC MATCHING (normalized keyword overlap)
// ──────────────────────────────────────────────

/**
 * Normalize a comma-separated skill string into a clean array.
 * - Converts to lowercase
 * - Splits by comma
 * - Trims spaces
 * - Removes empty values
 */
/**
 * Professional Skill Normalizer
 * Handles strings, arrays, and messy data reliably.
 */
function normalize(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.map(s => String(s).toLowerCase().trim()).filter(Boolean);
    if (typeof data === "string") {
        return data
            .split(",")
            .map(s => s.toLowerCase().trim())
            .filter(Boolean);
    }
    return [];
}

/**
 * Calculate how well a user's skills match a job's required skills.
 * Follows the "Professional Way": Normalize, Filter, Includes.
 *
 * @param {string|string[]} userSkills - user skills
 * @param {string|string[]} jobSkills  - job skills
 * @returns {{ matchedSkills: string[], score: number }}
 */
function calculateMatch(userSkills, jobSkills) {
    const userSkillsNormalized = normalize(userSkills);
    const jobSkillsNormalized = normalize(jobSkills);

    if (jobSkillsNormalized.length === 0) {
        return { matchedSkills: [], score: 0 };
    }

    // intersection: Job skills that the user has
    const intersection = jobSkillsNormalized.filter(skill =>
        userSkillsNormalized.includes(skill)
    );

    // Score is (matched requirements / total requirements) * 100
    const score = Math.round(
        (intersection.length / jobSkillsNormalized.length) * 100
    );

    return {
        matchedSkills: intersection,
        score
    };
}

// ──────────────────────────────────────────────
// 2. AI-POWERED MATCHING (semantic via Gemini)
//    Uses delimiter-based format for reliable parsing
// ──────────────────────────────────────────────

/**
 * Send a batch of jobs to Gemini 2.5 Flash for semantic scoring.
 * Uses delimiter markers (AI_MATCH_RESULTS / END_RESULTS) for safe parsing.
 * Makes exactly ONE API call.
 *
 * @param {string} userSkills - Comma-separated user skills
 * @param {Array}  topJobs    - Array of job objects (up to 30)
 * @returns {Array} - Same jobs with `aiScore` (0-100), sorted descending
 */
async function refineMatchesWithAI(userSkills, topJobs) {
    // Edge cases
    if (!userSkills || userSkills.trim() === "" || !topJobs || topJobs.length === 0) {
        return [];
    }

    // Build the numbered job list
    const jobList = topJobs
        .map((job, i) => {
            const title = job.title || "Untitled";
            const skills = job.skills || "N/A";
            const description = job.description || "No description";
            return `${i + 1}. Title: ${title}\n   Skills: ${skills}\n   Description: ${description}`;
        })
        .join("\n");

    // Prompt with delimiter-based output format
    const prompt = `User skills: ${userSkills}

For each job below, return a semantic match score from 0 to 100. Consider related technologies, transferable skills, and ecosystem overlap — not just exact keyword matches.

Jobs:
${jobList}

Return results ONLY in this exact format, with no extra text:
AI_MATCH_RESULTS
Job Title|Score
Job Title|Score
END_RESULTS

Example:
AI_MATCH_RESULTS
Senior React Developer|85
Python Data Analyst|42
END_RESULTS`;

    // --- ONE Gemini API call ---
    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();

    // Extract text from Gemini response
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error("Gemini returned an empty or unexpected response.");
    }

    // --- Parse delimiter-based response ---
    const aiScores = parseDelimiterResponse(rawText);

    // Merge AI scores back onto the original job objects
    const refinedJobs = topJobs.map((job) => {
        const jobTitle = (job.title || "").toLowerCase();

        // Find matching AI score by title (case-insensitive)
        const aiMatch = aiScores.find(
            (s) => s.title.toLowerCase() === jobTitle
        );

        return {
            ...job,
            aiScore: aiMatch ? aiMatch.score : 0,
        };
    });

    // Sort by AI score descending
    refinedJobs.sort((a, b) => b.aiScore - a.aiScore);

    return refinedJobs;
}

/**
 * Parse Gemini's delimiter-based response.
 * Extracts lines between AI_MATCH_RESULTS and END_RESULTS markers.
 * Each line should be: Title|Score
 *
 * @param {string} rawText - Raw Gemini response text
 * @returns {Array<{ title: string, score: number }>}
 */
function parseDelimiterResponse(rawText) {
    const results = [];

    // Extract content between markers
    const startMarker = "AI_MATCH_RESULTS";
    const endMarker = "END_RESULTS";

    const startIndex = rawText.indexOf(startMarker);
    const endIndex = rawText.indexOf(endMarker);

    // If markers not found, return empty
    if (startIndex === -1 || endIndex === -1) {
        console.error("AI response missing delimiter markers");
        return [];
    }

    // Get the content between markers
    const content = rawText
        .substring(startIndex + startMarker.length, endIndex)
        .trim();

    // Split into lines and parse each
    const lines = content.split("\n").filter((line) => line.trim().length > 0);

    for (const line of lines) {
        const parts = line.split("|");

        if (parts.length >= 2) {
            const title = parts[0].trim();
            const score = parseInt(parts[1].trim(), 10);

            // Only add if we got a valid title and score
            if (title && !isNaN(score)) {
                results.push({ title, score: Math.min(100, Math.max(0, score)) });
            }
        }
    }

    return results;
}

module.exports = { calculateMatch, refineMatchesWithAI };

