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
  totalDays:   7,
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

    /* ============================ DAY 4 ============================ */
    {
      id:               'tech-market-d4',
      dayNumber:        4,
      title:            'What SaaS actually changed',
      hook:             'Why subscriptions beat shrinkwrap.',
      estimatedMinutes: 3,
      conceptTags:      ['saas', 'subscription', 'net-retention', 'land-and-expand'],
      body:
`Until the late 1990s, software was a product. You paid once for a copy on a disc, installed it on your machine, and lived with whatever bugs it shipped with until next year's release. The vendor sold a box; the customer owned a copy.

Software-as-a-Service flipped the deal. You don't own a copy. You log in to the vendor's running instance. They host it, fix it, ship features continuously. You pay an ongoing subscription — usually per user per month, billed annually — to keep the lights on.

For the buyer, that's a different bargain. Lower upfront cost. No IT install. New features arrive automatically. The operational headache moves to the vendor. But the spend never stops, switching costs accumulate as data and workflows pile up inside the product, and the vendor controls the roadmap.

For the vendor, the economics changed even more. Revenue is recurring rather than lumpy. R&D is funded by a smooth annual base of contracted dollars. Every new feature reaches every customer immediately, which means feedback loops are tighter and bad decisions hurt faster.

The single most important metric in a SaaS business is net dollar retention — what last year's customers spend this year, including upgrades and minus churn. A company with 110% net retention grows even if it never wins another logo. A company at 90% leaks faster than it can fill the tub.

For sellers this changes the shape of the job. Deals are smaller per transaction but compound. Renewal is the second sale; expansion is the third. "Land and expand" replaces "sell once". And customer success exists as a function because keeping a customer is usually worth more than winning a new one.`,
      takeaway:         'SaaS turned software from a one-time product sale into a relationship you renew every year.',
      questions: [
        {
          id:           'tech-market-d4-q1',
          prompt:       'What does SaaS fundamentally change versus the old "buy a CD" model?',
          options: [
            'Customers buy a perpetual licence and host it themselves',
            'Customers log in to the vendor’s instance and pay an ongoing subscription',
            'Customers pay a one-time fee with optional support contracts',
            'Customers receive a CD by post each month',
          ],
          correctIndex: 1,
          explanation:  'SaaS replaces buying a copy with logging into the vendor’s hosted instance and paying recurring fees while you use it.',
          difficulty:   'easy',
          conceptTags:  ['saas', 'subscription'],
        },
        {
          id:           'tech-market-d4-q2',
          prompt:       'Which metric matters most to a SaaS business?',
          options: [
            'Number of trial sign-ups per quarter',
            'Net dollar retention — what existing customers spend this year vs last',
            'Average website traffic',
            'Number of marketing emails sent',
          ],
          correctIndex: 1,
          explanation:  'Net dollar retention captures whether the existing customer base is growing or shrinking; above 100% means the company can grow on its installed base alone.',
          difficulty:   'medium',
          conceptTags:  ['net-retention'],
        },
        {
          id:           'tech-market-d4-q3',
          prompt:       'Why does "land and expand" describe modern SaaS selling?',
          options: [
            'The first deal is usually small; the value compounds through renewal and expansion',
            'Every customer pays the maximum on day one',
            'Vendors land in one country and expand globally',
            'Sales reps are required to physically expand the office for each deal',
          ],
          correctIndex: 0,
          explanation:  'Initial deals are smaller than legacy on-prem ones; the bulk of lifetime revenue comes from renewing and expanding the relationship over years.',
          difficulty:   'medium',
          conceptTags:  ['land-and-expand'],
        },
        {
          id:           'tech-market-d4-q4',
          prompt:       'Why do SaaS companies invest heavily in customer success even when it costs more than landing new deals?',
          options: [
            'Regulators require a customer success team',
            'It is a marketing channel for advertising new products',
            'Keeping an existing customer is usually worth more — through renewal and expansion — than winning a new one',
            'Customer success teams replace the engineering function',
          ],
          correctIndex: 2,
          explanation:  'Recurring revenue compounds: a saved or expanded customer pays year after year, which is typically more lucrative than the same dollars spent on new acquisition.',
          difficulty:   'hard',
          conceptTags:  ['net-retention', 'land-and-expand'],
        },
      ],
    },

    /* ============================ DAY 5 ============================ */
    {
      id:               'tech-market-d5',
      dayNumber:        5,
      title:            'The AI layer',
      hook:             'A new dependency, quietly inside every product that says "AI".',
      estimatedMinutes: 3,
      conceptTags:      ['foundation-models', 'tokens', 'ai-providers', 'unit-economics'],
      body:
`Between 2022 and 2024 a new layer of the stack formed. Foundation models — neural networks trained on enormous text, image, and audio corpuses, capable of general-purpose reasoning — became something you could call from any product over an API. Almost overnight, "AI features" stopped being R&D projects and started being a check-the-box capability you could ship in a sprint.

The providers are a small group. OpenAI (the GPT family). Anthropic (Claude). Google (Gemini). Meta (the open-weight Llama models). Specialists like Mistral and Cohere. Around them sits a layer of hosting and fine-tuning services — Together, Fireworks, Replicate, Bedrock, Vertex — that resell the same models with different operational guarantees.

For an application company, the foundation model is now a critical-path supplier — like AWS, but for intelligence. If your product's AI features stop working, your product stops working. That dependency is the same shape as cloud and behaves the same way: you have a contract, an SLA, a rate limit, and a bill.

Pricing is metered, like cloud. You're charged by tokens — the unit chunks of text the model reads and writes. Input tokens are cheap; output tokens are more expensive; long-context tokens are more expensive still. Costs per task drop steeply year over year as model efficiency improves; what cost a dollar in 2023 costs a few cents in 2026.

For sellers there are three questions worth asking of any "AI-powered" product. Which model is underneath. How reliable is the contract with that model provider. And what does the unit economics look like if customer usage grows 10×. Models can absorb your margin fast if customer queries get expensive and your pricing isn't tied to consumption.`,
      takeaway:         'Foundation models are a new dependency layer. Cheap, fast-improving, and quietly inside every product that says AI.',
      questions: [
        {
          id:           'tech-market-d5-q1',
          prompt:       'A "foundation model" is best described as:',
          options: [
            'A spreadsheet template for financial models',
            'A general-purpose neural network trained on huge data, called via API',
            'A regulatory framework for AI vendors',
            'A specific Microsoft Excel add-in',
          ],
          correctIndex: 1,
          explanation:  'Foundation models are large neural networks trained broadly enough to be useful across many tasks; applications consume them through APIs.',
          difficulty:   'easy',
          conceptTags:  ['foundation-models'],
        },
        {
          id:           'tech-market-d5-q2',
          prompt:       'How is access to a foundation model typically priced?',
          options: [
            'A flat per-month fee per developer',
            'Per-token — you pay for the chunks of text the model reads and writes',
            'Per-seat licence renewed annually',
            'A fixed price per trained model',
          ],
          correctIndex: 1,
          explanation:  'Foundation-model APIs are metered by tokens (input and output), the model’s unit of text. Costs scale with usage, like cloud.',
          difficulty:   'medium',
          conceptTags:  ['tokens'],
        },
        {
          id:           'tech-market-d5-q3',
          prompt:       'Why is the model provider effectively a critical-path supplier for an AI-powered product?',
          options: [
            'They distribute the product on their app store',
            'If their service stops working, the product’s AI features stop working',
            'They handle all of the customer’s legal contracts',
            'They print the company’s marketing materials',
          ],
          correctIndex: 1,
          explanation:  'AI features sit on top of a foundation model. Outages, rate limits, or pricing changes from the provider directly impact the application.',
          difficulty:   'medium',
          conceptTags:  ['ai-providers'],
        },
        {
          id:           'tech-market-d5-q4',
          prompt:       'A buyer asks: "What happens to your margin if my team uses your AI features 10× more next year?" What is the right shape of question they are pushing on?',
          options: [
            'Brand strategy and marketing spend',
            'Unit economics — whether your pricing scales with the model cost underneath',
            'Office location and hiring plans',
            'Tax structure',
          ],
          correctIndex: 1,
          explanation:  'They are probing whether your product’s pricing tracks consumption. If usage explodes and your contract is flat-fee, the model bill underneath can swallow your margin.',
          difficulty:   'hard',
          conceptTags:  ['unit-economics', 'tokens'],
        },
      ],
    },

    /* ============================ DAY 6 ============================ */
    {
      id:               'tech-market-d6',
      dayNumber:        6,
      title:            'Horizontal vs vertical software',
      hook:             'Two different bets on where your moat lives.',
      estimatedMinutes: 3,
      conceptTags:      ['horizontal', 'vertical', 'tam', 'moat'],
      body:
`Software businesses pick between two shapes. They can serve a single function across every industry (horizontal), or they can serve a single industry across all its functions (vertical). The choice shapes the company.

Horizontal players cover one job everyone has. Salesforce sells CRM to banks, biotech, retail, and manufacturing — every business that has customers. Workday handles HR for any company with employees. Slack runs the chat in any team. The total addressable market is enormous. The competition is fierce. The product can rarely afford to go deep on any one industry's quirks; it has to stay general enough to serve all of them.

Vertical players pick one industry and go deep. Veeva sells CRM, content management, and clinical trial software to life sciences companies. Toast sells point-of-sale and back-office software to restaurants. Procore covers project management for construction. Tyler Technologies sells software to local governments. The TAM is smaller, but the relationships are deeper, the switching costs are higher (because the product knows the customer's regulatory environment, jargon, edge cases), and the leader within a vertical often dominates it for a long time.

Each shape buys a different moat. Horizontal companies bet on scale: become the default everywhere, push the cost per customer down, win on platform economics. Vertical companies bet on depth: know the industry better than any horizontal generalist could, and use that knowledge to charge premium pricing and stay sticky.

For sellers, the shape changes how you talk. Horizontal pitches lean on logos across industries and the "general purpose" of the product. Vertical pitches lean on outcome-specific case studies, industry conferences, and the seller's own credibility within the niche. The most interesting in-between is a horizontal product with a vertical edition — Salesforce Health Cloud, Microsoft Cloud for Retail. They aim for both moats at once, with mixed results.`,
      takeaway:         'Horizontal goes wide for scale. Vertical goes deep for stickiness. Neither is better — they are different bets.',
      questions: [
        {
          id:           'tech-market-d6-q1',
          prompt:       'A vertical software company is best described as one that:',
          options: [
            'Sells the same generic product to every industry',
            'Goes deep on one industry, covering many of its functions',
            'Builds only mobile apps',
            'Operates only in a single country',
          ],
          correctIndex: 1,
          explanation:  'Vertical companies pick an industry and serve it deeply, often dominating their slice with high domain expertise and switching costs.',
          difficulty:   'easy',
          conceptTags:  ['vertical'],
        },
        {
          id:           'tech-market-d6-q2',
          prompt:       'Veeva (life sciences) and Toast (restaurants) are examples of:',
          options: ['Horizontal software', 'Vertical software', 'Hyperscalers', 'AI labs'],
          correctIndex: 1,
          explanation:  'Both pick a single industry and go deep on its specific functions and constraints — the textbook vertical play.',
          difficulty:   'medium',
          conceptTags:  ['vertical'],
        },
        {
          id:           'tech-market-d6-q3',
          prompt:       'What kind of moat do horizontal players typically chase?',
          options: [
            'Deep industry-specific expertise',
            'Scale and platform economics across many industries',
            'Government regulation in a single country',
            'Hardware patents',
          ],
          correctIndex: 1,
          explanation:  'Horizontal companies bet on becoming the default everywhere, driving cost per customer down through scale.',
          difficulty:   'medium',
          conceptTags:  ['horizontal', 'moat'],
        },
        {
          id:           'tech-market-d6-q4',
          prompt:       'A vertical-software competitor often beats a horizontal generalist within its industry by:',
          options: [
            'Charging less than the generalist on every line item',
            'Knowing the industry’s regulations, jargon, and edge cases better, then charging premium pricing for that knowledge',
            'Refusing to sell outside its country',
            'Outspending the generalist on television advertising',
          ],
          correctIndex: 1,
          explanation:  'Domain depth — workflows, terminology, regulatory specifics — is the vertical player’s moat. It supports premium pricing and sticky relationships.',
          difficulty:   'hard',
          conceptTags:  ['vertical', 'moat'],
        },
      ],
    },

    /* ============================ DAY 7 ============================ */
    {
      id:               'tech-market-d7',
      dayNumber:        7,
      title:            'How tech companies make money',
      hook:             'Five pricing shapes, and what each one rewards.',
      estimatedMinutes: 3,
      conceptTags:      ['pricing', 'per-seat', 'consumption', 'freemium', 'enterprise', 'take-rate'],
      body:
`Pricing is the deepest signal of what kind of business something is. Most modern tech companies use one or two of five shapes, and each shape pulls the company in a different direction.

Per-seat subscription. Salesforce, Workday, Microsoft 365. You pay a fixed price per user per month, billed annually. The model is predictable, scales cleanly with the customer's headcount, and rewards the vendor for getting more people inside the customer's organisation onto the product.

Consumption — also called usage-based. AWS, Snowflake, OpenAI, Twilio. You pay for what you use: compute hours, queries, tokens, messages. Revenue tracks customer activity, which means a customer's good year is automatically the vendor's good year. The downside: the bill is unpredictable, and procurement teams hate that.

Freemium with paid tiers. Slack, Notion, Figma, Loom. The product is free for individuals or small teams; paid plans unlock collaboration, admin controls, security and scale. The shape is designed to drive bottom-up adoption — the team adopts the product before IT or procurement gets involved, and the upgrade conversation happens once it is already entrenched.

Enterprise contracts. Often layered on top of one of the above for the largest customers. A multi-year, custom-negotiated commitment with discounts, volume tiers, and bespoke terms. The mark of "real" enterprise software: the price you pay isn't on the website; it is whatever the procurement team agreed.

Marketplace / take-rate. App stores, AWS Marketplace, Stripe, Shopify. The platform takes a cut of every transaction running through it — say 1% to 30% — rather than charging access. The platform's revenue grows with its customers' revenue.

Most modern companies blend two or three. Snowflake is consumption with annual commitments. Salesforce is per-seat with consumption-priced add-ons. Stripe is take-rate with subscription tiers on top. For sellers, the dominant shape tells you what behaviour the company is paid to produce — more seats, more queries, more transactions — and what the customer is going to be pushed on through the year.`,
      takeaway:         'Five pricing shapes. The dominant one tells you what behaviour the company is paid to produce.',
      questions: [
        {
          id:           'tech-market-d7-q1',
          prompt:       'Salesforce is primarily an example of which pricing shape?',
          options: [
            'Per-seat subscription',
            'Consumption / usage-based',
            'Marketplace / take-rate',
            'One-time perpetual licence',
          ],
          correctIndex: 0,
          explanation:  'Salesforce charges a fixed price per user per month, billed annually — the canonical per-seat SaaS model.',
          difficulty:   'easy',
          conceptTags:  ['per-seat'],
        },
        {
          id:           'tech-market-d7-q2',
          prompt:       'Which is most characteristic of a consumption-priced business like Snowflake or AWS?',
          options: [
            'Predictable monthly bill regardless of activity',
            'Revenue tracks customer activity — busy customers cost more, quiet ones cost less',
            'Unlimited free usage with no upsell path',
            'A one-time perpetual licence with no renewal',
          ],
          correctIndex: 1,
          explanation:  'Consumption-priced products bill against actual usage — compute, storage, queries — so revenue rises and falls with the customer’s activity.',
          difficulty:   'medium',
          conceptTags:  ['consumption'],
        },
        {
          id:           'tech-market-d7-q3',
          prompt:       'Why does freemium suit a bottom-up adoption motion?',
          options: [
            'Free users have no influence inside their organisations',
            'It lets a team adopt the product before IT or procurement gets involved, then negotiates the paid upgrade once entrenched',
            'It is cheaper for the vendor than running a sales team',
            'Regulators require some products to be free',
          ],
          correctIndex: 1,
          explanation:  'Freemium gets the product into the team’s daily workflow first; the paid conversion happens once switching costs and habits make the upgrade an easy yes.',
          difficulty:   'medium',
          conceptTags:  ['freemium'],
        },
        {
          id:           'tech-market-d7-q4',
          prompt:       'For a seller, why does the dominant pricing shape matter beyond the contract itself?',
          options: [
            'It changes the colour of the invoice',
            'It tells you what behaviour the company is paid to drive — more seats, more queries, more transactions — and shapes how the customer will be pushed throughout the contract',
            'It determines the legal jurisdiction of the deal',
            'It controls how often the website is updated',
          ],
          correctIndex: 1,
          explanation:  'Pricing shape is the company’s incentive structure. It dictates which expansion levers the sales and product teams will lean on, and what the customer should expect over the contract life.',
          difficulty:   'hard',
          conceptTags:  ['pricing'],
        },
      ],
    },

  ],
}
