import { useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { toggleFollow } from '../../services/userService.js'

export default function FollowButton({ userId, initial = false, size = 'sm', block = false, onChange }) {
  const { t } = useLang()
  const [following, setFollowing] = useState(initial)
  const [busy, setBusy] = useState(false)

  async function handle() {
    const was = following
    setBusy(true)
    setFollowing(!was) // optimistic
    try {
      const now = await toggleFollow(userId, was)
      setFollowing(now)
      if (now !== was) onChange?.(now)
    } catch {
      setFollowing(was)
    } finally {
      setBusy(false)
    }
  }

  const cls = [
    'btn',
    following ? 'btn-outline' : 'btn-dark',
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : '',
  ].join(' ')

  return (
    <button type="button" className={cls} onClick={handle} disabled={busy} aria-pressed={following}>
      {following ? t('user.following') : t('user.follow')}
    </button>
  )
}
