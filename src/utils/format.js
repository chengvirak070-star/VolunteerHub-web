const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const parse = (iso) => new Date(`${iso}T00:00:00`)

/** { dow: 'SAT', day: '21' } */
export function dateParts(iso) {
  const d = parse(iso)
  return { dow: DAYS[d.getDay()], day: String(d.getDate()).padStart(2, '0') }
}

/** 'Sat, 21 Nov' */
export function shortDate(iso) {
  const d = parse(iso)
  const dow = DAYS[d.getDay()]
  return `${dow[0]}${dow.slice(1).toLowerCase()}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** 'Saturday, 21 November 2026' */
export function longDate(iso) {
  const d = parse(iso)
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

/** 1800 -> '1.8K' */
export function compact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
  return String(n)
}

export const BADGE_STEPS = [10, 25, 50, 100]

export function nextBadge(hours) {
  return BADGE_STEPS.find((s) => s > hours) ?? BADGE_STEPS.at(-1)
}

export const TINTS = { mint: 'bg-mint', peach: 'bg-peach', slate: 'bg-slate', green: 'bg-green' }
export const tintClass = (t) => TINTS[t] || 'bg-mint'
