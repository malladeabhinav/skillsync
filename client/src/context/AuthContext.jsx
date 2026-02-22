import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as apiLogout } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    // user: object from /api/auth/me, null when not logged in
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On app load: call /me to check if a valid HttpOnly cookie session exists.
    // This restores auth state after a page refresh without touching localStorage.
    useEffect(() => {
        getMe()
            .then(({ user }) => setUser(user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    // Called after a successful login/signup — receives the user object from the response.
    const login = useCallback((userData) => {
        setUser(userData)
    }, [])

    // Called from logout UI — clears the HttpOnly cookie via the backend, then clears state.
    const logout = useCallback(async () => {
        try {
            await apiLogout()
        } catch {
            // Even if the server call fails, clear local state
        }
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
