export default function Avatar({ user, size = 40, className = '' }) {
  if (!user) return null
  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.36),
    background: user.color || '#13263a',
  }
  return (
    <span className={`avatar ${className}`} style={style} title={user.name}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        user.initials
      )}
    </span>
  )
}
