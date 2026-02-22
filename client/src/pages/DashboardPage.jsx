import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMatches } from '../services/api'
import api from '../api/axios'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import MatchCard from '../components/MatchCard'
import TypeDropdown from '../components/TypeDropdown'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
    const navigate = useNavigate()
    const { userId, userName, extractedSkills, matches, setMatches } = useApp()
    const { user, logout } = useAuth()

    const [type, setType] = useState('job')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fetched, setFetched] = useState(false)
    const [analytics, setAnalytics] = useState(null)
    const [appliedIds, setAppliedIds] = useState(new Set())

    // Guard: redirect if no userId
    if (!userId) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
                <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>No resume analysed yet.</p>
                <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Resume</button>
            </main>
        )
    }

    const handleFindMatches = async () => {
        setError('')
        setLoading(true)
        setFetched(false)
        try {
            const data = await getMatches(user.id, type)
            const sorted = [...(data.matches || [])].sort((a, b) => (b.matchScore ?? b.score ?? 0) - (a.matchScore ?? a.score ?? 0))
            setMatches(sorted)
            const total = sorted.length
            const apiCount = data.apiCount ?? sorted.filter(m => (m.source || '').toLowerCase() !== 'database').length
            const dbCount = data.dbCount ?? sorted.filter(m => (m.source || '').toLowerCase() === 'database').length
            const avgScore = total > 0 ? Math.round(sorted.reduce((acc, m) => acc + (m.matchScore ?? m.score ?? 0), 0) / total) : 0
            setAnalytics({ total, apiCount, dbCount, averageScore: avgScore })
            setFetched(true)
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to fetch matches.')
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async (matchId, matchData) => {
        try {
            await api.post('/apply', {
                opportunity_id: matchId,
                status: 'pending',
                title: matchData?.title,
                company: matchData?.company,
                type: matchData?.type,
            })
            setAppliedIds(prev => new Set([...prev, matchId]))
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || ''
            if (msg.includes('Already applied')) {
                // Silently mark as applied — backend already has it
                setAppliedIds(prev => new Set([...prev, matchId]))
            } else {
                console.error('Apply error:', err)
            }
        }
    }

    const displayName = user?.name || userName || 'User'
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

            {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
            <aside style={{
                width: 260,
                flexShrink: 0,
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 1.25rem',
                gap: '1.5rem',
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflowY: 'auto',
                background: 'rgba(15,15,25,0.92)',
            }}>
                {/* Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', fontWeight: 800, color: '#fff',
                        boxShadow: '0 0 0 3px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.25)',
                        flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>Welcome back,</p>
                        <p style={{ fontWeight: 800, color: '#a78bfa', fontSize: '1.05rem' }}>{displayName}</p>
                    </div>
                    {/* Role badge */}
                    <span style={{
                        background: user?.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                        color: user?.role === 'admin' ? '#fbbf24' : '#818cf8',
                        border: `1px solid ${user?.role === 'admin' ? 'rgba(245,158,11,0.35)' : 'rgba(99,102,241,0.35)'}`,
                        borderRadius: 20, padding: '0.25rem 0.9rem',
                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                        {user?.role === 'admin' ? '⭐ Admin' : '👤 User'}
                    </span>
                </div>

                {/* Skills section */}
                <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
                        🧠 Your Skills ({Array.isArray(extractedSkills) ? extractedSkills.length : 0})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {Array.isArray(extractedSkills) && extractedSkills.slice(0, 12).map((s, i) => (
                            <span key={s} style={{
                                background: `hsla(${(i * 43 + 210) % 360},60%,55%,0.12)`,
                                color: `hsla(${(i * 43 + 210) % 360},70%,70%,1)`,
                                border: `1px solid hsla(${(i * 43 + 210) % 360},60%,55%,0.3)`,
                                borderRadius: 20, padding: '0.2rem 0.6rem',
                                fontSize: '0.72rem', fontWeight: 600,
                            }}>
                                {s}
                            </span>
                        ))}
                        {extractedSkills.length > 12 && (
                            <span style={{ color: 'var(--muted)', fontSize: '0.72rem', alignSelf: 'center' }}>+{extractedSkills.length - 12} more</span>
                        )}
                    </div>
                </div>

                {/* Nav links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[
                        { to: '/dashboard', label: '🎯 Dashboard', active: true },
                        { to: '/upload', label: '📄 Upload Resume' },
                        { to: '/applications', label: '📋 Applications' },
                        { to: '/profile', label: '👤 Profile' },
                    ].map(({ to, label, active }) => (
                        <Link key={to} to={to} style={{
                            display: 'block', padding: '0.6rem 0.85rem',
                            borderRadius: 10, fontSize: '0.88rem', fontWeight: active ? 700 : 500,
                            color: active ? '#a78bfa' : 'var(--muted)',
                            background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                            border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}>
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Logout */}
                <button
                    onClick={() => { logout(); navigate('/login') }}
                    style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f87171', borderRadius: 10, padding: '0.65rem 1rem',
                        fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
                >
                    🚪 Logout
                </button>
            </aside>

            {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', maxWidth: '100%' }}>

                {/* Command Center Header */}
                <div style={{ position: 'relative', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                        position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
                        width: 300, height: 100,
                        background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <h1 style={{
                        fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 900,
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 60%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px', marginBottom: '0.4rem',
                    }}>
                        AI Opportunity Command Center
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                        Hybrid intelligence matching powered by SkillSync Engine
                    </p>
                </div>

                {/* Controls */}
                <div className="glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                Opportunity Type
                            </label>
                            <TypeDropdown value={type} onChange={setType} />
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}>
                            <button className="btn-primary" onClick={handleFindMatches} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                                {loading ? 'Scanning…' : '⚡ Find Matches'}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div style={{ marginTop: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '0.6rem 1rem', color: '#f87171', fontSize: '0.84rem' }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Analytics Strip */}
                {!loading && analytics && (
                    <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
                        {[
                            { label: 'Total Matches', value: analytics.total, icon: '🎯', color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
                            { label: 'Avg Match Score', value: `${analytics.averageScore}%`, icon: '📊', color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
                            { label: 'API Results', value: analytics.apiCount, icon: '🌐', color: '#2dd4bf', glow: 'rgba(45,212,191,0.2)' },
                            { label: 'DB Results', value: analytics.dbCount, icon: '🗄️', color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
                        ].map(({ label, value, icon, color, glow }) => (
                            <div key={label} className="glass" style={{ padding: '1.1rem 1.25rem', cursor: 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${glow}` }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.4rem' }}>
                                    {icon} {label}
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 20px ${glow}` }}>
                                    {value ?? '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading */}
                {loading && <LoadingSpinner message="AI is ranking your matches…" />}

                {/* Match cards */}
                {!loading && fetched && (
                    <section>
                        {matches.length === 0 ? (
                            <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😔</p>
                                <p style={{ color: 'var(--muted)' }}>No matches found. Try a different category.</p>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.85rem' }}>
                                    🎯 {matches.length} Opportunities — AI Ranked
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                                    {matches.map((m, i) => {
                                        const matchId = `${m.title}-${m.company}-${i}`
                                        return (
                                            <MatchCard
                                                key={matchId}
                                                match={m}
                                                index={i}
                                                applied={appliedIds.has(matchId)}
                                                onApply={() => handleApply(matchId, m)}
                                            />
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </section>
                )}

                {/* Initial prompt */}
                {!loading && !fetched && !error && (
                    <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>⚡</div>
                        <p style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                            Ready to launch?
                        </p>
                        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                            Select an opportunity type and click <strong style={{ color: '#818cf8' }}>Find Matches</strong>.
                        </p>
                    </div>
                )}
            </main>

        </div>
    )
}
