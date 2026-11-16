import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/index.jsx'
import { shortDate, tintClass } from '../../utils/format.js'
import JoinButton from '../event/JoinButton.jsx'
import Icon from '../ui/Icon.jsx'
import RichText from '../ui/RichText.jsx'
import Avatar from '../user/Avatar.jsx'
import UserName from '../user/UserName.jsx'
import CommentList from './CommentList.jsx'
import LikeButton from './LikeButton.jsx'

export default function PostCard({ post, onShare }) {
  const { t } = useLang()
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [event, setEvent] = useState(post.event)
  const hasMedia = post.image || post.tint

  return (
    <article className="card post">
      <header className="post-head">
        <Link to={`/u/${post.author.username}`}>
          <Avatar user={post.author} size={40} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UserName user={post.author} />
          <p className="muted xs">{post.ago}</p>
        </div>
        <button type="button" className="icon-btn" aria-label="More options">
          <Icon name="more" size={20} />
        </button>
      </header>

      <p className="post-body">
        <RichText text={post.text} />
      </p>

      {hasMedia && (
        <div className={`img-placeholder post-media ${post.image ? '' : tintClass(post.tint)}`}>
          {post.image ? <img src={post.image} alt="" /> : <Icon name="image" size={36} strokeWidth={1.5} />}
        </div>
      )}

      {event && (
        <div className="event-strip">
          <Icon name="calendar" size={18} className="verified" />
          <Link to={`/events/${event.id}`} className="event-strip-text">
            <strong>{event.title}</strong>
            <span className="muted xs">
              {shortDate(event.date)} · {event.place} ·{' '}
              {event.spotsLeft > 0 ? t('event.spotsLeft', { n: event.spotsLeft }) : t('event.full')}
            </span>
          </Link>
          <JoinButton event={event} onChange={setEvent} />
        </div>
      )}

      <footer className="post-actions">
        <LikeButton postId={post.id} liked={post.likedByMe} likes={post.likes} />
        <button type="button" className="post-action" onClick={() => setShowComments((s) => !s)}>
          <Icon name="message" size={18} />
          {t('post.comments', { n: commentCount })}
        </button>
        <button type="button" className="post-action" onClick={() => onShare?.(post)}>
          <Icon name="share" size={18} />
          {t('post.share')}
        </button>
      </footer>

      {showComments && (
        <CommentList
          postId={post.id}
          comments={post.comments}
          onAdded={() => setCommentCount((n) => n + 1)}
        />
      )}
    </article>
  )
}
