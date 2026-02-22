function Tile({ label, value, icon, accent }) {
    return (
        <div className="stat-tile" style={{ borderLeft: `3px solid ${accent}` }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: accent, lineHeight: 1 }}>
                {value ?? '—'}
            </div>
        </div>
    )
}

export default function AnalyticsPanel({ analytics }) {
    if (!analytics) return null
    const { total, apiCount, dbCount, averageScore } = analytics
    return (
        <div>
            <h2 style={{
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem',
            }}>
                Analytics
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Tile label="Total Matches" value={total} icon="🎯" accent="#6366f1" />
                <Tile label="API Results" value={apiCount} icon="🌐" accent="#2dd4bf" />
                <Tile label="DB Results" value={dbCount} icon="🗄️" accent="#a78bfa" />
                <Tile label="Avg Score" value={averageScore !== undefined ? `${averageScore}%` : '—'} icon="📊" accent="#fbbf24" />
            </div>
        </div>
    )
}
