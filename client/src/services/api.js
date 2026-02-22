import axios from 'axios'
import api from '../api/axios'

/**
 * SkillSync API Service
 * ─────────────────────
 * VITE_AUTH_URL → auth backend  (localhost:4000 in dev, Render in prod)
 * VITE_API_URL  → matching API  (localhost:5000 in dev, Render in prod)
 *
 * Both are injected by Vite from:
 *   client/.env              → dev values
 *   client/.env.production   → production values
 *
 * All auth calls use withCredentials: true so the browser sends/receives
 * the HttpOnly cookie. No token is ever stored in JavaScript.
 */

const AUTH_BASE = `${import.meta.env.VITE_AUTH_URL}/api/auth`

// ── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Login with email & password.
 * Backend sets HttpOnly cookie — returns { message, user }.
 */
export async function login(email, password) {
    const { data } = await axios.post(
        `${AUTH_BASE}/login`,
        { email, password },
        { withCredentials: true }
    )
    return data
}

/**
 * Register a new account.
 * Backend sets HttpOnly cookie — returns { message, user }.
 */
export async function signup(name, email, password) {
    const { data } = await axios.post(
        `${AUTH_BASE}/signup`,
        { name, email, password },
        { withCredentials: true }
    )
    return data
}

/**
 * Verify the current session cookie and get the logged-in user.
 * Called on app load to restore authentication state.
 */
export async function getMe() {
    const { data } = await axios.get(
        `${AUTH_BASE}/me`,
        { withCredentials: true }
    )
    return data
}

/**
 * Log out — clears the HttpOnly cookie on the server side.
 */
export async function logout() {
    await axios.post(
        `${AUTH_BASE}/logout`,
        {},
        { withCredentials: true }
    )
}

// ── Matching helpers ─────────────────────────────────────────────────────────

/**
 * Analyze a resume file (multipart).
 */
export async function analyzeResume(name, file) {
    const form = new FormData()
    form.append('name', name)
    form.append('resume', file)

    const { data } = await api.post('/resume/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

/**
 * Fetch job/internship/hackathon matches for a user.
 */
export async function getMatches(userId, type) {
    const params = type ? { type } : {}
    const { data } = await api.get(`/match/${userId}`, { params })
    return data
}
