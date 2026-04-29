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
    snapshot:
`Founded 1975. Today one of the world's most valuable companies. The business stretches across operating systems (Windows), productivity (Microsoft 365), developer tooling (GitHub), professional networks (LinkedIn), gaming (Xbox), and cloud (Azure). Azure is the second-largest public cloud globally and Microsoft's fastest-growing line. CEO Satya Nadella has led the firm since 2014.`,
    position:
`For most of its history Microsoft was a software company that sold to enterprises through licensing. Windows on every PC. Office on every desk. Contracts with every IT department. The Nadella era pivoted that base into the cloud — Azure leveraged decades of enterprise sales relationships into a credible number-two hyperscaler in well under a decade.

Today Microsoft's strategic position rests on three pillars: the enterprise installed base (Windows, Active Directory, SQL Server, and the surrounding stack), the productivity suite (rebadged as Microsoft 365), and Azure as the cloud underneath both.

The company's distinctive move is bundling. New AI capabilities tend to arrive as Copilot features inside products customers already buy, adding utility without new procurement cycles. That is a structural advantage no AI lab or pure-cloud rival has.`,
    keyProducts:
`Azure offers the same breadth as AWS — compute, storage, databases, AI services — with deeper hooks into Microsoft's enterprise stack. Microsoft 365 (Office, Teams, Outlook, and Copilot uplifts) is the productivity engine. Dynamics 365 covers CRM and ERP; Power Platform handles low-code, RPA, and business apps.

GitHub, owned since 2018, has become a critical piece of the developer story; GitHub Copilot was the first widely-deployed coding assistant and remains the most-used. Underneath everything sits a vast investment in AI infrastructure, including custom silicon (Maia and Cobalt chips) and the OpenAI partnership.`,
    competitors:
`AWS is the principal cloud rival; Google Cloud the third. In productivity and CRM, Microsoft competes head-on with Google Workspace and Salesforce. In developer tooling, GitHub faces GitLab and a growing crop of AI-native coding assistants.

The OpenAI partnership has put Microsoft in unusually direct competition with Anthropic and Google's foundation models — and, increasingly, with OpenAI itself as the two firms expand into adjacent agent and product surfaces.`,
    recentMoves:
