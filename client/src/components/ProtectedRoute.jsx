import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps any route that requires authentication.
 * Shows a loading indicator while the initial /me session check is in progress.
 * If no valid session cookie → redirect to /login.
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: '#a78bfa',
                fontSize: '1rem',
                fontWeight: 500,
                background: 'var(--bg)',
            }}>
                Loading...
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}
