import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setToken, setUnauthorizedHandler } from '../services/api.js'
import { mapUser } from '../utils/user.js'

const AuthContext = createContext(null)
const KEY = 'vh-token'

function readToken() {
  try {
    localStorage.removeItem('vh-user') // old mock login, no longer used
    return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

function saveToken(t, remember) {
  try {
    ;(remember ? localStorage : sessionStorage).setItem(KEY, t)
  } catch {
    /* storage blocked: token only lives in memory for this tab */
  }
  setToken(t)
}

function clearToken() {
  try {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  setToken(null)
}

const startToken = readToken()
setToken(startToken)

// First open in this browser tab: show the splash screen for a moment.
const SPLASH_MS = 900
const firstOpen = (() => {
  try {
    if (sessionStorage.getItem('vh-opened')) return false
    sessionStorage.setItem('vh-opened', '1')
    return true
  } catch {
    return false
  }
})()

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// The free Render server sleeps and can take ~50 s to wake up, so keep retrying for a while.
const RETRY_EVERY_MS = 3000
const MAX_TRIES = 25 // ≈ 75 seconds

export function AuthProvider({ children }) {
  // loading: splash is showing / we are checking the saved token with GET /auth/me
  // waking:  the server did not answer yet, we are retrying ("Connecting to server…")
  // offline: gave up retrying — show a "Try again" screen, but KEEP the saved login
  const [state, setState] = useState({
    user: null,
    loading: Boolean(startToken) || firstOpen,
    waking: false,
    offline: false,
  })

  useEffect(() => {
    let cancelled = false

    setUnauthorizedHandler(() => {
      clearToken()
      setState({ user: null, loading: false, waking: false, offline: false })
    })

    async function checkUser() {
      if (!startToken) return null
      for (let attempt = 1; ; attempt++) {
        try {
          const res = await api('/auth/me')
          return mapUser(res.data)
        } catch (e) {
          // Only a real "not logged in / blocked" answer logs the user out.
          if (e.status === 401 || e.status === 403) {
            clearToken()
            return null
          }
          // Server asleep, network problem, server error: keep the token and try again.
          if (cancelled) return null
          if (attempt >= MAX_TRIES) throw e
          setState((s) => ({ ...s, waking: true }))
          await wait(RETRY_EVERY_MS)
          if (cancelled) return null
        }
      }
    }

    Promise.all([checkUser(), wait(firstOpen ? SPLASH_MS : 0)])
      .then(([user]) => !cancelled && setState({ user, loading: false, waking: false, offline: false }))
      .catch(() => !cancelled && setState({ user: null, loading: false, waking: false, offline: true }))

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password, remember) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password, device_name: 'web' } })
    saveToken(res.data.token, remember)
    setState({ user: mapUser(res.data.user), loading: false })
  }, [])

  // role: 'volunteer' | 'organizer' (organizers also send organizationName)
  const register = useCallback(async ({ name, username, email, password, role = 'volunteer', organizationName }) => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name, username, email, password, role, organization_name: organizationName },
    })
    saveToken(res.data.token, true)
    setState({ user: mapUser(res.data.user), loading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      /* token may already be invalid */
    }
    clearToken()
    setState({ user: null, loading: false })
  }, [])

  // After editing the profile: replace the logged-in user (name, bio, photo…)
  const updateUser = useCallback((user) => setState((s) => ({ ...s, user })), [])

  const value = useMemo(
    () => ({ ...state, login, register, logout, updateUser }),
    [state, login, register, logout, updateUser],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
