import { GRID_SIZE, PARTIES, getCell } from '../data.js';

function GridMap({ assignments, metrics, onToggleVoter, voters }) {
  const districtById = new Map(
    metrics.districtSummaries.map((district) => [district.id, district]),
  );

  return (
    <div className="grid-map-wrap">
      <div className="grid-board" role="grid" aria-label="Editable ten by ten voter grid">
        {voters.map((party, index) => {
          const districtId = assignments[index];
          const district = districtById.get(districtId);
          const cell = getCell(index);
          const partyName = PARTIES[party].name;

          return (
            <button
              aria-label={`Row ${cell.row + 1}, column ${cell.col + 1}: ${partyName} voter in district ${districtId}. Activate to change affiliation.`}
              className={`voter-cell voter-cell--${party.toLowerCase()}`}
              key={index}
              onClick={() => onToggleVoter(index)}
              role="gridcell"
              style={getBoundaryStyle(index, assignments, district.winner)}
              title={`${partyName} voter · District ${districtId} · click to switch`}
              type="button"
            >
              <span aria-hidden="true">{party}</span>
            </button>
          );
        })}

        {metrics.districtSummaries.map((district) => {
          const position = getCell(district.labelPosition);
          return (
            <div
              aria-hidden="true"
              className={`district-label district-label--${district.winner.toLowerCase()}`}
              key={district.id}
              style={{
                left: `${(position.col + 0.5) * (100 / GRID_SIZE)}%`,
                top: `${(position.row + 0.5) * (100 / GRID_SIZE)}%`,
              }}
            >
              <span>D{district.id}</span>
              <strong>{district.winner}</strong>
            </div>
          );
        })}
      </div>

      <div className="map-legend" aria-label="Map legend">
        <span><i className="legend-swatch legend-swatch--blue" />Blue voter</span>
        <span><i className="legend-swatch legend-swatch--red" />Red voter</span>
        <span><i className="legend-line" />Boundary color shows district winner</span>
      </div>
      <p className="map-hint">Select any voter cell to switch its affiliation. District geometry stays fixed until you generate another map.</p>
    </div>
  );
}

function getBoundaryStyle(index, assignments, winner) {
  const districtId = assignments[index];
  const { row, col } = getCell(index);
  const boundaryColor = getWinnerColor(winner);
  const innerLine = 'rgba(255, 255, 255, 0.28)';

  return {
    borderTop: row === 0 || assignments[index - GRID_SIZE] !== districtId ? `3px solid ${boundaryColor}` : `1px solid ${innerLine}`,
    borderRight: col === GRID_SIZE - 1 || assignments[index + 1] !== districtId ? `3px solid ${boundaryColor}` : `1px solid ${innerLine}`,
    borderBottom: row === GRID_SIZE - 1 || assignments[index + GRID_SIZE] !== districtId ? `3px solid ${boundaryColor}` : `1px solid ${innerLine}`,
    borderLeft: col === 0 || assignments[index - 1] !== districtId ? `3px solid ${boundaryColor}` : `1px solid ${innerLine}`,
  };
}

function getWinnerColor(winner) {
  if (winner === 'B') return 'var(--blue-boundary)';
  if (winner === 'R') return 'var(--red-boundary)';
  return 'var(--tie-boundary)';
}

export default GridMap;
