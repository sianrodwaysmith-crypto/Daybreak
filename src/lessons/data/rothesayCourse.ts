import type { Course } from '../types'

/* ====================================================================
   The 'Rothesay — UK pension insurance, in depth' course.
   General defined-benefit-pension and bulk-annuity concepts are
   described confidently as public industry knowledge. Rothesay-specific
   facts are limited to publicly stated information (founded 2007 inside
   Goldman, spun out, backed by GIC and MassMutual, large UK pensions
   insurance specialist). Anything organisation-specific that isn't
   public is framed as 'how this typically works at firms like X'
   rather than presented as verified fact about Rothesay.

   Days 5-14 land in subsequent commits.
==================================================================== */

export const ROTHESAY_COURSE: Course = {
  id:          'rothesay-pensions',
  title:       'Rothesay — UK pension insurance, in depth',
  description: "A guided introduction to the UK's largest pensions insurance specialist and the bulk annuity market they lead.",
  totalDays:   14,
  authoredAt:  '2026-04-28',
  lessons: [
    {
      id:               'rothesay-d1',
      dayNumber:        1,
      title:            'Defined benefit pensions, in plain English',
      hook:             'How a scheme moves from open to fully insured: the de-risking journey.',
      estimatedMinutes: 3,
      conceptTags:      ['db-pensions', 'liabilities', 'longevity'],
      body:
`A defined benefit pension is a promise from an employer to pay an employee a defined income in retirement, for the rest of their life, indexed against inflation. Twenty-five years of teacher salary at one employer might mean £18,000 a year, paid every year, until the teacher dies. That's the promise.

Defined benefit was the standard mid-century employment offer. A worker in the UK from the 1960s through the 1990s was likely to retire on one. Companies set them up because they were tax-efficient, helped retain staff, and were affordable when interest rates were high and people died younger. None of those conditions have held for the last 20 years.

The hard part is the long tail. A 65-year-old retiree might live to 95. Their pension grows with inflation. The employer has to fund every year of payments, regardless of what happens to the company in the meantime. A scheme with 10,000 retirees and 30 years of paid pensions ahead is a multi-billion-pound liability that sits on someone's balance sheet for decades.

Most UK companies stopped opening DB schemes years ago. They are stuck with the legacy ones — closed to new members, closed to further accruals, but still committed to paying the old promises. Getting free of those promises is what most of this course is about.`,
      takeaway:         'DB pensions are long-tailed promises few companies want to keep carrying.',
      questions: [
        {
          id:           'rothesay-d1-q1',
          prompt:       'What is a defined benefit pension?',
          options: [
            'A retirement account where the employee chooses the investments',
            'A promise from an employer to pay a retiree a defined income for life, usually indexed',
            'A government bond bought at retirement',
            'A lump-sum payout at retirement age',
          ],
          correctIndex: 1,
          explanation:  'DB schemes commit the employer to ongoing payments to retirees, often inflation-linked, for the rest of their life.',
          difficulty:   'easy',
          conceptTags:  ['db-pensions'],
        },
        {
          id:           'rothesay-d1-q2',
          prompt:       'Why have DB pensions become unaffordable for many companies?',
          options: [
            'Workers retire much earlier than in the 1990s',
            'A combination of falling interest rates, rising longevity, and rising costs',
            'Inflation has been zero for the last 20 years',
            'Employees stopped contributing',
          ],
          correctIndex: 1,
          explanation:  'Lower discount rates and longer lifespans both inflate the present-day cost of the promise.',
          difficulty:   'medium',
          conceptTags:  ['liabilities'],
        },
        {
          id:           'rothesay-d1-q3',
          prompt:       'What does the "long tail" of a DB scheme refer to?',
          options: [
            'The list of past employees',
            'Liabilities that last decades after the employee retires',
            "The scheme's annual report",
            'A specific reinsurance treaty',
          ],
          correctIndex: 1,
          explanation:  'A pensioner can live 30+ years post-retirement; the scheme pays every year of that long tail.',
          difficulty:   'medium',
          conceptTags:  ['longevity'],
        },
        {
          id:           'rothesay-d1-q4',
          prompt:       'Why are most UK DB schemes closed today?',
          options: [
            'Regulators banned them in 2010',
            'Companies stopped opening them years ago; closed schemes still pay the old promises but don\'t add new ones',
            'They were all wound up after the 2008 crisis',
            'Employees prefer defined contribution',
          ],
          correctIndex: 1,
          explanation:  'Most companies closed new DB accruals years ago. The legacy schemes remain — promises being paid down for decades.',
          difficulty:   'hard',
          conceptTags:  ['db-pensions'],
        },
      ],
    },

    {
      id:               'rothesay-d2',
      dayNumber:        2,
      title:            'The de-risking journey',
      hook:             'Buy-ins versus buy-outs: the two key transaction shapes.',
      estimatedMinutes: 4,
      conceptTags:      ['de-risking', 'closed-frozen', 'lifecycle'],
      body:
`A DB scheme rarely just sits unchanged. Over time, employers and trustees take steps to reduce the financial risk of carrying the scheme. This sequence — open, closed, frozen, partially insured, fully insured, wound up — is what the industry calls de-risking. It typically takes 20+ years.

The first step is closing the scheme to new members. Existing employees keep accruing benefits; new hires get a different (usually defined contribution) plan. The next is freezing — existing members stop accruing further benefits, though the benefits they have already earned are preserved. Both steps reduce growth in the liability without yet touching what's already there.

After freezing, the scheme typically starts shifting its investment mix away from growth assets toward bonds that match the pension payments. This is liability-driven investment — making the scheme's assets behave like its liabilities so funding becomes more predictable. Insurance only enters after this groundwork is done.

{{diagram:de-risking}}

The end state is a buy-out: the scheme transfers all its remaining liabilities to an insurer, who pays the pensioners directly going forward, and the scheme itself is wound up. Thirty years from open to wound-up isn't unusual. Each step is a real decision, often involving the trustees, the corporate sponsor, an actuary, an investment consultant, and an employee benefit consultant.`,
      takeaway:         'De-risking is a long, deliberate sequence — twenty years from open to wound up.',
      diagrams: [
        {
          id:      'de-risking',
          caption: 'The de-risking sequence. Not all schemes go all the way; some pause for years.',
          svg: `<svg viewBox="0 0 600 130" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <line x1="40" y1="60" x2="560" y2="60" stroke-width="0.75" />
  <g stroke="none" fill="currentColor">
    <circle cx="40"  cy="60" r="3" />
    <circle cx="140" cy="60" r="3" />
    <circle cx="240" cy="60" r="3" />
    <circle cx="340" cy="60" r="3" />
    <circle cx="440" cy="60" r="3" />
    <circle cx="540" cy="60" r="3" />
  </g>
  <g font-size="10" fill="currentColor" stroke="none" text-anchor="middle">
    <text x="40"  y="48">Open</text>
    <text x="140" y="48">Closed</text>
    <text x="240" y="48">Frozen</text>
    <text x="340" y="48">Buy-in</text>
    <text x="440" y="48">Buy-out</text>
    <text x="540" y="48">Wound up</text>
  </g>
  <g font-size="9" fill="currentColor" stroke="none" text-anchor="middle">
    <text x="40"  y="80">to new members</text>
    <text x="140" y="80">to new accruals</text>
    <text x="240" y="80">benefits frozen</text>
    <text x="340" y="80">insurer covers</text>
    <text x="440" y="80">obligation transferred</text>
    <text x="540" y="80">scheme closed</text>
  </g>
  <g font-size="10" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="116" text-anchor="middle">A 20-30 year sequence; many schemes pause for years between steps.</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'rothesay-d2-q1',
          prompt:       "What's typically the first step in a de-risking journey?",
          options: [
            'Buying out the entire scheme',
            'Closing the scheme to new members',
            'Selling all assets',
            'Discontinuing pension payments',
          ],
          correctIndex: 1,
          explanation:  'Closing to new members halts intake without affecting existing accruals.',
          difficulty:   'easy',
          conceptTags:  ['de-risking'],
        },
        {
          id:           'rothesay-d2-q2',
          prompt:       'What does freezing a scheme mean?',
          options: [
            'Pension payments are paused for a year',
            'Existing members stop accruing further benefits; benefits already earned are preserved',
            'The scheme switches to a new actuary',
            'All assets are converted to cash',
          ],
          correctIndex: 1,
          explanation:  'Freezing stops new accrual without touching what members have already earned.',
          difficulty:   'medium',
          conceptTags:  ['closed-frozen'],
        },
        {
          id:           'rothesay-d2-q3',
          prompt:       "What is liability-driven investment?",
          options: [
            'Picking equities to grow the scheme aggressively',
            "Investing the scheme's assets so they behave like its liabilities (typically with bonds), making funding more predictable",
            'Lending to the scheme sponsor',
            'A regulatory disclosure framework',
          ],
          correctIndex: 1,
          explanation:  'LDI matches asset cashflows to liability cashflows so the scheme is less exposed to interest-rate moves.',
          difficulty:   'medium',
          conceptTags:  ['de-risking'],
        },
        {
          id:           'rothesay-d2-q4',
          prompt:       'How long does a de-risking journey typically take?',
          options: ['1-2 years', '5 years', '10 years', '20-30 years'],
          correctIndex: 3,
          explanation:  'It is rarely fast — a typical journey from open to wound up runs 20-30 years.',
          difficulty:   'hard',
          conceptTags:  ['lifecycle'],
        },
      ],
    },

    {
      id:               'rothesay-d3',
      dayNumber:        3,
      title:            'Buy-ins vs buy-outs',
      hook:             'Why pension risk transfer is one of the biggest UK financial markets nobody talks about.',
      estimatedMinutes: 4,
      conceptTags:      ['buy-in', 'buy-out', 'risk-transfer'],
      body:
`There are two key transaction shapes by which a pension scheme can lay off its liabilities to an insurer. They are called buy-ins and buy-outs, and the difference matters more than the names suggest.

A buy-in is a transaction between the trustees and the insurer. The scheme buys an insurance policy that pays an income equal to the pensions the scheme owes. The trustees still own the policy; the scheme still pays the pensioners. From the pensioner's point of view, nothing changes — they keep getting their cheque from the scheme. The insurance is a hidden hedge.

{{diagram:buy-in-vs-out}}

A buy-out goes further. Instead of holding an insurance policy that mirrors the pensions, the trustees transfer the obligation entirely. The insurer becomes the direct payer to each individual pensioner. The scheme is wound up. From the pensioner's point of view, their cheque now arrives with the insurer's name on it.

Most large schemes go through a buy-in first — often partial, covering only the retired members — and then a full buy-out years later. Buy-ins are reversible and cheaper to do partially. Buy-outs are final. The transaction sequence reflects both insurer pricing dynamics and the long, careful judgement trustees take to make the move.`,
      takeaway:         'Buy-in is a hedge held by the scheme. Buy-out moves the obligation to the insurer.',
      diagrams: [
        {
          id:      'buy-in-vs-out',
          caption: "Buy-in: scheme keeps paying pensioners, insurance hedges the risk. Buy-out: insurer pays pensioners directly.",
          svg: `<svg viewBox="0 0 600 220" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <text x="90" y="20" font-size="11" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">BUY-IN</text>
  <g stroke-width="1">
    <rect x="40"  y="36" width="100" height="32" rx="4" />
    <rect x="180" y="36" width="100" height="32" rx="4" />
    <rect x="40"  y="120" width="100" height="32" rx="4" />
  </g>
  <g stroke-width="0.75" opacity="0.7">
    <line x1="140" y1="52" x2="180" y2="52" />
    <polyline points="176,49 180,52 176,55" fill="currentColor" />
    <line x1="180" y1="60" x2="140" y2="60" />
    <line x1="90" y1="68" x2="90" y2="120" />
    <polyline points="87,116 90,120 93,116" fill="currentColor" />
  </g>
  <g font-size="9.5" fill="currentColor" stroke="none" text-anchor="middle">
    <text x="90"  y="56">Trustees</text>
    <text x="230" y="56">Insurer</text>
    <text x="90"  y="140">Pensioner</text>
  </g>
  <text x="160" y="80" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">policy cashflow</text>
  <text x="38" y="98" font-size="9" fill="currentColor" stroke="none" font-style="italic">pension</text>
  <text x="90" y="180" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">Pensioner is paid by the scheme.</text>
  <text x="90" y="194" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">Insurance hedges the risk.</text>

  <text x="510" y="20" font-size="11" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">BUY-OUT</text>
  <g stroke-width="1">
    <rect x="320" y="36" width="100" height="32" rx="4" stroke-dasharray="2 3" opacity="0.5" />
    <rect x="460" y="36" width="100" height="32" rx="4" />
    <rect x="460" y="120" width="100" height="32" rx="4" />
  </g>
  <g stroke-width="0.75" opacity="0.7">
    <line x1="420" y1="52" x2="460" y2="52" />
    <polyline points="456,49 460,52 456,55" fill="currentColor" />
    <line x1="510" y1="68" x2="510" y2="120" />
    <polyline points="507,116 510,120 513,116" fill="currentColor" />
  </g>
  <g font-size="9.5" fill="currentColor" stroke="none" text-anchor="middle">
    <text x="370" y="56">Trustees</text>
    <text x="510" y="56">Insurer</text>
    <text x="510" y="140">Pensioner</text>
  </g>
  <text x="440" y="80" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">obligation transferred</text>
  <text x="510" y="180" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">Pensioner is paid by the insurer.</text>
  <text x="510" y="194" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-style="italic">Scheme is wound up.</text>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'rothesay-d3-q1',
          prompt:       "What does a pensioner experience differently between buy-in and buy-out?",
          options: [
            'Nothing — the experience is identical',
            'Their pension stops in either case',
            'Buy-in: cheque still from the scheme. Buy-out: cheque from the insurer',
            'Buy-out: cheque from the scheme. Buy-in: cheque from the insurer',
          ],
          correctIndex: 2,
          explanation:  "Buy-in is invisible to the pensioner; buy-out changes the payer of record to the insurer.",
          difficulty:   'easy',
          conceptTags:  ['buy-in', 'buy-out'],
        },
        {
          id:           'rothesay-d3-q2',
          prompt:       'A buy-in is a transaction between…',
          options: [
            'The pensioner and the insurer directly',
            'The trustees and an insurer; the scheme retains the obligation and uses the insurance as a hedge',
            'The corporate sponsor and the regulator',
            'Two insurers',
          ],
          correctIndex: 1,
          explanation:  'In a buy-in the trustees own the policy and the scheme keeps paying pensioners. The insurance is a hedge sitting behind it.',
          difficulty:   'medium',
          conceptTags:  ['buy-in'],
        },
        {
          id:           'rothesay-d3-q3',
          prompt:       'What happens to the scheme after a buy-out?',
          options: [
            'It continues to manage assets indefinitely',
            "It is wound up; the insurer pays pensioners directly going forward",
            'It merges with another scheme',
            'It stops paying inflation increases',
          ],
          correctIndex: 1,
          explanation:  'Buy-out is a complete transfer. The scheme winds up and the insurer becomes the pensioner\'s direct counterparty.',
          difficulty:   'medium',
          conceptTags:  ['buy-out'],
        },
        {
          id:           'rothesay-d3-q4',
          prompt:       'Why do most large schemes do a buy-in first and a buy-out later?',
          options: [
            'Regulators require it',
            'Buy-ins are reversible and cheaper to do partially, allowing schemes to de-risk gradually before committing to full transfer',
            'Buy-outs are illegal until a buy-in completes',
            'Insurers refuse to write a buy-out without a buy-in first',
          ],
          correctIndex: 1,
          explanation:  'Partial buy-ins let trustees move toward full buy-out in stages, smoothing pricing and operational risk.',
          difficulty:   'hard',
          conceptTags:  ['risk-transfer'],
        },
      ],
    },

    {
      id:               'rothesay-d4',
      dayNumber:        4,
      title:            'Why pension risk transfer is one of the biggest UK financial markets',
      hook:             'From Goldman to standalone — the Rothesay story.',
      estimatedMinutes: 3,
      conceptTags:      ['market-size', 'bulk-annuity'],
      body:
`The UK pension risk transfer market is now consistently writing more than £60 billion of new business per year. That's bigger than the IPO market. Bigger than most M&A categories. And almost completely invisible to the public — because the buyers and sellers are both institutional, and the product is dull.

The size makes sense once you see the scale of the underlying liability. UK private-sector DB schemes hold something close to £1.4 trillion of assets backing similar-sized liabilities. As corporate sponsors push to get free of those legacy schemes, they pay insurers to take on the obligation. The premium that flows on each transaction is enormous because the liability being insured is enormous.

A handful of insurers do almost all of this business. Rothesay is one, alongside L&G, PIC, Aviva, Standard Life, Just, Canada Life, and M&G. Most are not household names; the ones that are (Aviva, L&G) are known for other things. The market is deep, technically sophisticated, and run by a few dozen specialist teams across these firms.

Underneath the jargon, this is just risk transfer at scale. A company hands a long-tailed liability to an insurer who is better-equipped to carry it. The size of the market reflects the size of the legacy. The reason no one talks about it is that nobody outside the industry needs to.`,
      takeaway:         'A £60bn-a-year market that nobody outside the industry needs to talk about.',
      questions: [
        {
          id:           'rothesay-d4-q1',
          prompt:       'How big is the UK pension risk transfer market in recent years?',
          options: ['Under £1bn per year', 'Around £10bn per year', '£60bn+ per year', 'Over £500bn per year'],
          correctIndex: 2,
          explanation:  'Recent years have seen consistent £60bn+ of bulk annuity new business in the UK market.',
          difficulty:   'easy',
          conceptTags:  ['market-size'],
        },
        {
          id:           'rothesay-d4-q2',
          prompt:       'Why is the underlying market so large?',
          options: [
            'UK retirees are an unusually wealthy cohort',
            'UK private-sector DB schemes hold around £1.4 trillion of assets backing similar liabilities, and sponsors are pushing to lay them off',
            'Each transaction is small but very frequent',
            'It includes overseas pension schemes',
          ],
          correctIndex: 1,
          explanation:  "The legacy DB liability stack is enormous; each transaction can be billions of pounds.",
          difficulty:   'medium',
          conceptTags:  ['market-size'],
        },
        {
          id:           'rothesay-d4-q3',
          prompt:       'Roughly how many insurers do most of the UK bulk annuity business?',
          options: ['Two', 'Around eight specialist insurers', 'Over fifty', 'Just one'],
          correctIndex: 1,
          explanation:  'About eight specialist firms — Rothesay, L&G, PIC, Aviva, Standard Life, Just, Canada Life, M&G — write the bulk of it.',
          difficulty:   'medium',
          conceptTags:  ['bulk-annuity'],
        },
        {
          id:           'rothesay-d4-q4',
          prompt:       'Why is this market largely invisible to the public?',
          options: [
            'It is regulated under secrecy rules',
            'Both buyers (trustees, corporate sponsors) and sellers (specialist insurers) are institutional; pensioners often don\'t even know',
            'Newspapers are forbidden from covering it',
            "It happens entirely abroad",
          ],
          correctIndex: 1,
          explanation:  'The market is institutional end to end. Pensioners may receive a different payer with no fanfare.',
          difficulty:   'hard',
          conceptTags:  ['market-size'],
        },
      ],
    },

    {
      id:               'rothesay-d5',
      dayNumber:        5,
      title:            'From Goldman to standalone — the Rothesay story',
      hook:             'The economics of an annuity insurer.',
      estimatedMinutes: 3,
      conceptTags:      ['rothesay-history', 'monoline', 'patient-capital'],
      body:
`Rothesay was founded in 2007 inside Goldman Sachs, set up to write UK pension risk transfer business in what was then a young market. The financial crisis hit a year later. Rothesay survived it, kept writing, and grew quickly as the de-risking trend accelerated through the 2010s.

Goldman sold its stake in Rothesay in 2013 to a consortium of long-term investors. Today the firm is owned principally by GIC, the Singapore sovereign wealth fund, and MassMutual, the US life insurer. Both are patient capital — exactly what an annuity insurer needs, since the liabilities they take on run for decades.

The shape of the business is unusual for a UK insurer. Rothesay is a monoline — they only write bulk annuities. They don't sell motor insurance, home insurance, or any other product. That focus has let them build everything (their pricing, their asset management, their operational platform) around one product done well at scale.

Today Rothesay is among the largest UK pensions insurance specialists, with hundreds of billions of pounds of liabilities backed by an equivalent asset book. Their growth has been deliberate — they pick when to write big, when to hold off, and when to expand into adjacent transactions. Patience is part of the strategy.`,
      takeaway:         'A monoline business: bulk annuities only, done at scale.',
      questions: [
        {
          id:           'rothesay-d5-q1',
          prompt:       'When was Rothesay founded?',
          options: ['2007, inside Goldman Sachs', '1995, inside Lloyds', '2014, as a standalone', '2001, inside Goldman'],
          correctIndex: 0,
          explanation:  'Rothesay was set up in 2007 inside Goldman Sachs to write UK bulk annuity business.',
          difficulty:   'easy',
          conceptTags:  ['rothesay-history'],
        },
        {
          id:           'rothesay-d5-q2',
          prompt:       'Who are the principal owners of Rothesay today?',
          options: [
            'Goldman Sachs and the UK government',
            'GIC (Singapore sovereign wealth fund) and MassMutual',
            'L&G and Aviva',
            'A consortium of UK pension funds',
          ],
          correctIndex: 1,
          explanation:  'Goldman exited in 2013; today GIC and MassMutual are the principal owners.',
          difficulty:   'medium',
          conceptTags:  ['rothesay-history'],
        },
        {
          id:           'rothesay-d5-q3',
          prompt:       'What does "monoline" mean for Rothesay?',
          options: [
            'They write only one bulk annuity at a time',
            'They write only bulk annuities — no other insurance products',
            'They only operate in one country',
            'They only invest in one asset class',
          ],
          correctIndex: 1,
          explanation:  'Monoline means one product line. Rothesay writes only bulk annuities; no motor, home, or other insurance.',
          difficulty:   'medium',
          conceptTags:  ['monoline'],
        },
        {
          id:           'rothesay-d5-q4',
          prompt:       'Why is patient capital particularly suited to an annuity insurer?',
          options: [
            'Patient investors charge lower fees',
            'Liabilities run for decades; investors who want short-term returns aren\'t aligned with how the business actually works',
            'Regulators require a specific share of patient ownership',
            'Bulk annuities have no liquidity profile to manage',
          ],
          correctIndex: 1,
          explanation:  '30-year liabilities can\'t be funded by capital that wants out in 3 years. Patient owners and patient liabilities go together.',
          difficulty:   'hard',
          conceptTags:  ['patient-capital'],
        },
      ],
    },

    {
      id:               'rothesay-d6',
      dayNumber:        6,
      title:            'The economics of an annuity insurer',
      hook:             'How Rothesay actually makes money.',
      estimatedMinutes: 3,
      conceptTags:      ['economics', 'asset-liability-match', 'solvency-ii'],
      body:
`An annuity insurer's business model is, on paper, simple: take a premium today, pay pensions for 30+ years. The premium is large because the future obligations are large. The insurer holds the premium as assets, invests them carefully, and uses the investment returns plus the principal to fund the pensions as they come due.

For this to work, the asset side has to keep pace with the liability side. If interest rates rise, the value of bonds falls — but the present value of liabilities also falls, so the position holds. If rates fall, both rise. This matching is the heart of the model: assets that move with liabilities, so the surplus is stable through interest-rate cycles.

The insurer's economic return comes from the gap between the rate at which they price the liabilities and the rate they can earn on the assets backing them. Pricing is an actuarial exercise; investment is an asset-management exercise. Both are deeply technical, and small differences compound enormously over a 30-year liability tail.

The capital required to back this is set by the regulator. Solvency II in the UK and EU requires insurers to hold enough capital that they can survive a one-in-200-year stress without defaulting. That capital is what makes the promise credible, and what underwrites the trust pensioners place in the insurer for the next three decades.`,
      takeaway:         'Take a premium today. Pay pensions for 30 years. Live or die on the asset-liability match.',
      questions: [
        {
          id:           'rothesay-d6-q1',
          prompt:       "What is an annuity insurer's basic business model?",
          options: [
            'Trade short-term currency futures',
            'Take a premium today and pay annuities to retirees for decades',
            'Sell life insurance products to younger workers',
            'Provide short-duration corporate insurance',
          ],
          correctIndex: 1,
          explanation:  'It is, at heart, premium-in-now, pension-out-for-decades; the rest of the model serves that.',
          difficulty:   'easy',
          conceptTags:  ['economics'],
        },
        {
          id:           'rothesay-d6-q2',
          prompt:       'Why does asset-liability matching matter so much?',
          options: [
            'Regulators require all assets to be cash',
            'When rates move, assets and liabilities should move together so surplus stays stable',
            'It increases marketing reach',
            'It avoids the need for actuaries',
          ],
          correctIndex: 1,
          explanation:  'Matching neutralises rate risk. Without it, every rate move would shake the surplus and the firm.',
          difficulty:   'medium',
          conceptTags:  ['asset-liability-match'],
        },
        {
          id:           'rothesay-d6-q3',
          prompt:       "Where does the insurer's economic return come from?",
          options: [
            'A fixed margin set by the regulator',
            'The gap between the rate at which they price liabilities and the rate they can earn on assets',
            'Premiums paid annually by pensioners',
            'Government subsidies',
          ],
          correctIndex: 1,
          explanation:  'The economic spread between liability pricing and asset earning rate is the core source of profit.',
          difficulty:   'medium',
          conceptTags:  ['economics'],
        },
        {
          id:           'rothesay-d6-q4',
          prompt:       'What does Solvency II require an insurer to hold?',
          options: [
            'A fixed percentage of premium as cash',
            'Enough capital to survive a one-in-200-year stress without defaulting',
            'A specific equity-to-bond ratio',
            'Reinsurance on every transaction',
          ],
          correctIndex: 1,
          explanation:  'Solvency II is a stress-based regime: the SCR is calibrated to a 1-in-200-year confidence level.',
          difficulty:   'hard',
          conceptTags:  ['solvency-ii'],
        },
      ],
    },

    {
      id:               'rothesay-d7',
      dayNumber:        7,
      title:            'How Rothesay makes money',
      hook:             'Who Rothesay competes with: the bulk annuity market.',
      estimatedMinutes: 3,
      conceptTags:      ['investment', 'illiquidity-premium', 'spread'],
      body:
`Rothesay's profit comes mainly from investment returns on the assets backing its liabilities. They take in a premium of, say, two billion pounds to insure a particular pension scheme. They invest that premium across a carefully constructed portfolio. Over time, the returns on that portfolio fund the pensions, plus the cost of running the business, plus a margin for shareholders.

The investment side is unusually long-dated. Bulk annuity insurers don't try to outperform indices — they try to match liabilities. Their portfolio leans heavily on UK government bonds (gilts), corporate credit, and increasingly on infrastructure lending and other long-term private credit. The aim is yield with predictable cashflows that align with the pensions to be paid.

The longer and more illiquid an asset, the more yield it tends to produce. Annuity insurers can hold those assets where pension funds, banks, and many other investors can't, because their own liabilities are long and illiquid. This is the structural advantage of the model: a 30-year liability is, in effect, a 30-year licence to invest in 30-year assets.

The profit pool is what's left after the pensioners are paid, the operating costs are met, and the regulatory capital is funded. Get the matching wrong and the model breaks. Get it right and the firm is one of the most reliably profitable in financial services. The dullness is the point.`,
      takeaway:         'A long liability is a long licence to invest. Get the matching right and the model is reliably profitable.',
      questions: [
        {
          id:           'rothesay-d7-q1',
          prompt:       'How does Rothesay primarily make money?',
          options: [
            'Trading commissions',
            'Investment returns on the assets backing its liabilities',
            'Annual fees from pensioners',
            'Performance fees from corporate sponsors',
          ],
          correctIndex: 1,
          explanation:  'The investment spread on the assets is the engine of profit.',
          difficulty:   'easy',
          conceptTags:  ['investment'],
        },
        {
          id:           'rothesay-d7-q2',
          prompt:       'What kinds of assets do bulk annuity insurers prefer?',
          options: [
            'Daily-priced equities and short-term FX',
            'Long-dated bonds (gilts), corporate credit, and infrastructure lending — predictable cashflows that match pensions',
            'Cryptocurrencies',
            'Daily money market funds only',
          ],
          correctIndex: 1,
          explanation:  'Long-dated, cashflow-predictable assets that align with the long-tailed liabilities are the natural fit.',
          difficulty:   'medium',
          conceptTags:  ['investment'],
        },
        {
          id:           'rothesay-d7-q3',
          prompt:       'Why can annuity insurers hold long illiquid assets that other investors cannot?',
          options: [
            "They have a regulatory exemption",
            "Their liabilities are also long and illiquid, so the duration matches",
            'They borrow short and lend long',
            'They don\'t have to mark to market',
          ],
          correctIndex: 1,
          explanation:  'Duration matching: long liabilities allow long, illiquid assets without a refinancing risk other investors face.',
          difficulty:   'medium',
          conceptTags:  ['illiquidity-premium'],
        },
        {
          id:           'rothesay-d7-q4',
          prompt:       "What's the structural advantage of an annuity insurer's model?",
          options: [
            'Tax exemption on investment returns',
            'Long-dated liabilities allow long-dated investing, capturing the illiquidity premium that other investors structurally cannot',
            'Lower regulatory capital than other lenders',
            'Direct access to central bank lending',
          ],
          correctIndex: 1,
          explanation:  'The 30-year liability is a 30-year licence to invest. That captures yield others can\'t.',
          difficulty:   'hard',
          conceptTags:  ['illiquidity-premium', 'spread'],
        },
      ],
    },

    {
      id:               'rothesay-d8',
      dayNumber:        8,
      title:            'The competitive landscape',
      hook:             'Trustees, sponsors, and EBCs — the cast on the buyer side.',
      estimatedMinutes: 4,
      conceptTags:      ['competition', 'market-shape', 'reputation'],
      body:
`A handful of UK insurers do almost all of the bulk annuity business. The major players today are Rothesay, L&G (Legal & General), PIC (Pension Insurance Corporation), Aviva, Phoenix (Standard Life), Just, Canada Life, and M&G. Roughly half are monolines focused only on bulk annuities; the others are diversified life and pensions firms with bulk annuity arms.

L&G has historically been the largest by reserves, with the deepest book and a long share of historical writes. Rothesay and PIC are close behind, both monolines with patient long-term capital backing them. Aviva, Phoenix and Canada Life are diversified players for whom bulk annuities are an important but not exclusive line. Just specialises in smaller transactions; M&G is a more recent entrant scaling its position.

{{diagram:bulk-annuity-market}}

Each transaction is competed for. Trustees, advised by employee benefit consultants, run a process to gather quotes. Insurers price the liabilities, model the assets they'd back them with, and submit. The cheapest credible quote tends to win, but cheap isn't simple — quote quality, asset capability, and operational track record all matter. Trustees are picking a counterparty for 30 years.

The market is large, but the players are few and the people involved know each other. Reputation compounds across transactions. An insurer that handles a buy-out smoothly is invited to quote on the next one. An insurer that doesn't is quietly dropped from the next process. Like much of UK institutional finance, it runs on long memory.`,
      takeaway:         'A few players, deep memory, big numbers. Reputation compounds.',
      diagrams: [
        {
          id:      'bulk-annuity-market',
          caption: 'Rough relative scale of in-force books. Specifics vary year to year. Canada Life writes alongside the named firms.',
          svg: `<svg viewBox="0 0 600 160" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <text x="300" y="20" font-size="11" fill="currentColor" stroke="none" text-anchor="middle">UK bulk annuity market — major players</text>
  <rect x="40" y="44" width="520" height="36" rx="4" stroke-width="1" />
  <g stroke-width="0.75" opacity="0.7">
    <line x1="160" y1="44" x2="160" y2="80" />
    <line x1="270" y1="44" x2="270" y2="80" />
    <line x1="370" y1="44" x2="370" y2="80" />
    <line x1="440" y1="44" x2="440" y2="80" />
    <line x1="490" y1="44" x2="490" y2="80" />
    <line x1="525" y1="44" x2="525" y2="80" />
  </g>
  <g font-size="10" fill="currentColor" stroke="none" text-anchor="middle">
    <text x="100" y="66">L&amp;G</text>
    <text x="215" y="66">Rothesay</text>
    <text x="320" y="66">PIC</text>
    <text x="405" y="66">Aviva</text>
    <text x="465" y="66">Phoenix</text>
    <text x="507" y="66">Just</text>
    <text x="542" y="66">M&amp;G</text>
  </g>
  <g font-size="9" fill="currentColor" stroke="none">
    <text x="40" y="40">larger book ←</text>
    <text x="560" y="40" text-anchor="end">→ smaller / newer</text>
  </g>
  <g font-size="10" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="116" text-anchor="middle">A small market in player count. Each firm runs a long-memory book.</text>
    <text x="300" y="132" text-anchor="middle">Reputation across transactions matters more than pricing alone.</text>
  </g>
</svg>`,
        },
      ],
      questions: [
        {
          id:           'rothesay-d8-q1',
          prompt:       'Who is historically the largest UK bulk annuity insurer by reserves?',
          options: ['Just', 'L&G', 'M&G', 'Canada Life'],
          correctIndex: 1,
          explanation:  'L&G has been the largest by reserves and historical writes.',
          difficulty:   'easy',
          conceptTags:  ['competition'],
        },
        {
          id:           'rothesay-d8-q2',
          prompt:       'What is a "monoline" annuity insurer?',
          options: [
            'One that uses a single line of code',
            'One that writes only bulk annuities — like Rothesay or PIC',
            'One regulated only in the UK',
            'One owned by a single shareholder',
          ],
          correctIndex: 1,
          explanation:  'Monoline = one product line. Rothesay and PIC are the two best-known UK monolines in this market.',
          difficulty:   'medium',
          conceptTags:  ['market-shape'],
        },
        {
          id:           'rothesay-d8-q3',
          prompt:       'Who advises trustees during a bulk annuity process?',
          options: [
            'A regulator-appointed assessor',
            'Employee benefit consultants',
            'The corporate sponsor only',
            'The chosen insurer themselves',
          ],
          correctIndex: 1,
          explanation:  'Trustees engage employee benefit consultants — the EBCs — to advise on the process and pricing.',
          difficulty:   'medium',
          conceptTags:  ['competition'],
        },
        {
          id:           'rothesay-d8-q4',
          prompt:       'Why does reputation compound in this market?',
          options: [
            'There is a published league table updated daily',
            'A small number of players with long-memory institutional buyers — smooth execution earns the next quote invitation; poor execution gets quietly dropped',
            'Regulators score insurers on reputation',
            'Pensioners vote on insurers each year',
          ],
          correctIndex: 1,
          explanation:  'The institutional market remembers. Repeat business — and exclusion — both flow from past transactions.',
          difficulty:   'hard',
          conceptTags:  ['reputation'],
        },
      ],
    },
  ],
}
