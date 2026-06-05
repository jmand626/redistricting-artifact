import { DISTRICT_SIZE, PARTIES, VOTERS } from './data.js';

const DISTRICTS = ['1', '2', '3', '4', '5'];
const WINNING_THRESHOLD = Math.floor(DISTRICT_SIZE / 2) + 1;

export function calculateScenarioMetrics(scenario) {
  const districtMap = new Map(
    DISTRICTS.map((districtId) => [
      districtId,
      {
        id: districtId,
        blueVotes: 0,
        redVotes: 0,
        cells: [],
      },
    ]),
  );

  VOTERS.forEach((voter) => {
    const districtId = scenario.assignments[voter.row][voter.col];
    const district = districtMap.get(districtId);

    if (!district) {
      throw new Error(`Unknown district "${districtId}" in ${scenario.name}.`);
    }

    if (voter.preference === 'B') {
      district.blueVotes += 1;
    } else {
      district.redVotes += 1;
    }

    district.cells.push(voter);
  });

  const wastedVotes = {
    blue: 0,
    red: 0,
  };

  const seats = {
    blue: 0,
    red: 0,
  };

  const districtSummaries = [...districtMap.values()].map((district) => {
    if (district.cells.length !== DISTRICT_SIZE) {
      throw new Error(
        `District ${district.id} in ${scenario.name} has ${district.cells.length} cells instead of ${DISTRICT_SIZE}.`,
      );
    }

    const winner =
      district.blueVotes > district.redVotes
        ? PARTIES.B.name
        : district.redVotes > district.blueVotes
          ? PARTIES.R.name
          : 'Tie';

    if (winner === PARTIES.B.name) {
      seats.blue += 1;
      // Losing votes are wasted. Winning votes above the 11-vote threshold are also wasted.
      wastedVotes.blue += district.blueVotes - WINNING_THRESHOLD;
      wastedVotes.red += district.redVotes;
    } else if (winner === PARTIES.R.name) {
      seats.red += 1;
      wastedVotes.blue += district.blueVotes;
      wastedVotes.red += district.redVotes - WINNING_THRESHOLD;
    } else {
      wastedVotes.blue += district.blueVotes;
      wastedVotes.red += district.redVotes;
    }

    return {
      ...district,
      winner,
      margin: Math.abs(district.blueVotes - district.redVotes),
      labelPosition: getRepresentativeCell(district.cells),
    };
  });

  const totalBlueVotes = districtSummaries.reduce((total, district) => total + district.blueVotes, 0);
  const totalRedVotes = districtSummaries.reduce((total, district) => total + district.redVotes, 0);
  const totalVotes = totalBlueVotes + totalRedVotes;
  const totalSeats = seats.blue + seats.red;
  const efficiencyGap = (wastedVotes.red - wastedVotes.blue) / totalVotes;

  return {
    districtSummaries,
    totalVotes,
    totalBlueVotes,
    totalRedVotes,
    voteShare: {
      blue: totalBlueVotes / totalVotes,
      red: totalRedVotes / totalVotes,
    },
    seats,
    seatShare: {
      blue: totalSeats ? seats.blue / totalSeats : 0,
      red: totalSeats ? seats.red / totalSeats : 0,
    },
    wastedVotes,
    efficiencyGap,
    advantageParty:
      efficiencyGap > 0 ? PARTIES.B.name : efficiencyGap < 0 ? PARTIES.R.name : 'Neither party',
    winningThreshold: WINNING_THRESHOLD,
  };
}

function getRepresentativeCell(cells) {
  const center = cells.reduce(
    (position, cell) => ({
      row: position.row + cell.row / cells.length,
      col: position.col + cell.col / cells.length,
    }),
    { row: 0, col: 0 },
  );

  return cells.reduce((closest, cell) => {
    const closestDistance = squaredDistance(closest, center);
    const cellDistance = squaredDistance(cell, center);
    return cellDistance < closestDistance ? cell : closest;
  }, cells[0]);
}

function squaredDistance(cell, position) {
  return (cell.row - position.row) ** 2 + (cell.col - position.col) ** 2;
}
