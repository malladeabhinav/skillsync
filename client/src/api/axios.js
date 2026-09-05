import axios from 'axios'

// Matching API URL is supplied by Vite via VITE_API_URL.
// Keep the value environment-specific so production never falls back to localhost.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
