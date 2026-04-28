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
    snapshot:
`Founded 2006 inside Amazon. Now Amazon's most profitable segment, on a roughly $100bn annual revenue run rate, and the market leader in public cloud infrastructure with around 30% global share. Operates dozens of regions worldwide.`,
    position:
`AWS started the cloud era in 2006 when Amazon, having built out enormous internal infrastructure to run its retail business, decided to rent it out by the hour. That insight — that compute and storage could be commoditised and sold like electricity — shaped the entire industry that followed.

Today AWS is the default choice for enterprises starting from scratch and the largest provider in absolute terms. Its position rests on a combination of breadth (over 200 services), maturity (longest operational track record), and a developer ecosystem more than a decade ahead of most rivals.

The structural advantage is depth, not novelty. AWS rarely ships first; it ships at scale. By the time a technology category is mature, AWS usually has the deepest version of it.`,
    keyProducts:
`At the bottom of the stack are EC2 (rentable virtual servers), S3 (object storage — the original AWS service), and a sprawling family of databases including RDS, DynamoDB, Aurora and Redshift. Above those sit serverless (Lambda) and managed services for almost any workload an engineer might want.

AWS has invested heavily in custom silicon: Graviton ARM CPUs for general workloads, Trainium and Inferentia chips for AI training and inference. The aim is to lessen reliance on Nvidia GPUs and improve unit economics on the AI workloads now dominating the industry.

Its AI strategy centres on Bedrock — a hosted-model service running Anthropic's Claude alongside Amazon's own models and several open-weight ones — and Q, an enterprise AI assistant for developers and business users. The depth and breadth here is the moat.`,
    competitors:
`AWS's principal rivals are Microsoft Azure (number two by revenue, growing fastest) and Google Cloud (number three, the AI-native challenger). Azure benefits from deep enterprise relationships and the Microsoft 365 / OpenAI bundle; GCP punches above its weight on AI and data.

Below the big three are smaller providers — Oracle, IBM, regional and sovereign clouds — that compete on price or data residency for specific workloads. Above them, AI labs and SaaS platforms increasingly resell services that incidentally run on cloud infrastructure, blurring exactly where AWS ends.`,
    recentMoves:
`AWS's biggest strategic move of recent years is its multi-billion-dollar partnership with Anthropic. As of late 2024 Amazon had invested around $8bn in Anthropic, with Claude available primarily through Bedrock, and Anthropic using AWS Trainium chips for training. The deal answers Microsoft's OpenAI bet with the same shape: a hyperscaler underwriting the leading AI lab in exchange for being the home cloud.

Beyond AI, AWS continues to push custom silicon, expand into sovereign cloud regions for governments and regulated industries, and roll Q-branded AI agents into its developer and enterprise tooling. The strategic question Amazon is answering with all of this is whether AWS can stay the default cloud through the AI transition.`,
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
