import { DISTRICT_COUNT, DISTRICT_SIZE, GRID_SIZE } from './data.js';
import { calculateElection, getNeighbors, isDistrictContiguous } from './metrics.js';

const DEFAULT_ITERATIONS = 4200;

export function createBaselineAssignments() {
  const rows = [
    ...Array(4).fill('1111122222'),
    ...Array(2).fill('5555555555'),
    ...Array(4).fill('3333344444'),
  ];
  return rows.flatMap((row) => [...row].map(Number));
}

export function generateScenario(voters, mode, seed = 1, iterations = DEFAULT_ITERATIONS) {
  if (mode === 'baseline') return createBaselineAssignments();

  const targetParty = mode.endsWith('red') ? 'R' : 'B';
  const rng = mulberry32(hashVoters(voters) + seed * 9973 + hashString(mode));
  let current = createBaselineAssignments();
  let currentScore = scoreMap(voters, current, mode, targetParty);
  let best = current.slice();
  let bestScore = currentScore;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const candidate = proposeBoundarySwap(current, rng);
    if (!candidate) continue;

    const candidateScore = scoreMap(voters, candidate, mode, targetParty);
    const temperature = Math.max(0.04, 1 - iteration / iterations);
    const delta = candidateScore - currentScore;

    if (delta >= 0 || rng() < Math.exp(delta / (18 * temperature))) {
      current = candidate;
      currentScore = candidateScore;
    }

    if (candidateScore > bestScore) {
      best = candidate.slice();
      bestScore = candidateScore;
    }
  }

  return best;
}

export function shuffleVoterLocations(voters, seed = Date.now()) {
  const shuffled = voters.slice();
  const rng = mulberry32(seed >>> 0);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function proposeBoundarySwap(assignments, rng) {
  for (let attempt = 0; attempt < 28; attempt += 1) {
    const firstIndex = Math.floor(rng() * assignments.length);
    const neighbors = getNeighbors(firstIndex).filter(
      (index) => assignments[index] !== assignments[firstIndex],
    );
    if (neighbors.length === 0) continue;

    const secondIndex = neighbors[Math.floor(rng() * neighbors.length)];
    const firstDistrict = assignments[firstIndex];
    const secondDistrict = assignments[secondIndex];
    const candidate = assignments.slice();
    candidate[firstIndex] = secondDistrict;
    candidate[secondIndex] = firstDistrict;

    if (
      isDistrictContiguous(candidate, firstDistrict) &&
      isDistrictContiguous(candidate, secondDistrict)
    ) {
      return candidate;
    }
  }

  return null;
}

function scoreMap(voters, assignments, mode, targetParty) {
  const metrics = calculateElection(voters, assignments);
  const targetSeats = targetParty === 'B' ? metrics.seats.blue : metrics.seats.red;
  const opponentSeats = targetParty === 'B' ? metrics.seats.red : metrics.seats.blue;
  const targetVoteShare = targetParty === 'B' ? metrics.voteShare.blue : metrics.voteShare.red;
  const targetSeatShare = targetParty === 'B' ? metrics.seatShare.blue : metrics.seatShare.red;
  const compactnessBonus = metrics.averageCompactness * 24;
  const perimeterPenalty = metrics.districtSummaries.reduce(
    (total, district) => total + Math.max(0, district.perimeter - 18),
    0,
  );

  if (mode === 'pack-blue') {
    const packedSurplus = metrics.districtSummaries.reduce((total, district) => {
      const targetVotes = targetParty === 'B' ? district.blueVotes : district.redVotes;
      const opponentVotes = DISTRICT_SIZE - targetVotes;
      return targetVotes > opponentVotes ? total + Math.max(0, targetVotes - 11) ** 2 : total;
    }, 0);
    return opponentSeats * 1200 + packedSurplus * 5 + compactnessBonus - perimeterPenalty * 0.8;
  }

  if (mode === 'crack-blue') {
    const nearMisses = metrics.districtSummaries.reduce((total, district) => {
      const targetVotes = targetParty === 'B' ? district.blueVotes : district.redVotes;
      const opponentVotes = DISTRICT_SIZE - targetVotes;
      if (targetVotes >= opponentVotes) return total;
      return total + Math.max(0, 10 - Math.abs(10 - targetVotes)) ** 2;
    }, 0);
    const spreadPenalty = metrics.districtSummaries.reduce((total, district) => {
      const targetVotes = targetParty === 'B' ? district.blueVotes : district.redVotes;
      return total + Math.max(0, targetVotes - 14) ** 2;
    }, 0);
    return (
      opponentSeats * 1200 +
      nearMisses * 4 -
      spreadPenalty * 2 +
      compactnessBonus -
      perimeterPenalty * 0.65
    );
  }

  const seatBonus = targetSeats * 1400;
  const amplification = (targetSeatShare - targetVoteShare) * 700;
  return seatBonus + amplification + compactnessBonus - perimeterPenalty * 0.55;
}

function hashVoters(voters) {
  return voters.reduce((hash, party, index) => {
    const value = party === 'B' ? 17 : 31;
    return (hash + value * (index + 1)) >>> 0;
  }, 2166136261);
}

function hashString(value) {
  return [...value].reduce((hash, character) => ((hash * 33) ^ character.charCodeAt(0)) >>> 0, 5381);
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function assignmentsToRows(assignments) {
  return Array.from({ length: GRID_SIZE }, (_, row) =>
    assignments.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE).join(''),
  );
}

export function districtPopulationCounts(assignments) {
  return Array.from({ length: DISTRICT_COUNT }, (_, index) =>
    assignments.filter((districtId) => districtId === index + 1).length,
  );
}
