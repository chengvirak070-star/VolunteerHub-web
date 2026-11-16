import HoursTable from '../../components/user/HoursTable.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { getHoursLog } from '../../services/userService.js'

export default function MyHours() {
  const { t } = useLang()
  const { user } = useAuth()
  const { data } = useAsync(getHoursLog, [])
  const rows = data ?? []
  const pending = rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.hours, 0)

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <h1>{t('hours.title')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          {t('profile.certificate')}
        </button>
      </div>

      <div className="stat-tiles">
        <div className="card stat-tile">
          <span className="muted small">{t('hours.total')}</span>
          <b>{user.hours ?? 0} h</b>
        </div>
        <div className="card stat-tile">
          <span className="muted small">{t('hours.pending')}</span>
          <b>{pending} h</b>
        </div>
        <div className="card stat-tile">
          <span className="muted small">{t('hours.events')}</span>
          <b>{rows.filter((r) => r.status === 'confirmed').length}</b>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <HoursTable rows={rows} />
      </div>
    </div>
  )
}
