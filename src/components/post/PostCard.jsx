import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { deletePost } from '../../services/postService.js'
import { shortDate } from '../../utils/format.js'
import JoinButton from '../event/JoinButton.jsx'
import Icon from '../ui/Icon.jsx'
import RichText from '../ui/RichText.jsx'
import Avatar from '../user/Avatar.jsx'
import UserName from '../user/UserName.jsx'
import CommentList from './CommentList.jsx'
import LikeButton from './LikeButton.jsx'

export default function PostCard({ post, onShare, onDeleted, openComments = false }) {
  const { t } = useLang()
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(openComments)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [event, setEvent] = useState(post.event)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMine = user?.id === post.author.id

  function share() {
    if (onShare) return onShare(post)
    navigator.clipboard?.writeText(`${window.location.origin}/posts/${post.id}`).catch(() => {})
    toast(t('post.copied'))
  }

  async function remove() {
    setMenuOpen(false)
    if (!window.confirm(t('post.confirmDelete'))) return
    try {
      await deletePost(post.id)
      onDeleted?.(post.id)
    } catch (err) {
      toast(err.message)
    }
  }

  return (
    <article className="card post">
      <header className="post-head">
        <Link to={`/u/${post.author.username}`}>
          <Avatar user={post.author} size={40} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UserName user={post.author} />
          <p className="muted xs">
            <Link to={`/posts/${post.id}`}>{post.ago}</Link>
          </p>
        </div>
        {isMine && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-btn"
              aria-label="More options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon name="more" size={20} />
            </button>
            {menuOpen && (
              <div className="card user-menu" role="menu">
                <button type="button" onClick={remove}>
                  <Icon name="x" size={16} /> {t('post.delete')}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <p className="post-body">
        <RichText text={post.text} />
      </p>

      {post.image && (
        <div className="img-placeholder post-media">
          <img src={post.image} alt="" loading="lazy" />
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
          {t(commentCount === 1 ? 'post.comment1' : 'post.comments', { n: commentCount })}
        </button>
        <button type="button" className="post-action" onClick={share}>
          <Icon name="share" size={18} />
          {t('post.share')}
        </button>
      </footer>

      {showComments && <CommentList postId={post.id} onAdded={() => setCommentCount((n) => n + 1)} />}
    </article>
  )
}
