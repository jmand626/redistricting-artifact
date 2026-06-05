function ExplanationPanel({ scenario }) {
  return (
    <section className="explanation-panel" aria-labelledby="explanation-heading">
      <div className="key-idea">
        <span>Key Idea</span>
        <p>The map is not just a picture of democracy; it is one of the machines that produces it.</p>
      </div>

      <div className="scenario-explanation">
        <p className="eyebrow">Current scenario</p>
        <h2 id="explanation-heading">{scenario.name}</h2>
        <p>{scenario.explanation}</p>
        <p className="scenario-summary">{scenario.summary}</p>
      </div>
    </section>
  );
}

export default ExplanationPanel;
