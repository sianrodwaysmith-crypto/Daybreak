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
  ],
}
