import { useState } from 'react'
import EventCard from '../../components/event/EventCard.jsx'
import EventFilters from '../../components/event/EventFilters.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { searchEvents } from '../../services/eventService.js'

export default function Discover() {
  const { t } = useLang()
  const [filters, setFilters] = useState({ categories: [], when: 'any', city: '', freeOnly: false })
  const events = useAsync(() => searchEvents(filters), [filters])

  return (
    <div className="page page-narrow">
      <div className="search-grid">
        <EventFilters value={filters} onChange={setFilters} />
        <section>
          <div className="page-head">
            <div>
              <h1>{t('discover.title')}</h1>
              <p className="muted small">{t('discover.subtitle')}</p>
            </div>
          </div>
          {events.data?.length === 0 && <p className="card empty">{t('search.noEvents')}</p>}
          <div className="card-grid-3">
            {events.data?.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
