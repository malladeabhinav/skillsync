import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [userId, setUserId] = useState(null)
    const [userName, setUserName] = useState('')
    const [extractedSkills, _setExtractedSkills] = useState([])
    const [matches, setMatches] = useState([])
    const [analytics, setAnalytics] = useState(null)

    const setExtractedSkills = (skills) => {
        if (typeof skills === 'string') {
            _setExtractedSkills(skills.split(',').map(s => s.trim()).filter(Boolean))
        } else {
            _setExtractedSkills(Array.isArray(skills) ? skills : [])
        }
    }

    const value = {
        userId, setUserId,
        userName, setUserName,
        extractedSkills, setExtractedSkills,
        matches, setMatches,
        analytics, setAnalytics,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used inside AppProvider')
    return ctx
}
