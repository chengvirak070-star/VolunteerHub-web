import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/index.jsx'
import { tintClass } from '../../utils/format.js'
import DateBadge from './DateBadge.jsx'

export function SpotsLabel({ event }) {
  const { t } = useLang()
  const full = event.spotsLeft <= 0
  return (
    <p className={`spots ${full ? 'full' : ''}`}>
      {full ? t('event.full') : t('event.spotsLeft', { n: event.spotsLeft })}
    </p>
  )
}

/** Grid card used on Search / Discover / My events. */
export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card event-card">
      <div
        className={`event-card-cover ${tintClass(event.tint)}`}
        style={event.image ? { backgroundImage: `url(${event.image})` } : undefined}
      >
        <DateBadge date={event.date} white />
      </div>
      <div className="event-card-body">
        <h4>{event.title}</h4>
        <p className="muted xs">
          {event.organizer?.name} · {event.place}
        </p>
        <SpotsLabel event={event} />
      </div>
    </Link>
  )
}

/** Compact row used in the "Upcoming near you" widget. */
export function EventRow({ event }) {
  const { t } = useLang()
  const full = event.spotsLeft <= 0
  return (
    <Link to={`/events/${event.id}`} className="upcoming-item">
      <DateBadge date={event.date} tint={event.tint} />
      <div style={{ minWidth: 0 }}>
        <strong className="small" style={{ display: 'block' }}>
          {event.title}
        </strong>
        <span className="muted xs">
          {event.place} · {full ? t('event.full').toLowerCase() : t('event.spotsLeft', { n: event.spotsLeft })}
        </span>
      </div>
    </Link>
  )
}
