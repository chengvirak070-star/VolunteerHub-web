import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EventCard from '../../components/event/EventCard.jsx'
import EventFilters from '../../components/event/EventFilters.jsx'
import PostCard from '../../components/post/PostCard.jsx'
import PersonCard from '../../components/user/PersonCard.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { searchEvents } from '../../services/eventService.js'
import { getTrending, searchPosts } from '../../services/postService.js'
import { searchUsers } from '../../services/userService.js'

export default function Search() {
  const { t } = useLang()
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  // "#RiverCleanup" -> "River Cleanup" so a hashtag also matches event and people text
  const textQ = q.startsWith('#') ? q.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2') : q

  const [filters, setFilters] = useState({ categories: [], when: 'any', city: '', freeOnly: false })

  const events = useAsync(() => searchEvents({ q: textQ, ...filters }), [textQ, filters])
  const people = useAsync(() => searchUsers(textQ), [textQ])
  const posts = useAsync(() => searchPosts(q), [q])
  const trending = useAsync(getTrending, [])

  return (
    <div className="page page-narrow">
      <div className="search-grid">
        <EventFilters value={filters} onChange={setFilters} />

        <section>
          <div className="results-head">
            <h1 style={{ fontSize: 24 }}>{q ? t('search.results', { q }) : t('search.allEvents')}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {trending.data?.slice(0, 3).map((tag) => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="chip chip-tag">
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <h2 className="section-title" style={{ marginBottom: 12 }}>
            {t('search.events')}
          </h2>
          {events.loading && !events.data && <p className="empty">{t('common.loading')}</p>}
          {events.data?.length === 0 && <p className="card empty">{t('search.noEvents')}</p>}
          <div className="card-grid-3" style={{ opacity: events.loading ? 0.6 : 1 }}>
            {events.data?.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>

          <h2 className="section-title" style={{ margin: '28px 0 12px' }}>
            {t('search.people')}
          </h2>
          {people.data?.length === 0 && <p className="card empty">{t('search.noPeople')}</p>}
          <div className="card-grid-3">
            {people.data?.slice(0, 6).map((u) => (
              <PersonCard key={u.id} user={u} />
            ))}
          </div>

          {q && posts.data?.length > 0 && (
            <>
              <h2 className="section-title" style={{ margin: '28px 0 12px' }}>
                {t('profile.posts')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {posts.data.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onDeleted={(id) => posts.setData((list) => list.filter((x) => x.id !== id))}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
