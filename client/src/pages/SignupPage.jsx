import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signup as apiSignup } from '../services/api'

export default function SignupPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e?.preventDefault()
        setError('')
        if (!name.trim()) return setError('Please enter your full name.')
        if (!email.trim()) return setError('Please enter your email.')
        if (password.length < 6) return setError('Password must be at least 6 characters.')
        if (password !== confirm) return setError('Passwords do not match.')

        setLoading(true)
        try {
            const data = await apiSignup(name.trim(), email.trim(), password)
            // Backend sets HttpOnly cookie — just update context with user data
            login(data.user)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Signup failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const strength = password.length === 0 ? 0
        : password.length < 6 ? 1
            : password.length < 10 ? 2
                : 3

    const strengthColors = ['transparent', '#ef4444', '#f59e0b', '#10b981']
    const strengthLabels = ['', 'Weak', 'Medium', 'Strong']

    return (
        <main style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem 1.5rem',
            background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }}>
            <div className="animate-fade-up" style={{ width: '100%', maxWidth: 460 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 60, height: 60,
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                        border: '1px solid rgba(139,92,246,0.35)',
                        borderRadius: 16, marginBottom: '1.2rem',
                        boxShadow: '0 0 24px rgba(139,92,246,0.25)',
                    }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: '0.4rem' }}>
                        Create account
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Start matching your skills today
                    </p>
                </div>

                {/* Card */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} noValidate>

                        {/* Name */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Full Name
                            </label>
                            <input
                                className="input-dark"
                                type="text"
                                placeholder="Alex Johnson"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '1rem' }}>
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
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Password
                            </label>
                            <input
                                className="input-dark"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Password strength bar */}
                        {password.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{
                                            flex: 1, height: 3, borderRadius: 99,
                                            background: i <= strength ? strengthColors[strength] : 'var(--border)',
                                            transition: 'background 0.3s',
                                        }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.72rem', color: strengthColors[strength] }}>
                                    {strengthLabels[strength]}
                                </p>
                            </div>
                        )}

                        {/* Confirm */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Confirm Password
                            </label>
                            <input
                                className="input-dark"
                                type="password"
                                placeholder="••••••••"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                style={{
                                    borderColor: confirm && confirm !== password ? 'rgba(239,68,68,0.6)' : undefined,
                                }}
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

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating account…' : '✨ Create Account'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
