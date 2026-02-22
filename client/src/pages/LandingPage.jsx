import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const badges = ['React', 'Python', 'Machine Learning', 'Node.js', 'AWS', 'Docker', 'TypeScript', 'SQL', 'TensorFlow', 'Figma']

const features = [
    {
        icon: '🤖',
        title: 'AI-Powered Matching',
        desc: 'Gemini AI ranks opportunities by semantic skill alignment, not just keywords.',
    },
    {
        icon: '🔐',
        title: 'Secure by Design',
        desc: 'JWT authentication, hashed passwords, and JWT-protected API routes.',
    },
    {
        icon: '⚡',
        title: 'Real-time Results',
        desc: 'Live job data from Adzuna + curated database — 10 best matches instantly.',
    },
]

export default function LandingPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // If already logged in, skip landing
    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard', { replace: true })
    }, [isAuthenticated, navigate])

    return (
        <main style={{ minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section style={{
                minHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '4rem 1.5rem 2rem',
                background: 'radial-gradient(ellipse 80% 70% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 65%)',
                position: 'relative',
            }}>
                {/* Glow orb */}
                <div style={{
                    position: 'absolute',
                    top: '15%', left: '50%',
                    transform: 'translateX(-50%)',
                    width: 480, height: 480,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Badge */}
                <div className="animate-fade-up" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.35)',
                    borderRadius: 99, padding: '0.35rem 1rem',
                    marginBottom: '1.75rem',
                    fontSize: '0.82rem', fontWeight: 600, color: '#a78bfa',
                }}>
                    <span style={{ fontSize: '0.7rem' }}>✦</span>
                    AI-Powered Job Matching Platform
                    <span style={{ fontSize: '0.7rem' }}>✦</span>
                </div>

                {/* Headline */}
                <h1 className="animate-fade-up" style={{
                    fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: '-1.5px',
                    maxWidth: 780,
                    marginBottom: '1.4rem',
                    animationDelay: '0.05s',
                }}>
                    <span style={{ color: '#e2e8f0' }}>Your Skills,</span>
                    <br />
                    <span style={{
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Perfectly Matched.
                    </span>
                </h1>

                <p className="animate-fade-up" style={{
                    color: 'var(--muted)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                    maxWidth: 560,
                    lineHeight: 1.7,
                    marginBottom: '2.5rem',
                    animationDelay: '0.1s',
                }}>
                    Upload your resume. Our AI extracts your skills and finds the{' '}
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>best jobs, internships, and hackathons</span>{' '}
                    tailored exactly to you.
                </p>

                {/* CTAs */}
                <div className="animate-fade-up" style={{
                    display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center',
                    animationDelay: '0.15s',
                }}>
                    <button
                        className="btn-primary"
                        style={{ fontSize: '1rem', padding: '0.75rem 2.2rem' }}
                        onClick={() => navigate('/signup')}
                    >
                        🚀 Get Started — Free
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={() => navigate('/login')}
                    >
                        Sign In →
                    </button>
                </div>

                {/* Floating skill badges */}
                <div style={{
                    marginTop: '4rem',
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                    gap: '0.6rem', maxWidth: 640,
                }}>
                    {badges.map((badge, i) => (
                        <span
                            key={badge}
                            className="animate-float"
                            style={{
                                background: 'rgba(15,22,36,0.8)',
                                border: '1px solid var(--border)',
                                borderRadius: 99,
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? '#38bdf8' : '#6ee7b7',
                                animationDelay: `${i * 0.15}s`,
                                animationDuration: `${3 + (i % 3) * 0.5}s`,
                            }}
                        >
                            {badge}
                        </span>
                    ))}
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────── */}
            <section style={{
                maxWidth: 1100,
                margin: '0 auto',
                padding: '5rem 1.5rem',
            }}>
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.78rem', fontWeight: 700,
                    color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    marginBottom: '3rem',
                }}>
                    Why SkillSync?
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                }}>
                    {features.map((f, i) => (
                        <div key={i} className="glass feature-card" style={{ padding: '1.8rem 1.75rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                            <h3 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                                {f.title}
                            </h3>
                            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA bar ───────────────────────────────────────────── */}
            <section style={{
                textAlign: 'center',
                padding: '4rem 1.5rem 6rem',
                background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)',
            }}>
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                    fontWeight: 800, color: '#e2e8f0',
                    letterSpacing: '-0.5px', marginBottom: '1rem',
                }}>
                    Ready to sync your skills?
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                    Join thousands of developers finding their perfect match.
                </p>
                <button
                    className="btn-primary"
                    style={{ fontSize: '1rem', padding: '0.8rem 2.5rem' }}
                    onClick={() => navigate('/signup')}
                >
                    Create Free Account
                </button>
            </section>
        </main>
    )
}
