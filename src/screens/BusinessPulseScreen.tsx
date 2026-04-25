const MARKETS = [
  { name: 'S&P 500',  value: '5,248',  change: '+0.4%', up: true },
  { name: 'NASDAQ',   value: '16,421', change: '+0.7%', up: true },
  { name: 'BTC',      value: '$67,240', change: '-1.2%', up: false },
  { name: 'GBP/USD',  value: '1.268',  change: '-0.1%', up: false },
]

const NEWS = [
  { source: 'FINANCIAL TIMES', headline: 'UK economy grows 0.4% in Q1, beating forecasts as services sector rebounds strongly', time: '2h ago' },
  { source: 'BLOOMBERG',       headline: 'Fed signals patience on rate cuts as inflation data remains sticky above 3%', time: '3h ago' },
  { source: 'REUTERS',         headline: 'Tech earnings season opens strong — Microsoft and Alphabet top consensus estimates', time: '5h ago' },
  { source: 'WSJ',             headline: 'Private equity deal flow picks up in Q2 as credit conditions ease across markets', time: '6h ago' },
]

export default function BusinessPulseScreen() {
  return (
    <div>
      <div className="screen-section">
        <div className="screen-section-label">MARKETS</div>
        <div className="markets-grid">
          {MARKETS.map(m => (
            <div key={m.name} className="market-card">
              <div className="market-name">{m.name}</div>
              <div className="market-value">{m.value}</div>
              <div className={`market-change ${m.up ? 'up' : 'down'}`}>{m.change}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">TOP STORIES</div>
        {NEWS.map((n, i) => (
          <div key={i} className="news-item">
            <div className="news-source">{n.source}</div>
            <div className="news-headline">{n.headline}</div>
            <div className="news-time">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
