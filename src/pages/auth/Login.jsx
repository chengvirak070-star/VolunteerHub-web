import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import AuthShell from './AuthShell.jsx'

export default function Login() {
  const { t } = useLang()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError(t('auth.errRequired'))
    setBusy(true)
    try {
      await login(form.email, form.password, form.remember)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate style={{ display: 'contents' }}>
        <div>
          <h2>{t('auth.welcome')}</h2>
          <p className="muted small" style={{ marginTop: 6 }}>
            {t('auth.loginHint')}
          </p>
        </div>

        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
          />
        </div>

        <div className="field">
          <label htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder={t('auth.passwordPh')}
            autoComplete="current-password"
            value={form.password}
            onChange={set('password')}
          />
        </div>

        <div className="auth-row">
          <label className="checkbox">
            <input type="checkbox" checked={form.remember} onChange={set('remember')} />
            {t('auth.remember')}
          </label>
          <a href="#" className="link" onClick={(e) => e.preventDefault()}>
            {t('auth.forgot')}
          </a>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? t('common.loading') : t('auth.login')}
        </button>

        <p className="small" style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          {t('auth.newHere')}{' '}
          <Link to="/register" className="link">
            {t('auth.createAccount')}
          </Link>
        </p>
        <p className="xs muted" style={{ textAlign: 'center' }}>
          {t('auth.demo')}
        </p>
      </form>
    </AuthShell>
  )
}
