import { Link, useNavigate } from 'react-router-dom'
import { DesktopNotifyBanner } from '../../components/ui/DesktopNotifySetting.jsx'
import Icon from '../../components/ui/Icon.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/userService.js'

const ICONS = {
  like: 'heart',
  comment: 'message',
  follow: 'user',
  registration_confirmed: 'calendar',
  event_reminder: 'bell',
  hours_approved: 'clock',
  hours_declined: 'clock',
  bug_fixed: 'check',
  report_reviewed: 'flag',
}

export default function Notifications() {
  const { t } = useLang()
  const navigate = useNavigate()
  const { data, loading, error, setData } = useAsync(getNotifications, [])
  const items = data?.items ?? []

  async function markAll() {
    await markAllNotificationsRead()
    setData((d) => ({ unread: 0, items: d.items.map((n) => ({ ...n, unread: false })) }))
    window.dispatchEvent(new Event('vh-notifications-read'))
  }

  function open(n) {
    if (n.unread) {
      markNotificationRead(n.id).catch(() => {})
      setData((d) => ({
        unread: Math.max(0, d.unread - 1),
        items: d.items.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
      }))
      window.dispatchEvent(new Event('vh-notifications-read'))
    }
    if (n.link) navigate(n.link)
  }

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="page-head">
        <h1>{t('notif.title')}</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={markAll} disabled={!data?.unread}>
          {t('notif.markAll')}
        </button>
      </div>

      <DesktopNotifyBanner />

      {loading && !data && <p className="empty">{t('common.loading')}</p>}
      {error && <p className="card empty">{error.message}</p>}
      {data && items.length === 0 && <p className="card empty">{t('notif.empty')}</p>}

      {items.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map((n) => (
            <div
              key={n.id}
              className={`notif ${n.unread ? 'unread' : ''}`}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => open(n)}
              onKeyDown={(e) => e.key === 'Enter' && open(n)}
            >
              {n.actor ? (
                <Avatar user={n.actor} size={40} />
              ) : (
                <span className="avatar" style={{ width: 40, height: 40, background: 'var(--teal)' }}>
                  <Icon name={ICONS[n.type] || 'bell'} size={18} />
                </span>
              )}
              <div>
                <p className="small">
                  {n.actor && ['like', 'comment', 'follow'].includes(n.type) && (
                    <>
                      <Link to={`/u/${n.actor.username}`} onClick={(e) => e.stopPropagation()}>
                        <strong>{n.actor.name}</strong>
                      </Link>{' '}
                    </>
                  )}
                  {n.text}
                </p>
                <p className="muted xs">{n.ago}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
