/**
 * Player profiles for the Tech Market drawer. Pure reference data;
 * additions land here as new objects in the array.
 *
 * Profiles are progressively filled in across chunks: scaffold ships
 * with only oneLiner + category; the prose fields land in subsequent
 * commits. Empty strings render as a "Coming soon." beat in the UI.
 */

import type { PlayerProfile } from './types'

export const PLAYERS: PlayerProfile[] = [
  {
    id:        'aws',
    name:      'Amazon Web Services',
    shortName: 'AWS',
    category:  'hyperscaler',
    oneLiner:  'The cloud platform that started the cloud era.',
    snapshot:    '',
    position:    '',
    keyProducts: '',
    competitors: '',
    recentMoves: '',
  },
  {
    id:        'microsoft',
    name:      'Microsoft',
    shortName: 'Microsoft',
    category:  'hyperscaler',
    oneLiner:  'The enterprise incumbent that came back via Azure and OpenAI.',
    snapshot:    '',
    position:    '',
    keyProducts: '',
    competitors: '',
    recentMoves: '',
  },
  {
    id:        'google',
    name:      'Google (Alphabet)',
    shortName: 'Google',
    category:  'hyperscaler',
    oneLiner:  'The research powerhouse with Gemini, GCP, and a profitable ad business funding it all.',
    snapshot:    '',
    position:    '',
    keyProducts: '',
    competitors: '',
    recentMoves: '',
  },
  {
    id:        'anthropic',
    name:      'Anthropic',
    shortName: 'Anthropic',
    category:  'ai-lab',
    oneLiner:  'The AI safety company building Claude.',
    snapshot:    '',
    position:    '',
    keyProducts: '',
    competitors: '',
    recentMoves: '',
  },
  {
    id:        'salesforce',
    name:      'Salesforce',
    shortName: 'Salesforce',
    category:  'application-platform',
    oneLiner:  'The CRM platform building agentic AI on top of customer data.',
    snapshot:    '',
    position:    '',
    keyProducts: '',
    competitors: '',
    recentMoves: '',
  },
]
