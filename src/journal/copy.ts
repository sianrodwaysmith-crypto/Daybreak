/**
 * All user-facing strings for the Journal module live here.
 * Functions where copy depends on data; constants otherwise.
 *
 * Post-restructure: the journal is now a single-purpose worry bank.
 * The morning intention block and the end-of-day reflection both
 * live in Daily Mindset (morning + evening). What survives here is
 * the bit that intentionally needs the PIN gate: things to take to
 * therapy.
 */

export const copy = {
  tile: {
    label: 'Journal',
  },

  unlock: {
    label:        'Journal',
    setupTitle:   'Set your PIN.',
    verifyTitle:  'Enter your PIN.',
    confirmTitle: 'Re-enter your PIN.',
    tryAgain:     'Try again.',
    mismatch:     "PINs didn't match. Start over.",
    cancel:       'cancel',
  },

  worries: {
    title:    'worry bank',
    privacy:  'Private to this device. Nothing here is visible to other parts of Daybreak.',
    lock:     'lock',
    new:      '+ new',
    empty:    'Nothing in the bank.',
    wedFuture: (n: number) => n === 1 ? 'Wednesday is in 1 day.' : `Wednesday is in ${n} days.`,
    wedToday:  'Today is therapy.',
    pastLabel: 'PAST',
    pastEmpty: 'Discussed worries appear here once you mark them.',

    // The two prompts on the worry editor — kept short and concrete
    // so the screen reads like a quick brain-dump rather than a form.
    moment:    'WHAT HAPPENED',
    why:       "HOW IT'S AFFECTING ME",

    // Placeholders sit inside the textareas as soft prompts.
    momentPlaceholder: 'The situation, in your own words…',
    whyPlaceholder:    'The feeling it left, the part that keeps replaying…',

    back:         '← back',
    save:         'SAVE →',
    saveBusy:     'Saving…',
    discussed:    'mark as discussed',
    stillSitting: 'still sitting with it',
    delete:       'delete',
  },
}
