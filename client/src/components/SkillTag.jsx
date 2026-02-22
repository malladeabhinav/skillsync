const PALETTES = [
    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', color: '#a78bfa' },
    { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)', color: '#2dd4bf' },
    { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)', color: '#f472b6' },
    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', color: '#fbbf24' },
    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#60a5fa' },
    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#34d399' },
]

export default function SkillTag({ skill, index = 0 }) {
    const p = PALETTES[index % PALETTES.length]
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: p.bg, border: `1px solid ${p.border}`,
            color: p.color, borderRadius: 20,
            padding: '0.28rem 0.75rem',
            fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
        }}>
            {skill}
        </span>
    )
}
