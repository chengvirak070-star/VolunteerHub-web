import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/index.jsx'
import { compact } from '../../utils/format.js'
import Avatar from './Avatar.jsx'
import FollowButton from './FollowButton.jsx'
import UserName from './UserName.jsx'

export default function PersonCard({ user }) {
  const { t } = useLang()
  return (
    <div className="card person-card">
      <Link to={`/u/${user.username}`}>
        <Avatar user={user} size={56} />
      </Link>
      <UserName user={user} />
      <p className="muted xs" style={{ marginBottom: 10 }}>
        {user.role === 'organizer'
          ? `${t('user.organizer')} · ${compact(user.followers)} ${t('user.followers')}`
          : `${t('user.volunteer')} · ${user.hours} ${t('user.hours')}`}
      </p>
      <FollowButton userId={user.id} initial={user.isFollowing} size="md" block />
    </div>
  )
}
