export const GRID_SIZE = 10;
export const DISTRICT_COUNT = 5;
export const DISTRICT_SIZE = (GRID_SIZE * GRID_SIZE) / DISTRICT_COUNT;

export const PARTIES = {
  B: {
    id: 'B',
    name: 'Blue',
    opposite: 'R',
  },
  R: {
    id: 'R',
    name: 'Red',
    opposite: 'B',
  },
};

export const DEFAULT_VOTER_ROWS = [
  'BBBBRRRRRR',
  'BBBBRRRRRR',
  'BBBBBBRRRR',
  'BBBBBBRRRR',
  'BBBBBBRRRR',
  'BBBBBBRRRR',
  'RRBBBBBBRR',
  'RRBBBBBBRR',
  'RRRRBBBBBB',
  'BRRRRRRRRR',
];

export const VOTER_EXAMPLES = {
  clustered: {
    name: 'Clustered communities',
    description: 'The original 51–49 pattern, with several visible geographic clusters.',
    rows: DEFAULT_VOTER_ROWS,
  },
  halves: {
    name: 'Polarized halves',
    description: 'Two equally sized blocs separated by a sharp geographic line.',
    rows: [
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
      'BBBBBRRRRR',
    ],
  },
  checkerboard: {
    name: 'Evenly mixed',
    description: 'A 50–50 checkerboard with almost no same-party geographic clustering.',
    rows: Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => ((row + col) % 2 === 0 ? 'B' : 'R')).join(''),
    ),
  },
  islands: {
    name: 'Blue islands',
    description: 'Compact Blue clusters surrounded by a Red-leaning outer area.',
    rows: [
      'RRRRRRRRRR',
      'RBBBRRBBBR',
      'RBBBRRBBBR',
      'RBBBRRBBBR',
      'RRRRRRRRRR',
      'RRRBBBBRRR',
      'RRRBBBBRRR',
      'RRRBBBBRRR',
      'RRRRRRRRRR',
      'RRRRRRRRRR',
    ],
  },
};

export const SCENARIO_DEFINITIONS = {
  baseline: {
    id: 'baseline',
    label: 'Compact baseline',
    shortLabel: 'Baseline',
    eyebrow: 'Reference map',
    summary:
      'Five equal-population districts use simple rectangular blocks. It is a reference point, not a declaration that the map is fair.',
  },
  'pack-blue': {
    id: 'pack-blue',
    label: 'Pack Blue voters',
    shortLabel: 'Pack Blue',
    eyebrow: 'Generated scenario',
    summary:
      'A constrained search tries to concentrate Blue voters into fewer districts while keeping every district equal in size and contiguous.',
  },
  'crack-blue': {
    id: 'crack-blue',
    label: 'Crack Blue voters',
    shortLabel: 'Crack Blue',
    eyebrow: 'Generated scenario',
    summary:
      'A constrained search tries to distribute Blue voters just below winning thresholds across several districts.',
  },
  'favor-blue': {
    id: 'favor-blue',
    label: 'Optimize for Blue',
    shortLabel: 'Favor Blue',
    eyebrow: 'Generated scenario',
    summary:
      'A search favors Blue seat wins, then uses compactness as a secondary preference rather than an absolute rule.',
  },
  'favor-red': {
    id: 'favor-red',
    label: 'Optimize for Red',
    shortLabel: 'Favor Red',
    eyebrow: 'Generated scenario',
    summary:
      'A search favors Red seat wins, then uses compactness as a secondary preference rather than an absolute rule.',
  },
};

export function rowsToVoters(rows) {
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    throw new Error(`Voter rows must form a ${GRID_SIZE}×${GRID_SIZE} grid.`);
  }

  const voters = rows.flatMap((row) => [...row]);
  if (voters.some((party) => !PARTIES[party])) {
    throw new Error('Voter rows may only contain B and R affiliations.');
  }

  return voters;
}

export function votersToRows(voters) {
  return Array.from({ length: GRID_SIZE }, (_, row) =>
    voters.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE).join(''),
  );
}

export function getCell(index) {
  return {
    index,
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE,
  };
}
