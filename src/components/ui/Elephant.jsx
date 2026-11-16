// VolunteerHub mascot: a friendly teal elephant with a scarf.
// Replace with the real illustration (e.g. src/assets/elephant.png) when available.
export default function Elephant({ size = 140, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      role="img"
      aria-label="VolunteerHub elephant"
    >
      <g stroke="#fff" strokeWidth="6" strokeLinejoin="round" fill="#fff">
        <ellipse cx="80" cy="104" rx="40" ry="36" />
        <circle cx="78" cy="58" r="36" />
        <ellipse cx="38" cy="58" rx="24" ry="28" />
        <ellipse cx="118" cy="58" rx="24" ry="28" />
        <path d="M100 72c14 4 22 0 30-14 4-6 12-2 8 6-10 20-24 26-40 20Z" />
      </g>
      {/* body */}
      <ellipse cx="80" cy="104" rx="38" ry="34" fill="#159a86" />
      {/* legs */}
      <rect x="52" y="118" width="18" height="24" rx="8" fill="#13897a" />
      <rect x="90" y="118" width="18" height="24" rx="8" fill="#13897a" />
      <path d="M54 140h14M92 140h14" stroke="#e8f6f2" strokeWidth="3" strokeLinecap="round" />
      {/* tail */}
      <path d="M43 108c-8 2-10 8-8 14" stroke="#13897a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* ears */}
      <ellipse cx="38" cy="58" rx="22" ry="26" fill="#13897a" />
      <ellipse cx="40" cy="60" rx="13" ry="16" fill="#3fbfa5" />
      <ellipse cx="118" cy="58" rx="22" ry="26" fill="#13897a" />
      <ellipse cx="116" cy="60" rx="13" ry="16" fill="#3fbfa5" />
      {/* head */}
      <circle cx="78" cy="58" r="34" fill="#1aa58f" />
      {/* trunk raised */}
      <path
        d="M96 70c12 4 20 0 28-13 3-5 10-2 7 4-9 18-22 24-37 18Z"
        fill="#1aa58f"
        stroke="#13897a"
        strokeWidth="1.5"
      />
      {/* eyes & cheeks */}
      <ellipse cx="68" cy="54" rx="4" ry="5" fill="#13263a" />
      <ellipse cx="90" cy="54" rx="4" ry="5" fill="#13263a" />
      <circle cx="69.5" cy="52.5" r="1.4" fill="#fff" />
      <circle cx="91.5" cy="52.5" r="1.4" fill="#fff" />
      <ellipse cx="60" cy="66" rx="5" ry="3" fill="#7fd6c4" />
      {/* smile */}
      <path d="M72 72c4 5 10 5 14 0" stroke="#13263a" strokeWidth="2.5" fill="#e86a5b" strokeLinecap="round" />
      {/* scarf */}
      <path d="M50 86c18 10 40 10 58 0l-2 9c-18 8-36 8-54 0Z" fill="#13263a" />
      <path d="M62 94l-4 22 10-3 2-17Z" fill="#13263a" />
      <path d="M58 116l2 6M62 115l1 6M66 114l1 6" stroke="#13263a" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M79 92.5c-1.6-2.6-5.4-1.5-5 1.4.3 2 2.8 3.4 5 5 2.2-1.6 4.7-3 5-5 .4-2.9-3.4-4-5-1.4Z"
        fill="#fff"
      />
    </svg>
  )
}
