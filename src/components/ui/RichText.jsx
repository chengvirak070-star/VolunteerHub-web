import { Link } from 'react-router-dom'

// Turns #hashtags in plain text into links to the search page.
export default function RichText({ text }) {
  // \p{M} = combining marks, needed for Khmer vowel signs inside a hashtag
  const parts = text.split(/(#[\p{L}\p{M}\p{N}_]+)/gu)
  return parts.map((part, i) =>
    part.startsWith('#') ? (
      <Link key={i} className="hashtag" to={`/search?q=${encodeURIComponent(part)}`}>
        {part}
      </Link>
    ) : (
      part
    ),
  )
}
