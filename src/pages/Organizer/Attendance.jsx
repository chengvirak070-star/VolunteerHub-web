import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon.jsx'
import Avatar from '../../components/user/Avatar.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { getEvent } from '../../services/eventService.js'
import { getRegistrations, markAttendance } from '../../services/organizerService.js'
import { longDate } from '../../utils/format.js'

/** Organizer marks who attended. "Attended" creates a pending hour log for the volunteer. */
export default function Attendance() {
  const { id } = useParams()
  const { t } = useLang()
  const event = useAsync(() => getEvent(id), [id])
  const regs = useAsync(() => getRegistrations(id), [id])
  const [busyId, setBusyId] = useState(null)

  async function mark(reg, status) {
    setBusyId(reg.id)
    try {
      const updated = await markAttendance(reg.id, status)
      regs.setData((list) => list.map((r) => (r.id === reg.id ? updated : r)))
    } catch (err) {
      toast(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const list = regs.data ?? []
  const active = list.filter((r) => r.status !== 'cancelled')
  const attended = list.filter((r) => r.status === 'attended').length

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <Link to="/organizer" className="back-link">
        <Icon name="chevronLeft" size={16} /> {t('org.title')}
      </Link>

      <div className="page-head">
        <div>
          <h1>{t('org.attendance')}</h1>
          {event.data && (
            <p className="muted small">
              {event.data.title} · {longDate(event.data.date)} · {t('event.counts', { n: event.data.hours })}
            </p>
          )}
        </div>
        {regs.data && (
          <span className="pill pill-mint">{t('org.attendedCount', { a: attended, b: active.length })}</span>
        )}
      </div>

      {event.data && !event.data.isPast && <div className="notice">{t('org.notStartedNote')}</div>}

      {regs.loading && !regs.data && <p className="empty">{t('common.loading')}</p>}
      {regs.error && <p className="card empty">{regs.error.message}</p>}
      {regs.data && active.length === 0 && <p className="card empty">{t('org.noRegistrations')}</p>}

      {active.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {active.map((r) => (
            <div key={r.id} className="org-event-row">
              <Link to={`/u/${r.user.username}`}>
                <Avatar user={r.user} size={40} />
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="small">{r.user.name}</strong>
                <p className="muted xs">
                  @{r.user.username}
                  {r.hourLog && ` · ${t('org.hoursLabel', { n: r.hourLog.hours })} ${t(`hours.status.${r.hourLog.status}`).toLowerCase()}`}
                </p>
              </div>
              <div className="org-event-actions">
                <button
                  type="button"
                  className={`btn btn-sm ${r.status === 'attended' ? 'btn-primary' : 'btn-outline'}`}
                  disabled={busyId === r.id || r.hourLog?.status === 'approved'}
                  onClick={() => mark(r, 'attended')}
                  aria-pressed={r.status === 'attended'}
                >
                  {t('org.attended')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${r.status === 'absent' ? 'btn-dark' : 'btn-outline'}`}
                  disabled={busyId === r.id || r.hourLog?.status === 'approved'}
                  onClick={() => mark(r, 'absent')}
                  aria-pressed={r.status === 'absent'}
                >
                  {t('org.absent')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
