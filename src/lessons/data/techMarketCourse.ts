import type { Course } from '../types'

/* ====================================================================
   The 'Selling in the Tech Market' course.
   A 14-day primer for someone new to selling software or tech: the
   shape of the industry, who the players are, how money flows, and
   what to listen for in a sales motion.

   Authored in chunks. This first ship covers Days 1-3 with totalDays
   set to 3 so the in-app progress reads honestly. Subsequent commits
   add days 4-7, 8-11, 12-14 and bump totalDays each time.

   Diagrams land on Days 2 (the stack), 8 (the buyers), and 13 (value
   flow). Original prose summarising publicly known industry concepts.
==================================================================== */

export const TECH_MARKET_COURSE: Course = {
  id:          'tech-market-sales',
  title:       'Selling in the Tech Market',
  description: 'A guided primer for someone new to selling software or tech. The shape of the industry, the players, how money flows, what to listen for in a sales motion.',
  totalDays:   3,
  authoredAt:  '2026-05-01',
  lessons: [

    /* ============================ DAY 1 ============================ */
    {
      id:               'tech-market-d1',
      dayNumber:        1,
      title:            'What "tech" means today',
      hook:             'Software, cloud, AI — three different businesses.',
      estimatedMinutes: 3,
      conceptTags:      ['software', 'cloud-rented', 'ai-layer'],
      body:
`"Tech" used to mean computers and the things you ran on them. Today the word covers a much wider sprawl, and it's worth pulling apart into the three things people usually mean when they say it.

The first is software. Programs that do something — a CRM, a spreadsheet, a billing engine, a Slack channel. Historically you bought a CD and installed it on your machine. Today almost all of it lives in a browser and you log in instead. Software is what an end user actually opens.

The second is cloud. Rented infrastructure — the compute, the storage, the network, the GPUs — by the hour, by the gigabyte, by the second. AWS, Azure, GCP. Cloud is what the software is running on, somewhere far away from the person using it. The cloud business is metered and consumption-based: you pay for what you use.

The third is AI. Models trained on huge quantities of data, exposed as APIs other products call into, or embedded directly into apps. OpenAI, Anthropic, Google's Gemini, Meta's open Llamas. AI is the newest layer and the one reshaping the other two fastest.

A modern tech company is usually a stack of all three. Salesforce is software. It runs on cloud — some on its own infrastructure, plenty on AWS. Its newer features sit on top of foundation models. Spotting which layer a product mostly lives in tells you almost everything that follows: who buys it, how the contract is shaped, and which other vendors are real competition.

The point of this lesson isn't memorising a definition. It's a habit. When you meet a new product, first ask: which layer is this?`,
      takeaway:         'Three layers — software, cloud, AI. Knowing which one a product is tells you almost everything else.',
      questions: [
        {
          id:           'tech-market-d1-q1',
          prompt:       'Which three things do people loosely lump together as "tech"?',
          options: [
            'Hardware, manufacturing, and retail',
            'Software, cloud, and AI',
            'Telecoms, broadcasting, and devices',
            'Consumer apps, gaming, and social media',
          ],
          correctIndex: 1,
          explanation:  'Modern tech is dominated by three layers — the software people open, the cloud it runs on, and the AI increasingly woven into both.',
          difficulty:   'easy',
          conceptTags:  ['software', 'cloud-rented', 'ai-layer'],
        },
        {
          id:           'tech-market-d1-q2',
          prompt:       'Salesforce is best understood as which of these?',
          options: [
            'A cloud infrastructure provider',
            'A software product, running on cloud, with AI features layered in',
            'A foundation-model lab',
            'A consumer device maker',
          ],
          correctIndex: 1,
          explanation:  'Salesforce is application software at its core; it consumes cloud underneath and is adding AI on top, but the layer it sells from is software.',
          difficulty:   'medium',
          conceptTags:  ['software'],
        },
        {
          id:           'tech-market-d1-q3',
          prompt:       'Why does it matter which layer a product sits in?',
          options: [
            "It changes the colour of the company's branding",
            'It changes who buys, how they buy, and who the real competitors are',
            'Regulators only allow companies in one layer',
            "It determines how many founders the company can have",
          ],
          correctIndex: 1,
          explanation:  'Layer dictates the buyer, the contract shape, the pricing model, and the competitive set — it is the first thing a seller should figure out.',
          difficulty:   'medium',
          conceptTags:  ['software', 'cloud-rented'],
        },
        {
          id:           'tech-market-d1-q4',
          prompt:       'Which is most characteristic of cloud as a business?',
          options: [
            'Boxed product sold once with no ongoing fee',
            'Per-seat subscription billed annually',
            'Metered, consumption-based billing — pay for what you use',
            'Royalty-free open source distributed via app stores',
          ],
          correctIndex: 2,
          explanation:  'Cloud sells rented infrastructure on a meter — by the second on compute, by the gigabyte on storage. Consumption-based pricing is its defining shape.',
          difficulty:   'hard',
          conceptTags:  ['cloud-rented'],
        },
      ],
    },

    /* ============================ DAY 2 ============================ */
    {
      id:               'tech-market-d2',
      dayNumber:        2,
      title:            'The stack — infra, platform, app',
      hook:             'One picture you can sketch on a whiteboard.',
      estimatedMinutes: 3,
      conceptTags:      ['stack', 'infrastructure', 'platform', 'application'],
      body:
`Most tech products can be drawn as a stack of four layers. From bottom up: infrastructure, platform, application, end user.

Infrastructure is the metal. Datacentres, networking gear, racks of servers, the GPUs everyone is fighting over. The hyperscalers — AWS, Microsoft Azure, Google Cloud — own this layer in the western market. You don't usually buy it directly as an end customer; you rent it through the people building on top.

Platform sits above infrastructure. It's the set of building blocks that developers use so they don't have to think about the metal — managed databases (Snowflake, Databricks), AI APIs (OpenAI, Anthropic), identity (Auth0, Okta), observability (Datadog), payments (Stripe). Platform companies consume infrastructure underneath them and resell value-added services on top.

Application is what a business person actually opens to do their job. Salesforce, Workday, ServiceNow, Slack, Zoom, Notion. Apps consume platforms beneath them — every Salesforce login is also a Snowflake query, an Auth0 token, a CDN fetch.

End user is the human at the top. Sometimes the same person who signs the cheque, sometimes not. The buyer is rarely the user in enterprise; the user is rarely the buyer in consumer.

{{diagram:tech-stack}}

Each layer captures a different kind of margin and runs a different sales motion. Infra sells consumption, billed by the second. Platforms sell subscriptions with usage on top. Apps mostly sell per-seat subscriptions. Money flows up the stack — the user pays the app vendor, the app vendor pays the platform vendor, the platform vendor pays the hyperscaler. Cost and dependency flow down. Once you can place a product on this stack, you can guess most of the rest.`,
      takeaway:         'Every product sits on a layer. Money flows up; cost flows down.',
      diagrams: [
        {
          id:      'tech-stack',
          caption: 'Four layers, bottom up: infrastructure → platform → application → end user.',
          svg: `<svg viewBox="0 0 600 220" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g stroke-width="1">
    <rect x="60" y="20"  width="480" height="36" rx="4" />
    <rect x="60" y="68"  width="480" height="36" rx="4" />
    <rect x="60" y="116" width="480" height="36" rx="4" />
    <rect x="60" y="164" width="480" height="36" rx="4" />
  </g>
  <g font-size="11.5" fill="currentColor" stroke="none">
    <text x="300" y="42"  text-anchor="middle">End user — the human who actually opens it</text>
    <text x="300" y="90"  text-anchor="middle">Application — Salesforce, Workday, Slack, Notion</text>
    <text x="300" y="138" text-anchor="middle">Platform — Snowflake, OpenAI, Auth0, Datadog, Stripe</text>
    <text x="300" y="186" text-anchor="middle">Infrastructure — AWS, Azure, Google Cloud</text>
  </g>
  <g stroke-width="0.75" stroke-dasharray="2 3" opacity="0.6">
    <line x1="36" y1="200" x2="36" y2="20" />
    <polygon points="32,28 36,18 40,28" stroke="none" fill="currentColor" opacity="0.6" />
    <line x1="564" y1="20" x2="564" y2="200" />
    <polygon points="560,192 564,202 568,192" stroke="none" fill="currentColor" opacity="0.6" />
  </g>
  <g font-size="9.5" fill="currentColor" stroke="none" opacity="0.7">
    <text x="36" y="14"  text-anchor="middle">$</text>
    <text x="564" y="14" text-anchor="middle">cost</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'tech-market-d2-q1',
          prompt:       'In the tech stack, which layer is the metal — datacentres, servers, GPUs?',
          options: ['Application', 'Platform', 'Infrastructure', 'End user'],
          correctIndex: 2,
          explanation:  'Infrastructure is the bottom layer — the physical compute, storage, and networking that everything else runs on.',
          difficulty:   'easy',
          conceptTags:  ['infrastructure'],
        },
        {
          id:           'tech-market-d2-q2',
          prompt:       'Snowflake, OpenAI, and Auth0 are best classified as what?',
          options: [
            'Infrastructure providers',
            'Platform companies',
            'End-user applications',
            'Hardware vendors',
          ],
          correctIndex: 1,
          explanation:  'They sell building blocks (databases, AI APIs, identity) that other developers consume to build their own products. That is the platform layer.',
          difficulty:   'medium',
          conceptTags:  ['platform'],
        },
        {
          id:           'tech-market-d2-q3',
          prompt:       'How does money typically flow through the stack?',
          options: [
            'Down — infrastructure pays platforms which pay applications',
            'Up — the user pays the app vendor, who pays the platform, who pays the infra provider',
            'Sideways — every layer bills the end user directly',
            'It does not flow; each layer is paid by its government',
          ],
          correctIndex: 1,
          explanation:  'The end user pays the application vendor, which in turn pays its platform suppliers, which pay the hyperscaler underneath. Cost (and dependency) flows the other way.',
          difficulty:   'medium',
          conceptTags:  ['stack'],
        },
        {
          id:           'tech-market-d2-q4',
          prompt:       'Why is "which layer is this product on?" usually the first question to ask of a tech company?',
          options: [
            'It tells you how big the founders are',
            'It changes the buyer, the contract shape, the pricing motion, and the competitor set',
            'It is required by tax law in most countries',
            'Investors will not fund a company unless its layer is named in its pitch deck',
          ],
          correctIndex: 1,
          explanation:  'Layer is the most predictive single fact: it determines almost everything about how a product is bought, priced, and competed against.',
          difficulty:   'hard',
          conceptTags:  ['stack', 'application', 'platform', 'infrastructure'],
        },
      ],
    },

    /* ============================ DAY 3 ============================ */
    {
      id:               'tech-market-d3',
      dayNumber:        3,
      title:            'The hyperscalers',
      hook:             'AWS, Azure, GCP — and why they sit beneath everything.',
      estimatedMinutes: 3,
      conceptTags:      ['hyperscalers', 'aws', 'azure', 'gcp', 'marketplaces'],
      body:
`Three companies own the floor of the modern tech market: Amazon Web Services, Microsoft Azure, and Google Cloud Platform. Together they're called hyperscalers — the term is shorthand for "cloud providers operating at planetary scale", though in practice it just means these three.

They sell the same things in different brand wrappers. Compute by the second (CPU, GPU). Storage by the gigabyte. Networking, databases, queues, machine-learning services, every kind of glue. Pricing is usage-based, with discounts for customers who commit a year or three of spend up front. There is no boxed product. The contract is essentially "open the tap, see what flows".

Why this matters when you sell software: the hyperscaler is almost always already in the room. Any large enterprise you call on already has an AWS or Azure or GCP relationship — an account team, a security review process, a committed-spend deal. They want their software vendors to fit into that frame. Practically, that means selling through the hyperscaler's marketplace: AWS Marketplace, Azure Marketplace, GCP Marketplace. Buying through the marketplace draws down the customer's pre-committed cloud budget rather than opening a new line item, which is often the difference between yes and not-this-quarter.

Market shape is worth knowing. AWS has the largest share of pure-play cloud and the broadest service catalogue. Azure is second, growing fastest, and tightly bundled with the rest of Microsoft's enterprise estate (Active Directory, Office, GitHub) — which is why it shows up everywhere there's already a Microsoft contract. GCP is third, smaller, with strong differentiation in data analytics and AI.

None of the three is going away. None is winning a winner-takes-all race. Plan for a multi-cloud world.`,
      takeaway:         'AWS, Azure, GCP. Always in the room. Always on the bill. Sell through their marketplaces.',
      questions: [
        {
          id:           'tech-market-d3-q1',
          prompt:       'Which three companies are referred to as the hyperscalers?',
          options: [
            'IBM, Oracle, SAP',
            'AWS, Azure, GCP',
            'Salesforce, Workday, ServiceNow',
            'Apple, Google, Meta',
          ],
          correctIndex: 1,
          explanation:  'In the western market, "hyperscaler" almost always refers to Amazon Web Services, Microsoft Azure, and Google Cloud Platform — the three planet-scale cloud infrastructure providers.',
          difficulty:   'easy',
          conceptTags:  ['hyperscalers'],
        },
        {
          id:           'tech-market-d3-q2',
          prompt:       'How do hyperscalers typically charge?',
          options: [
            'A flat annual fee per company',
            'Usage-based — by the second on compute, by the gigabyte on storage — with optional commitment discounts',
            'Per-seat licences renewed yearly',
            'A revenue share on the customer’s sales',
          ],
          correctIndex: 1,
          explanation:  'Hyperscaler pricing is metered consumption with the option to pre-commit a year or more of spend in exchange for a discount.',
          difficulty:   'medium',
          conceptTags:  ['hyperscalers', 'cloud-rented'],
        },
        {
          id:           'tech-market-d3-q3',
          prompt:       'Why do enterprise software sellers care about hyperscaler marketplaces?',
          options: [
            'Listing on a marketplace doubles a vendor’s revenue automatically',
            'Marketplace purchases draw down the customer’s pre-committed cloud budget instead of opening a new line item',
            'Marketplaces are the only legal way to sell software in some countries',
            'Hyperscalers ban direct sales to their customers',
          ],
          correctIndex: 1,
          explanation:  'Selling through the marketplace lets the customer apply existing committed cloud spend to your invoice, which often unblocks deals that would otherwise need fresh procurement approval.',
          difficulty:   'hard',
          conceptTags:  ['marketplaces'],
        },
        {
          id:           'tech-market-d3-q4',
          prompt:       'What is most accurate about hyperscaler market share today?',
          options: [
            'AWS is winning a winner-takes-all race; Azure and GCP are fading',
            'Each is roughly equal in share and price',
            'AWS leads in pure-play share, Azure is second and growing fastest off Microsoft’s enterprise base, GCP is third and smaller but strong in data and AI',
            'Microsoft and Google are merging their cloud businesses',
          ],
          correctIndex: 2,
          explanation:  'Pure-play share leads with AWS; Azure rides Microsoft’s enterprise relationships; GCP is third with data and AI as differentiators. Plan for a multi-cloud world rather than a single winner.',
          difficulty:   'medium',
          conceptTags:  ['aws', 'azure', 'gcp'],
        },
      ],
    },

  ],
}
