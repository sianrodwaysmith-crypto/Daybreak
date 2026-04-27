/**
 * All user-facing strings for the House drawer.
 */

export const copy = {
  back:    '← library',
  add:     '+ add',
  title:   'House',
  tagline: 'Things the house needs.',

  meta: {
    open: (n: number) => n === 1 ? '1 open' : `${n} open`,
    done: (n: number) => n === 1 ? '1 done' : `${n} done`,
  },

  empty: {
    todo: 'Nothing on the list. Tap + add when something comes up.',
    done: 'Nothing finished yet.',
  },

  doneSectionLabel: 'done',
  showDone: (n: number) => n === 1 ? 'show 1 done' : `show ${n} done`,
  hideDone: 'hide done',

  newTitle:   'New task',
  editTitle:  'Edit task',

  fields: {
    titleLabel:   'What needs doing',
    titlePh:      'Fix the kitchen tap…',
    noteLabel:    'Notes',
    notePh:       'Anything to remember about it.',
  },

  actions: {
    save:        'Save',
    cancel:      'cancel',
    markDone:    '✓ mark as done',
    reopen:      'reopen',
    delete:      'delete',
  },
}
