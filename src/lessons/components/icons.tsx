/* ====================================================================
   Lessons module icon. Self-contained inside /lessons so the sealed
   boundary holds.
==================================================================== */

interface IconProps { size?: number }

export function LessonsIcon({ size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* An open book — two facing pages on a spine. */}
      <path d="M3 5.5C3 5.5 6 4 9 4C10.5 4 11.5 4.5 12 5C12.5 4.5 13.5 4 15 4C18 4 21 5.5 21 5.5V19C21 19 18 17.5 15 17.5C13.5 17.5 12.5 18 12 18.5C11.5 18 10.5 17.5 9 17.5C6 17.5 3 19 3 19V5.5Z" />
      <path d="M12 5V18.5" />
    </svg>
  )
}
