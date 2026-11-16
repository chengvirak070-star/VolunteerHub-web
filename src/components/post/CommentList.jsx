import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useLang } from '../../i18n/index.jsx'
import { toast } from '../../services/api.js'
import { addComment, getComments } from '../../services/postService.js'
import Avatar from '../user/Avatar.jsx'

// Loads the post's comments from the API when it is opened.
export default function CommentList({ postId, onAdded }) {
  const { t } = useLang()
  const { user } = useAuth()
  const { data: comments, loading, setData } = useAsync(() => getComments(postId), [postId])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setBusy(true)
    try {
      const c = await addComment(postId, value)
      setData((list) => [...(list || []), c])
      setText('')
      onAdded?.()
    } catch (err) {
      toast(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="comments">
      {loading && !comments && <p className="muted small">{t('common.loading')}</p>}
      {comments?.map((c) => (
        <div className="comment" key={c.id}>
          <Link to={`/u/${c.user.username}`}>
            <Avatar user={c.user} size={30} />
          </Link>
          <div className="comment-bubble">
            <strong className="small">{c.user.name}</strong> <span className="muted xs">· {c.ago}</span>
            <p>{c.text}</p>
          </div>
        </div>
      ))}
      <form className="comment-form" onSubmit={submit}>
        <Avatar user={user} size={30} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('post.writeComment')}
          aria-label={t('post.writeComment')}
          maxLength={1000}
        />
        <button type="submit" className="btn btn-dark btn-sm" disabled={busy || !text.trim()}>
          {t('post.send')}
        </button>
      </form>
    </div>
  )
}