`Microsoft has invested over $13bn in OpenAI through staged commitments, with Azure as OpenAI's primary cloud. The Copilot brand has been rolled out across nearly every product line. The Activision Blizzard acquisition (closed 2023) extended the gaming franchise.

More recently, Microsoft has been investing in its own foundation-model capability via the Phi series of smaller models and through senior research hires — signalling a less exclusive dependence on OpenAI than the original deal implied.`,
  },
  {
    id:        'google',
    name:      'Google (Alphabet)',
    shortName: 'Google',
    category:  'hyperscaler',
    oneLiner:  'The research powerhouse with Gemini, GCP, and a profitable ad business funding it all.',
    snapshot:
`Founded 1998. Now part of Alphabet, with a market cap among the world's largest. The cash engine is advertising — Search and YouTube — funding everything else. Google Cloud (GCP) is the third-largest hyperscaler. Google DeepMind is its consolidated AI research and product organisation, with the Gemini family of foundation models at the centre. CEO Sundar Pichai has run the firm since 2015.`,
    position:
`Google is the only company with a credible presence at every layer of the AI stack at once: custom silicon (TPU), data centres, foundation models (Gemini, via DeepMind), and consumer-scale applications (Search, YouTube, Workspace, Android). That vertical integration is the strategic story.

The cloud business has been a longer story than rivals would like. Google Cloud was late, lost early enterprise deals, and spent years catching up on the fundamentals (sales coverage, support, regional presence). It has now reached genuine scale and grows fast, but remains third by some distance behind AWS and Azure.

Where Google does lead is research and AI-native data products. The original transformer paper came out of Google, as did much of the work that powers everyone's foundation models today.`,
    keyProducts:
`At the consumer layer: Search, YouTube, Maps, Android, and Chrome — every one of which is a top-tier global product with billions of users. Google Workspace (Gmail, Docs, Drive, Meet) competes head-on with Microsoft 365 in productivity.

GCP runs the same shape of infrastructure as AWS and Azure but with deeper AI tooling, BigQuery as a stand-out data warehouse, and a different network architecture. Custom TPU chips power Google's own training and are increasingly available to GCP customers.

Gemini is the consumer-and-enterprise face of Google's AI work — the model family, the Gemini app, and the integrations into Workspace and Search. Google DeepMind also continues fundamental research that occasionally produces step-changes (AlphaFold, for example).`,
    competitors:
`In cloud, AWS and Azure. In productivity, Microsoft. In foundation models, OpenAI and Anthropic — both of whom Google partly funds (Anthropic) or competes directly with on a similar surface area. In search, AI-native rivals like Perplexity and ChatGPT-as-search are an emerging threat to the cash engine.

The more uncomfortable competitive position is that Google's distribution advantages (Search, Android, Chrome) are exactly the surfaces a more capable AI assistant could disrupt. Defending those surfaces while integrating Gemini into them is the strategic balancing act of the next few years.`,
    recentMoves:
`The 2023 consolidation of Google Brain and DeepMind into a single Google DeepMind organisation centralised AI research under one leadership. The Gemini model family has been rolled out across Workspace (Gemini Side Panel, Help me write, etc.), Search (AI Overviews), and the standalone Gemini app. TPU generations continue to ship roughly annually.

Google has also taken a meaningful stake in Anthropic — both as a strategic investor and as a cloud partner where Claude runs on GCP infrastructure. The dual relationship (compete with Anthropic via Gemini, partner with them via cloud) mirrors what Microsoft and AWS have done at their respective AI labs.`,
  },
  {
    id:        'anthropic',
    name:      'Anthropic',
    shortName: 'Anthropic',
    category:  'ai-lab',
    oneLiner:  'The AI safety company building Claude.',
    snapshot:
`Founded 2021 in San Francisco. A public-benefit corporation that frames its mission around AI safety research as well as commercial product. Best known for Claude, a family of large language models, and for foundational research on alignment, interpretability, and responsible scaling. Backed by Google and Amazon among others. Co-founded by Dario and Daniela Amodei alongside other ex-OpenAI researchers.`,
    position:
`Anthropic sits at the AI lab layer of the stack — building foundation models, packaging them as APIs, and researching the techniques to keep increasingly capable systems aligned with human intent. The strategic position is unusual: a relatively small organisation producing models that compete head-to-head with the much larger OpenAI and Google.

The company's distinctive stance is on safety. Frontier model releases are tied to a Responsible Scaling Policy that imposes capability-based safeguards. Research on interpretability, constitutional AI, and red-teaming is published rather than kept proprietary. The bet is that safety work and commercial success reinforce each other: a model that is harder to misuse and easier to predict is also more useful to deploy.

Compared with OpenAI's consumer-first arc, Anthropic has leaned toward enterprise and developer surfaces — Claude as a coding assistant, an analyst, a customer-facing agent.`,
    keyProducts:
`Claude is the main product family. The flagship Claude Sonnet and Claude Opus models are general-purpose; Claude Haiku is the smaller, faster, cheaper sibling. They are accessible directly via the Anthropic API, through Amazon Bedrock, and via Google Cloud Vertex AI.

Claude Code is the developer-tool branch — a CLI agent and IDE integrations that turn Claude into a coding partner inside a real codebase. Claude.ai is the consumer-facing chat product. The Claude Agent SDK lets developers build custom agents on the same primitives.

Across all of these, distinctive technical work shows up in features like prompt caching, extended thinking, tool use, computer use, and the structured "agentic" patterns Anthropic has helped popularise.`,
    competitors:
`OpenAI is the principal direct rival on foundation models and developer APIs. Google DeepMind via Gemini is the other; Meta and Mistral compete on the open-weight side; xAI is a newer commercial entrant.

The relationships with hyperscalers are a competitive landscape unto themselves. AWS and Google are both significant investors in Anthropic and both run Claude on their clouds — while also competing with Anthropic via their own first-party models. The same model is partner, customer, and competitor depending on the surface.

Application platforms (Salesforce, Notion, Slack and many others) increasingly embed Claude alongside other models, treating foundation models as a commodity layer they shop across.`,
    recentMoves:
`Amazon's Anthropic investment reached around $8bn by late 2024, with Claude available primarily through Bedrock and Anthropic using AWS Trainium for training. Google has a separate stake and a separate cloud partnership.

Recent product themes include Claude with extended thinking and computer use, Claude Code as a coding-agent surface, and continued releases in the Sonnet / Opus / Haiku family. Research releases on interpretability, on the responsible scaling policy, and on the practicalities of building agentic systems continue to appear in public.`,
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
