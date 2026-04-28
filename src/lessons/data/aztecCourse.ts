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
  ],
}
