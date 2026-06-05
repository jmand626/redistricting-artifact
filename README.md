# Same Voters, Different Democracy

A small interactive web artifact for a CSE 480 project about computational redistricting and gerrymandering.

The app shows a simplified 10x10 grid of voters. The voters never change, but the district boundaries do. By switching between a compact baseline, packing, cracking, and an algorithmic advantage scenario, the visualization demonstrates how the same population can produce different election outcomes depending only on how districts are drawn.

This is a toy ethical visualization. It does not use real census data, real election data, or make claims about any real state.

## Run Locally

```bash
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173/`.

## Build

```bash
npm run build
```

The production build will be written to `dist/`.

## Deploy To GitHub Pages

This project is configured for a repository named `redistricting-artifact`. The Vite base path is set to `/redistricting-artifact/` in `vite.config.js`.

1. Create a GitHub repository named `redistricting-artifact`.
2. Push this project to that repository.
3. Install dependencies if you have not already:

```bash
npm install
```

4. Deploy the built site to the `gh-pages` branch:

```bash
npm run deploy
```

5. In GitHub, confirm that Pages is serving from the `gh-pages` branch.

If you want the `homepage` field in `package.json` to point to your exact page, replace `YOUR_GITHUB_USERNAME` with your GitHub username.

## Purpose

The artifact is meant to make one ethical point visible: district maps are not neutral containers around voters. They are part of the system that translates votes into representation.

The fixed key idea in the interface is:

> The map is not just a picture of democracy; it is one of the machines that produces it.

## AI Assistance Note

AI assistance was used to help generate the code for this Part 4 artifact, which is allowed for this project point.
