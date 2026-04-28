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
  ],
}
