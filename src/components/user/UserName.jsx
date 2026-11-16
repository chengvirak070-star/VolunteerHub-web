import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

export default function UserName({ user, className = '' }) {
  return (
    <Link to={`/u/${user.username}`} className={`post-author ${className}`}>
      {user.name}
      {user.verified && <Icon name="verified" size={15} className="verified" />}
    </Link>
  )
}
