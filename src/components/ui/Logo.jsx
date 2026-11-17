// VolunteerHub logo (files in /public).
//   variant="dark"  -> navy text, for light backgrounds (top bar)
//   variant="light" -> white text, for dark navy backgrounds (login page, splash screen)
export default function Logo({ variant = 'dark', height = 28, className = '' }) {
  return (
    <img
      src={variant === 'light' ? '/logo-light.svg' : '/logo.svg'}
      alt="VolunteerHub"
      height={height}
      width={Math.round(height * 7.36)}
      className={`logo-img ${className}`}
      style={{ height, width: 'auto' }}
    />
  )
}
