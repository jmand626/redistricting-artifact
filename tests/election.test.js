import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_VOTER_ROWS, DISTRICT_COUNT, DISTRICT_SIZE, rowsToVoters } from '../src/data.js';
import { calculateElection, validateAssignments } from '../src/metrics.js';
import { createBaselineAssignments, generateScenario } from '../src/scenarioEngine.js';

const voters = rowsToVoters(DEFAULT_VOTER_ROWS);

test('baseline map has five equal, contiguous districts', () => {
  const assignments = createBaselineAssignments();
  assert.deepEqual(validateAssignments(assignments), { valid: true, reason: null });

  const metrics = calculateElection(voters, assignments);
  assert.equal(metrics.districtSummaries.length, DISTRICT_COUNT);
  metrics.districtSummaries.forEach((district) => assert.equal(district.cells.length, DISTRICT_SIZE));
  assert.equal(metrics.mapIsContiguous, true);
});

test('vote and seat shares use stable denominators', () => {
  const metrics = calculateElection(voters, createBaselineAssignments());
  assert.equal(metrics.totalBlueVotes, 51);
  assert.equal(metrics.totalRedVotes, 49);
  assert.equal(metrics.voteShare.blue, 0.51);
  assert.equal(metrics.seats.blue + metrics.seats.red + metrics.seats.ties, DISTRICT_COUNT);
  assert.equal(metrics.seatShare.blue + metrics.seatShare.red + metrics.seatShare.ties, 1);
});

test('compactness and efficiency gap remain bounded', () => {
  const metrics = calculateElection(voters, createBaselineAssignments());
  assert.ok(metrics.averageCompactness > 0 && metrics.averageCompactness <= 1);
  assert.ok(metrics.efficiencyGap >= -1 && metrics.efficiencyGap <= 1);
  metrics.districtSummaries.forEach((district) => {
    assert.ok(district.compactness > 0 && district.compactness <= 1);
  });
});

test('generated scenarios preserve equal population and contiguity', () => {
  for (const mode of ['pack-blue', 'crack-blue', 'favor-blue', 'favor-red']) {
    const assignments = generateScenario(voters, mode, 7, 1200);
    assert.deepEqual(validateAssignments(assignments), { valid: true, reason: null }, mode);
  }
});

test('changing a voter updates totals without changing district geometry', () => {
  const assignments = createBaselineAssignments();
  const edited = voters.slice();
  edited[0] = 'R';

  const before = calculateElection(voters, assignments);
  const after = calculateElection(edited, assignments);

  assert.equal(after.totalBlueVotes, before.totalBlueVotes - 1);
  assert.deepEqual(
    after.districtSummaries.map((district) => district.cells),
    before.districtSummaries.map((district) => district.cells),
  );
});
