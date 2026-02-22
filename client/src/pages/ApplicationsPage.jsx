import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLE = {
    pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', color: '#f59e0b', label: '⏳ Pending' },
    interview: { bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.35)', color: '#38bdf8', label: '🗓 Interview' },
    offered: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#10b981', label: '🎉 Offered' },
    rejected: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.35)', color: '#f87171', label: '❌ Rejected' },
    applied: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#818cf8', label: '✅ Applied' },
}

const SAMPLE_APPS = [
    { id: 's1', title: 'Frontend Engineer', company: 'Stripe', type: 'Job', status: 'interview', date: '2026-02-18' },
    { id: 's2', title: 'ML Intern', company: 'Google', type: 'Internship', status: 'applied', date: '2026-02-19' },
    { id: 's3', title: 'AI Hackathon 2026', company: 'DevPost', type: 'Hackathon', status: 'offered', date: '2026-02-20' },
]

export default function ApplicationsPage() {
    const { user } = useAuth()
    const [apps, setApps] = useState(SAMPLE_APPS)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchApps = async () => {
            if (!user?.id) return
            setLoading(true)
            try {
                const { data } = await api.get(`/apply/${user.id}`)
                if (data?.applications?.length) {
                    const mapped = data.applications.map(a => ({
                        id: a.id,
                        title: a.opportunity_title || a.title || 'Role',
                        company: a.company || '—',
                        type: a.opportunity_type || a.type || 'Job',
                        status: (a.status || 'applied').toLowerCase(),
                        date: a.created_at ? a.created_at.split('T')[0] : '—',
                    }))
                    setApps(mapped)
                }
            } catch {
                // Backend route may not exist yet — show placeholders
            } finally {
                setLoading(false)
            }
        }
        fetchApps()
    }, [user?.id])

    const statusCounts = Object.keys(STATUS_STYLE).reduce((acc, k) => {
        acc[k] = apps.filter(a => (a.status || '').toLowerCase() === k).length
        return acc
    }, {})

    return (
        <main style={{ minHeight: '100vh', maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                    📋 Application Tracker
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                    Real-time status of your job, internship, and hackathon applications.
                </p>
            </div>

            {/* Status count strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {Object.entries(STATUS_STYLE).map(([key, st]) => (
                    <div key={key} className="glass" style={{ padding: '1rem 1.25rem', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: st.color }}>{statusCounts[key] || 0}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, marginTop: '0.2rem' }}>{st.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading applications…</div>
                ) : apps.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                            No applications yet.{' '}
                            <Link to="/dashboard" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
                                Find matches →
                            </Link>
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1.3fr 0.9fr 1.4fr 0.9fr',
                            padding: '0.75rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)',
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>
                            <span>Role</span>
                            <span>Company</span>
                            <span>Type</span>
                            <span>Status</span>
                            <span>Applied</span>
                        </div>

                        {/* Rows */}
                        {apps.map((app, i) => {
                            const statusKey = (app.status || 'applied').toLowerCase()
                            const st = STATUS_STYLE[statusKey] || STATUS_STYLE.applied
                            return (
                                <div
                                    key={app.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1.3fr 0.9fr 1.4fr 0.9fr',
                                        alignItems: 'center',
                                        padding: '1rem 1.5rem',
                                        borderBottom: i < apps.length - 1 ? '1px solid var(--border)' : 'none',
                                        transition: 'background 0.18s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{app.title}</div>
                                    </div>
                                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{app.company}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>{app.type}</span>

                                    {/* Status badge */}
                                    <span style={{
                                        display: 'inline-block',
                                        background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                                        borderRadius: 20, padding: '0.25rem 0.75rem',
                                        fontSize: '0.75rem', fontWeight: 700,
                                    }}>
                                        {st.label}
                                    </span>

                                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{app.date}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}
