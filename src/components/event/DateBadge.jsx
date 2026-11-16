import { dateParts, tintClass } from '../../utils/format.js'

export default function DateBadge({ date, tint, white = false }) {
  const { dow, day } = dateParts(date)
  return (
    <span className={`date-badge ${white ? '' : tintClass(tint)}`}>
      <small>{dow}</small>
      <b>{day}</b>
    </span>
  )
}
