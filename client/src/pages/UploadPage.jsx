import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeResume } from '../services/api'
import { useApp } from '../context/AppContext'
import LoadingSpinner from '../components/LoadingSpinner'
import SkillTag from '../components/SkillTag'

export default function UploadPage() {
    const navigate = useNavigate()
    const { setUserId, setUserName, setExtractedSkills } = useApp()

    const [name, setName] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [skills, setSkills] = useState([])
    const [dragging, setDragging] = useState(false)
    const fileRef = useRef()

    const handleFile = f => {
        if (f) setFile(f)
    }

    const handleDrop = e => {
        e.preventDefault(); setDragging(false)
        handleFile(e.dataTransfer.files[0])
    }

    const handleSubmit = async () => {
        setError('')
        if (!name.trim()) return setError('Please enter your name.')
        if (!file) return setError('Please select a resume file.')
        setLoading(true)
        try {
            const data = await analyzeResume(name.trim(), file)

            // Normalize skills: handle array or comma-separated string
            let rawSkills = data.extractedSkills || data.skills || []
            const extracted = typeof rawSkills === 'string'
                ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
                : rawSkills || []

            setUserId(data.userId)
            setUserName(data.name || name.trim())
            setExtractedSkills(extracted)
            setSkills(extracted)
            // Give user a moment to see their skills before redirecting
            setTimeout(() => navigate('/dashboard'), 1800)
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Upload failed. Is the backend running?')
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
            <div style={{ width: '100%', maxWidth: 520 }}>

                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 64, height: 64,
                        background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))',
                        border: '1px solid rgba(99,102,241,0.35)',
                        borderRadius: 18, marginBottom: '1.2rem',
                        boxShadow: '0 0 24px rgba(99,102,241,0.25)',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Analyse Your Resume
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        Upload your resume and let AI extract your skills &amp; find the best matches.
                    </p>
                </div>

                {/* Card */}
                <div className="glass" style={{ padding: '2rem 2rem 1.75rem' }}>

                    {/* Name */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Full Name
                        </label>
                        <input
                            className="input-dark"
                            type="text"
                            placeholder="e.g. Alex Johnson"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    {/* File drop zone */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Resume File
                        </label>
                        <div
                            onClick={() => fileRef.current.click()}
                            onDragOver={e => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${dragging ? '#6366f1' : 'var(--border)'}`,
                                borderRadius: 12,
                                padding: '1.8rem 1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragging ? 'rgba(99,102,241,0.07)' : 'var(--surface2)',
                                transition: 'border-color 0.2s, background 0.2s',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                            {file ? (
                                <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.9rem' }}>✓ {file.name}</p>
                            ) : (
                                <>
                                    <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>
                                        Drag &amp; drop or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>browse</span>
                                    </p>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                                        PDF, DOC, DOCX supported
                                    </p>
                                </>
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={e => handleFile(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                            borderRadius: 10, padding: '0.65rem 1rem',
                            color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Upload button */}
                    <button
                        className="btn-primary"
                        style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Analysing…' : '🚀 Analyse Resume'}
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <LoadingSpinner message="Extracting skills with AI…" />
                    </div>
                )}

                {/* Extracted skills preview */}
                {!loading && Array.isArray(skills) && skills.length > 0 && (
                    <div className="glass animate-fade-up" style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.7rem' }}>
                            ✨ Extracted Skills ({skills.length})
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {skills.map((s, i) => <SkillTag key={s} skill={s} index={i} />)}
                        </div>
                        <p style={{ marginTop: '0.9rem', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                            Redirecting to dashboard…
                        </p>
                    </div>
                )}
            </div>
        </main>
    )
}
