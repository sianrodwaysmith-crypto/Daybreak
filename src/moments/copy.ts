/**
 * Every user-facing string in the Moments module lives here. No literal
 * strings inside JSX or templates anywhere else in /moments.
 *
 * Functions return strings; values that depend on data take the data as a
 * parameter so the resolution happens at render time, not at module load.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function monthName(monthIndex: number): string {
  return MONTHS[monthIndex] ?? ''
}

function ordinal(n: number): string {
  const suffix = (n % 100 >= 11 && n % 100 <= 13)
    ? 'th'
    : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'
  return `${n}${suffix}`
}

function dayKindFromOffset(daysAgo: number): 'today' | 'yesterday' | 'older' {
  if (daysAgo === 0) return 'today'
  if (daysAgo === 1) return 'yesterday'
  return 'older'
}

function dayLabelFromOffset(daysAgo: number, date: Date): string {
  const kind = dayKindFromOffset(daysAgo)
  if (kind === 'today')     return "Today"
  if (kind === 'yesterday') return 'Yesterday'
  return `${ordinal(date.getDate())} ${monthName(date.getMonth())}`
}

export const copy = {
  // Surface labels
  sectionLabel: 'moments',

  // Tile state copy
  tile: {
    morningEmptyDayOne:   () => 'Begin tonight.',
    morningEmptyGrowing:  () => 'Your collection is starting to grow.',
    eveningPrompt:        () => "What was today's moment?",
    eveningPromptCta:     () => 'Add today',
    submittedFor:         (date: Date) =>
      `${ordinal(date.getDate())} ${monthName(date.getMonth())}.`,
    collectionLink:       () => 'collection',
    postYesterdayLink:    () => 'post yesterday',
    connectGooglePrompt:  () => 'Connect Google to save your moments.',
    connectGoogleCta:     () => 'Open Settings',
  },

  // Memory resurface captions. Caption builders take whatever values they
  // need so nothing is baked at module-load time.
  memory: {
    aYearAgoToday:        () => 'A year ago today.',
    nYearsAgoToday:       (years: number) => `${years} years ago today.`,
    aYearAgoThisWeek:     () => 'A moment from a year ago.',
    aMonthAgo:            () => 'A month ago.',
    randomOlder:          (date: Date) =>
      `A moment from ${monthName(date.getMonth())} ${date.getFullYear()}.`,
  },

  // Errors
  errors: {
    notConnected: () =>
      "You're not connected to Google, so this photo would only live on this device. Connect Google in Settings to save it permanently.",
  },

  // Submission flow
  submit: {
    pickTitleFor:         (daysAgo: number, date: Date) =>
      `Pick a photo for ${dayLabelFromOffset(daysAgo, date).toLowerCase()}`,
    pickHelpFor:          (daysAgo: number) => {
      const kind = dayKindFromOffset(daysAgo)
      if (kind === 'today')     return 'Choose one image from today.'
      if (kind === 'yesterday') return "Choose one image from yesterday."
      return 'Choose one image from that day.'
    },
    pickCta:              () => 'Choose photo',
    confirmTitleFor:      (daysAgo: number, date: Date) =>
      `${dayLabelFromOffset(daysAgo, date)}'s moment`,
    notePlaceholder:      () => 'Add a thought, if you like.',
    save:                 () => 'Save',
    saving:               () => 'Saving…',
    cancel:               () => 'Cancel',
    overwriteWarningFor:  (daysAgo: number) => {
      const label = dayKindFromOffset(daysAgo) === 'today' ? 'today' : 'this day'
      return `You already saved a moment for ${label}. Saving will replace it.`
    },
  },

  // Collection + day card
  collection: {
    title:                () => 'Your collection',
    empty:                () => 'No moments yet. The first one waits for tonight.',
    close:                () => 'Close',
    clearLink:            () => 'Clear collection',
    clearConfirm:         (n: number) =>
      `This will delete all ${n} saved ${n === 1 ? 'moment' : 'moments'}. There's no undo.`,
    clearCta:             () => 'Hold to delete',
    clearCtaHolding:      () => 'Keep holding…',
    clearCtaDeleting:     () => 'Deleting…',
    clearCancel:          () => 'Keep them',
  },

  dayCard: {
    dateLine: (date: Date) => {
      const day   = ordinal(date.getDate())
      const month = monthName(date.getMonth())
      const year  = date.getFullYear()
      const today = new Date()
      const sameYear = today.getFullYear() === year
      return sameYear ? `${day} ${month}.` : `${day} ${month} ${year}.`
    },
  },
}

export type Copy = typeof copy
