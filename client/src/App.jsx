import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_STORAGE_KEY = 'chronos_token'

const readTokenFromStorage = () => localStorage.getItem(TOKEN_STORAGE_KEY) || ''

function App() {
  const [token, setToken] = useState(() => readTokenFromStorage())
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(readTokenFromStorage()))
  const [status, setStatus] = useState('Connect Google to start your daily Chronos brief.')
  const [error, setError] = useState('')
  const isDashboardRoute = window.location.pathname === '/dashboard'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')

    if (!tokenFromUrl) {
      return
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, tokenFromUrl)
    setToken(tokenFromUrl)
    setIsLoggedIn(true)
    setStatus('Login successful. Loading your workspace...')
    setError('')

    window.history.replaceState({}, '', '/dashboard')
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false)
      if (isDashboardRoute) {
        setStatus('Your session is missing. Sign in again to open the dashboard.')
      }
      return
    }

    const loadProfile = async () => {
      try {
        setStatus('Loading your profile...')
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile')
        }

        setIsLoggedIn(true)
        setStatus('You are logged in and on your dashboard.')
      } catch (loadError) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken('')
        setIsLoggedIn(false)
        setError(loadError.message)
        setStatus('Your session expired. Please sign in again.')
      }
    }

    loadProfile()
  }, [isDashboardRoute, token])

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
    setIsLoggedIn(false)
    setError('')
    setStatus('You have been logged out.')
    window.history.replaceState({}, '', '/')
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Chronos</p>
        <h1>Daily briefings that arrive before your day starts.</h1>
        <p className="lede">
          Google sign-in is now connected to a real dashboard flow, so your
          automation system can identify each user, load their workspace, and
          prepare for scheduled summaries.
        </p>

        <div className="hero-actions">
          {isLoggedIn ? (
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={handleLogin}>
              Continue with Google
            </button>
          )}
        </div>

        <div className="status-card">
          <p className="status-label">Session status</p>
          <p className="status-copy">{status}</p>
          {error ? <p className="status-error">{error}</p> : null}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <p className="eyebrow">Dashboard</p>
          <h2>{isDashboardRoute ? 'You are logged in' : 'Welcome to Chronos'}</h2>
        </div>

        {isLoggedIn ? (
          <div className="dashboard-message">
            <p>You are logged in and on the dashboard.</p>
          </div>
        ) : (
          <div className="empty-state">
            <p>You are not logged in yet.</p>
            <p>Continue with Google to open the dashboard.</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
