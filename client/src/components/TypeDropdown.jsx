export default function TypeDropdown({ value, onChange }) {
    const types = [
        { value: 'job', label: '💼  Jobs' },
        { value: 'internship', label: '🎓  Internships' },
        { value: 'govt', label: '🏛️  Government' },
        { value: 'hackathon', label: '⚡  Hackathons' },
    ]

    return (
        <select
            className="select-dark"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ minWidth: 180 }}
        >
            {types.map(t => (
                <option key={t.value} value={t.value}>
                    {t.label}
                </option>
            ))}
        </select>
    )
}
