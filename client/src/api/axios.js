import axios from "axios";

// Matching API instance (Port 5000 in dev, Render URL in prod)
// VITE_API_URL is set in:
//   client/.env              → http://localhost:5000/api  (dev)
//   client/.env.production   → https://skillsync-matching.onrender.com/api  (prod)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Sends HttpOnly cookie with every request
});

// ── RESPONSE interceptor: Auto-redirect on 401 ────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
