/* ====================================================================
   Daily stoic quote rotation. Stable across the day, rotates to the
   next on the next local-date change.
==================================================================== */

const MARCUS_QUOTES: string[] = [
  'You have power over your mind, not outside events. Realize this, and you will find strength.',
  'The happiness of your life depends upon the quality of your thoughts.',
  'Waste no more time arguing what a good man should be. Be one.',
  'When you arise in the morning, think of what a precious privilege it is to be alive: to breathe, to think, to enjoy, to love.',
  'What we do now echoes in eternity.',
  'The impediment to action advances action. What stands in the way becomes the way.',
  'Confine yourself to the present.',
  'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
  'The soul becomes dyed with the color of its thoughts.',
  'Begin. To begin is half the work.',
  'It is not death that a man should fear, but he should fear never beginning to live.',
  'You have to assemble your life yourself, action by action.',
]

export function quoteForDay(d: Date = new Date()): { text: string; attribution: string } {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0)
  const day   = Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000)
  return {
    text:        MARCUS_QUOTES[day % MARCUS_QUOTES.length],
    attribution: 'Marcus Aurelius',
  }
}
