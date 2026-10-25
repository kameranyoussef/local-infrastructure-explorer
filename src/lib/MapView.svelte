<script>
    import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
    import { onMount } from "svelte";
    // @ts-ignore - Vite's ?worker&url suffix isn't known to the type checker
    import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { growthColourExpression } from "./scale.js";

    setWorkerUrl(workerUrl);

    /** @type {{ data: any, selectedCode: string | null, onselect: (area: any) => void }} */
    let { data, selectedCode, onselect } = $props();

    /** @type {HTMLDivElement} */
    let container;

    /** @type {Map | undefined} */
    let map;
    let ready = $state(false);

    /**
     * @param {string | null} code
     * @returns {any}
     */
    function selectionFilter(code) {
        return ["==", ["get", "code"], code ?? ""];
    }

    onMount(() => {
        const instance = new Map({
            container,
            style: "https://tiles.openfreemap.org/styles/positron",
            center: [-3.5, 54.5],
            zoom: 5,
            minZoom: 4,
            maxZoom: 12,
        });
        map = instance;

        instance.addControl(new NavigationControl(), "top-right");

        instance.on("load", () => {
            instance.addSource("local-authorities", { type: "geojson", data });

            instance.addLayer({
                id: "la-fill",
                type: "fill",
                source: "local-authorities",
                paint: {
                    "fill-color": growthColourExpression("growth10y"),
                    "fill-opacity": 0.8,
                },
            });

            instance.addLayer({
                id: "la-outline",
                type: "line",
                source: "local-authorities",
                paint: { "line-color": "#ffffff", "line-width": 0.6 },
            });

            instance.addLayer({
                id: "la-selected",
                type: "line",
                source: "local-authorities",
                filter: selectionFilter(selectedCode),
                paint: { "line-color": "#0b0c0c", "line-width": 3 },
            });

            instance.on("click", "la-fill", (event) => {
                const feature = event.features?.[0];
                if (feature) onselect(feature.properties);
            });

            instance.on("mouseenter", "la-fill", () => {
                instance.getCanvas().style.cursor = "pointer";
            });

            instance.on("mouseleave", "la-fill", () => {
                instance.getCanvas().style.cursor = "";
            });

            ready = true;
        });

        return () => instance.remove();
    });

    // Keep the highlighted outline in step with the selected area.
    $effect(() => {
        if (ready && map) {
            map.setFilter("la-selected", selectionFilter(selectedCode));
        }
    });
</script>

<div
    class="map"
    bind:this={container}
    role="region"
    aria-label="Map of population change by local authority in the United Kingdom. A table view is also available."
></div>

<style>
    .map {
        width: 100%;
        height: 100%;
    }
</style>
