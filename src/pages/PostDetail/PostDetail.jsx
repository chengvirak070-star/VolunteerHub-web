import { Link, useNavigate, useParams } from 'react-router-dom'
import PostCard from '../../components/post/PostCard.jsx'
import Icon from '../../components/ui/Icon.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { getPost } from '../../services/postService.js'

// One post with its comments open (used by notification and share links).
export default function PostDetail() {
  const { id } = useParams()
  const { t } = useLang()
  const navigate = useNavigate()
  const { data: post, loading, error } = useAsync(() => getPost(id), [id])

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <Link to="/" className="back-link">
        <Icon name="chevronLeft" size={16} /> {t('event.backToFeed')}
      </Link>
      {loading && !post && <p className="empty">{t('common.loading')}</p>}
      {error && <p className="card empty">{error.message}</p>}
      {!loading && !error && !post && <p className="card empty">{t('post.notFound')}</p>}
      {post && <PostCard key={post.id} post={post} openComments onDeleted={() => navigate('/')} />}
    </div>
  )
}
