import LangSwitch from '../../components/ui/LangSwitch.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'

export default function Settings() {
  const { t } = useLang()
  const { user, logout } = useAuth()

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-head">
        <h1>{t('nav.settings')}</h1>
      </div>
      <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="auth-row">
          <span>Language</span>
          <LangSwitch />
        </div>
        <div className="divider" />
        <div className="auth-row">
          <span>{user.email || `@${user.username}`}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
