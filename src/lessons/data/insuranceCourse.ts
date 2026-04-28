import type { Course } from '../types'

/* ====================================================================
   The 'London Insurance Market' course.
   General-knowledge content about a well-documented public industry,
   written in plain language for someone with no prior background.
   Days 5-14 land in subsequent commits; the lessons array can grow
   in place.
==================================================================== */

export const INSURANCE_COURSE: Course = {
  id:          'insurance-london-market',
  title:       'The London Insurance Market',
  description: "A guided introduction to one of the world's oldest and most distinctive insurance ecosystems. No prior knowledge assumed.",
  totalDays:   14,
  authoredAt:  '2026-04-28',
  lessons: [
    {
      id:               'insurance-d1',
      dayNumber:        1,
      title:            'What is insurance, really?',
      hook:             'How insurance gets to the people who need it.',
      estimatedMinutes: 3,
      conceptTags:      ['risk-transfer', 'pooling', 'large-numbers'],
      body:
`Insurance, stripped to its essence, is a trade. You pay a small certain amount. In return, someone else carries a large uncertain amount on your behalf. The premium for your home insurance is a known cost. The fire that might destroy your kitchen is unknown — its timing, its scale, whether it'll happen at all. You hand the unknown to a counterparty, and you pay them for taking it.

The reason an insurance company can do this without going bankrupt is the law of large numbers. Any single house catching fire is unpredictable. But across a hundred thousand houses, the rate of fires per year is remarkably stable. Spread over enough policies, a small per-house premium adds up to enough money to pay for the fires that do happen, plus the cost of running the company.

This is called pooling. Each policyholder contributes a small share to a common pot. The unfortunate few who suffer a loss draw from the pot. The fortunate many fund it. The whole arrangement only works because individual outcomes are random but the aggregate is not.

Everything else in the industry — Lloyd's, brokers, treaties, slips, every term you'll meet over the next two weeks — is structure built on top of this one idea. Insurance is not a product. It is a quiet bargain about who carries what.`,
      takeaway:         'Insurance is a quiet bargain about who carries what.',
      questions: [
        {
          id:           'insurance-d1-q1',
          prompt:       'What is the core mechanism of insurance?',
          options: [
            'A lottery whose pot is paid out to one winner each year',
            'Risk transfer — paying a small certain amount so someone else carries a large uncertain one',
            'A savings account that pays interest after a fixed term',
            'A loyalty programme rewarding long-term customers',
          ],
          correctIndex: 1,
          explanation:  'Insurance is fundamentally a transfer: the insured pays a known premium and the insurer accepts an unknown loss in exchange.',
          difficulty:   'easy',
          conceptTags:  ['risk-transfer'],
        },
        {
          id:           'insurance-d1-q2',
          prompt:       'Why does the law of large numbers matter for insurers?',
          options: [
            'It predicts when a specific policyholder will claim',
            'It lets the average loss rate across many policies be modelled with confidence',
            'It forces insurers to grow above a regulatory threshold',
            'It determines the rate of premium tax',
          ],
          correctIndex: 1,
          explanation:  'Individual losses stay unpredictable, but the average across a large pool is stable enough to price against.',
          difficulty:   'medium',
          conceptTags:  ['large-numbers'],
        },
        {
          id:           'insurance-d1-q3',
          prompt:       'What does "pooling" mean in insurance?',
          options: [
            'Treating all policyholders as a single customer',
            'Combining premiums from many policyholders into a shared fund that pays the unlucky few',
            'Sharing every claim equally with a reinsurer',
            'Buying insurance in bulk through a broker',
          ],
          correctIndex: 1,
          explanation:  'Pooling means many small premiums fund the unlucky few who claim, with margin left over for the insurer to operate.',
          difficulty:   'medium',
          conceptTags:  ['pooling'],
        },
        {
          id:           'insurance-d1-q4',
          prompt:       'Even with a large pool, why can a single fire still be financially uncertain for an insurer?',
          options: [
            'The law of large numbers fails above a certain pool size',
            'Premiums are not paid until after a loss',
            'A single very large loss can exceed the premiums collected for that line',
            'Regulators forbid pools larger than 50,000 policies',
          ],
          correctIndex: 2,
          explanation:  'A single catastrophic loss can outpace the year’s premium intake, which is part of why reinsurance exists.',
          difficulty:   'hard',
          conceptTags:  ['pooling', 'risk-transfer'],
        },
      ],
    },

    {
      id:               'insurance-d2',
      dayNumber:        2,
      title:            'How insurance is sold',
      hook:             "What makes a risk a 'London market' risk.",
      estimatedMinutes: 3,
      conceptTags:      ['retail', 'commercial', 'specialty', 'distribution'],
      body:
`Most insurance you've encountered is retail. Motor, home, contents, life. These are standard products bought directly online or through a high-street broker. The premium is small per policy. The insurer makes its money by writing millions of them.

A second tier is commercial. A bakery insures its ovens against breakdown. A logistics firm insures its fleet. A landlord insures the building and its rental income. The underlying idea is the same as retail, but the policies are negotiated, not picked off a shelf. They're often arranged through commercial brokers who know which insurers will look at which kinds of business.

At the top of the pyramid is specialty. Marine cargo. Aviation hulls. Satellite launches. Cyber liability for a global bank. Political risk in a country where a regime might fall. These are specific, sometimes one-off risks where the premium is large, the wording bespoke, and the underwriter wants to look at the file in detail before saying yes. Specialty business is what flows through the London market.

The line between these tiers isn't the size of the customer. It's the standardness of the risk. A large company buys retail-style motor cover for its company cars and sees specialty underwriters for its director liability. The product, not the buyer, decides the channel.`,
      takeaway:         "The standardness of the risk, not the size of the buyer, decides where it gets sold.",
      questions: [
        {
          id:           'insurance-d2-q1',
          prompt:       'Most everyday personal insurance (motor, home) sits in which tier?',
          options: ['Retail', 'Commercial', 'Specialty', 'Reinsurance'],
          correctIndex: 0,
          explanation:  'Retail products are standardised, sold in volume, and bought directly or through high-street brokers.',
          difficulty:   'easy',
          conceptTags:  ['retail'],
        },
        {
          id:           'insurance-d2-q2',
          prompt:       'Where is a satellite launch most likely to be insured?',
          options: [
            'Through a personal-lines broker',
            'Through a commercial broker quoting retail carriers',
            'Through specialty markets, including London',
            'Direct from the satellite manufacturer',
          ],
          correctIndex: 2,
          explanation:  'Bespoke, large, international risks like satellite launches sit firmly in specialty markets.',
          difficulty:   'medium',
          conceptTags:  ['specialty'],
        },
        {
          id:           'insurance-d2-q3',
          prompt:       'What chiefly determines whether a risk goes to retail, commercial, or specialty?',
          options: [
            'The size of the customer',
            'How standard the risk is',
            'Whether the customer pays VAT',
            'The age of the insurer',
          ],
          correctIndex: 1,
          explanation:  'Standardised risks fit retail forms; unusual or bespoke ones flow to specialty regardless of customer size.',
          difficulty:   'medium',
          conceptTags:  ['distribution'],
        },
        {
          id:           'insurance-d2-q4',
          prompt:       'A FTSE 100 company\'s motor fleet is most likely written via…',
          options: [
            'Specialty markets, because the customer is large',
            'Reinsurance, because the fleet is national',
            'Retail-style commercial channels, because the underlying motor risk is standard',
            'A Lloyd\'s syndicate, because corporate work always goes there',
          ],
          correctIndex: 2,
          explanation:  'A large customer doesn’t make the risk specialty. Standard motor cover is standard motor cover.',
          difficulty:   'hard',
          conceptTags:  ['distribution'],
        },
      ],
    },

    {
      id:               'insurance-d3',
      dayNumber:        3,
      title:            "What makes a 'London market' risk",
      hook:             'The four kinds of player who actually run the place.',
      estimatedMinutes: 3,
      conceptTags:      ['london-market', 'specialty', 'capacity'],
      body:
`Some risks don't fit a standard form. They are too large for one insurer to carry alone, too unusual for a high-street underwriter to price, or they straddle countries and currencies. A satellite launch. The hull of a tanker. The construction of a refinery. A film production with stunts. A heavyweight fight with appearance fees. None of these are written from a brochure.

London became the home of these risks for historical reasons — proximity to global shipping, the rise of Lloyd's, English contract law — and stayed there because the market grew specialists in everything. The result is a city where, if you know how to navigate it, you can place almost any risk that exists.

The defining traits are size, complexity, and international reach. A London market risk usually involves multiple jurisdictions, often multiple currencies, and almost always more than one insurer carrying a piece. Premiums run from hundreds of thousands of pounds into the hundreds of millions. The wording is negotiated, not pre-printed.

London doesn't compete with retail markets. It exists for risks that retail won't touch. The skill of the place is saying yes to things no one else will price.`,
      takeaway:         "The London market exists for risks that retail markets won't price.",
      questions: [
        {
          id:           'insurance-d3-q1',
          prompt:       'Which of these is most likely a London market risk?',
          options: [
            "A first-time driver's car insurance",
            'Insurance for a North Sea oil platform under construction',
            "A homeowner's contents policy",
            "An employee's life cover",
          ],
          correctIndex: 1,
          explanation:  'Large, complex, international, bespoke risks are the London market’s home turf.',
          difficulty:   'easy',
          conceptTags:  ['london-market'],
        },
        {
          id:           'insurance-d3-q2',
          prompt:       'A defining trait of London market risks is that they…',
          options: [
            'Are always written by Lloyd\'s alone',
            'Sit on a single insurer\'s balance sheet',
            'Span multiple jurisdictions and often multiple currencies',
            'Use only English-language wording',
          ],
          correctIndex: 2,
          explanation:  'International scope is part of what pushes a risk into the London market in the first place.',
          difficulty:   'medium',
          conceptTags:  ['london-market'],
        },
        {
          id:           'insurance-d3-q3',
          prompt:       'Why did London specifically become the home of specialty risk?',
          options: [
            'Cheap office space attracted underwriters',
            'A combination of shipping history, the rise of Lloyd\'s, and English contract law',
            'A government subsidy in the 1980s',
            'It is the only city with insurance regulators',
          ],
          correctIndex: 1,
          explanation:  'The market grew up around the docks, around Lloyd\'s, and within a legal system that handles complex contracts well.',
          difficulty:   'medium',
          conceptTags:  ['london-market'],
        },
        {
          id:           'insurance-d3-q4',
          prompt:       'Why does a London market risk typically involve multiple insurers?',
          options: [
            'Regulation requires it',
            'A single insurer rarely has the appetite or capital to carry the whole limit alone',
            'Brokers are paid more if they involve more insurers',
            'Lloyd\'s mandates a minimum of three syndicates per risk',
          ],
          correctIndex: 1,
          explanation:  'For a 100m+ risk, no one insurer wants the whole loss, so the limit is split across many on a subscription basis.',
          difficulty:   'hard',
          conceptTags:  ['capacity'],
        },
      ],
    },

    {
      id:               'insurance-d4',
      dayNumber:        4,
      title:            'The four types of player',
      hook:             'What Lloyd\'s of London actually is.',
      estimatedMinutes: 3,
      conceptTags:      ['insurer', 'reinsurer', 'broker', 'mga'],
      body:
`An insurer carries risk. They take in premiums, hold reserves against expected claims, and pay out when things go wrong. In London this might be a Lloyd's syndicate or a company-market insurer. Either way, their job is balancing the premium they collect against the losses they expect, with enough margin to absorb the year that's worse than expected.

A reinsurer is an insurer for insurers. When a primary insurer takes on more risk than they want to keep, they cede part of it to a reinsurer in exchange for part of the premium. Reinsurance is what keeps a single hurricane or a single big plant explosion from breaking a primary insurer's balance sheet.

A broker sits between the buyer and the market. They represent the client, not the insurer. They translate the buyer's risk into a form underwriters can quote, shop the risk to the right markets, negotiate the wording, and stand by the policy if a claim is disputed. The broker is paid a commission by the insurer but works for the insured — a peculiarity that takes some getting used to.

An MGA — managing general agent — is the newer one. An insurer delegates underwriting authority to a smaller, more specialised firm: write up to this much in this class, on our paper. MGAs let big insurers deploy capacity into niches without staffing them. Together these four are who you'll meet in every London transaction.`,
      takeaway:         'Four roles, one transaction: insurer, reinsurer, broker, MGA.',
      questions: [
        {
          id:           'insurance-d4-q1',
          prompt:       "A reinsurer's customer is…",
          options: [
            'The end policyholder',
            'A primary insurer',
            'The broker who placed the original risk',
            'The regulator',
          ],
          correctIndex: 1,
          explanation:  'Reinsurance is insurance bought by insurers themselves, to lay off risk they can\'t comfortably hold.',
          difficulty:   'easy',
          conceptTags:  ['reinsurer'],
        },
        {
          id:           'insurance-d4-q2',
          prompt:       "In a London market deal, the broker's loyalty is owed to…",
          options: [
            'The insurer who pays their commission',
            'The insured client',
            'Lloyd\'s as the marketplace',
            'The reinsurer behind the primary',
          ],
          correctIndex: 1,
          explanation:  'Despite being paid by the insurer via commission, brokers act for the insured. This principal-agent split is fundamental.',
          difficulty:   'medium',
          conceptTags:  ['broker'],
        },
        {
          id:           'insurance-d4-q3',
          prompt:       'What is an MGA?',
          options: [
            'A government-mandated audit firm',
            'A specialty broker for marine risks only',
            'A firm with delegated underwriting authority on an insurer\'s paper',
            'A reinsurer that operates outside Lloyd\'s',
          ],
          correctIndex: 2,
          explanation:  'MGAs underwrite on behalf of an insurer up to agreed limits, letting carriers reach niches without building in-house teams.',
          difficulty:   'medium',
          conceptTags:  ['mga'],
        },
        {
          id:           'insurance-d4-q4',
          prompt:       'Why might a primary insurer choose to use a reinsurer rather than just write less business?',
          options: [
            'It frees up capital so they can keep writing in their target classes',
            'Regulators give a discount on premium tax',
            'Reinsurance is mandatory above a fixed turnover',
            'Reinsurers handle claims directly with the insured',
          ],
          correctIndex: 0,
          explanation:  'Ceding part of a portfolio releases capital and capacity that the insurer can then redeploy into more business.',
          difficulty:   'hard',
          conceptTags:  ['reinsurer', 'capacity'],
        },
      ],
    },

    {
      id:               'insurance-d5',
      dayNumber:        5,
      title:            "Lloyd's of London — what it actually is",
      hook:             "The other half of the London market: company-market insurers.",
      estimatedMinutes: 4,
      conceptTags:      ['lloyds', 'syndicates', 'capital'],
      body:
`Lloyd's is not an insurance company. That single fact, once it lands, makes everything else about it easier. Lloyd's is a marketplace — a building, an institution, a set of rules — but never a single carrier with one balance sheet. The risks placed there are written by syndicates that operate within it.

A syndicate is a pool of capital and underwriting expertise that comes together to write business at Lloyd's. Some are large and run by global insurers; some are small and specialised. Each is backed by capital providers — historically wealthy individuals known as Names, today mostly institutional and corporate members — and managed day-to-day by a managing agent.

{{diagram:lloyds-structure}}

Inside a syndicate, an underwriter is the person actually deciding which risks to take. Brokers walk into Lloyd's, sit down, present a risk, and the underwriter says yes, no, or yes-but-at-this-price. If they accept, they sign the slip for a portion of the risk. Other underwriters at other syndicates may sign for further portions until the slip is fully placed.

That's the architecture. Capital flows in from members, sits inside syndicates, gets deployed by underwriters, accessed via brokers, and bound onto risks. Lloyd's itself oversees the marketplace, sets the rules, and stands behind the whole thing as a chain of security. It's a marketplace, not a company.`,
      takeaway:         "Lloyd's is a marketplace, not a company.",
      diagrams: [
        {
          id:      'lloyds-structure',
          caption: 'Capital → syndicates → underwriters → brokers → risks.',
          svg: `<svg viewBox="0 0 600 250" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g stroke-width="1">
    <rect x="30" y="14" width="540" height="32" rx="4" />
    <rect x="90" y="64" width="420" height="32" rx="4" />
    <rect x="140" y="114" width="320" height="32" rx="4" />
    <rect x="180" y="164" width="240" height="32" rx="4" />
    <rect x="220" y="206" width="160" height="28" rx="4" />
  </g>
  <g stroke-width="0.75" stroke-dasharray="2 3" opacity="0.6">
    <line x1="300" y1="46" x2="300" y2="64" />
    <line x1="300" y1="96" x2="300" y2="114" />
    <line x1="300" y1="146" x2="300" y2="164" />
    <line x1="300" y1="196" x2="300" y2="206" />
  </g>
  <g font-size="11" fill="currentColor" stroke="none">
    <text x="300" y="34" text-anchor="middle">Capital providers (Names + corporate members)</text>
    <text x="300" y="84" text-anchor="middle">Syndicates, run by managing agents</text>
    <text x="300" y="134" text-anchor="middle">Underwriters write the business</text>
    <text x="300" y="184" text-anchor="middle">Brokers carry risks into the market</text>
    <text x="300" y="224" text-anchor="middle">Risks</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'insurance-d5-q1',
          prompt:       "Lloyd's of London is best described as…",
          options: [
            'A single insurance company',
            'A marketplace where syndicates write insurance',
            'A reinsurer of last resort owned by the UK government',
            'A regulator overseeing all UK insurance',
          ],
          correctIndex: 1,
          explanation:  "Lloyd's is the marketplace; the actual underwriting is done by the syndicates that operate within it.",
          difficulty:   'easy',
          conceptTags:  ['lloyds'],
        },
        {
          id:           'insurance-d5-q2',
          prompt:       "A Lloyd's syndicate is backed by…",
          options: [
            'A single multinational insurer',
            'Capital providers — Names and corporate members',
            'The Bank of England',
            'The PRA',
          ],
          correctIndex: 1,
          explanation:  'Capital comes from members — historically Names, now mostly corporate members — who fund the syndicate.',
          difficulty:   'medium',
          conceptTags:  ['syndicates', 'capital'],
        },
        {
          id:           'insurance-d5-q3',
          prompt:       "Who manages a syndicate's day-to-day operations?",
          options: [
            'The Council of Lloyd\'s directly',
            'A managing agent',
            'The lead broker',
            'The reinsurer behind the syndicate',
          ],
          correctIndex: 1,
          explanation:  'Each syndicate has a managing agent responsible for hiring underwriters and running the business.',
          difficulty:   'medium',
          conceptTags:  ['syndicates'],
        },
        {
          id:           'insurance-d5-q4',
          prompt:       "When a broker brings a risk to Lloyd's, why might multiple underwriters end up signing?",
          options: [
            'Lloyd\'s requires every risk to be signed by at least three syndicates',
            'It\'s a tradition rather than a rule',
            'A single syndicate may not want or have capacity for the whole risk; the slip is filled by subscription',
            'Each syndicate must approve the others\' line',
          ],
          correctIndex: 2,
          explanation:  'Subscription placement spreads each risk across many underwriters, each signing for a slice they\'re willing to carry.',
          difficulty:   'hard',
          conceptTags:  ['lloyds', 'capacity'],
        },
      ],
    },

    {
      id:               'insurance-d6',
      dayNumber:        6,
      title:            "The company market alongside Lloyd's",
      hook:             'How a 200m risk gets split across many insurers.',
      estimatedMinutes: 3,
      conceptTags:      ['company-market', 'iua'],
      body:
`Lloyd's is the famous half of the London market. The company market is the other half — and roughly the same size by premium. It's made up of international insurance companies that operate in London under their own balance sheets, rather than through Lloyd's syndicates.

These are firms recognisable in their own right — global names whose London offices write specialty business much the way Lloyd's syndicates do. Brokers walk in, underwriters quote, slips get signed, risks get split across multiple insurers. The mechanics on the day look very similar.

The company market has its own coordinating body — the International Underwriting Association of London, the IUA — which negotiates standards, lobbies regulators, and runs market infrastructure. Brokers often place a single risk across both Lloyd's and the company market on the same slip, picking up capacity wherever it sits.

For a buyer, the difference is mostly invisible. The slip looks the same. The wording can be the same. What differs is who's standing behind the policy: Lloyd's chain of security on one side, an individual insurer's balance sheet on the other. Both are how London says yes.`,
      takeaway:         'The company market is the other half of London. Same mechanics, different balance sheets.',
      questions: [
        {
          id:           'insurance-d6-q1',
          prompt:       'The London company market is best described as…',
          options: [
            'A second Lloyd\'s, owned by Lloyd\'s',
            'International insurers operating in London on their own balance sheets',
            'The reinsurance arm of Lloyd\'s',
            'A regional cluster of broker-only firms',
          ],
          correctIndex: 1,
          explanation:  'Company-market insurers underwrite as standalone firms in London, separate from but alongside Lloyd\'s.',
          difficulty:   'easy',
          conceptTags:  ['company-market'],
        },
        {
          id:           'insurance-d6-q2',
          prompt:       'The IUA is…',
          options: [
            'The lead insurer for IUA syndicates',
            'A category of risk written only in London',
            "The coordinating body for the London company market",
            "A regulator that supervises Lloyd's",
          ],
          correctIndex: 2,
          explanation:  'The International Underwriting Association coordinates standards and infrastructure for the company-market insurers.',
          difficulty:   'medium',
          conceptTags:  ['iua'],
        },
        {
          id:           'insurance-d6-q3',
          prompt:       "Why can a buyer often not tell whether a risk was placed at Lloyd's or in the company market?",
          options: [
            'Both markets share the same underwriters',
            'The slip and wording can look very similar; mechanics on the day are alike',
            'Brokers are required to keep the placement market secret',
            'Lloyd\'s and the company market issue identical paperwork by law',
          ],
          correctIndex: 1,
          explanation:  'The mechanics — slip, terms, signatures — are very alike, so the visible artefacts look the same to the buyer.',
          difficulty:   'medium',
          conceptTags:  ['company-market', 'lloyds'],
        },
        {
          id:           'insurance-d6-q4',
          prompt:       "What's the substantive difference between Lloyd's and the company market for the buyer?",
          options: [
            "Lloyd's only writes marine; the company market does everything else",
            "Lloyd's pays claims faster",
            "Who stands behind the policy if the underwriter fails — Lloyd's chain of security vs. the insurer's own balance sheet",
            "Wordings differ in legally binding ways",
          ],
          correctIndex: 2,
          explanation:  "The financial backstop differs: Lloyd's has its central fund and chain of security; a company-market insurer has only its own capital.",
          difficulty:   'hard',
          conceptTags:  ['company-market', 'lloyds'],
        },
      ],
    },

    {
      id:               'insurance-d7',
      dayNumber:        7,
      title:            'Subscription markets and lead/follow',
      hook:             'Insurance for insurers — and why it exists.',
      estimatedMinutes: 4,
      conceptTags:      ['subscription', 'lead-follow', 'capacity'],
      body:
`A 200 million pound risk doesn't go to one insurer. No single underwriter wants to carry the whole thing. Instead, the risk is built up to a 100% line from many smaller signings. This is a subscription market.

The first underwriter to sign is the lead. They negotiate the terms, set the price, and write the largest single line — perhaps 20-25% of the limit. Their signature is what the rest of the market reads. Following underwriters take smaller slices — 10%, 5%, 3% — at the same terms, until the broker has filled the slip to 100%.

{{diagram:subscription-bar}}

This is why you'll hear traders talk about lining the slip or filling the order. A risk that's 80% subscribed is exposed; the broker keeps walking the floor, finding another underwriter willing to take a 5% line, until they're complete. A heavily subscribed slip is a sign of a popular risk. An undersubscribed one suggests the market sees something the lead missed.

The genius of the subscription model is that it lets the market write very large risks without any single insurer carrying the whole loss. The penalty is coordination — every change in wording, every claim, has to flow back through the lead to the followers. The slip becomes the contract that holds them all together.`,
      takeaway:         'A subscription market lets many insurers write what no one of them could carry alone.',
      diagrams: [
        {
          id:      'subscription-bar',
          caption: 'A 100% line filled across many subscribers; lead sets the terms.',
          svg: `<svg viewBox="0 0 600 110" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g font-size="10" fill="currentColor" stroke="none">
    <text x="40" y="22">0%</text>
    <text x="560" y="22" text-anchor="end">100%</text>
  </g>
  <rect x="40" y="32" width="520" height="34" rx="4" stroke-width="1" />
  <g stroke-width="0.75" opacity="0.7">
    <line x1="170" y1="32" x2="170" y2="66" />
    <line x1="248" y1="32" x2="248" y2="66" />
    <line x1="313" y1="32" x2="313" y2="66" />
    <line x1="365" y1="32" x2="365" y2="66" />
    <line x1="412" y1="32" x2="412" y2="66" />
    <line x1="453" y1="32" x2="453" y2="66" />
    <line x1="490" y1="32" x2="490" y2="66" />
  </g>
  <g font-size="9.5" fill="currentColor" stroke="none">
    <text x="105" y="53" text-anchor="middle">Lead 25%</text>
    <text x="209" y="53" text-anchor="middle">15%</text>
    <text x="280" y="53" text-anchor="middle">12.5%</text>
    <text x="339" y="53" text-anchor="middle">10%</text>
    <text x="388" y="53" text-anchor="middle">9%</text>
    <text x="432" y="53" text-anchor="middle">8%</text>
    <text x="471" y="53" text-anchor="middle">7%</text>
    <text x="525" y="53" text-anchor="middle">13.5%</text>
  </g>
  <g font-size="10.5" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="92" text-anchor="middle">Lead sets the terms · followers accept at the same terms</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'insurance-d7-q1',
          prompt:       "Why doesn't a single insurer typically write a 200m risk on its own?",
          options: [
            'Lloyd\'s rules forbid it',
            'No single underwriter wants or has capacity for the whole loss',
            'Premium tax is higher on single-insurer slips',
            'Brokers refuse to place 100% with one carrier',
          ],
          correctIndex: 1,
          explanation:  'Capacity and risk appetite — no underwriter wants their book exposed to one giant single loss.',
          difficulty:   'easy',
          conceptTags:  ['capacity'],
        },
        {
          id:           'insurance-d7-q2',
          prompt:       "What is the lead insurer's role on a subscription slip?",
          options: [
            'They sign last, after the slip is full',
            'They negotiate the terms, set the price, and write the largest single line',
            'They guarantee payment by the followers',
            'They handle claims for the whole slip',
          ],
          correctIndex: 1,
          explanation:  'The lead does the heavy lifting on terms; the rest of the market then reads and follows.',
          difficulty:   'medium',
          conceptTags:  ['lead-follow'],
        },
        {
          id:           'insurance-d7-q3',
          prompt:       'Following underwriters accept the slip on…',
          options: [
            'Their own bespoke terms',
            'The same terms negotiated by the lead',
            'A standardised wording set by Lloyd\'s',
            'Whatever wording the broker prefers',
          ],
          correctIndex: 1,
          explanation:  'Followers accept the lead\'s terms in exchange for their slice of the premium and the loss.',
          difficulty:   'medium',
          conceptTags:  ['lead-follow'],
        },
        {
          id:           'insurance-d7-q4',
          prompt:       'What does an undersubscribed slip suggest?',
          options: [
            'Brokers are inexperienced',
            'The market sees something the lead has missed — pricing, wording, or risk profile',
            'The risk is too small to interest London',
            'Reinsurance is unavailable',
          ],
          correctIndex: 1,
          explanation:  'If followers won\'t fill the slip at the lead\'s terms, the market is sending a signal that the lead got it wrong.',
          difficulty:   'hard',
          conceptTags:  ['subscription'],
        },
      ],
    },
  ],
}
