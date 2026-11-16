import { useLang } from '../../i18n/index.jsx'
import { shortDate } from '../../utils/format.js'

/** rows: [{ id, event, organizer, date, hours, status: 'pending'|'approved'|'declined' }] */
export default function HoursTable({ rows }) {
  const { t } = useLang()
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>{t('hours.event')}</th>
            <th>{t('hours.date')}</th>
            <th>{t('hours.organizer')}</th>
            <th>{t('hours.h')}</th>
            <th>{t('hours.status')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                {t('hours.empty')}
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.event}</strong>
              </td>
              <td>{r.date ? shortDate(r.date) : '—'}</td>
              <td>{r.organizer}</td>
              <td>{r.hours}</td>
              <td>
                <span className={`status ${r.status}`}>{t(`hours.status.${r.status}`)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
