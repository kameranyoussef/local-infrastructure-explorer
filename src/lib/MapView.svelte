<script>
    import { Map, NavigationControl } from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";

    /** @type {HTMLDivElement} */
    let container;

    const dataUrl = new URL(
        `${import.meta.env.BASE_URL}data/local-authorities.geojson`,
        window.location.origin,
    ).href;

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

        map.on("load", () => {
            map.addSource("local-authorities", {
                type: "geojson",
                data: dataUrl,
            });

            map.addLayer({
                id: "la-fill",
                type: "fill",
                source: "local-authorities",
                paint: {
                    "fill-color": "#1d70b8",
                    "fill-opacity": 0.35,
                },
            });

            map.addLayer({
                id: "la-outline",
                type: "line",
                source: "local-authorities",
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 0.8,
                },
            });
        });

        return () => map.remove();
    });
</script>

<div
    class="map"
    bind:this={container}
    role="region"
    aria-label="Map of the United Kingdom"
></div>

<style>
    .map {
        width: 100%;
        height: 100%;
    }
</style>
