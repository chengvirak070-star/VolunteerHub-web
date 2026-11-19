import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import { getFollowList } from '../../services/userService.js'
import { compact } from '../../utils/format.js'
import Icon from '../ui/Icon.jsx'
import Avatar from './Avatar.jsx'
import FollowButton from './FollowButton.jsx'

/**
 * List of a user's followers or the people they follow.
 *   type: 'followers' | 'following'
 *   onFollowChange(user, nowFollowing): I followed/unfollowed someone in the list
 */
export default function FollowListDialog({ username, name, type, onClose, onFollowChange }) {
  const { t } = useLang()
  const { user: me } = useAuth()
  const [state, setState] = useState({ users: [], page: 0, lastPage: 1, total: null, loading: true, error: '' })

  async function load(page) {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try {
      const res = await getFollowList(username, type, page)
      setState((s) => ({
        users: page === 1 ? res.users : [...s.users, ...res.users],
        page: res.page,
        lastPage: res.lastPage,
        total: res.total,
        loading: false,
        error: '',
      }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, type])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const title = type === 'followers' ? t('follow.followersOf', { name }) : t('follow.followingOf', { name })

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card modal follow-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="follow-modal-head">
          <div>
            <h2 style={{ fontSize: 18 }}>{type === 'followers' ? t('profile.followers') : t('profile.following')}</h2>
            <p className="muted xs">{title}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('create.cancel')}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="follow-list">
          {state.users.map((u) => (
            <div key={u.id} className="follow-item">
              <Link to={`/u/${u.username}`} onClick={onClose}>
                <Avatar user={u} size={40} />
              </Link>
              <div className="who">
                <Link to={`/u/${u.username}`} onClick={onClose} className="one-line">
                  <strong>{u.name}</strong>
                </Link>
                <div className="muted xs one-line">
                  @{u.username} · {u.role === 'organizer' ? t('user.organizer') : t('user.volunteer')}
                </div>
              </div>
              {u.id !== me.id ? (
                <FollowButton userId={u.id} initial={u.isFollowing} onChange={(now) => onFollowChange?.(u, now)} />
              ) : (
                <span className="muted xs">{t('follow.you')}</span>
              )}
            </div>
          ))}

          {state.loading && <p className="empty small">{t('common.loading')}</p>}
          {state.error && <p className="error-text">{state.error}</p>}
          {!state.loading && state.total === 0 && (
            <p className="empty small">{type === 'followers' ? t('follow.noFollowers') : t('follow.noFollowing')}</p>
          )}
          {!state.loading && state.page < state.lastPage && (
            <button type="button" className="btn btn-outline btn-block" onClick={() => load(state.page + 1)}>
              {t('follow.more', { n: compact(state.total - state.users.length) })}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
