import { useLang } from '../../i18n/index.jsx'
import { shortDate } from '../../utils/format.js'

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
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.event}</strong>
              </td>
              <td>{shortDate(r.date)}</td>
              <td>{r.organizer}</td>
              <td>{r.hours}</td>
              <td>
                <span className={`status ${r.status}`}>
                  {r.status === 'confirmed' ? t('hours.confirmed') : t('hours.waiting')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
