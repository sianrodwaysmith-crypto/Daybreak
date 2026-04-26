/* ====================================================================
   All user-facing strings for the Lessons module.
   Lives in one place so copy can be edited or translated without
   touching component code. Anything dynamic is a function.
==================================================================== */

export const copy = {
  tile: {
    sectionLabel:    "today's lesson",
    cta:             'Open lesson',
    chooseCourse:    'Choose a course',
    noCourseLine:    'Begin a course.',
    noCourseSub:     'Three minutes a morning. Compounds.',
    tomorrow:        (nextTitle: string) => `Tomorrow: ${nextTitle}.`,
    dayDone:         (n: number) => `Day ${n} done.`,
    dayHeading:      (courseTitle: string, day: number) => `${courseTitle} · Day ${day}`,
    dayHeadingLine:  (day: number, lessonTitle: string) => `Day ${day} — ${lessonTitle}`,
    courseTapLine:   (courseTitle: string) => `${courseTitle}. Tap to begin.`,
    minutes:         (n: number) => `${n} min`,
    courseCompleteLine: (courseTitle: string) => `Course complete: ${courseTitle}.`,
    courseCompleteSub:  'Browse the library for what to learn next.',
    libraryLink:        'all courses',
  },

  lesson: {
    headerLine:      (course: string, day: number, total: number, mins: number) =>
                       `${course} · Day ${day} of ${total} · ${mins} min`,
    dwellWaiting:    (s: number) => `Take a moment. ${s}s`,
    dwellReady:      'Ready when you are.',
    beginQuiz:       'Begin quiz',
    closeAria:       'Close',
  },

  quiz: {
    counter:         (i: number, total: number) => `Question ${i} of ${total}`,
    continue:        'Continue →',
    seeRecap:        'See recap →',
  },

  recap: {
    label:           (n: number) => `day ${n} done`,
    takeawayLabel:   "today's takeaway",
    accuracyHeading: 'accuracy today',
    accuracyValue:   (got: number, total: number) => `${got} of ${total}`,
    progressHeading: 'progress',
    progressValue:   (done: number, total: number) => `${done} of ${total}`,
    transitionLine:  (nextTitle: string, hook: string) => `Tomorrow: ${nextTitle}. ${hook}`,
    finishedLine:    'You finished the course. Tomorrow opens the recap.',
    backCta:         'Back to Daybreak',
  },

  library: {
    title:           'Lessons',
    activeBadge:     'continue',
    completedBadge:  (date: string) => `completed ${date}`,
    dayProgress:     (day: number, total: number) => `Day ${day} of ${total}`,
    browseCta:       'Browse new courses',
    switchActive:    'Switch active course?',
    switchConfirm:   'Switch',
    switchCancel:    'Cancel',
    emptyTitle:      'Pick a course.',
    emptySub:        'Three minutes a morning. One lesson at a time.',
    activeHeader:    'Continue',
    enrolledHeader:  'Enrolled',
    completedHeader: 'Completed',
    availableHeader: 'Available',
  },

  active: {
    progressLabel:   (done: number, total: number) => `${done} of ${total} days`,
    takeawaysLabel:  'Takeaways so far',
    takeawayDate:    (n: number) => `Day ${n}`,
    switchCourse:    'switch course',
    nothingYet:      'No takeaways yet — finish today to start your collection.',
  },

  summary: {
    label:           'course complete',
    completedOn:     (date: string) => `Completed ${date}`,
    daysTotal:       (n: number) => `${n} days · ${n * 3} minutes`,
    journeyLabel:    'Your takeaways',
    addToLibrary:    'Add to library',
    chooseNext:      'Choose your next course',
  },
}
