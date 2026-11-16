import { useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { toggleLike } from '../../services/postService.js'
import Icon from '../ui/Icon.jsx'

export default function LikeButton({ postId, liked: initLiked, likes: initLikes }) {
  const { t } = useLang()
  const [state, setState] = useState({ liked: initLiked, likes: initLikes })
  const [busy, setBusy] = useState(false)

  async function handle() {
    if (busy) return
    const before = state
    setBusy(true)
    setState({ liked: !before.liked, likes: before.likes + (before.liked ? -1 : 1) }) // optimistic
    try {
      setState(await toggleLike(postId, before.liked))
    } catch (err) {
      setState(before)
      toast(err.message)
    } finally {
      setBusy(false)
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
      {t(state.likes === 1 ? 'post.like1' : 'post.likes', { n: state.likes })}
    </button>
  )
}
