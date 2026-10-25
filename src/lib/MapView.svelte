<script>
    import { Map, NavigationControl } from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";
    import { joinPopulation, loadJson } from "./data.js";
    import { growthColourExpression } from "./scale.js";

    /** @type {HTMLDivElement} */
    let container;

    const base = import.meta.env.BASE_URL;

    onMount(() => {
        const map = new Map({
            container,
            style: "https://tiles.openfreemap.org/styles/positron",
            center: [-3.5, 54.5],
            zoom: 5,
            minZoom: 4,
            maxZoom: 12,
        });

        map.addControl(new NavigationControl(), "top-right");

        map.on("load", async () => {
            try {
                const [boundaries, population] = await Promise.all([
                    loadJson(`${base}data/local-authorities.geojson`),
                    loadJson(`${base}data/population.json`),
                ]);

                const { geojson, unmatched } = joinPopulation(
                    boundaries,
                    population,
                );
                if (unmatched.length > 0) {
                    console.warn(
                        `${unmatched.length} areas have no population data:`,
                        unmatched,
                    );
                }

                map.addSource("local-authorities", {
                    type: "geojson",
                    data: geojson,
                });

                map.addLayer({
                    id: "la-fill",
                    type: "fill",
                    source: "local-authorities",
                    paint: {
                        "fill-color": growthColourExpression("growth10y"),
                        "fill-opacity": 0.8,
                    },
                });

                map.addLayer({
                    id: "la-outline",
                    type: "line",
                    source: "local-authorities",
                    paint: {
                        "line-color": "#ffffff",
                        "line-width": 0.6,
                    },
                });
            } catch (error) {
                console.error("Could not load map data", error);
            }
        });

        return () => map.remove();
    });
</script>

<div
    class="map"
    bind:this={container}
    role="region"
    aria-label="Map of population growth by local authority in the United Kingdom"
></div>

<style>
    .map {
        width: 100%;
        height: 100%;
    }
</style>
