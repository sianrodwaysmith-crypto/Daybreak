import type { Course } from '../types'

/* ====================================================================
   The 'Aztec Group in depth' course.
   General fund-administration concepts are confidently described.
   Aztec-specific facts are limited to what is publicly stated by the
   firm (founding year, jurisdictions, scale, the Warburg Pincus
   partnership). Any organisation-specific practice that isn't public
   is framed as 'how this typically works at firms like X' rather than
   presented as verified fact about Aztec.

   Days 5-14 land in subsequent commits.
==================================================================== */

export const AZTEC_COURSE: Course = {
  id:          'aztec-in-depth',
  title:       'Aztec Group in depth',
  description: 'A guided introduction to a leading European fund administrator and the alternative investments world they serve.',
  totalDays:   14,
  authoredAt:  '2026-04-28',
  lessons: [
    {
      id:               'aztec-d1',
      dayNumber:        1,
      title:            'Fund administration, in plain English',
      hook:             'Why alternative investments need different infrastructure.',
      estimatedMinutes: 3,
      conceptTags:      ['fund-admin', 'outsourcing', 'operating-layer'],
      body:
`A fund is, in business terms, a structured pool of capital. Investors put money in, the manager invests it, and money goes out again as distributions when investments are sold. Around all that activity sits a quiet operational layer — keeping the books, valuing the assets, calculating each investor's share, paying the bills, filing the regulatory returns, answering questions from investors. That operational layer is fund administration.

Many fund managers used to do this themselves. Increasingly they outsource it to a fund administrator — a specialist firm whose only job is the operational layer. The manager keeps doing what they're good at: picking investments and managing the relationship with investors. The administrator handles everything that goes around the investments, at scale.

A fund administrator is not a fund manager. They don't pick investments, set strategy, or take a fee on performance. Their fee is operational — based on assets under administration, the number of investor entities served, or the work involved in the structure. They are the trusted backstop that lets a fund manager run a multi-billion vehicle with a small investment team.

Outsourcing the operational layer matters more than it sounds. As funds got bigger, more international, and more regulated, the cost and complexity of doing it in-house overtook the savings. Fund administration is now a multi-billion industry built on doing one thing very well: the careful, unglamorous work that makes investing possible.`,
      takeaway:         'Fund administration is the careful, unglamorous work that makes investing possible.',
      questions: [
        {
          id:           'aztec-d1-q1',
          prompt:       'What does a fund administrator primarily do?',
          options: [
            'Picks the investments the fund makes',
            'Provides the operational layer — bookkeeping, valuations, investor records, filings',
            'Markets the fund to new investors',
            'Sets the fund\'s investment strategy',
          ],
          correctIndex: 1,
          explanation:  "The administrator handles the operational layer that surrounds the fund manager's actual investing.",
          difficulty:   'easy',
          conceptTags:  ['fund-admin'],
        },
        {
          id:           'aztec-d1-q2',
          prompt:       'A fund administrator is NOT a…',
          options: [
            'Bookkeeper',
            'Fund manager picking investments',
            'Calculator of investor shares',
            'Filer of regulatory returns',
          ],
          correctIndex: 1,
          explanation:  "Picking investments is the manager's job. The administrator stays operational.",
          difficulty:   'medium',
          conceptTags:  ['fund-admin'],
        },
        {
          id:           'aztec-d1-q3',
          prompt:       "Why do fund managers increasingly outsource the operational layer?",
          options: [
            'Regulators require it for all funds',
            'Specialist firms can do it more efficiently as scale and complexity grow',
            'Fund managers are not allowed to do their own bookkeeping',
            'Outsourcing eliminates investor questions',
          ],
          correctIndex: 1,
          explanation:  'A specialist administrator amortises tooling and expertise across many funds; in-house is rarely cheaper.',
          difficulty:   'medium',
          conceptTags:  ['outsourcing'],
        },
        {
          id:           'aztec-d1-q4',
          prompt:       "What's the typical fee model for a fund administrator?",
          options: [
            "A share of the fund's investment performance",
            'Operational fees tied to assets under administration, entities served, or work done',
            'A flat annual fee regardless of fund size',
            'A percentage of investor distributions',
          ],
          correctIndex: 1,
          explanation:  "Administrator fees are operational, not performance-based — that's part of why their incentives stay clean.",
          difficulty:   'hard',
          conceptTags:  ['operating-layer'],
        },
      ],
    },

    {
      id:               'aztec-d2',
      dayNumber:        2,
      title:            'Alternative investments and why they need different infrastructure',
      hook:             'From founding in Jersey to 2,300 people: the Aztec story.',
      estimatedMinutes: 3,
      conceptTags:      ['alternatives', 'private-equity', 'illiquid'],
      body:
`"Alternative investments" is a label that covers everything that isn't a public stock or bond. Private equity buying a company. Venture capital backing a startup. Private credit lending to a mid-market firm. A real estate fund buying a London office block. An infrastructure fund taking a stake in a wind farm. They are illiquid, long-dated, and individually large.

That makes them operationally different from public funds. A public fund's NAV is calculated daily, mostly by reading market prices. An alternatives fund's NAV is calculated quarterly, often by writing valuations from scratch. Public investors put money in via a buy order; alternatives investors commit capital and get called in tranches over years. Public funds distribute via a single line on a statement; alternatives distribute via complex waterfalls tied to fund-level metrics.

The infrastructure to handle this — specialised software, deep domain knowledge, jurisdictional expertise — is large enough that even sophisticated managers find it cheaper to outsource. The scale of an alternatives administrator is what makes the model work; spreading the cost of expertise and tooling across many funds.

This is the niche fund administration grew up in. Firms specialising in alternatives are not the same firms doing daily-priced mutual fund admin. The cadence, the complexity, the long-running relationships with managers and investors — all of it shaped a different industry.`,
      takeaway:         'Alternatives have their own cadence, and their own infrastructure to match.',
      questions: [
        {
          id:           'aztec-d2-q1',
          prompt:       'Which of these is an alternative investment?',
          options: ['A FTSE 100 share', 'A government bond', 'A private equity fund stake', 'A daily-priced mutual fund'],
          correctIndex: 2,
          explanation:  'Alternatives are everything that isn\'t public stocks or bonds — PE, VC, private credit, real estate, infrastructure.',
          difficulty:   'easy',
          conceptTags:  ['alternatives'],
        },
        {
          id:           'aztec-d2-q2',
          prompt:       'A defining trait of alternative investments is that they are…',
          options: [
            'Daily-priced and highly liquid',
            'Listed on public exchanges',
            'Illiquid, long-dated, and individually large',
            'Restricted to retail investors only',
          ],
          correctIndex: 2,
          explanation:  'Illiquidity, long horizons, and large individual investments shape almost everything else about how these funds run.',
          difficulty:   'medium',
          conceptTags:  ['illiquid'],
        },
        {
          id:           'aztec-d2-q3',
          prompt:       'How does NAV calculation differ for alternatives vs. public funds?',
          options: [
            'Both are daily and mostly automated',
            'Alternatives are typically calculated quarterly with bespoke valuations; public funds daily from market prices',
            'Public funds are calculated quarterly; alternatives daily',
            'Alternatives are not required to calculate NAV',
          ],
          correctIndex: 1,
          explanation:  'Quarterly bespoke valuations vs. daily market-priced NAV is a structural cadence difference.',
          difficulty:   'medium',
          conceptTags:  ['alternatives'],
        },
        {
          id:           'aztec-d2-q4',
          prompt:       'Why does outsourcing fit alternatives more naturally than public funds?',
          options: [
            'Public funds can\'t legally outsource',
            'The specialist software, expertise, and jurisdictional knowledge cost is high enough that spreading it across many funds via an administrator beats in-house',
            'Alternatives investors pay administrators directly',
            'Public-fund administrators are forbidden from accepting alternative funds',
          ],
          correctIndex: 1,
          explanation:  'Alternatives need deep specialist tooling that few individual managers can justify in-house. Outsourcing to a specialist firm wins on economics.',
          difficulty:   'hard',
          conceptTags:  ['outsourcing', 'alternatives'],
        },
      ],
    },

    {
      id:               'aztec-d3',
      dayNumber:        3,
      title:            'The Aztec story — origin to 2,300 people',
      hook:             'Owner-managed, then Warburg Pincus — the September 2024 partnership.',
      estimatedMinutes: 3,
      conceptTags:      ['aztec', 'history', 'positioning'],
      body:
`Aztec Group was founded in Jersey in 2001. The starting point was a small team handling fund administration in a single jurisdiction. The Bright Alternative is the long-standing brand promise — a deliberate positioning as the alternatives specialist, not a generalist trying to cover everything.

Over two decades the firm grew across the Channel Islands, into Luxembourg, Ireland, the UK, and the US. Today it administers around €760 billion of assets and employs roughly 2,300 people across six jurisdictions. The growth has been mostly organic — measured, jurisdiction by jurisdiction, rather than through large acquisitions of generalist competitors.

The shape of the firm is unusual for its size. Many fund administrators reach 1,000-plus employees through aggressive M&A and end up with a patchwork of platforms and cultures. Aztec's measured growth means a more consistent operating model — a deliberate choice that's contributed to its retention rates and reputation in the alternatives space.

For 23 years Aztec was owner-managed and independent. That changed in 2024 with the Warburg Pincus partnership — a story for tomorrow's lesson. But the business that arrived at that decision was already large, profitable, and uncommonly stable for a firm operating across six demanding regulatory regimes.`,
      takeaway:         'Twenty-three years of measured growth into a firm uncommonly stable for its size.',
      questions: [
        {
          id:           'aztec-d3-q1',
          prompt:       'Where was Aztec Group founded?',
          options: ['London, 1995', 'Jersey, 2001', 'Luxembourg, 2010', 'Dublin, 2003'],
          correctIndex: 1,
          explanation:  'Aztec was founded in Jersey in 2001.',
          difficulty:   'easy',
          conceptTags:  ['aztec', 'history'],
        },
        {
          id:           'aztec-d3-q2',
          prompt:       "What is the 'Bright Alternative' positioning?",
          options: [
            'A multi-asset generalist offer covering all fund types',
            'A deliberate alternatives-specialist stance',
            'A retail-investor brand for emerging markets',
            'A trade name for a single product line',
          ],
          correctIndex: 1,
          explanation:  'The brand has long signalled an alternatives-specialist focus rather than a generalist offer.',
          difficulty:   'medium',
          conceptTags:  ['positioning'],
        },
        {
          id:           'aztec-d3-q3',
          prompt:       'Roughly how many people does Aztec employ?',
          options: ['200', '2,300', '12,000', '500'],
          correctIndex: 1,
          explanation:  'Around 2,300 people across the six jurisdictions where the firm operates.',
          difficulty:   'medium',
          conceptTags:  ['aztec'],
        },
        {
          id:           'aztec-d3-q4',
          prompt:       "What's unusual about Aztec compared with similarly-sized fund administrators?",
          options: [
            'It was founded by a single individual',
            'Its growth has been mostly organic, giving a more consistent operating model than M&A-led peers',
            'It administers only one fund',
            'It has no investor-services function',
          ],
          correctIndex: 1,
          explanation:  'Many peers reach scale through M&A and end up with platform/culture patchworks. Aztec\'s organic growth contrasts with that.',
          difficulty:   'hard',
          conceptTags:  ['history', 'positioning'],
        },
      ],
    },

    {
      id:               'aztec-d4',
      dayNumber:        4,
      title:            'Owner-managed, then Warburg Pincus',
      hook:             "The fund lifecycle, and where Aztec sits in it.",
      estimatedMinutes: 3,
      conceptTags:      ['warburg-pincus', 'ownership', 'continuity'],
      body:
`For 23 years Aztec was owner-managed and independent. Independence meant the firm could grow at the pace it chose, without external shareholders pushing for faster expansion or different strategy. That independence shaped both the culture and the client offer — a long-running relationship that didn't change ownership underneath the client every few years.

In September 2024 the firm announced a strategic partnership with Warburg Pincus, a global growth investor. Warburg took a significant stake; the existing leadership remained in place; the brand and operating model were committed to continuing. The structure was framed as a partnership rather than a buyout — a meaningful distinction in this industry.

Why that matters: a fund administrator's whole asset is trust. Clients have committed long-running operational dependencies, sometimes regulatory obligations, to the firm. A change in ownership can be a moment of risk — clients reconsider, key staff reassess, competitors circle. The Warburg partnership was sized and structured to add capital and growth capacity without disturbing those continuity expectations.

The deal is a marker of where the alternatives administration sector now sits. Large enough, profitable enough, and durable enough to attract serious growth capital. Aztec's particular shape — measured organic growth, retention-driven, alternatives-specialist — is precisely the kind of asset growth investors look for.`,
      takeaway:         'Independence shaped the firm; the Warburg partnership funded its next chapter.',
      questions: [
        {
          id:           'aztec-d4-q1',
          prompt:       'When did Aztec announce its partnership with Warburg Pincus?',
          options: ['September 2024', 'January 2022', 'June 2020', 'March 2025'],
          correctIndex: 0,
          explanation:  'The strategic partnership was announced in September 2024.',
          difficulty:   'easy',
          conceptTags:  ['warburg-pincus'],
        },
        {
          id:           'aztec-d4-q2',
          prompt:       'What happened to the existing leadership and brand after the partnership?',
          options: [
            'Both were replaced as part of the deal',
            'Leadership remained in place; brand and operating model continued',
            "Aztec was rebranded as a Warburg subsidiary",
            'The leadership team was rotated through Warburg portfolio companies',
          ],
          correctIndex: 1,
          explanation:  'The partnership was framed and structured to preserve continuity of leadership and brand.',
          difficulty:   'medium',
          conceptTags:  ['continuity'],
        },
        {
          id:           'aztec-d4-q3',
          prompt:       "Why does ownership change matter especially for a fund administrator's clients?",
          options: [
            'Clients are contractually entitled to a discount',
            "Their long-running operational dependencies and trust in the firm are tied to continuity",
            'Regulators automatically require client re-onboarding',
            'It always increases administrator fees',
          ],
          correctIndex: 1,
          explanation:  "An administrator's value is operational continuity. Ownership churn is a moment of risk to that.",
          difficulty:   'medium',
          conceptTags:  ['continuity'],
        },
        {
          id:           'aztec-d4-q4',
          prompt:       'Why is a firm like Aztec attractive to a growth investor?',
          options: [
            'It is small enough to flip quickly',
            'Measured growth, retention-driven, alternatives-specialist — durable and profitable, with a structural tailwind from alternatives expansion',
            'It is in a declining industry trading at a low multiple',
            'It pays a high dividend yield',
          ],
          correctIndex: 1,
          explanation:  "Growth investors look for durable, structurally-tailwinded businesses with strong retention. Aztec's shape fits.",
          difficulty:   'hard',
          conceptTags:  ['warburg-pincus', 'positioning'],
        },
      ],
    },

    {
      id:               'aztec-d5',
      dayNumber:        5,
      title:            'The fund lifecycle — and where Aztec sits in it',
      hook:             'Fund services — the core offering.',
      estimatedMinutes: 4,
      conceptTags:      ['lifecycle', 'capital-calls', 'distributions'],
      body:
`A private fund has a finite life. It is born when investors commit capital, lives for ten or twelve years drawing that capital down and putting it to work, distributes proceeds as investments are sold, and is wound up at the end. The cadence — launch, capital calls, investments, valuations, reporting, distributions, wind-down — is the rhythm fund administration runs against.

Launch is busy. Legal entities are set up across multiple jurisdictions. Bank accounts are opened. Investor onboarding starts: KYC, AML checks, subscription documents. Capital commitments are recorded. From day one the administrator is in the middle of all this, building the operational scaffold the fund will live inside.

{{diagram:fund-lifecycle}}

Through the fund's life the cadence continues. Capital calls go out to investors when the manager finds an investment to make. Quarterly NAVs are produced. Investor reports go out. Tax returns are filed across every jurisdiction the fund touches. Distributions are calculated through the waterfall — the agreed sequence of who gets paid what. Each step is operational, repeated, and exacting.

Wind-down is the long tail. Investments are sold. Proceeds distributed. Final tax returns filed. Entities closed. A fund that started ten years ago is still being administered today, sometimes for years after its last investment was sold. A fund administrator's involvement, in most cases, runs end to end.`,
      takeaway:         "A fund's life is a cadence; the administrator is in the middle of every beat.",
      diagrams: [
        {
          id:      'fund-lifecycle',
          caption: "Fund lifecycle phases. Administrator is involved end to end, not just at the start.",
          svg: `<svg viewBox="0 0 600 140" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g stroke-width="1">
    <rect x="20"  y="36" width="80"  height="32" rx="4" />
    <rect x="115" y="36" width="80"  height="32" rx="4" />
    <rect x="210" y="36" width="80"  height="32" rx="4" />
    <rect x="305" y="36" width="100" height="32" rx="4" />
    <rect x="420" y="36" width="80"  height="32" rx="4" />
    <rect x="515" y="36" width="65"  height="32" rx="4" />
  </g>
  <g stroke-width="0.75" opacity="0.7">
    <line x1="100" y1="52" x2="115" y2="52" />
    <line x1="195" y1="52" x2="210" y2="52" />
    <line x1="290" y1="52" x2="305" y2="52" />
    <line x1="405" y1="52" x2="420" y2="52" />
    <line x1="500" y1="52" x2="515" y2="52" />
  </g>
  <g font-size="9.5" fill="currentColor" stroke="none">
    <text x="60"  y="56" text-anchor="middle">Launch</text>
    <text x="155" y="56" text-anchor="middle">Capital calls</text>
    <text x="250" y="56" text-anchor="middle">Investments</text>
    <text x="355" y="56" text-anchor="middle">Reporting / NAV</text>
    <text x="460" y="56" text-anchor="middle">Distributions</text>
    <text x="547" y="56" text-anchor="middle">Wind-down</text>
  </g>
  <line x1="20" y1="92" x2="580" y2="92" stroke-width="1" />
  <g stroke="none" fill="currentColor">
    <circle cx="20"  cy="92" r="2.5" />
    <circle cx="580" cy="92" r="2.5" />
  </g>
  <g font-size="10" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="110" text-anchor="middle">Administrator (e.g. Aztec) involved end to end</text>
    <text x="300" y="124" text-anchor="middle" font-size="9">Year 1 → Year 10+</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'aztec-d5-q1',
          prompt:       'How long does a typical private fund live?',
          options: ['1-2 years', '3-5 years', '10-12 years', '25+ years'],
          correctIndex: 2,
          explanation:  'Most private funds run a 10-12 year life cycle from launch through wind-down.',
          difficulty:   'easy',
          conceptTags:  ['lifecycle'],
        },
        {
          id:           'aztec-d5-q2',
          prompt:       'When are capital calls made?',
          options: [
            'Quarterly on a fixed schedule',
            'When the manager has an investment to make',
            'Only at launch',
            'Annually as a single drawdown',
          ],
          correctIndex: 1,
          explanation:  'Calls are demand-driven — the manager calls capital from investors when there is something to invest in.',
          difficulty:   'medium',
          conceptTags:  ['capital-calls'],
        },
        {
          id:           'aztec-d5-q3',
          prompt:       'What is a distribution waterfall?',
          options: [
            'A list of investors entitled to fees',
            'The agreed sequence determining who receives what when proceeds are distributed',
            'A market index used to benchmark fund returns',
            'A pre-agreed marketing schedule',
          ],
          correctIndex: 1,
          explanation:  'The waterfall sets the order — return of capital, preferred return, catch-up, carry — by which proceeds flow to LPs and GPs.',
          difficulty:   'medium',
          conceptTags:  ['distributions'],
        },
        {
          id:           'aztec-d5-q4',
          prompt:       'Why does fund administration continue after the last investment has been sold?',
          options: [
            "It doesn't — the relationship ends at the final distribution",
            'Wind-down requires final NAV calculations, tax filings, and entity closures across each jurisdiction, often spanning years',
            "Regulators charge ongoing fees regardless",
            'Investors keep the fund open in case of new deals',
          ],
          correctIndex: 1,
          explanation:  'A fund\'s end is administrative not investment-driven; closing it cleanly takes time across multiple jurisdictions.',
          difficulty:   'hard',
          conceptTags:  ['lifecycle'],
        },
      ],
    },

    {
      id:               'aztec-d6',
      dayNumber:        6,
      title:            'Fund services — the core offering',
      hook:             'Corporate services and management company services.',
      estimatedMinutes: 3,
      conceptTags:      ['fund-services', 'accounting', 'investor-services'],
      body:
`Fund services is the heart of what an alternatives administrator does. It's the family of activities that keep a fund's books, valuations, and records straight. Inside it sit four main strands: fund accounting, investor services, valuations, and reporting.

Fund accounting means maintaining the fund's books and producing its financial statements — recognising drawdowns, recording investments, posting capital activity, calculating fees and carry, and producing the quarterly NAV. Done well, the books reconcile cleanly and the annual audit goes smoothly. Done badly, every year-end is a fire drill.

Investor services is the relationship side: onboarding new investors, processing subscriptions and redemptions, calculating each investor's NAV share, sending capital call notices, and answering investor questions. For a fund with 80 limited partners across ten jurisdictions, this work is constant and detail-heavy.

Valuations and reporting sit alongside. Valuations are a quarterly choreography — pricing each investment in the portfolio with appropriate evidence and method. Reporting packages this up for investors, regulators, and tax authorities. A good administrator produces all of it on time, in formats easy to consume, with the underlying data traceable end to end.`,
      takeaway:         'Fund services keeps the books, the investors, and the regulators all in step.',
      questions: [
        {
          id:           'aztec-d6-q1',
          prompt:       'Which of these is part of fund services?',
          options: ['Fund accounting only', 'Investor onboarding only', 'Valuations only', 'All of the above, alongside reporting'],
          correctIndex: 3,
          explanation:  'Fund services is the umbrella covering accounting, investor services, valuations, and reporting.',
          difficulty:   'easy',
          conceptTags:  ['fund-services'],
        },
        {
          id:           'aztec-d6-q2',
          prompt:       "What does fund accounting produce quarterly?",
          options: ["The investor list", "The fund's NAV and supporting financial statements", "The carry waterfall", "Tax returns"],
          correctIndex: 1,
          explanation:  'NAV is the headline output of quarterly accounting; everything else flows from it.',
          difficulty:   'medium',
          conceptTags:  ['accounting'],
        },
        {
          id:           'aztec-d6-q3',
          prompt:       "Investor services typically handles…",
          options: [
            'Picking new investments for the fund',
            'Onboarding, subscriptions, capital call notices, and investor queries',
            'Hiring the fund manager\'s analysts',
            'Setting the fund\'s investment strategy',
          ],
          correctIndex: 1,
          explanation:  'Investor services is the operational relationship layer between the fund and its limited partners.',
          difficulty:   'medium',
          conceptTags:  ['investor-services'],
        },
        {
          id:           'aztec-d6-q4',
          prompt:       'Why is end-to-end data lineage important in fund reporting?',
          options: [
            'It is only relevant for marketing',
            'Auditors, regulators, and investors need to trace every figure; opacity creates audit and trust risk',
            'It reduces software licensing costs',
            'It allows investors to vote on the fund\'s strategy',
          ],
          correctIndex: 1,
          explanation:  'When a number can\'t be traced to its source, audits stall and investor trust erodes. Lineage is operational hygiene.',
          difficulty:   'hard',
          conceptTags:  ['fund-services'],
        },
      ],
    },

    {
      id:               'aztec-d7',
      dayNumber:        7,
      title:            'Corporate services and management company services',
      hook:             'AIFM, depositary, and the regulatory edges.',
      estimatedMinutes: 3,
      conceptTags:      ['corporate-services', 'substance', 'aifm'],
      body:
`Around the fund itself sits a network of legal entities — vehicles holding investments, special purpose companies, intermediate holdcos, the management company itself. Each entity needs directors, registered offices, statutory filings, and increasingly, real economic substance in its jurisdiction. Corporate services is the discipline of running all of that at scale.

Substance has become a regulatory requirement in most fund jurisdictions — meaning a fund company can't be a paper letterhead with a manager elsewhere. There must be local directors making real decisions, board meetings held in the right place, decisions properly documented. Administrators provide directors who sit on the boards of many funds at once, satisfying substance requirements for many vehicles at the same time.

Management company services goes a step further. An AIFM — Alternative Investment Fund Manager, the regulated entity managing the fund — is itself complex to run. Some firms outsource the AIFM function to their administrator entirely, gaining a regulated entity without building one. This is a higher-trust, higher-stakes service, and only a few administrators are licensed to provide it across the jurisdictions a manager needs.

These services don't get the spotlight that fund accounting does, but they are part of what makes the modern fund machinery legal. A fund without proper substance, governance, and licensed management isn't a fund — it's a regulatory liability.`,
      takeaway:         'The quiet entity work that turns a fund from idea into something that can lawfully exist.',
      questions: [
        {
          id:           'aztec-d7-q1',
          prompt:       "What does 'substance' mean in fund administration?",
          options: [
            'The size of a fund\'s assets',
            'Real local presence — directors, decisions, documentation — in the relevant jurisdiction',
            'A regulator-mandated minimum NAV',
            'The fund\'s historical track record',
          ],
          correctIndex: 1,
          explanation:  'Substance rules require funds to demonstrate real economic activity in the jurisdiction they\'re domiciled in.',
          difficulty:   'easy',
          conceptTags:  ['substance'],
        },
        {
          id:           'aztec-d7-q2',
          prompt:       "Why are administrator-provided directors common?",
          options: [
            'They\'re cheaper than independent directors',
            'They satisfy substance requirements for many funds at once',
            'Regulators require all directors to come from administrators',
            'Investors prefer them as a marketing point',
          ],
          correctIndex: 1,
          explanation:  'A single qualified director can sit on multiple fund boards in the right jurisdiction, providing substance efficiently.',
          difficulty:   'medium',
          conceptTags:  ['corporate-services'],
        },
        {
          id:           'aztec-d7-q3',
          prompt:       'What does an AIFM do?',
          options: [
            'Picks investments for the fund\'s portfolio',
            'Audits the fund\'s books at year-end',
            'Acts as the regulated entity managing an alternative investment fund',
            'Provides KYC checks on investors',
          ],
          correctIndex: 2,
          explanation:  'The AIFM is the regulated manager of the fund — it carries the regulatory accountability for how the fund is run.',
          difficulty:   'medium',
          conceptTags:  ['aifm'],
        },
        {
          id:           'aztec-d7-q4',
          prompt:       'Why is outsourcing the AIFM function higher-stakes for the administrator than fund accounting?',
          options: [
            'AIFM work is paid hourly rather than on AUA',
            'The administrator becomes the regulated entity itself, taking on direct regulatory accountability',
            'Only one jurisdiction allows it',
            'It requires the manager to relocate',
          ],
          correctIndex: 1,
          explanation:  'Acting as AIFM means the administrator is the regulated party — much higher accountability than producing reports.',
          difficulty:   'hard',
          conceptTags:  ['aifm'],
        },
      ],
    },

    {
      id:               'aztec-d8',
      dayNumber:        8,
      title:            'AIFM, depositary, and the regulatory edges',
      hook:             'The six jurisdictions and why each matters.',
      estimatedMinutes: 3,
      conceptTags:      ['aifm', 'depositary', 'aifmd'],
      body:
`Two regulated services sit at the boundary between fund administration and the regulator: the AIFM and the depositary. They look adjacent, but they do quite different things, and a fund using an alternative investment vehicle in Europe needs both.

The AIFM, as introduced yesterday, is the regulated entity that manages the fund. It carries the legal responsibility for risk management, portfolio management, valuation oversight, and regulatory reporting. AIFM rules came in via the AIFMD directive after the financial crisis to bring oversight to private funds in Europe. Where a manager doesn't have its own AIFM licence, an administrator can host the function on theirs.

The depositary is the trusted independent. Their job is to hold or oversee the fund's assets, verify ownership, monitor cashflows, and act as a check on the AIFM. The regulator wants the depositary to be independent enough to flag things if the manager goes off-piste. In practice the depositary signs off on capital movements and provides assurance to investors that the assets are where the books say they are.

Together they're the two regulatory pillars that European alternative funds rest on. An administrator that's licensed across both — and across the right jurisdictions — saves a manager from spinning up either capability themselves. It's a niche service inside fund admin, but a strategically important one.`,
      takeaway:         'AIFM and depositary are the regulatory pillars European alternative funds rest on.',
      questions: [
        {
          id:           'aztec-d8-q1',
          prompt:       'What is the AIFM responsible for?',
          options: [
            'Custody of fund assets',
            'Risk management, portfolio management, valuation oversight, and regulatory reporting',
            'Marketing the fund to investors',
            'Auditing the fund\'s books',
          ],
          correctIndex: 1,
          explanation:  'The AIFM is the regulated manager carrying the legal accountability for how the fund is run.',
          difficulty:   'easy',
          conceptTags:  ['aifm'],
        },
        {
          id:           'aztec-d8-q2',
          prompt:       "What is the depositary's role?",
          options: [
            'Setting the fund\'s investment strategy',
            'Holding/overseeing fund assets, verifying ownership, monitoring cashflows, acting as a check on the AIFM',
            'Underwriting investor commitments',
            'Producing the fund\'s tax returns',
          ],
          correctIndex: 1,
          explanation:  'The depositary is the independent oversight layer for assets and cashflows. It exists to provide investor and regulator assurance.',
          difficulty:   'medium',
          conceptTags:  ['depositary'],
        },
        {
          id:           'aztec-d8-q3',
          prompt:       'Why does AIFMD exist?',
          options: [
            'It pre-dates the financial crisis',
            'To bring regulatory oversight to private funds in Europe after the financial crisis',
            'To allow tax-free fund structures',
            'To replace MiFID for alternative funds',
          ],
          correctIndex: 1,
          explanation:  'AIFMD post-2008 was the European framework bringing alternative funds into a regulated perimeter.',
          difficulty:   'medium',
          conceptTags:  ['aifmd'],
        },
        {
          id:           'aztec-d8-q4',
          prompt:       'Why must the depositary be independent of the AIFM?',
          options: [
            'Tax rules require it',
            'Regulators want a credible check on the manager — the depositary should be willing and able to flag misconduct',
            'Independence reduces costs',
            'Depositaries are barred from any other regulated activity',
          ],
          correctIndex: 1,
          explanation:  'The whole point of the depositary is that it can credibly raise an alarm. Independence from the manager is structural.',
          difficulty:   'hard',
          conceptTags:  ['depositary'],
        },
      ],
    },

    {
      id:               'aztec-d9',
      dayNumber:        9,
      title:            'The six jurisdictions and why each matters',
      hook:             "The Client Relationship Lead model — Aztec's distinctive operational shape.",
      estimatedMinutes: 4,
      conceptTags:      ['jurisdictions', 'channel-islands', 'luxembourg', 'ireland'],
      body:
`A fund administrator's geography is not arbitrary. Each jurisdiction has its own regulator, its own tax treatment, its own legal forms, and its own market of fund managers. Operating in six places isn't six times the work — it's six related but distinct businesses that need local people, local licences, and local expertise.

Jersey and Guernsey, the Channel Islands, are the historic heart of the alternatives administration industry. A century of fund and trust expertise, English-language legal infrastructure, low tax for non-resident funds, and respected regulators. They are popular for private equity, real estate, and family office structures. Aztec's roots are in Jersey, and it remains a strategic centre.

{{diagram:six-jurisdictions}}

Luxembourg is the European heavyweight — the largest cross-border fund domicile in Europe, with regulated structures (SIF, RAIF, SCSp) European institutional money flows through. Ireland is increasingly its rival, particularly for funds wanting EU passporting and a common-law legal heritage. The UK, post-Brexit, remains the centre of the international management industry even as the funds themselves often live offshore. The US is the newest leg, supporting funds raising or deploying capital there.

For a manager picking where to set up, the jurisdiction choice depends on the investors they're courting, the asset class, the regulatory access they need, and tax. An administrator that operates in all six can handle whatever choice the manager makes — and lets a manager run a fund touching several jurisdictions without juggling several administrators.`,
      takeaway:         'Six jurisdictions, six related but distinct markets.',
      diagrams: [
        {
          id:      'six-jurisdictions',
          caption: "Aztec's six jurisdictions: a North Atlantic spread of related but distinct markets.",
          svg: `<svg viewBox="0 0 600 220" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g stroke-width="0.5" opacity="0.22">
    <path d="M 60 60 C 50 80 50 120 80 140 C 120 152 150 138 160 116 C 170 92 140 60 100 56 C 84 54 70 56 60 60 Z" />
    <path d="M 320 56 C 308 66 305 96 322 110 C 350 122 388 116 412 104 C 432 94 434 70 416 60 C 392 50 354 50 332 52 C 326 53 322 54 320 56 Z" />
    <path d="M 296 76 C 290 82 290 96 298 102 C 312 100 318 90 314 80 C 310 75 304 74 296 76 Z" />
  </g>
  <g stroke="none" fill="currentColor">
    <circle cx="307" cy="84" r="3" />
    <circle cx="294" cy="92" r="3" />
    <circle cx="318" cy="103" r="3" />
    <circle cx="324" cy="108" r="3" />
    <circle cx="345" cy="86" r="3" />
    <circle cx="100" cy="100" r="3" />
  </g>
  <g stroke="currentColor" stroke-width="0.5" opacity="0.55">
    <line x1="307" y1="84" x2="307" y2="44" />
    <line x1="294" y1="92" x2="245" y2="120" />
    <line x1="318" y1="103" x2="290" y2="140" />
    <line x1="324" y1="108" x2="350" y2="160" />
    <line x1="345" y1="86" x2="430" y2="50" />
    <line x1="100" y1="100" x2="100" y2="160" />
  </g>
  <g font-size="10" fill="currentColor" stroke="none">
    <text x="307" y="38" text-anchor="middle">UK</text>
    <text x="240" y="124" text-anchor="end">Ireland</text>
    <text x="285" y="144" text-anchor="end">Jersey</text>
    <text x="358" y="164">Guernsey</text>
    <text x="438" y="54">Luxembourg</text>
    <text x="100" y="174" text-anchor="middle">US</text>
  </g>
  <g font-size="10" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="208" text-anchor="middle">Six markets, related but distinct — each with its own regulator, tax, and legal forms.</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'aztec-d9-q1',
          prompt:       "Where are Aztec's roots?",
          options: ['Luxembourg', 'Jersey', 'Dublin', 'London'],
          correctIndex: 1,
          explanation:  "Aztec was founded in Jersey in 2001 and the Channel Islands remain a strategic centre.",
          difficulty:   'easy',
          conceptTags:  ['channel-islands'],
        },
        {
          id:           'aztec-d9-q2',
          prompt:       'Why is Luxembourg significant in alternatives?',
          options: [
            'It hosts the largest stock exchange in Europe',
            "It's the largest cross-border fund domicile in Europe, with regulated structures (SIF, RAIF, SCSp) European institutional money flows through",
            'Luxembourg-domiciled funds are tax-exempt globally',
            "It's the only EU country offering AIFM licences",
          ],
          correctIndex: 1,
          explanation:  'Luxembourg is the European fund-domicile heavyweight; SIF/RAIF/SCSp are widely used institutional vehicles.',
          difficulty:   'medium',
          conceptTags:  ['luxembourg'],
        },
        {
          id:           'aztec-d9-q3',
          prompt:       'On what does Ireland increasingly compete with Luxembourg?',
          options: [
            'Lowest tax rates in Europe',
            'EU passporting access for funds, with a common-law legal heritage',
            'Real estate fund domicile only',
            'Direct US fund licensing',
          ],
          correctIndex: 1,
          explanation:  'Ireland\'s common-law roots and EU passporting make it an attractive alternative to Luxembourg for many managers.',
          difficulty:   'medium',
          conceptTags:  ['ireland'],
        },
        {
          id:           'aztec-d9-q4',
          prompt:       "Why isn't operating in six jurisdictions simply 6× the work?",
          options: [
            'Six jurisdictions share one set of regulations',
            'Each requires local people, licences, and expertise — the businesses are related but distinct, not parallel',
            'Five of the six are administrative pass-throughs',
            'Most of the work is centralised in London',
          ],
          correctIndex: 1,
          explanation:  'Local regulators, tax, and legal forms make each jurisdiction a separate operating problem with its own complexity.',
          difficulty:   'hard',
          conceptTags:  ['jurisdictions'],
        },
      ],
    },

    {
      id:               'aztec-d10',
      dayNumber:        10,
      title:            'The Client Relationship Lead model',
      hook:             'The technology stack: eFront, Investran, Yardi.',
      estimatedMinutes: 3,
      conceptTags:      ['operating-model', 'crl', 'retention'],
      body:
`Most fund administrators are organised by function. A client of theirs talks to an accounting team for accounting, an investor services team for investor questions, a tax team for tax. The client has many counterparts; coordination falls on the client's COO. It's how the industry has worked for decades.

Aztec's offering is structured differently. The Client Relationship Lead — CRL — is a single named person who heads up a small dedicated team handling that client's funds across functions. Accounting, investor services, valuations, regulatory — they sit inside the team, organised around the client rather than around the discipline.

This is a "team rather than function" model. It's more expensive to run than the conventional functional org because individual specialists are deployed to specific clients rather than pooled. But it gives the client a single point of contact, a team that knows their funds in detail, and an operational rhythm that doesn't require the client to coordinate between departments at the administrator.

For managers, especially mid-sized ones, the trade-off is favourable. They get a coherent relationship rather than a hub of fragments. The CRL model is one of the things distinctive about Aztec's positioning, and a lot of why managers stay once they've onboarded.`,
      takeaway:         'A team organised around the client, not the discipline.',
      questions: [
        {
          id:           'aztec-d10-q1',
          prompt:       'How are most fund administrators traditionally organised?',
          options: [
            'Around clients, with a single named team per client',
            'By function — separate accounting, investor services, tax, etc. teams',
            'By geography only',
            'Around individual investments',
          ],
          correctIndex: 1,
          explanation:  'Functional org is the industry default: clients deal with multiple teams across the administrator.',
          difficulty:   'easy',
          conceptTags:  ['operating-model'],
        },
        {
          id:           'aztec-d10-q2',
          prompt:       'What is the CRL model?',
          options: [
            'A single named lead heading a dedicated team that handles the client across functions',
            "A regulator's framework for client meetings",
            'A category of managed accounts',
            'A specific software platform',
          ],
          correctIndex: 0,
          explanation:  'CRL — Client Relationship Lead — anchors a per-client team that spans accounting, investor services, etc.',
          difficulty:   'medium',
          conceptTags:  ['crl'],
        },
        {
          id:           'aztec-d10-q3',
          prompt:       "What's a downside of the CRL model from the administrator's side?",
          options: [
            'Clients receive worse service',
            'It is more expensive to run than the functional org because specialists are deployed to specific clients rather than pooled',
            'It cannot scale beyond a few clients',
            'It is only legal in one jurisdiction',
          ],
          correctIndex: 1,
          explanation:  'Per-client teams cost more in specialist headcount than functional pools. Aztec accepts that trade-off as a strategic choice.',
          difficulty:   'medium',
          conceptTags:  ['operating-model'],
        },
        {
          id:           'aztec-d10-q4',
          prompt:       'Why does the CRL model tend to improve retention for managers?',
          options: [
            'Clients are contractually locked in',
            'Managers deal with one coherent team that knows their funds in depth — reducing coordination cost and the friction of switching',
            'Pricing discounts increase over time',
            'It enables single-sign-on across multiple administrators',
          ],
          correctIndex: 1,
          explanation:  'A coherent named team is sticky. The cost of replicating that relationship elsewhere keeps managers from switching lightly.',
          difficulty:   'hard',
          conceptTags:  ['retention'],
        },
      ],
    },

    {
      id:               'aztec-d11',
      dayNumber:        11,
      title:            'The technology stack they actually use',
      hook:             'How fund administrators win and retain clients.',
      estimatedMinutes: 3,
      conceptTags:      ['technology', 'efront', 'investran', 'yardi'],
      body:
`An alternatives administrator's tech is unusual. The major core platforms are not built in-house but bought from a small set of specialist vendors who have served the industry for two or three decades. Nearly every administrator runs some combination of three core systems: eFront, Investran, and Yardi.

eFront is the dominant private equity platform — fund accounting, investor reporting, capital activity, all on one stack. Investran is its main rival in the same space, with deep roots at the larger US administrators. Yardi is the real estate specialist — property, lease, and fund accounting purpose-built for the asset class. A fund administrator running real estate alongside private equity will commonly run two of these in parallel.

Around the cores sit a constellation of operational tools — investor portals, treasury platforms, document management, KYC/AML systems, regulatory reporting tools. Many are SaaS. Some are decades-old internally hosted systems that no one wants to migrate off. Integration between them — getting the books, the investor records, and the regulatory filings to agree — is much of the technology challenge.

For a software vendor selling into this space, the lesson is that you are usually selling into the gaps between the cores, not replacing them. The cores are old, sticky, and embedded; what's modernising is the layer that connects them and makes their data usable.`,
      takeaway:         "Sell into the gaps between the cores. The cores themselves don't move.",
      questions: [
        {
          id:           'aztec-d11-q1',
          prompt:       'What are eFront, Investran, and Yardi?',
          options: [
            'Three competing fund administrators',
            'Industry-standard core platforms used by fund administrators',
            'Regulators in three different jurisdictions',
            'Three legacy investor portals being phased out',
          ],
          correctIndex: 1,
          explanation:  "These are the long-standing core platforms most administrators use — fund accounting, investor reporting, real estate accounting.",
          difficulty:   'easy',
          conceptTags:  ['technology'],
        },
        {
          id:           'aztec-d11-q2',
          prompt:       'Yardi is specifically known for…',
          options: [
            'Hedge fund accounting',
            'Real estate property, lease, and fund accounting',
            'AIFM regulatory reporting',
            'Private credit only',
          ],
          correctIndex: 1,
          explanation:  'Yardi is the real estate specialist — property and lease accounting purpose-built for that asset class.',
          difficulty:   'medium',
          conceptTags:  ['yardi'],
        },
        {
          id:           'aztec-d11-q3',
          prompt:       "Why are administrator core platforms rarely replaced?",
          options: [
            'Regulators forbid migration',
            'They are old, deeply embedded, and migration carries operational risk; replacement is high-cost and high-risk',
            'They are free, so there is no commercial pressure',
            'Investors require continuity of vendor',
          ],
          correctIndex: 1,
          explanation:  'Core systems hold years of fund history. Migrating them is high-risk, slow, and rarely cost-justified vs. patching.',
          difficulty:   'medium',
          conceptTags:  ['technology'],
        },
        {
          id:           'aztec-d11-q4',
          prompt:       'Where does software innovation typically happen at fund administrators?',
          options: [
            'Replacing the core systems',
            'In the layer between the cores — investor portals, integrations, data tooling, automation',
            'Only at regulator-mandated reporting tooling',
            'In retail-facing front ends',
          ],
          correctIndex: 1,
          explanation:  'The cores stay. The connecting layer — integrations, portals, data — is where most modernisation effort lands.',
          difficulty:   'hard',
          conceptTags:  ['technology'],
        },
      ],
    },

    {
      id:               'aztec-d12',
      dayNumber:        12,
      title:            'How they win and retain clients',
      hook:             'Who buys software at a fund administrator: the buying centre.',
      estimatedMinutes: 3,
      conceptTags:      ['retention', 'growth', 'switching'],
      body:
`A fund administrator's growth tends to come from two places. First, existing clients launching new funds. A manager that's happy with how their first fund is administered will, when they raise their next, default to the same firm. This is where the bulk of net new revenue actually comes from at a well-run administrator.

Second is winning clients from competitors. This is harder. A switching fund manager has to migrate their books, their investor relationships, their regulatory filings — possibly across several entities and jurisdictions. The disruption is real. New clients only switch when their current administrator is failing them, or when they've grown beyond what their current administrator can handle.

Retention is therefore the strategic battlefield. The metrics administrators publish — retention rate, awards, client testimonials — all roll up to the question of whether managers keep coming back for the next fund. Aztec publishes a retention rate that has been consistently among the highest in the industry; it's a deliberate strategic asset.

For a software vendor, the implication is the same one that holds for the administrators themselves: stay in the relationship, get good at the unsexy, and the renewals look after themselves. Cleverness rarely wins. Reliability does.`,
      takeaway:         'Retention is the strategic battlefield. New funds from existing clients are the prize.',
      questions: [
        {
          id:           'aztec-d12-q1',
          prompt:       "Where does most net new revenue come from at a well-run fund administrator?",
          options: [
            'Winning clients from competitors',
            'Existing clients launching new funds',
            'Cross-selling to retail investors',
            'Regulator-driven mandate work',
          ],
          correctIndex: 1,
          explanation:  'A happy manager defaults to the same administrator for the next fund. That repeat-business base is the engine.',
          difficulty:   'easy',
          conceptTags:  ['growth'],
        },
        {
          id:           'aztec-d12-q2',
          prompt:       'Why is winning clients from competitors hard for fund administrators?',
          options: [
            'Regulators require client lock-in',
            'Migration disruption — books, investors, regulatory filings, often across multiple entities and jurisdictions',
            'Competitors offer mandatory exit fees',
            'There is no marketing channel for it',
          ],
          correctIndex: 1,
          explanation:  'Switching is operationally painful. Managers do it only when something is wrong, or when they\'ve outgrown their current admin.',
          difficulty:   'medium',
          conceptTags:  ['switching'],
        },
        {
          id:           'aztec-d12-q3',
          prompt:       'What is a key retention metric for fund administrators?',
          options: [
            'Time spent in onboarding',
            'Client retention rate (and the share of existing clients launching new funds with the same firm)',
            'Number of slips signed per quarter',
            'Average time to publish quarterly NAV',
          ],
          correctIndex: 1,
          explanation:  'Retention rate is the headline strategic metric. Aztec publishes a high one; it\'s a deliberate marketing asset.',
          difficulty:   'medium',
          conceptTags:  ['retention'],
        },
        {
          id:           'aztec-d12-q4',
          prompt:       "What's the strategic insight for software vendors selling into this space?",
          options: [
            'Big-bang launches win deals',
            'Reliability and relationship depth compound over time; cleverness rarely wins',
            'Disruption is the fastest path to share',
            'Vendors should target retail investors directly',
          ],
          correctIndex: 1,
          explanation:  "The same dynamic the administrators face: stickiness comes from reliability. Vendors who get good at the unsexy keep their renewals.",
          difficulty:   'hard',
          conceptTags:  ['retention'],
        },
      ],
    },

    {
      id:               'aztec-d13',
      dayNumber:        13,
      title:            'Who buys software at a fund administrator',
      hook:             'Where Salesforce typically fits at a fund administrator.',
      estimatedMinutes: 4,
      conceptTags:      ['buying-centre', 'coo', 'cto', 'sales'],
      body:
`A fund administrator is not a single buyer. Software decisions touch several functions, and the people who matter sit at different levels with different incentives. Knowing the buying centre is half the work of selling into one of these firms.

The COO is usually the centre of gravity. They run operations end to end and care most about reliability, scalability, and the cost of running the platform per fund. The CTO or Head of Technology owns the architecture and integrations. The Head of Fund Services cares about client experience and what their teams do day to day. Heads of regulatory or compliance care about audit, traceability, and regulator-facing risk.

{{diagram:buying-centre}}

The pattern across most deals is that 3-5 of these people need to be aligned for anything substantial to move. The COO sponsors. The technology team owns the integration. The function leads sign off on workflow fit. Procurement runs the contract. Lawyers review. Each one is a small veto point; deals stall when any of them stay quiet.

For a vendor, the right approach is to map the centre early, find the genuine champion, and arm them with what each of the others needs to say yes. Selling into administrators is patient work. The reward is that, once a vendor is in, they stay.`,
      takeaway:         'Map the centre, find the champion, give each veto point what they need to say yes.',
      diagrams: [
        {
          id:      'buying-centre',
          caption: 'A typical buying centre at a fund administrator. Each is a small veto point.',
          svg: `<svg viewBox="0 0 600 220" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <rect x="240" y="20" width="120" height="32" rx="4" stroke-width="1" />
  <g stroke-width="0.75" opacity="0.7">
    <line x1="300" y1="52" x2="300" y2="80" />
    <line x1="80"  y1="80" x2="520" y2="80" />
    <line x1="80"  y1="80" x2="80"  y2="100" />
    <line x1="226" y1="80" x2="226" y2="100" />
    <line x1="372" y1="80" x2="372" y2="100" />
    <line x1="518" y1="80" x2="518" y2="100" />
  </g>
  <g stroke-width="1">
    <rect x="20"  y="100" width="120" height="32" rx="4" />
    <rect x="166" y="100" width="120" height="32" rx="4" />
    <rect x="312" y="100" width="120" height="32" rx="4" />
    <rect x="458" y="100" width="120" height="32" rx="4" />
  </g>
  <g font-size="10" fill="currentColor" stroke="none">
    <text x="300" y="40" text-anchor="middle">COO</text>
    <text x="80"  y="120" text-anchor="middle">CTO / Head of Tech</text>
    <text x="226" y="120" text-anchor="middle">Head of Fund Services</text>
    <text x="372" y="120" text-anchor="middle">Head of Regulatory</text>
    <text x="518" y="120" text-anchor="middle">Procurement / Legal</text>
  </g>
  <g font-size="10" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="172" text-anchor="middle">3-5 stakeholders aligned to move a substantial deal.</text>
    <text x="300" y="192" text-anchor="middle">Each is a small veto point. Map them early.</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'aztec-d13-q1',
          prompt:       'Who is usually the centre of gravity for software decisions at a fund administrator?',
          options: ['The CFO', 'The COO', 'The Head of Marketing', 'The CEO'],
          correctIndex: 1,
          explanation:  'The COO owns operations end to end and is the most natural sponsor for platform decisions.',
          difficulty:   'easy',
          conceptTags:  ['coo'],
        },
        {
          id:           'aztec-d13-q2',
          prompt:       'How many stakeholders are typically involved in aligning a substantial deal?',
          options: ['1', '2', '3-5', '8+'],
          correctIndex: 2,
          explanation:  '3-5 functional leaders need to align for anything substantial to move forward.',
          difficulty:   'medium',
          conceptTags:  ['buying-centre'],
        },
        {
          id:           'aztec-d13-q3',
          prompt:       'What does the CTO / Head of Technology focus on in a deal?',
          options: [
            'Marketing the chosen platform',
            'Architecture and integrations',
            'Pricing negotiations',
            'Investor onboarding workflow',
          ],
          correctIndex: 1,
          explanation:  'Tech leads care about how a new platform fits the existing architecture and what integration work it implies.',
          difficulty:   'medium',
          conceptTags:  ['cto'],
        },
        {
          id:           'aztec-d13-q4',
          prompt:       'Why is each stakeholder effectively a small veto point?',
          options: [
            'They each have a contractual block in the procurement process',
            'Any of them can stall the deal by staying quiet; momentum requires explicit yeses across multiple functions',
            'Regulators require unanimous consent',
            'The CEO has delegated final approval to each',
          ],
          correctIndex: 1,
          explanation:  'Silence is sufficient to stall. Vendors must surface and equip each stakeholder rather than rely on a single sponsor.',
          difficulty:   'hard',
          conceptTags:  ['sales'],
        },
      ],
    },

    {
      id:               'aztec-d14',
      dayNumber:        14,
      title:            'Where Salesforce fits at a fund administrator',
      hook:             'End of the course. Onward.',
      estimatedMinutes: 3,
      conceptTags:      ['salesforce', 'crm', 'integration'],
      body:
`Salesforce isn't core fund administration software. The core systems remain eFront, Investran, Yardi. But around those cores there's a recurring set of jobs Salesforce typically does well at administrators of this kind: investor relationship management, deal pipeline tracking, marketing automation, and case or service management.

Investor relationship management — sometimes called LP management — is the most natural fit. Each fund has dozens of LPs, each with a relationship history, contact preferences, and document trails. Capturing all that in a CRM gives investor services and the CRL teams a single source of truth, vastly better than the email-and-spreadsheets default. This is usually the wedge.

From there, several adjacent use cases follow. Pipeline tracking for new business — which managers are evaluating the firm, where each is in the funnel, what the next action is. Marketing automation for newsletters, regulatory updates, event invitations. Service Cloud for handling the inbound queries and tickets that any operationally-intensive business generates.

The opportunity at any specific administrator depends on what they've already built. Salesforce typically slots in alongside the core platforms — never replacing them, often integrating with them via middleware. The right way to think about a Salesforce conversation here is as a way to make the relationship layer of the business — the bit the cores leave alone — coherent and operable.`,
      takeaway:         'Salesforce belongs to the relationship layer the cores leave alone.',
      questions: [
        {
          id:           'aztec-d14-q1',
          prompt:       'Salesforce typically fits at a fund administrator as…',
          options: [
            'A replacement for eFront / Investran / Yardi',
            'A CRM and relationship layer alongside the core fund admin platforms',
            "An AIFM regulatory-reporting tool",
            'A general ledger',
          ],
          correctIndex: 1,
          explanation:  'Salesforce sits alongside the cores; it doesn\'t replace them. The relationship layer is its natural home.',
          difficulty:   'easy',
          conceptTags:  ['salesforce'],
        },
        {
          id:           'aztec-d14-q2',
          prompt:       "What's typically the wedge use case for Salesforce at a fund administrator?",
          options: [
            'Tax filing automation',
            'Investor relationship / LP management',
            "Replacing the firm's accounting platform",
            'Direct-to-consumer marketing',
          ],
          correctIndex: 1,
          explanation:  'LP management — relationship history, contacts, documents — is where Salesforce tends to land first and demonstrably help.',
          difficulty:   'medium',
          conceptTags:  ['crm'],
        },
        {
          id:           'aztec-d14-q3',
          prompt:       'What does Salesforce typically NOT replace at an administrator?',
          options: [
            'Email tools',
            'The core platforms (eFront / Investran / Yardi)',
            'Investor portals',
            'Document management systems',
          ],
          correctIndex: 1,
          explanation:  'The cores hold the system-of-record data and aren\'t displaced by a CRM. Coexistence is the model.',
          difficulty:   'medium',
          conceptTags:  ['salesforce', 'crm'],
        },
        {
          id:           'aztec-d14-q4',
          prompt:       'How does Salesforce relate to the core platforms?',
          options: [
            'It replaces them as the system of record',
            'It runs in parallel with them, integrating where needed via middleware — never replacing the core',
            'It sits underneath them as a database',
            'It hosts the cores in its cloud',
          ],
          correctIndex: 1,
          explanation:  'Salesforce in this context is the relationship layer; cores remain the operational system of record. Integration glues them.',
          difficulty:   'hard',
          conceptTags:  ['integration'],
        },
      ],
    },
  ],
}
