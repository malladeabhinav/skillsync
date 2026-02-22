export default function LoadingSpinner({ message = 'Processing…' }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '1.2rem', padding: '2rem',
        }}>
            {/* Outer pulse ring */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
                <div className="animate-pulse-ring" style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '2px solid rgba(99,102,241,0.25)',
                }} />
                {/* Spinner */}
                <div className="animate-spin-slow" style={{
                    width: 64, height: 64,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#6366f1',
                    borderRightColor: '#8b5cf6',
                }} />
                {/* Inner dot */}
                <div style={{
                    position: 'absolute', inset: '20%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    opacity: 0.85,
                }} />
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                {message}
            </p>
        </div>
    )
}
