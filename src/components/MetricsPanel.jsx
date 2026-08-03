import { PARTIES } from '../data.js';

function MetricsPanel({ metrics }) {
  const efficiencyParty = metrics.efficiencyGapAdvantage
    ? PARTIES[metrics.efficiencyGapAdvantage].name
    : 'neither party';

  return (
    <section className="metrics-panel panel" aria-labelledby="metrics-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live calculation</p>
          <h2 id="metrics-heading">Votes, seats, and tradeoffs</h2>
        </div>
        <span className="validity-badge">Equal population · contiguous</span>
      </div>

      <div className="share-comparison" aria-label="Vote share compared with seat share">
        <ShareBar label="Vote share" blue={metrics.voteShare.blue} red={metrics.voteShare.red} />
        <ShareBar label="Seat share" blue={metrics.seatShare.blue} red={metrics.seatShare.red} ties={metrics.seatShare.ties} />
      </div>

      <div className="metric-grid">
        <Metric label="Competitive districts" value={`${metrics.competitiveDistricts} / 5`} note="Margin of 10 percentage points or less." />
        <Metric label="Average win margin" value={formatPercent(metrics.averageVictoryMargin)} note="Smaller can mean closer races, not necessarily fairer maps." />
        <Metric label="Efficiency gap" value={formatSignedPercent(metrics.efficiencyGap)} note={`This toy formula currently favors ${efficiencyParty}.`} />
        <Metric label="Compactness" value={metrics.averageCompactness.toFixed(2)} note="Grid approximation of Polsby–Popper; 1 is more compact." />
      </div>

      <details className="metric-explainer">
        <summary>What do these metrics mean—and miss?</summary>
        <div className="explanation-grid">
          <p><strong>Competitiveness</strong> counts districts with close results. A map can be competitive while still dividing communities or producing disproportional outcomes.</p>
          <p><strong>Efficiency gap</strong> compares each party’s losing votes and surplus winning votes. It is sensitive to geography, turnout assumptions, ties, and the number of districts; no single cutoff proves intent or unfairness.</p>
          <p><strong>Compactness</strong> compares district area with perimeter. This grid score is only a shape heuristic: real communities, coastlines, legal rules, and representation goals can justify irregular shapes.</p>
          <p><strong>Vote–seat gap</strong> shows how Blue seat share differs from Blue vote share. Proportionality is informative, but single-member districts are not designed to produce exact proportional representation.</p>
        </div>
      </details>

      <div className="district-results" aria-label="District election results">
        {metrics.districtSummaries.map((district) => (
          <article className={`district-result district-result--${district.winner.toLowerCase()}`} key={district.id}>
            <div className="district-result__heading">
              <strong>District {district.id}</strong>
              <span>{district.winnerName}</span>
            </div>
            <div className="mini-bar" aria-label={`Blue ${district.blueVotes}, Red ${district.redVotes}`}>
              <span className="mini-bar__blue" style={{ width: `${district.blueVotes * 5}%` }} />
              <span className="mini-bar__red" style={{ width: `${district.redVotes * 5}%` }} />
            </div>
            <p><b>{district.blueVotes} B</b><b>{district.redVotes} R</b></p>
            <small>{district.competitive ? 'Competitive' : `${district.marginVotes}-vote margin`} · compactness {district.compactness.toFixed(2)}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ShareBar({ blue, label, red, ties = 0 }) {
  return (
    <div className="share-row">
      <div className="share-row__label"><strong>{label}</strong><span>{formatPercent(blue)} B · {formatPercent(red)} R{ties ? ` · ${formatPercent(ties)} tied` : ''}</span></div>
      <div className="share-bar">
        <span className="share-bar__blue" style={{ width: `${blue * 100}%` }} />
        {ties > 0 && <span className="share-bar__tie" style={{ width: `${ties * 100}%` }} />}
        <span className="share-bar__red" style={{ width: `${red * 100}%` }} />
      </div>
    </div>
  );
}

function Metric({ label, note, value }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><p>{note}</p></article>;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSignedPercent(value) {
  if (Math.abs(value) < 0.0001) return '0.0%';
  return `${value > 0 ? '+' : '−'}${Math.abs(value * 100).toFixed(1)}%`;
}

export default MetricsPanel;
