import { PARTIES } from '../data.js';

function GridMap({ metrics, scenario, voters }) {
  const districtById = new Map(
    metrics.districtSummaries.map((district) => [district.id, district]),
  );

  return (
    <div className="grid-map-wrap">
      <div
        aria-label="Ten by ten voter grid with district boundaries"
        className="grid-board"
        role="img"
      >
        {voters.map((voter) => {
          const districtId = scenario.assignments[voter.row][voter.col];
          const district = districtById.get(districtId);
          const partyName = PARTIES[voter.preference].name;

          return (
            <div
              aria-label={`Row ${voter.row + 1}, column ${voter.col + 1}: ${partyName} voter in district ${districtId}. District winner: ${district.winner}.`}
              className={`voter-cell voter-cell--${partyName.toLowerCase()}`}
              key={voter.id}
              style={getBoundaryStyle(voter, scenario.assignments, district.winner)}
              title={`${partyName} voter, District ${districtId}`}
            />
          );
        })}

        {metrics.districtSummaries.map((district) => (
          <div
            className={`district-label district-label--${district.winner.toLowerCase()}`}
            key={district.id}
            style={{
              left: `${(district.labelPosition.col + 0.5) * 10}%`,
              top: `${(district.labelPosition.row + 0.5) * 10}%`,
            }}
          >
            <span>D{district.id}</span>
            <strong>{district.winner === 'Tie' ? 'Tie' : district.winner[0]}</strong>
          </div>
        ))}
      </div>

      <div className="map-legend" aria-label="Map legend">
        <span>
          <span className="legend-swatch legend-swatch--blue" />
          Blue voter
        </span>
        <span>
          <span className="legend-swatch legend-swatch--red" />
          Red voter
        </span>
        <span>
          <span className="legend-line" />
          District boundary color shows winner
        </span>
      </div>
    </div>
  );
}

function getBoundaryStyle(voter, assignments, winner) {
  const districtId = assignments[voter.row][voter.col];
  const boundaryColor = getWinnerColor(winner);
  const subtleLine = 'rgba(255, 255, 255, 0.42)';

  return {
    borderTop:
      voter.row === 0 || assignments[voter.row - 1][voter.col] !== districtId
        ? `3px solid ${boundaryColor}`
        : `1px solid ${subtleLine}`,
    borderRight:
      voter.col === 9 || assignments[voter.row][voter.col + 1] !== districtId
        ? `3px solid ${boundaryColor}`
        : `1px solid ${subtleLine}`,
    borderBottom:
      voter.row === 9 || assignments[voter.row + 1][voter.col] !== districtId
        ? `3px solid ${boundaryColor}`
        : `1px solid ${subtleLine}`,
    borderLeft:
      voter.col === 0 || assignments[voter.row][voter.col - 1] !== districtId
        ? `3px solid ${boundaryColor}`
        : `1px solid ${subtleLine}`,
  };
}

function getWinnerColor(winner) {
  if (winner === PARTIES.B.name) {
    return 'var(--blue-boundary)';
  }

  if (winner === PARTIES.R.name) {
    return 'var(--red-boundary)';
  }

  return 'var(--tie-boundary)';
}

export default GridMap;
