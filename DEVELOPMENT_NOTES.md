# Development Notes

This document records concrete decisions made while expanding the original fixed-scenario CSE 480 artifact into an interactive sandbox.

## Architecture

The project remains intentionally small and dependency-light. React owns interface state; plain JavaScript modules own data, election math, validation, and scenario generation.

- `data.js` contains immutable constants, voter examples, party metadata, and row/grid conversion helpers.
- `metrics.js` is the authoritative calculation layer. The UI does not independently recompute winners or fairness metrics.
- `scenarioEngine.js` generates district assignments but delegates all outcome calculations and contiguity checks to `metrics.js`.
- `App.jsx` owns the current voter array, current assignment array, selected scenario, generator seed, and guided-tour state.
- Components receive already-calculated values and remain mostly presentational.

The voter grid and district map are separate arrays. This is important pedagogically and technically: a learner can change voters without redrawing boundaries, or redraw boundaries without changing voters.

## District geometry assumptions

The model is a 10×10 orthogonal grid. Two cells are adjacent only when they share an edge; diagonal contact does not establish contiguity.

There are five districts and every district must contain exactly 20 cells. The generator preserves population by swapping one cell from district A with one neighboring cell from district B. It then explicitly checks that both affected districts remain contiguous. This is slower than accepting arbitrary swaps, but the grid is small enough that clarity and validity matter more than micro-optimization.

A district perimeter is the number of its cell edges that touch the map exterior or a different district. Compactness is a grid approximation of Polsby–Popper: `4πA / P²`, capped at 1. The cap guards against discrete-grid artifacts and floating-point surprises; it does not make the score equivalent to a real GIS implementation.

## Election assumptions

Each cell is one equal-weight voter. Every voter participates. District winners use simple plurality.

A 10–10 tied district awards no seat. For the efficiency-gap calculation, every vote in a tied district is treated as wasted because neither party wins representation. This is a deliberate, transparent convention for an otherwise awkward edge case; other treatments are possible.

A district is labeled competitive when the margin is no more than 10 percentage points (two votes in a 20-voter district). This is a teaching threshold, not a research or legal standard.

Seat share always uses five districts as the denominator. Tied seats occupy part of that denominator, preventing Blue and Red seat shares from incorrectly summing to 100% when a tie exists.

## Scenario generator

The generator is a seeded stochastic hill-climbing / simulated-annealing hybrid:

1. Start from a compact equal-population baseline.
2. Propose a swap across a district boundary.
3. Reject the swap if either affected district becomes disconnected.
4. Score the candidate according to the selected scenario.
5. Accept improvements and occasionally accept worse moves early in the search.
6. Return the best map observed.

The generator is intentionally heuristic. It does not prove optimality, sample uniformly from all valid maps, or imitate a production redistricting algorithm. “Algorithmic advantage” means only that a simple optimization objective can search valid maps for a preferred outcome.

### Packing objective

The packing score primarily rewards opponent seat wins, then rewards very large target-party surpluses in the districts the target party still wins. Compactness is a modest secondary term.

### Cracking objective

The cracking score primarily rewards opponent seat wins, then rewards target-party losses near the winning threshold and penalizes extremely concentrated target-party districts. On some voter geographies, packing and cracking can converge on similar seat totals because the finite grid limits feasible outcomes.

### Favor-party objective

The general optimization modes heavily reward target-party seats, add a smaller vote-to-seat amplification term, and apply a modest compactness preference. The compactness term is intentionally too small to override an additional seat.

## Difficulties and bugs encountered

### A visually tidy first baseline was not representative

An early proposed baseline used horizontal rectangular strips. With the original clustered voter pattern, those strips happened to create several lopsided districts. The final baseline mixes vertical rectangles and a horizontal center district. It is still only a reference shape and is never labeled “fair.”

### Generator validity versus speed

Allowing arbitrary cell reassignment made it easy to improve an objective, but frequently created disconnected districts or unequal populations. Growing districts from scratch would require more complicated repair logic. Boundary-cell swaps were selected because equal population is automatic and only two contiguity checks are needed per proposal.

### Tied districts

The original code assumed every district had a winner. Editable voters make ties common. The updated metrics layer gives ties an explicit winner code, tracks tied seat share, prevents division mistakes, and documents the efficiency-gap convention.

