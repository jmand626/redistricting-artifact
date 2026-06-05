function MetricsPanel({ metrics }) {
  const efficiencyGapText =
    Math.abs(metrics.efficiencyGap) < 0.001
      ? '0.0 pts'
      : `${Math.abs(metrics.efficiencyGap * 100).toFixed(1)} pts toward ${metrics.advantageParty}`;

  return (
    <section className="metrics-panel" aria-labelledby="metrics-heading">
      <div className="section-heading">
        <p className="eyebrow">Calculated outcome</p>
        <h2 id="metrics-heading">Metrics</h2>
      </div>

      <div className="metric-grid">
        <Metric label="Blue vote share" value={formatPercent(metrics.voteShare.blue)} />
        <Metric label="Red vote share" value={formatPercent(metrics.voteShare.red)} />
        <Metric label="Blue seats" value={`${metrics.seats.blue} / 5`} />
        <Metric label="Red seats" value={`${metrics.seats.red} / 5`} />
        <Metric label="Blue seat share" value={formatPercent(metrics.seatShare.blue)} />
        <Metric label="Red seat share" value={formatPercent(metrics.seatShare.red)} />
      </div>

      <div className="wasted-votes">
        <div>
          <span>Blue wasted votes</span>
          <strong>{metrics.wastedVotes.blue}</strong>
        </div>
        <div>
          <span>Red wasted votes</span>
          <strong>{metrics.wastedVotes.red}</strong>
        </div>
      </div>

      <div className="efficiency-gap">
        <span>Efficiency gap</span>
        <strong>{efficiencyGapText}</strong>
        <p>
          Wasted votes are losing votes plus winning votes beyond {metrics.winningThreshold}, the
          number needed to win a 20-voter district. The gap compares wasted votes across parties.
        </p>
      </div>

      <div className="district-results" aria-label="District-level results">
        {metrics.districtSummaries.map((district) => (
          <article
            className={`district-result district-result--${district.winner.toLowerCase()}`}
            key={district.id}
          >
            <span>D{district.id}</span>
            <strong>
              {district.blueVotes}-{district.redVotes}
            </strong>
            <em>{district.winner === 'Tie' ? 'Tie' : `${district.winner} wins`}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export default MetricsPanel;
