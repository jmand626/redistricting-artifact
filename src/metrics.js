import { DISTRICT_COUNT, DISTRICT_SIZE, GRID_SIZE, PARTIES, getCell } from './data.js';

const COMPETITIVE_MARGIN = 0.1;

export function calculateElection(voters, assignments) {
  validateInputs(voters, assignments);

  const districts = Array.from({ length: DISTRICT_COUNT }, (_, index) => ({
    id: index + 1,
    blueVotes: 0,
    redVotes: 0,
    cells: [],
  }));

  voters.forEach((party, index) => {
    const district = districts[assignments[index] - 1];
    if (!district) {
      throw new Error(`Cell ${index} references unknown district ${assignments[index]}.`);
    }

    district.cells.push(index);
    if (party === 'B') district.blueVotes += 1;
    if (party === 'R') district.redVotes += 1;
  });

  const seats = { blue: 0, red: 0, ties: 0 };
  const wastedVotes = { blue: 0, red: 0 };
  const winningThreshold = Math.floor(DISTRICT_SIZE / 2) + 1;

  const districtSummaries = districts.map((district) => {
    if (district.cells.length !== DISTRICT_SIZE) {
      throw new Error(
        `District ${district.id} has ${district.cells.length} cells; expected ${DISTRICT_SIZE}.`,
      );
    }

    const winner = getWinner(district.blueVotes, district.redVotes);
    if (winner === 'B') {
      seats.blue += 1;
      wastedVotes.blue += district.blueVotes - winningThreshold;
      wastedVotes.red += district.redVotes;
    } else if (winner === 'R') {
      seats.red += 1;
      wastedVotes.blue += district.blueVotes;
      wastedVotes.red += district.redVotes - winningThreshold;
    } else {
      seats.ties += 1;
      wastedVotes.blue += district.blueVotes;
      wastedVotes.red += district.redVotes;
    }

    const voteMargin = Math.abs(district.blueVotes - district.redVotes) / DISTRICT_SIZE;
    const perimeter = calculatePerimeter(district.id, assignments);
    const compactness = Math.min(1, (4 * Math.PI * DISTRICT_SIZE) / perimeter ** 2);

    return {
      ...district,
      winner,
      winnerName: winner === 'T' ? 'Tie' : PARTIES[winner].name,
      marginVotes: Math.abs(district.blueVotes - district.redVotes),
      voteMargin,
      competitive: voteMargin <= COMPETITIVE_MARGIN,
      perimeter,
      compactness,
      labelPosition: getRepresentativeCell(district.cells),
    };
  });

  const totalBlueVotes = voters.filter((party) => party === 'B').length;
  const totalRedVotes = voters.length - totalBlueVotes;
  const totalVotes = voters.length;
  const voteShare = {
    blue: totalBlueVotes / totalVotes,
    red: totalRedVotes / totalVotes,
  };
  const seatShare = {
    blue: seats.blue / DISTRICT_COUNT,
    red: seats.red / DISTRICT_COUNT,
    ties: seats.ties / DISTRICT_COUNT,
  };
  const efficiencyGap = (wastedVotes.red - wastedVotes.blue) / totalVotes;
  const averageCompactness = average(districtSummaries.map((district) => district.compactness));
  const averageVictoryMargin = average(districtSummaries.map((district) => district.voteMargin));

  return {
    districtSummaries,
    totalVotes,
    totalBlueVotes,
    totalRedVotes,
    voteShare,
    seats,
    seatShare,
    wastedVotes,
    efficiencyGap,
    efficiencyGapAdvantage:
      Math.abs(efficiencyGap) < 0.0001 ? null : efficiencyGap > 0 ? 'B' : 'R',
    proportionalityGap: seatShare.blue - voteShare.blue,
    competitiveDistricts: districtSummaries.filter((district) => district.competitive).length,
    averageVictoryMargin,
    averageCompactness,
    winningThreshold,
    mapIsContiguous: districts.every((district) => isDistrictContiguous(assignments, district.id)),
  };
}

export function validateAssignments(assignments) {
  if (!Array.isArray(assignments) || assignments.length !== GRID_SIZE * GRID_SIZE) {
    return { valid: false, reason: 'Assignments must contain exactly 100 cells.' };
  }

  for (let districtId = 1; districtId <= DISTRICT_COUNT; districtId += 1) {
    const count = assignments.filter((value) => value === districtId).length;
    if (count !== DISTRICT_SIZE) {
      return {
        valid: false,
        reason: `District ${districtId} has ${count} cells instead of ${DISTRICT_SIZE}.`,
      };
    }
    if (!isDistrictContiguous(assignments, districtId)) {
      return { valid: false, reason: `District ${districtId} is not contiguous.` };
    }
  }

  return { valid: true, reason: null };
}

export function isDistrictContiguous(assignments, districtId) {
  const members = assignments
    .map((value, index) => (value === districtId ? index : -1))
    .filter((index) => index >= 0);

  if (members.length === 0) return false;

  const memberSet = new Set(members);
  const visited = new Set([members[0]]);
  const queue = [members[0]];

  while (queue.length > 0) {
    const current = queue.shift();
    getNeighbors(current).forEach((neighbor) => {
      if (memberSet.has(neighbor) && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }

  return visited.size === members.length;
}

export function getNeighbors(index) {
  const { row, col } = getCell(index);
  const neighbors = [];
  if (row > 0) neighbors.push(index - GRID_SIZE);
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
  if (col > 0) neighbors.push(index - 1);
  if (col < GRID_SIZE - 1) neighbors.push(index + 1);
  return neighbors;
}

function validateInputs(voters, assignments) {
  if (!Array.isArray(voters) || voters.length !== GRID_SIZE * GRID_SIZE) {
    throw new Error('The voter grid must contain exactly 100 cells.');
  }
  if (voters.some((party) => !PARTIES[party])) {
    throw new Error('Every voter must have a Blue or Red affiliation.');
  }

  const validation = validateAssignments(assignments);
  if (!validation.valid) throw new Error(validation.reason);
}

function getWinner(blueVotes, redVotes) {
  if (blueVotes > redVotes) return 'B';
  if (redVotes > blueVotes) return 'R';
  return 'T';
}

function calculatePerimeter(districtId, assignments) {
  let perimeter = 0;

  assignments.forEach((value, index) => {
    if (value !== districtId) return;

    const { row, col } = getCell(index);
    if (row === 0 || assignments[index - GRID_SIZE] !== districtId) perimeter += 1;
    if (row === GRID_SIZE - 1 || assignments[index + GRID_SIZE] !== districtId) perimeter += 1;
    if (col === 0 || assignments[index - 1] !== districtId) perimeter += 1;
    if (col === GRID_SIZE - 1 || assignments[index + 1] !== districtId) perimeter += 1;
  });

  return perimeter;
}

function getRepresentativeCell(cells) {
  const center = cells.reduce(
    (position, index) => {
      const cell = getCell(index);
      return {
        row: position.row + cell.row / cells.length,
        col: position.col + cell.col / cells.length,
      };
    },
    { row: 0, col: 0 },
  );

  return cells.reduce((closestIndex, index) => {
    const closest = getCell(closestIndex);
    const cell = getCell(index);
    return squaredDistance(cell, center) < squaredDistance(closest, center)
      ? index
      : closestIndex;
  }, cells[0]);
}

function squaredDistance(cell, position) {
  return (cell.row - position.row) ** 2 + (cell.col - position.col) ** 2;
}

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