### Regeneration after voter edits

Automatically regenerating after every edited cell felt unpredictable and made it difficult to isolate cause and effect. The chosen behavior keeps boundaries fixed while voters are edited. Users explicitly select or regenerate a scenario when they want geometry to change.

### Terminology

The interface avoids presenting the compact baseline as a neutral or fair map. It also describes generated maps as constrained searches rather than definitive examples of legal or real-world gerrymandering.

## Approaches abandoned

- **Direct freehand district painting:** It would require repair tools for population balance and contiguity, introducing many broken states and distracting from the core lesson.
- **Real election or census datasets:** This would greatly increase data, legal, geographic, and interpretive complexity and would undermine the intentionally transparent toy model.
- **A single composite “fairness score”:** Combining unlike metrics into one number would hide value judgments and falsely imply an objective ranking.
- **Third-party charting and optimization libraries:** The current bars and search are small enough to implement directly, keeping bundle size and conceptual overhead low.
- **Uniform random valid-map sampling:** Producing a defensible ensemble requires more careful Markov-chain design, diagnostics, and explanation than this sandbox can responsibly claim.

## Correctness, simplicity, performance, and usability tradeoffs

The generator recomputes all district metrics for each accepted candidate. Incremental scoring would be faster, but full recomputation is easier to audit and remains practical for 100 cells.

Several thousand iterations run synchronously in the browser. On ordinary hardware this should be brief, but it can still cause a small pause. A Web Worker would improve responsiveness at the cost of additional architecture and messaging complexity.

The map uses HTML buttons rather than canvas or SVG. This creates more DOM nodes, but each cell gains native keyboard behavior, focus handling, and accessible labels without a custom interaction layer.

Only voter affiliation is editable. District geometry is generated rather than manually painted, reducing invalid states and keeping the distinction between population edits and map-search objectives clear.

## Mathematical and visualization limitations

- The grid has no real geography, population variation, roads, water, municipal boundaries, or communities of interest.
- The two-party, full-turnout model excludes third parties, abstention, turnout differences, and uncertainty.
- Polsby–Popper on unit grid cells is sensitive to stair-step boundaries and is not directly comparable with scores calculated from real polygons.
- Efficiency gap can be affected by natural geographic clustering and is not a standalone test of intent, legality, or representational quality.
- Competitive elections are not synonymous with representative outcomes.
- Vote share versus seat share is descriptive; single-member districts do not guarantee proportionality.
- Five districts create coarse seat-share jumps of 20 percentage points.
- The scenario objectives reflect deliberately chosen values. A different objective or penalty weight can return a different map.
- The search returns local optima and may not find the theoretically strongest map for a scenario.

## Interesting implementation details

- Generator seeds combine voter positions, scenario name, and a regeneration counter. A given voter pattern, scenario, and seed are reproducible.
- Shuffling changes only voter locations; the number of Blue and Red voters remains unchanged.
- District labels are placed on the district cell nearest its centroid, avoiding a separate geometric label-placement dependency.
- Boundary colors reflect district winners, while cell fill and letters reflect individual voters. This allows a learner to see both levels at once.
- Focus rings are inset on voter cells so keyboard focus remains visible without distorting the grid geometry.

## Possible future expansions

- Move generation into a Web Worker and expose iteration count / compactness weighting as advanced controls.
- Add an optional manual map editor with explicit population and contiguity repair guidance.
- Add undo/redo for voter edits and scenario changes.
- Add a small ensemble mode that generates many heuristic maps and plots an outcome distribution, carefully labeled as non-uniform.
- Add community-of-interest overlays to show why compactness and community preservation can conflict.
- Add export/import of toy scenarios as compact JSON.
- Add automated browser accessibility tests and visual regression screenshots.
- Add a comparison view that locks voters and places two maps side by side.
- Add multilingual educational copy without changing the underlying math.

## Validation strategy

The Node test suite checks:

- baseline equal population and contiguity;
- stable vote-share and seat-share denominators;
- compactness and efficiency-gap bounds;
- generated-map validity for every scenario mode; and
- voter edits changing totals without changing district geometry.

The production build is included in `npm run check`. A GitHub Actions workflow runs the same command on pushes and pull requests.
