import { useState } from 'react'
import HoursTable from '../../components/user/HoursTable.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { downloadCertificate, getMyHours } from '../../services/userService.js'

export default function MyHours() {
  const { t } = useLang()
  const { user } = useAuth()
  const { data, loading, error } = useAsync(getMyHours, [])
  const [downloading, setDownloading] = useState(false)

  async function download() {
    setDownloading(true)
    try {
      await downloadCertificate(user.username)
    } catch (err) {
      toast(err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <h1>{t('hours.title')}</h1>
        <button type="button" className="btn btn-primary" onClick={download} disabled={downloading}>
          {downloading ? t('common.loading') : t('profile.certificate')}
        </button>
      </div>

      <div className="stat-tiles">
        <div className="card stat-tile">
          <span className="muted small">{t('hours.total')}</span>
          <b>{data?.approved ?? '–'} h</b>
        </div>
        <div className="card stat-tile">
          <span className="muted small">{t('hours.pending')}</span>
          <b>{data?.pending ?? '–'} h</b>
        </div>
        <div className="card stat-tile">
          <span className="muted small">{t('hours.events')}</span>
          <b>{data?.attended ?? '–'}</b>
        </div>
      </div>

      {loading && !data && <p className="empty">{t('common.loading')}</p>}
      {error && <p className="card empty">{error.message}</p>}
      {data && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <HoursTable rows={data.rows} />
        </div>
      )}
    </div>
  )
}
