import { useEffect, useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import {
  desktopEnabled,
  desktopPermission,
  requestDesktopPermission,
  setDesktopEnabled,
  showDesktopNotification,
} from '../../services/desktopNotify.js'

function useDesktopState() {
  const read = () => ({ permission: desktopPermission(), enabled: desktopEnabled() })
  const [state, setState] = useState(read)
  useEffect(() => {
    const update = () => setState(read())
    window.addEventListener('vh-desktop-notify-changed', update)
    return () => window.removeEventListener('vh-desktop-notify-changed', update)
  }, [])
  return state
}

/** Settings row: turn Windows notifications on/off, with a test button. */
export default function DesktopNotifySetting() {
  const { t } = useLang()
  const { permission, enabled } = useDesktopState()

  async function turnOn() {
    const p = permission === 'granted' ? 'granted' : await requestDesktopPermission()
    if (p === 'granted') {
      setDesktopEnabled(true)
      showDesktopNotification({ id: 'test', type: 'test', text: t('desk.testBody') })
    }
  }

  let status
  let action
  if (permission === 'unsupported') {
    status = t('desk.unsupported')
  } else if (permission === 'denied') {
    status = t('desk.blocked')
  } else if (enabled) {
    status = t('desk.on')
    action = (
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setDesktopEnabled(false)}>
        {t('desk.turnOff')}
      </button>
    )
  } else {
    status = t('desk.off')
    action = (
      <button type="button" className="btn btn-dark btn-sm" onClick={turnOn}>
        {t('desk.turnOn')}
      </button>
    )
  }

  return (
    <div className="auth-row" style={{ gap: 12 }}>
      <div>
        <span>{t('desk.title')}</span>
        <p className="muted xs">{status}</p>
      </div>
      {action}
    </div>
  )
}

/** Banner on the Notifications page while desktop notifications are not turned on yet. */
export function DesktopNotifyBanner() {
  const { t } = useLang()
  const { permission, enabled } = useDesktopState()
  if (permission !== 'default' && !(permission === 'granted' && !enabled)) return null

  return (
    <div className="notice" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div>
        <strong>{t('desk.bannerTitle')}</strong>
        <p>{t('desk.bannerText')}</p>
      </div>
      <button
        type="button"
        className="btn btn-dark btn-sm"
        onClick={async () => {
          if ((await requestDesktopPermission()) === 'granted') {
            setDesktopEnabled(true)
            showDesktopNotification({ id: 'test', type: 'test', text: t('desk.testBody') })
          }
        }}
      >
        {t('desk.turnOn')}
      </button>
    </div>
  )
}
