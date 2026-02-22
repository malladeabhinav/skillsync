// services/geminiService.js
// Handles communication with the Google Gemini API.
// Uses Node.js v20 built-in fetch (no external packages needed).
// Exports extractSkills(resumeText) which returns extracted skills as plain text.

// Read the Gemini API key from environment variables (.env)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Correct Gemini REST API endpoint (v1 + gemini-2.5-flash model)
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Sends resume text to Gemini and extracts technical skills.
 * @param {string} resumeText - The raw text content of the resume.
 * @returns {string} - Comma-separated list of extracted skills.
 */
async function extractSkills(resumeText) {
    // Prompt telling Gemini exactly what to do
    const prompt = `Extract all technical skills, programming languages, tools, and frameworks from this resume. Return as a comma-separated list.\n\n${resumeText}`;

    // Call Gemini API using Node.js v20 built-in global fetch
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: prompt },
                    ],
                },
            ],
        }),
    });

    // If the request failed, throw a detailed error
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    // Parse Gemini's JSON response
    const data = await response.json();

    // Pull out the skills text from the nested response structure
    const skills = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!skills) {
        throw new Error('Gemini returned an empty or unexpected response.');
    }

    // Return skills as a clean string
    return skills.trim();
}

// Export so routes/resume.js can import it
module.exports = { extractSkills };
