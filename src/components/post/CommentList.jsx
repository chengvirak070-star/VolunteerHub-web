import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../i18n/index.jsx'
import { addComment } from '../../services/postService.js'
import Avatar from '../user/Avatar.jsx'

export default function CommentList({ postId, comments: initial, onAdded }) {
  const { t } = useLang()
  const { user } = useAuth()
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setBusy(true)
    try {
      const c = await addComment(postId, user.id, value)
      setComments((list) => [...list, { ...c, user: { ...c.user, name: user.name, initials: user.initials } }])
      setText('')
      onAdded?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="comments">
      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <Avatar user={c.user} size={30} />
          <div className="comment-bubble">
            <strong className="small">{c.user.name}</strong>
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
        />
        <button type="submit" className="btn btn-dark btn-sm" disabled={busy || !text.trim()}>
          {t('post.send')}
        </button>
      </form>
    </div>
  )
}
