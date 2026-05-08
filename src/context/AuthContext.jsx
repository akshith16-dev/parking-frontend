import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [toast, setToast] = useState(null)

  // Load saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('parking_session')
      if (saved) {
        const { token: t, user: u } = JSON.parse(saved)
        setToken(t)
        setUser(u)
      }
    } catch (e) {}
  }, [])

  function login(tokenVal, userData) {
    setToken(tokenVal)
    setUser(userData)
    localStorage.setItem('parking_session', JSON.stringify({ token: tokenVal, user: userData }))
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('parking_session')
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, toast, showToast }}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
