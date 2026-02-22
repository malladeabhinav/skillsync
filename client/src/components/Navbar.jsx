import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PROTECTED_LINKS = [
    { label: 'Upload', path: '/upload' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'Applications', path: '/applications' },
]

export default function Navbar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { isAuthenticated, logout, user } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    const initial = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.[0]?.toUpperCase() || '?'

    return (
        <nav style={{
            background: 'rgba(8,11,20,0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 1.5rem',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <div
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                    <div style={{
                        width: 34, height: 34,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        borderRadius: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 14px rgba(99,102,241,0.5)',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
                        <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Skill</span>
                        <span style={{ color: '#e2e8f0' }}>Sync</span>
                    </span>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>

                    {isAuthenticated ? (
                        /* ── Authenticated nav ───────────────────────── */
                        <>
                            {PROTECTED_LINKS.map(({ label, path }) => (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    style={{
                                        background: pathname === path ? 'rgba(99,102,241,0.15)' : 'transparent',
                                        border: pathname === path ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                                        color: pathname === path ? '#a78bfa' : 'var(--muted)',
                                        borderRadius: 8,
                                        padding: '0.32rem 0.75rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'none',
                                    }}
                                    className="nav-link"
                                >
                                    {label}
                                </button>
                            ))}

                            {/* Avatar + logout */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem' }}>
                                {/* Mini avatar */}
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.72rem', fontWeight: 800, color: '#fff',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 10px rgba(99,102,241,0.4)',
                                }}
                                    onClick={() => navigate('/profile')}
                                    title="View Profile"
                                >
                                    {initial}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.25)',
                                        color: '#f87171',
                                        borderRadius: 8,
                                        padding: '0.32rem 0.75rem',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'rgba(239,68,68,0.18)'
                                        e.target.style.borderColor = 'rgba(239,68,68,0.5)'
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'rgba(239,68,68,0.08)'
                                        e.target.style.borderColor = 'rgba(239,68,68,0.25)'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>

                            {/* Inline nav links for md+ screens */}
                            <style>{`
                                @media (min-width: 640px) { .nav-link { display: inline-flex !important; } }
                            `}</style>
                        </>
                    ) : (
                        /* ── Unauthenticated nav ─────────────────────── */
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: 'var(--muted)',
                                    borderRadius: 8,
                                    padding: '0.38rem 1rem',
                                    fontSize: '0.88rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                                onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
                            >
                                Sign In
                            </button>
                            <button
                                className="btn-primary"
                                style={{ padding: '0.38rem 1.1rem', fontSize: '0.88rem' }}
                                onClick={() => navigate('/signup')}
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
