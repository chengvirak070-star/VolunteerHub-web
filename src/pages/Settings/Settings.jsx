import DesktopNotifySetting from '../../components/ui/DesktopNotifySetting.jsx'
import { openBugReport } from '../../services/api.js'
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
          <span>{t('settings.language')}</span>
          <LangSwitch />
        </div>
        <div className="divider" />
        <DesktopNotifySetting />
        <div className="divider" />
        <div className="auth-row">
          <div>
            <span>{t('bug.title')}</span>
            <p className="muted xs">{t('bug.settingsHint')}</p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={openBugReport}>
            {t('bug.menu')}
          </button>
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
