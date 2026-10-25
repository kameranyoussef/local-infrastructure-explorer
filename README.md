# Local Infrastructure Explorer

[![Test and deploy](https://github.com/kameranyoussef/local-infrastructure-explorer/actions/workflows/deploy.yml/badge.svg)](https://github.com/kameranyoussef/local-infrastructure-explorer/actions/workflows/deploy.yml)

An interactive map of population change across the UK's local authorities, built with Svelte and MapLibre GL JS.

**Live site:** https://kameranyoussef.github.io/local-infrastructure-explorer/

I built this as a small project to explore the kind of place-based spatial tooling used for infrastructure planning: combining official boundary and statistical data in one accessible web interface.

## What it does

- Colours each of the 361 UK local authority areas by population change between mid-2015 and mid-2025.
- Click an area to see its population, and its change since mid-2015 and mid-2024.
- A legend explains the colour scale.
- A sortable table view lists every area, so the data can be used with a keyboard or screen reader without the map.

## Tech

- **Svelte 5** and **Vite** for the front end
- **MapLibre GL JS 6** for the map, with an OpenFreeMap basemap
- **Vitest** for unit tests
- **GitHub Actions** to run the tests, build, and deploy to GitHub Pages on every push to `main`
- **Node.js** scripts (`exceljs`, `proj4`, `mapshaper`) that prepare the source data

## Data

| Data | Source |
|---|---|
| Local authority boundaries | [ONS Open Geography Portal](https://www.data.gov.uk/dataset/e2f256dc-9313-487b-8190-46b0da8c2798/local-authority-districts-december-2025-boundaries-uk-bgc): Local Authority Districts (December 2025) Boundaries UK BGC (generalised to 20m) |
| Population estimates | [ONS mid-year population estimates](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland): mid-2025 release, table MYE4 |

Contains OS data © Crown copyright and database right 2026. Contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

This is a personal project and is not an official ONS product.

### Data preparation

The boundaries arrive in British National Grid coordinates, so `scripts/prepare-boundaries.mjs` reprojects them to longitude/latitude and keeps only the area code and name. `mapshaper` then simplifies the shapes, which brings the file from about 10 MB to a size suitable for the web. `scripts/prepare-population.mjs` reads the ONS spreadsheet and writes population and growth figures keyed by area code. The map joins the two files on that code.

### Known data caveat

Barnsley and Sheffield have new area codes in the December 2025 boundaries (`E08000038`, `E08000039`) but still use their previous codes in the mid-2025 population release (`E08000016`, `E08000019`). I matched them by name and area type, and the mapping is recorded in `scripts/prepare-population.mjs`. I have not established why the codes changed, so the population figures for these two areas may refer to a slightly different area than the boundary shown.

## Design decisions

- **Ten-year change rather than one-year change.** A single year of population estimates is noisy, so the map colours by change since mid-2015. The one-year figure is still shown in the details panel.
- **Fixed colour classes** with a legend generated from the same breakpoints as the map, so the two cannot drift apart.
- **A table alongside the map.** A map you can only click is not usable by everyone, so the same data is available as a sortable table.
- **Pure functions for the logic.** The data join, number formatting and colour scale are plain functions with unit tests, separate from the Svelte components.

## Accessibility

Built with accessibility in mind: semantic headings, labelled regions, a table alternative to the map, keyboard-operable controls with a visible focus indicator, and text labels for every colour class. This has not had a formal audit, and the map itself cannot be operated by keyboard, which is why the table view exists.

## Running it locally

Requires Node.js.

```bash
git clone https://github.com/kameranyoussef/local-infrastructure-explorer.git
cd local-infrastructure-explorer
npm install
npm run dev
```

The prepared data files are committed in `public/data`, so the app runs without any extra steps.

### Rebuilding the data

1. Download the two source files and save them as:
   - `data/raw/local-authorities-bng.geojson` (the GeoJSON download from the boundaries dataset above)
   - `data/raw/mye25tablesuk.xlsx` (the mid-2025 file from the population dataset above)
2. Run:

```bash
npm run prepare-data
npm run prepare-population
```

### Other commands

```bash
npm test          # run the unit tests
npm run build     # production build
npm run preview   # serve the production build locally
```

## Possible next steps

- Add housing data (for example, dwelling stock by local authority) as a second layer.
- Add a keyboard-accessible area search.
- Run an automated accessibility check in CI.