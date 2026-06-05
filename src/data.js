export const DISTRICT_SIZE = 20;

export const PARTIES = {
  B: {
    name: 'Blue',
    shortName: 'B',
  },
  R: {
    name: 'Red',
    shortName: 'R',
  },
};

export const VOTER_ROWS = [
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

export const VOTERS = VOTER_ROWS.flatMap((row, rowIndex) =>
  [...row].map((preference, colIndex) => ({
    id: `${rowIndex}-${colIndex}`,
    row: rowIndex,
    col: colIndex,
    preference,
  })),
);

export const SCENARIOS = [
  {
    id: 'fair',
    name: 'Fair / Compact Map',
    tabLabel: 'Fair / compact',
    summary: 'Five clean vertical districts keep the result close to the voter split.',
    explanation:
      'The compact baseline translates a 51% blue vote share into a narrow 3-2 blue seat edge. It is still simplified, but it tracks the population more closely than the engineered maps.',
    assignments: [
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
      '1122334455',
    ],
  },
  {
    id: 'packing',
    name: 'Packing Map',
    tabLabel: 'Packing',
    summary: 'Many blue voters are concentrated into two districts.',
    explanation:
      'Packing wastes blue votes by placing large blue majorities into a small number of districts. The same voters now give blue only 2 of 5 seats, while red wins the remaining districts.',
    assignments: [
      '5533553335',
      '5111533335',
      '1111133333',
      '1111133335',
      '1111122355',
      '4112222255',
      '4442222255',
      '4442222255',
      '4444222345',
      '4444444455',
    ],
  },
  {
    id: 'cracking',
    name: 'Cracking Map',
    tabLabel: 'Cracking',
    summary: 'Blue voters are split below a winning threshold in most districts.',
    explanation:
      'Cracking spreads blue voters across several red-leaning districts after one packed blue district. Their votes still appear in the total vote share, but they are divided so that blue wins only 1 of 5 seats.',
    assignments: [
      '5522552225',
      '5522522222',
      '5511122223',
      '5111113233',
      '4111113333',
      '4111115333',
      '4411322235',
      '4444433355',
      '4444443333',
      '4444455555',
    ],
  },
  {
    id: 'algorithmic',
    name: 'Algorithmic Advantage Map',
    tabLabel: 'Algorithmic advantage',
    summary: 'A search-like map distributes blue voters just efficiently enough to win big.',
    explanation:
      'An optimization-style map can do the opposite: blue voters are distributed with just enough support to win four districts, while red voters are concentrated in one losing pattern. A small vote edge becomes an 80% seat share.',
    assignments: [
      '5111111555',
      '1111111155',
      '5111221225',
      '5512221225',
      '5432222225',
      '5333222244',
      '3333332444',
      '3333344444',
      '5333444444',
      '5533554445',
    ],
  },
];
