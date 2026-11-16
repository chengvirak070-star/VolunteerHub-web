import { useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { toggleLike } from '../../services/postService.js'
import Icon from '../ui/Icon.jsx'

export default function LikeButton({ postId, liked: initLiked, likes: initLikes }) {
  const { t } = useLang()
  const [state, setState] = useState({ liked: initLiked, likes: initLikes })

  async function handle() {
    // optimistic update
    setState((s) => ({ liked: !s.liked, likes: s.likes + (s.liked ? -1 : 1) }))
    try {
      setState(await toggleLike(postId))
    } catch {
      setState({ liked: initLiked, likes: initLikes })
    }
  }

  return (
    <button
      type="button"
      className={`post-action ${state.liked ? 'liked' : ''}`}
      onClick={handle}
      aria-pressed={state.liked}
    >
      <Icon name="heart" size={18} />
      {t('post.likes', { n: state.likes })}
    </button>
  )
}
