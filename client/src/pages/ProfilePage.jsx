import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const tabs = ['Overview', 'Skills', 'Applications']

const sampleSkills = ['React', 'Node.js', 'JavaScript', 'Python', 'SQL', 'TypeScript', 'AWS', 'Docker', 'REST APIs', 'GraphQL']

export default function ProfilePage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('Overview')

    const name = user?.name || user?.username || 'Your Name'
    const email = user?.email || 'your@email.com'
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <main style={{
            minHeight: 'calc(100vh - 64px)',
            maxWidth: 900, margin: '0 auto',
            padding: '2rem 1.5rem',
        }}>

            {/* ── Profile header ─────────────────────────────────── */}
            <div className="glass animate-fade-up" style={{
                padding: '2rem 2rem 1.75rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', fontWeight: 800, color: '#fff',
                        boxShadow: '0 0 32px rgba(99,102,241,0.45)',
                        flexShrink: 0,
                    }}>
                        {initials}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px', marginBottom: '0.2rem' }}>
                            {name}
                        </h1>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{email}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 99, padding: '0.2rem 0.75rem', fontSize: '0.76rem', color: '#a78bfa', fontWeight: 600 }}>
                                ✦ Pro Member
                            </span>
                            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 99, padding: '0.2rem 0.75rem', fontSize: '0.76rem', color: '#6ee7b7', fontWeight: 600 }}>
                                ● Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats row ──────────────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.85rem', marginBottom: '1.5rem',
            }}>
                {[
                    { label: 'Matches Found', value: '48', icon: '🎯', color: '#818cf8' },
                    { label: 'Skills Extracted', value: '10', icon: '🧠', color: '#34d399' },
                    { label: 'Applications', value: '3', icon: '📋', color: '#f59e0b' },
                    { label: 'Avg Match Score', value: '74%', icon: '📊', color: '#a78bfa' },
                ].map(stat => (
                    <div key={stat.label} className="glass stat-tile">
                        <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', fontWeight: 500 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ───────────────────────────────────────────── */}
            <div className="glass" style={{ overflow: 'hidden' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                                padding: '0.9rem 1rem',
                                color: activeTab === tab ? '#a78bfa' : 'var(--muted)',
                                fontWeight: activeTab === tab ? 700 : 500,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '-1px',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div style={{ padding: '1.75rem 1.5rem' }}>

                    {activeTab === 'Overview' && (
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                Account Details
                            </p>
                            <div style={{ display: 'grid', gap: '0.9rem' }}>
                                {[
                                    { label: 'Full Name', value: name },
                                    { label: 'Email', value: email },
                                    { label: 'Member Since', value: 'February 2026' },
                                    { label: 'Plan', value: 'Free Tier' },
                                ].map(row => (
                                    <div key={row.label} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--surface2)',
                                        borderRadius: 10,
                                        border: '1px solid var(--border)',
                                    }}>
                                        <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: 500 }}>{row.label}</span>
                                        <span style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Skills' && (
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                Extracted Skills ({sampleSkills.length})
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {sampleSkills.map((skill, i) => (
                                    <span key={skill} style={{
                                        background: i % 3 === 0
                                            ? 'rgba(99,102,241,0.15)'
                                            : i % 3 === 1
                                                ? 'rgba(56,189,248,0.1)'
                                                : 'rgba(167,139,250,0.1)',
                                        border: `1px solid ${i % 3 === 0 ? 'rgba(99,102,241,0.4)' : i % 3 === 1 ? 'rgba(56,189,248,0.3)' : 'rgba(167,139,250,0.3)'}`,
                                        borderRadius: 99,
                                        padding: '0.35rem 0.85rem',
                                        fontSize: '0.8rem', fontWeight: 600,
                                        color: i % 3 === 0 ? '#818cf8' : i % 3 === 1 ? '#38bdf8' : '#a78bfa',
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                                Upload a resume from the{' '}
                                <a href="/upload" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Upload page</a>{' '}
                                to update your extracted skills.
                            </p>
                        </div>
                    )}

                    {activeTab === 'Applications' && (
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                Recent Applications
                            </p>
                            <div style={{
                                padding: '3rem', textAlign: 'center',
                                background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)',
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                                    No applications tracked yet. Head to the{' '}
                                    <a href="/applications" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Applications</a>{' '}
                                    page to start tracking.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </main>
    )
}
