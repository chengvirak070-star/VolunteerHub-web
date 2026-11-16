import { Link } from 'react-router-dom'
import EventCard from '../../components/event/EventCard.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { getJoinedEvents, getSavedEvents } from '../../services/eventService.js'

/** mode: 'joined' (My events) | 'saved' (Saved) */
export default function MyEvents({ mode = 'joined' }) {
  const { t } = useLang()
  const { data } = useAsync(mode === 'saved' ? getSavedEvents : getJoinedEvents, [mode])

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <h1>{t(mode === 'saved' ? 'nav.saved' : 'nav.myEvents')}</h1>
        <Link to="/discover" className="btn btn-primary">
          {t('nav.discover')}
        </Link>
      </div>
      {data?.length === 0 && <p className="card empty">{t('search.noEvents')}</p>}
      <div className="card-grid-3">
        {data?.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  )
}
