import { useLang } from '../../i18n/index.jsx'
import { compact } from '../../utils/format.js'
import TempleSilhouette from '../ui/TempleSilhouette.jsx'
import Icon from '../ui/Icon.jsx'
import Avatar from './Avatar.jsx'
import FollowButton from './FollowButton.jsx'

export default function ProfileHeader({ user, isMe, onShare, onFollowChange }) {
  const { t } = useLang()
  const role = user.role === 'organizer' ? t('user.organizer') : t('user.volunteer')

  const stats = [
    { label: t('profile.hours'), value: user.hours ?? '—' },
    { label: t('profile.events'), value: user.eventsCount ?? 0 },
    { label: t('profile.followers'), value: compact(user.followers ?? 0) },
    { label: t('profile.following'), value: compact(user.following ?? 0) },
  ]

  return (
    <section className="card profile-card">
      <div className="profile-cover">
        <TempleSilhouette width={290} />
      </div>
      <div className="profile-main">
        <Avatar user={user} size={110} />
        <div className="profile-name">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {user.name}
            {user.verified && <Icon name="verified" size={20} className="verified" />}
          </h1>
          <p className="muted small">{[`@${user.username}`, role, user.city].filter(Boolean).join(' · ')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isMe ? (
            <button type="button" className="btn btn-outline">
              {t('profile.edit')}
            </button>
          ) : (
            <FollowButton userId={user.id} initial={user.isFollowing} size="md" onChange={onFollowChange} />
          )}
          <button type="button" className="btn btn-dark" onClick={onShare}>
            {t('profile.share')}
          </button>
        </div>
      </div>
      <div className="profile-stats">
        {stats.map((s) => (
          <div key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
