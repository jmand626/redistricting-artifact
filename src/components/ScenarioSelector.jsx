function ScenarioSelector({ activeScenarioId, onSelect, scenarios }) {
  return (
    <nav className="scenario-selector" aria-label="Redistricting scenarios">
      <div className="tab-list" role="tablist" aria-label="Choose a district map">
        {scenarios.map((scenario) => (
          <button
            aria-selected={scenario.id === activeScenarioId}
            className="scenario-tab"
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            role="tab"
            type="button"
          >
            <span>{scenario.tabLabel}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default ScenarioSelector;
