import { Link } from 'react-router-dom'
import DateBadge from '../../components/event/DateBadge.jsx'
import Icon from '../../components/ui/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { deleteEvent, getMyOrganizedEvents } from '../../services/organizerService.js'
import { shortDate } from '../../utils/format.js'

const STATUS_CLASS = { open: 'approved', full: 'pending', pending: 'pending', closed: '', rejected: 'declined' }

export default function OrganizerEvents() {
  const { t } = useLang()
  const { user } = useAuth()
  const orgStatus = user.organization?.status
  const { data, loading, error, setData } = useAsync(getMyOrganizedEvents, [])

  async function remove(ev) {
    if (!window.confirm(t('org.confirmDelete', { title: ev.title }))) return
    try {
      await deleteEvent(ev.id)
      setData((list) => list.filter((e) => e.id !== ev.id))
    } catch (err) {
      toast(err.message)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <div>
          <h1>{t('org.title')}</h1>
          <p className="muted small">{user.organization?.name}</p>
        </div>
        {orgStatus === 'approved' && (
          <Link to="/organizer/events/new" className="btn btn-primary">
            <Icon name="plus" size={18} strokeWidth={2.2} /> {t('org.create')}
          </Link>
        )}
      </div>

      {orgStatus !== 'approved' && (
        <div className="notice">
          <strong>{orgStatus === 'rejected' ? t('org.rejectedTitle') : t('org.pendingTitle')}</strong>
          <p>{orgStatus === 'rejected' ? t('org.rejectedText') : t('org.pendingText')}</p>
        </div>
      )}

      {loading && !data && <p className="empty">{t('common.loading')}</p>}
      {error && <p className="card empty">{error.message}</p>}
      {data?.length === 0 && orgStatus === 'approved' && <p className="card empty">{t('org.empty')}</p>}

      {data?.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {data.map((ev) => (
            <div key={ev.id} className="org-event-row">
              <DateBadge date={ev.date} tint={ev.tint} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/events/${ev.id}`}>
                  <strong>{ev.title}</strong>
                </Link>
                <p className="muted xs">
                  {shortDate(ev.date)} · {ev.start} · {ev.place} · {t('event.joinedOf', { a: ev.joined, b: ev.capacity })}
                </p>
              </div>
              <span className={`status ${STATUS_CLASS[ev.status] ?? ''}`}>{t(`event.status.${ev.status}`)}</span>
              <div className="org-event-actions">
                <Link to={`/organizer/events/${ev.id}/attendance`} className="btn btn-dark btn-sm">
                  {t('org.attendance')}
                </Link>
                <Link to={`/organizer/events/${ev.id}/edit`} className="btn btn-outline btn-sm">
                  {t('org.edit')}
                </Link>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => remove(ev)} aria-label={t('org.delete')}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
