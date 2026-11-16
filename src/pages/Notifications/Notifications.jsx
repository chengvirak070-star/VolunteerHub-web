import { Link } from 'react-router-dom'
import Avatar from '../../components/user/Avatar.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { getUserById, getNotifications, markAllNotificationsRead } from '../../services/userService.js'

export default function Notifications() {
  const { t } = useLang()
  const { data, setData } = useAsync(getNotifications, [])

  async function markAll() {
    await markAllNotificationsRead()
    setData((list) => list.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="page-head">
        <h1>{t('notif.title')}</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={markAll}>
          {t('notif.markAll')}
        </button>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {data?.map((n) => {
          const u = getUserById(n.userId)
          return (
            <div key={n.id} className={`notif ${n.unread ? 'unread' : ''}`}>
              <Avatar user={u} size={40} />
              <div>
                <p className="small">
                  <Link to={`/u/${u.username}`}>
                    <strong>{u.name}</strong>
                  </Link>{' '}
                  {n.text}
                </p>
                <p className="muted xs">{n.ago}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
