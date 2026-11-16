// Stylised five-tower temple silhouette used as a decorative background.
export default function TempleSilhouette({ width = 350, className }) {
  const h = (width * 160) / 350
  return (
    <svg width={width} height={h} viewBox="0 0 350 160" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="0" y="146" width="350" height="14" />
        <rect x="10" y="134" width="330" height="14" />
        <rect x="22" y="122" width="306" height="14" />
        <path d="M42 124V90c0-10 8-18 16-30 8 12 16 20 16 30v34Z" />
        <path d="M96 124V70c0-16 10-28 20-46 10 18 20 30 20 46v54Z" />
        <path d="M148 124V48c0-20 12-34 27-48 15 14 27 28 27 48v76Z" />
        <path d="M214 124V70c0-16 10-28 20-46 10 18 20 30 20 46v54Z" />
        <path d="M276 124V90c0-10 8-18 16-30 8 12 16 20 16 30v34Z" />
      </g>
    </svg>
  )
}
