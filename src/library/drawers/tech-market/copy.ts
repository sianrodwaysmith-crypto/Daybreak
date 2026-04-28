/**
 * All user-facing strings for the Tech Market drawer.
 */

export const copy = {
  back:      '← library',
  title:     'Tech market',
  tagline:   'How the cloud, AI, and software stack actually fits together.',
  intro:     'A reference of the major players: who they are, where they sit in the architecture, who they compete with, and what they are doing now.',

  sections: {
    architecture:  'Architecture',
    players:       'Players',
    landscape:     'Competitive landscape',
  },

  categoryLabel: {
    'hyperscaler':           'Hyperscaler',
    'ai-lab':                'AI lab',
    'application-platform':  'Application platform',
  },

  profile: {
    snapshot:     'Snapshot',
    position:     'Market position',
    keyProducts:  'Key products',
    competitors:  'Competitors and overlap',
    recentMoves:  'Recent moves',
  },

  meta: (n: number) => n === 1 ? '1 player' : `${n} players`,
}
