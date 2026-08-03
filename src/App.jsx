import { useMemo, useState } from 'react';
import GridMap from './components/GridMap.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';
import {
  DEFAULT_VOTER_ROWS,
  SCENARIO_DEFINITIONS,
  VOTER_EXAMPLES,
  rowsToVoters,
} from './data.js';
import { calculateElection } from './metrics.js';
import {
  createBaselineAssignments,
  generateScenario,
  shuffleVoterLocations,
} from './scenarioEngine.js';

const GUIDE_STEPS = [
  {
    title: '1. Start with the voters',
    body: 'Every square is one toy voter. Select cells to change affiliation and watch statewide vote share update immediately.',
    scenario: 'baseline',
  },
  {
    title: '2. Pack a group',
    body: 'Packing concentrates many Blue voters into fewer districts. Large victories can “waste” votes while the other party wins more districts narrowly.',
    scenario: 'pack-blue',
  },
  {
    title: '3. Crack a group',
    body: 'Cracking spreads Blue voters across districts so they repeatedly fall below the winning threshold. Geography and the exact voter pattern limit what the search can achieve.',
    scenario: 'crack-blue',
  },
  {
    title: '4. Compare tradeoffs',
    body: 'No metric captures fairness by itself. Compare seats, competitiveness, compactness, and the efficiency gap—and notice when they point in different directions.',
    scenario: 'favor-blue',
  },
];

function App() {
  const [voters, setVoters] = useState(() => rowsToVoters(DEFAULT_VOTER_ROWS));
  const [scenarioId, setScenarioId] = useState('baseline');
  const [assignments, setAssignments] = useState(() => createBaselineAssignments());
  const [generation, setGeneration] = useState(1);
  const [guideStep, setGuideStep] = useState(null);
  const scenario = SCENARIO_DEFINITIONS[scenarioId];
  const metrics = useMemo(() => calculateElection(voters, assignments), [voters, assignments]);

  function applyScenario(nextScenarioId, nextVoters = voters, seed = generation) {
    setScenarioId(nextScenarioId);
    setAssignments(generateScenario(nextVoters, nextScenarioId, seed));
    setGeneration(seed + 1);
  }

  function toggleVoter(index) {
    setVoters((current) => {
      const next = current.slice();
      next[index] = next[index] === 'B' ? 'R' : 'B';
      return next;
    });
  }

  function loadExample(exampleId) {
    const nextVoters = rowsToVoters(VOTER_EXAMPLES[exampleId].rows);
    setVoters(nextVoters);
    applyScenario('baseline', nextVoters, generation + 1);
  }

  function randomize() {
    const nextVoters = shuffleVoterLocations(voters);
    setVoters(nextVoters);
    applyScenario(scenarioId, nextVoters, generation + 1);
  }

  function reset() {
    const nextVoters = rowsToVoters(DEFAULT_VOTER_ROWS);
    setVoters(nextVoters);
    setScenarioId('baseline');
    setAssignments(createBaselineAssignments());
    setGuideStep(null);
  }

  function openGuide(step = 0) {
    setGuideStep(step);
    applyScenario(GUIDE_STEPS[step].scenario, voters, generation + 1);
  }

  return (
    <main className="app-shell">
      <header className="project-header">
        <div>
          <p className="eyebrow">Interactive redistricting sandbox</p>
          <h1>Same Voters, Different Democracy</h1>
          <p className="lede">
            Edit a toy population, redraw equal-population districts, and examine how boundaries
            translate the same votes into different representation.
          </p>
        </div>
        <div className="ethics-note">
          <strong>Toy model, not a real election forecast</strong>
          <span>No census, turnout, race, community, or state data are used here.</span>
        </div>
      </header>

      <section className="control-deck panel" aria-labelledby="controls-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Experiment controls</p>
            <h2 id="controls-heading">Choose what changes</h2>
          </div>
          <button className="button button--guide" onClick={() => openGuide(0)} type="button">Start guided tour</button>
        </div>

        <div className="control-grid">
          <div>
            <label htmlFor="voter-example">Voter pattern</label>
            <select id="voter-example" defaultValue="clustered" onChange={(event) => loadExample(event.target.value)}>
              {Object.entries(VOTER_EXAMPLES).map(([id, example]) => <option key={id} value={id}>{example.name}</option>)}
            </select>
          </div>
          <div className="scenario-buttons" aria-label="District map scenarios">
            {Object.values(SCENARIO_DEFINITIONS).map((definition) => (
              <button
                aria-pressed={scenarioId === definition.id}
                className="scenario-button"
                key={definition.id}
                onClick={() => applyScenario(definition.id)}
                type="button"
              >
                {definition.shortLabel}
              </button>
            ))}
          </div>
          <div className="utility-buttons">
            <button className="button" onClick={() => applyScenario(scenarioId)} type="button">Regenerate map</button>
            <button className="button" onClick={randomize} type="button">Shuffle locations</button>
            <button className="button button--quiet" onClick={reset} type="button">Reset all</button>
          </div>
        </div>
      </section>

      {guideStep !== null && (
        <section className="guide-card" aria-live="polite">
          <div>
            <p className="eyebrow">Guided mode · {guideStep + 1} of {GUIDE_STEPS.length}</p>
            <h2>{GUIDE_STEPS[guideStep].title}</h2>
            <p>{GUIDE_STEPS[guideStep].body}</p>
          </div>
          <div className="guide-actions">
            <button className="button button--quiet" onClick={() => setGuideStep(null)} type="button">Exit</button>
            {guideStep > 0 && <button className="button" onClick={() => openGuide(guideStep - 1)} type="button">Previous</button>}
            {guideStep < GUIDE_STEPS.length - 1 && <button className="button button--primary" onClick={() => openGuide(guideStep + 1)} type="button">Next</button>}
          </div>
        </section>
      )}

      <div className="sandbox-layout">
        <section className="map-panel panel" aria-labelledby="map-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{scenario.eyebrow}</p>
              <h2 id="map-heading">{scenario.label}</h2>
            </div>
            <span className="vote-tally">{metrics.totalBlueVotes} Blue · {metrics.totalRedVotes} Red</span>
          </div>
          <p className="scenario-summary">{scenario.summary}</p>
          <GridMap assignments={assignments} metrics={metrics} onToggleVoter={toggleVoter} voters={voters} />
        </section>

        <aside className="side-panel">
          <section className="principle-card panel">
            <p className="eyebrow">Key idea</p>
            <blockquote>The map is not just a picture of democracy; it is one of the machines that produces it.</blockquote>
            <p>Try editing one voter, then regenerate the same scenario. Outcome changes can come from voters, boundaries, or both.</p>
          </section>
          <section className="assumptions-card panel">
            <h2>Model assumptions</h2>
            <ul>
              <li>100 equal-weight voters on a square grid</li>
              <li>Five single-member districts of 20 voters</li>
              <li>Simple plurality winners; ties win no seat</li>
              <li>Districts must be contiguous, but communities are not modeled</li>
            </ul>
          </section>
        </aside>
      </div>

      <MetricsPanel metrics={metrics} />

      <footer>
        Educational sandbox only. Apparent advantage in this toy model is not evidence about any real map, jurisdiction, party, or election.
      </footer>
    </main>
  );
}

export default App;
