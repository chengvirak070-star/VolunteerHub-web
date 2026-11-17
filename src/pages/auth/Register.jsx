import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import AuthShell from './AuthShell.jsx'

export default function Register() {
  const { t } = useLang()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    role: 'volunteer',
    organization: '',
    name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isOrganizer = form.role === 'organizer'

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (isOrganizer && !form.organization.trim()) return setError(t('auth.errOrg'))
    if (!form.name.trim()) return setError(t('auth.errName'))
    if (!form.username.trim()) return setError(t('auth.errUsername'))
    if (!/^[a-z0-9_.]{3,30}$/i.test(form.username.trim())) return setError(t('auth.usernameHint'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError(t('auth.errEmail'))
    if (form.password.length < 8) return setError(t('auth.errShort'))
    if (form.password !== form.confirm) return setError(t('auth.errMatch'))
    setBusy(true)
    try {
      await register({
        role: form.role,
        organizationName: isOrganizer ? form.organization.trim() : undefined,
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email,
        password: form.password,
      })
      navigate(isOrganizer ? '/organizer' : '/', { replace: true })
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
          <h2>{t('auth.registerTitle')}</h2>
          <p className="muted small" style={{ marginTop: 6 }}>
            {t('auth.registerHint')}
          </p>
        </div>

        <div className="field">
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t('auth.iAm')}</span>
          <div className="role-switch" role="radiogroup" aria-label={t('auth.iAm')}>
            {[
              ['volunteer', 'auth.roleVolunteer', 'auth.roleVolunteerHint'],
              ['organizer', 'auth.roleOrganizer', 'auth.roleOrganizerHint'],
            ].map(([value, label, hint]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.role === value}
                className={form.role === value ? 'active' : ''}
                onClick={() => setForm((f) => ({ ...f, role: value }))}
              >
                <strong>{t(label)}</strong>
                <span>{t(hint)}</span>
              </button>
            ))}
          </div>
        </div>

        {isOrganizer && (
          <div className="field">
            <label htmlFor="org">{t('auth.orgName')}</label>
            <input
              id="org"
              className="input"
              placeholder={t('auth.orgNamePh')}
              value={form.organization}
              onChange={set('organization')}
              maxLength={150}
            />
            <span className="muted xs">{t('auth.orgApprovalNote')}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor="name">{isOrganizer ? t('auth.contactName') : t('auth.fullName')}</label>
          <input id="name" className="input" placeholder={t('auth.fullNamePh')} autoComplete="name" value={form.name} onChange={set('name')} />
        </div>

        <div className="field">
          <label htmlFor="username">{t('auth.username')}</label>
          <input
            id="username"
            className="input"
            placeholder="chengvirak"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={form.username}
            onChange={set('username')}
          />
          <span className="muted xs">{t('auth.usernameHint')}</span>
        </div>

        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" className="input" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={set('email')} />
        </div>

        <div className="field">
          <label htmlFor="password">{t('auth.password')}</label>
          <input id="password" type="password" className="input" placeholder={t('auth.passwordMin')} autoComplete="new-password" value={form.password} onChange={set('password')} />
        </div>

        <div className="field">
          <label htmlFor="confirm">{t('auth.confirmPassword')}</label>
          <input id="confirm" type="password" className="input" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? t('common.loading') : t('auth.register')}
        </button>

        <p className="small" style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="link">
            {t('auth.login')}
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
