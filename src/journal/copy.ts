/**
 * All user-facing strings for the Journal module live here.
 * Functions where copy depends on data; constants otherwise.
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

  home: {
    label:                'journal',
    lock:                 'lock',
    privacyEncrypted:     'Encrypted on this device. Nothing here is visible to other parts of Daybreak.',
    privacyUnencrypted:   'Private to this device. Nothing here is visible to other parts of Daybreak.',
    roundup: {
      title:    "Today's roundup",
      empty:    'A space for the day in your own words.',
    },
    worry: {
      title:    'Worry bank',
      sitting:  (n: number) => `${n} sitting`,
      empty:    'Things to bring to Wednesday.',
    },
    archive: {
      title:    'Archive',
      since:    (month: string) => `since ${month}`,
      empty:    'Past entries, in your own time.',
    },
  },

  roundup: {
    back:        '← back',
    title:       "today's roundup",
    save:        'Save',
    questionsHint: 'Three quiet questions, if you’d like them.',
    questions: [
      'What happened that mattered?',
      'What did you notice about yourself?',
      'What are you carrying into tomorrow?',
    ],
  },

  worries: {
    back:    '← back',
    title:   'worry bank',
    new:     '+ new',
    empty:   'Nothing in the bank.',
    wedFuture: (n: number) => n === 1 ? 'Wednesday is in 1 day.' : `Wednesday is in ${n} days.`,
    wedToday:  'Today is therapy.',
    moment:    'The moment',
    why:       'Why it stuck',
    bringUp:   'To bring up',
    bringUpEmpty: 'To bring up: —',
    saveNew:   'Save',
    cancelNew: 'cancel',
    discussed: 'mark as discussed',
    stillSitting: 'still sitting with it',
    delete:    'delete',
  },

  archive: {
    back:    '← back',
    title:   'archive',
    intro:   'Past roundups and resolved worries.',
    empty:   'Nothing yet.',
    therapyMarker: (n: number) => n === 1 ? 'therapy day · 1 worry discussed' : `therapy day · ${n} worries discussed`,
  },
}
