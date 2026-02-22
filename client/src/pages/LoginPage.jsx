import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../services/api'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e?.preventDefault()
        setError('')
        if (!email.trim()) return setError('Please enter your email.')
        if (!password.trim()) return setError('Please enter your password.')

        setLoading(true)
        try {
            const data = await apiLogin(email.trim(), password)
            // Backend sets HttpOnly cookie — just update context with user data
            login(data.user)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem 1.5rem',
            background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}>
            <div className="animate-fade-up" style={{ width: '100%', maxWidth: 440 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 60, height: 60,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                        border: '1px solid rgba(99,102,241,0.35)',
                        borderRadius: 16, marginBottom: '1.2rem',
                        boxShadow: '0 0 24px rgba(99,102,241,0.25)',
                    }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: '0.4rem' }}>
                        Welcome back
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Sign in to your SkillSync account
                    </p>
                </div>

                {/* Card */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} noValidate>

                        {/* Email */}
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Email Address
                            </label>
                            <input
                                className="input-dark"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Password
                            </label>
                            <input
                                className="input-dark"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                                borderRadius: 10, padding: '0.65rem 1rem',
                                color: '#f87171', fontSize: '0.84rem', marginBottom: '1rem',
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in…' : '🔐 Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                            Create one →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
