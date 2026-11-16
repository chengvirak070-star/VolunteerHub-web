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

export function AuthProvider({ children }) {
  // loading = true while the splash shows and/or we check a saved token with GET /auth/me
  const [state, setState] = useState({ user: null, loading: Boolean(startToken) || firstOpen })

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken()
      setState({ user: null, loading: false })
    })

    const checkUser = startToken
      ? api('/auth/me')
          .then((res) => mapUser(res.data))
          .catch(() => {
            clearToken()
            return null
          })
      : Promise.resolve(null)

    Promise.all([checkUser, wait(firstOpen ? SPLASH_MS : 0)]).then(([user]) =>
      setState({ user, loading: false }),
    )
  }, [])

  const login = useCallback(async (email, password, remember) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password, device_name: 'web' } })
    saveToken(res.data.token, remember)
    setState({ user: mapUser(res.data.user), loading: false })
  }, [])

  const register = useCallback(async ({ name, username, email, password }) => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { name, username, email, password, role: 'volunteer' },
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

  const value = useMemo(
    () => ({ user: state.user, loading: state.loading, login, register, logout }),
    [state, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
