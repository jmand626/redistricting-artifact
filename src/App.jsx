import { useMemo, useState } from 'react';
import ExplanationPanel from './components/ExplanationPanel.jsx';
import GridMap from './components/GridMap.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';
import ScenarioSelector from './components/ScenarioSelector.jsx';
import { SCENARIOS, VOTERS } from './data.js';
import { calculateScenarioMetrics } from './metrics.js';

function App() {
  const [activeScenarioId, setActiveScenarioId] = useState(SCENARIOS[0].id);
  const activeScenario = SCENARIOS.find((scenario) => scenario.id === activeScenarioId) ?? SCENARIOS[0];
  const metrics = useMemo(() => calculateScenarioMetrics(activeScenario), [activeScenario]);

  return (
    <main className="app-shell">
      <header className="project-header">
        <p className="eyebrow">CSE 480 interactive artifact</p>
        <h1>Same Voters, Different Democracy</h1>
        <p className="lede">
          A fixed population of 100 voters can produce very different representation when only the
          district boundaries change.
        </p>
      </header>

      <ScenarioSelector
        activeScenarioId={activeScenarioId}
        onSelect={setActiveScenarioId}
        scenarios={SCENARIOS}
      />

      <div className="artifact-layout">
        <section className="map-panel" aria-labelledby="map-heading">
          <div className="section-heading">
            <p className="eyebrow">Toy voter grid</p>
            <h2 id="map-heading">{activeScenario.name}</h2>
          </div>
          <GridMap metrics={metrics} scenario={activeScenario} voters={VOTERS} />
        </section>

        <aside className="analysis-column">
          <ExplanationPanel scenario={activeScenario} />
          <MetricsPanel metrics={metrics} />
        </aside>
      </div>
    </main>
  );
}

export default App;
