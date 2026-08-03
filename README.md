# Same Voters, Different Democracy

**Same Voters, Different Democracy** is an interactive redistricting sandbox built with React and Vite. It uses a deliberately small 10×10 toy population to show how voter geography and district boundaries jointly shape representation.

The project is educational, not predictive. It does **not** use census data, turnout estimates, demographic data, real precincts, or any real state map. Results in the sandbox are not claims about an actual party, jurisdiction, election, or legal dispute.

## What you can explore

- Select any voter cell to switch its affiliation between Blue and Red.
- Compare statewide vote share with seat share in real time.
- Generate compact baseline, packing, cracking, Blue-advantage, and Red-advantage maps.
- Shuffle voter locations while preserving the overall vote total.
- Load voter-geography examples such as clustered communities, polarized halves, an evenly mixed checkerboard, and “islands.”
- Inspect district-level vote totals, winners, margins, competitiveness, and compactness.
- Compare map-level competitiveness, average victory margin, efficiency gap, vote–seat gap, and compactness.
- Use the guided tour to learn the basic logic of packing and cracking.

All generated maps contain exactly five districts of 20 cells. The generator only accepts boundary swaps that preserve district contiguity.

## Educational purpose

The sandbox emphasizes one idea:

> The map is not just a picture of democracy; it is one of the machines that produces it.

Changing a single voter can affect an outcome. Changing only the district boundaries can also affect an outcome. The sandbox lets learners hold one factor fixed while experimenting with the other.

The interface intentionally displays several metrics together because no single number defines a fair district map. Compactness can conflict with competitiveness. Proportional outcomes can conflict with geographic communities. Efficiency-gap values depend on electoral geography and modeling assumptions. A metric can reveal a pattern without explaining its cause or proving intent.

## Model assumptions

- 100 equal-weight voters arranged on a square grid.
- Two affiliations, Blue and Red.
- Five single-member districts, each containing exactly 20 voters.
- Districts must be contiguous through shared edges.
- Plurality winners receive one seat; a 10–10 tie receives no seat.
- Every voter participates and casts one vote.
- The model does not represent communities of interest, race, incumbency, natural geography, legal constraints, turnout variation, multimember districts, or ranked-choice voting.

## Metric definitions

### Competitiveness

A district is marked competitive when its margin is 10 percentage points or less. This threshold is only a teaching convention. More competitive districts are not automatically more representative or fair.

### Efficiency gap

The implementation counts losing votes and winning votes beyond the 11-vote threshold as “wasted,” then calculates:

```text
(Red wasted votes − Blue wasted votes) / all votes
```

A positive result points toward a Blue advantage under this sign convention; a negative result points toward Red. Tied districts count all votes as wasted because neither side receives a seat. This toy implementation should not be treated as a legal test or universal fairness threshold.

### Compactness

For each grid district, area is 20 cells and perimeter is the number of exposed cell edges. The sandbox applies a grid version of Polsby–Popper:

```text
4π × area / perimeter²
```

The value is capped at 1. This is useful for comparing toy shapes, but it ignores coastlines, municipal boundaries, communities, transportation links, and other reasons real districts may be irregular.

## Scenario generation

Generated maps start from the compact baseline. A seeded stochastic search repeatedly proposes swapping two neighboring cells assigned to different districts. A swap is accepted only when both affected districts remain contiguous; because it is a swap, district populations stay equal.

Each scenario uses a different scoring objective:

- **Pack Blue:** reward Red seat wins and very large Blue winning surpluses.
- **Crack Blue:** reward Red seat wins and Blue near-losses spread across districts.
- **Favor Blue / Red:** prioritize target-party seats, then modestly prefer compactness.

These are heuristic searches, not optimal solvers. Regenerating a scenario can produce a different valid local optimum.

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Vite prints a local address, commonly `http://localhost:5173/`.

## Validate

```bash
npm test
npm run build
# or run both:
npm run check
```

The Node test suite verifies equal population, contiguity, vote/seat arithmetic, metric bounds, generated-map validity, and voter-edit behavior.

## Deploy to GitHub Pages

The Vite base path is configured for `/redistricting-artifact/`.

```bash
npm run deploy
```

Then configure GitHub Pages to serve the `gh-pages` branch if it is not already configured.

## Project structure

```text
src/
  App.jsx                  application state, controls, and guided mode
  data.js                  toy voter examples and shared constants
  metrics.js               election calculations and geometry validation
  scenarioEngine.js        constrained heuristic map generator
  components/
    GridMap.jsx             editable voter grid and district boundaries
    MetricsPanel.jsx        outcome charts, metrics, and explanations
  styles.css                responsive visual system and accessibility states
tests/
  election.test.js         calculation and generator regression tests
DEVELOPMENT_NOTES.md       decisions, tradeoffs, limitations, and future work
```

## Accessibility

Voter cells are native buttons inside a grid, with row, column, affiliation, district, and action labels. Controls use native buttons and selects, focus states are highly visible, generated explanations use live-region updates, and reduced-motion preferences are respected. Color is reinforced with letters, labels, text totals, and borders rather than carrying meaning alone.

## Development notes

See [`DEVELOPMENT_NOTES.md`](DEVELOPMENT_NOTES.md) for architectural decisions, generator limitations, abandoned approaches, known edge cases, and possible future expansions.
