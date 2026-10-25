<script>
  import { onMount } from "svelte";
  import AreaPanel from "./lib/AreaPanel.svelte";
  import DataTable from "./lib/DataTable.svelte";
  import Legend from "./lib/Legend.svelte";
  import MapView from "./lib/MapView.svelte";
  import { joinPopulation, loadJson } from "./lib/data.js";

  const base = import.meta.env.BASE_URL;

  // $state.raw: the GeoJSON is large and is handed to MapLibre's worker,
  // so it must stay a plain object rather than a reactive proxy.
  /** @type {any} */
  let geojson = $state.raw(null);
  /** @type {any} */
  let selected = $state.raw(null);
  let errorMessage = $state("");
  /** @type {'map' | 'table'} */
  let view = $state("map");

  /** @type {any[]} */
  const rows = $derived(
    geojson ? geojson.features.map((/** @type {any} */ f) => f.properties) : [],
  );

  /** @param {any} area */
  function selectArea(area) {
    selected = area;
  }

  onMount(async () => {
    try {
      const [boundaries, population] = await Promise.all([
        loadJson(`${base}data/local-authorities.geojson`),
        loadJson(`${base}data/population.json`),
      ]);

      const result = joinPopulation(boundaries, population);
      if (result.unmatched.length > 0) {
        console.warn(
          `${result.unmatched.length} areas have no population data:`,
          result.unmatched,
        );
      }
      geojson = result.geojson;
    } catch (error) {
      console.error(error);
      errorMessage =
        "Sorry, the data could not be loaded. Try refreshing the page.";
    }
  });
</script>

<header>
  <h1>Local Infrastructure Explorer</h1>
  <p>Population change by local authority</p>
</header>

<div class="toolbar">
  <div role="group" aria-label="Choose how to view the data">
    <button
      type="button"
      aria-pressed={view === "map"}
      onclick={() => (view = "map")}
    >
      Map
    </button>
    <button
      type="button"
      aria-pressed={view === "table"}
      onclick={() => (view = "table")}
    >
      Table
    </button>
  </div>
  <p>The table lists every area and works with a keyboard or screen reader.</p>
</div>

{#if errorMessage}
  <p class="message" role="alert">{errorMessage}</p>
{:else if !geojson}
  <p class="message">Loading data…</p>
{:else if view === "map"}
  <div class="layout">
    <div class="map-area">
      <MapView
        data={geojson}
        selectedCode={selected?.code ?? null}
        onselect={selectArea}
      />
    </div>
    <aside>
      <AreaPanel area={selected} />
      <Legend />
    </aside>
  </div>
{:else}
  <DataTable {rows} />
{/if}

<footer>
  <p>
    Population: Office for National Statistics mid-year estimates, mid-2025 and
    mid-2015. Boundaries: ONS Open Geography Portal, local authority districts
    (December 2025), generalised. Contains OS data © Crown copyright and
    database right 2026. Contains public sector information licensed under the
    Open Government Licence v3.0.
  </p>
</footer>

<style>
  header {
    padding: 1rem 1.5rem;
    border-bottom: 5px solid #1d70b8;
  }

  header p {
    margin: 0.25rem 0 0;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
  }

  .toolbar p {
    margin: 0;
  }

  .toolbar button {
    font: inherit;
    padding: 0.4rem 1rem;
    border: 2px solid #1d70b8;
    background: #ffffff;
    color: #1d70b8;
    cursor: pointer;
  }

  .toolbar button[aria-pressed="true"] {
    background: #1d70b8;
    color: #ffffff;
  }

  .message {
    padding: 1rem 1.5rem;
  }

  .layout {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 22rem;
    min-height: 32rem;
  }

  .map-area {
    min-height: 24rem;
  }

  aside {
    padding: 1rem 1.5rem;
    overflow: auto;
    border-left: 1px solid #b1b4b6;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  footer {
    padding: 0.75rem 1.5rem;
    border-top: 1px solid #b1b4b6;
    font-size: 0.85rem;
  }

  footer p {
    margin: 0;
  }

  @media (max-width: 48rem) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .map-area {
      height: 60vh;
    }

    aside {
      border-left: 0;
      border-top: 1px solid #b1b4b6;
    }
  }
</style>
