import axios from 'axios'

const BASE = 'http://localhost:5000'

/**
 * POST /api/resume/analyze
 * Sends a multipart form with `name` + `resume` file.
 * Returns { userId, name, extractedSkills }
 */
export async function analyzeResume(name, file) {
    const form = new FormData()
    form.append('name', name)
    form.append('resume', file)

    const { data } = await axios.post(`${BASE}/api/resume/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

/**
 * GET /api/match/:userId?type=job|internship|govt|hackathon
 * Returns { matches, apiCount, dbCount, total }
 */
export async function getMatches(userId, type) {
    const params = type ? { type } : {}
    const { data } = await axios.get(`${BASE}/api/match/${userId}`, { params })
    return data
}
