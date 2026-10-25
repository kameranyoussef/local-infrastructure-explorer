<script>
    import { Map, NavigationControl } from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";

    /** @type {HTMLDivElement} */
    let container;

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

        return () => map.remove();
    });
</script>

<div
    class="map"
    bind:this={container}
    role="region"
    aria-label="Map of the United Kingdom "
></div>

<style>
    .map {
        width: 100%;
        height: 100%;
    }
</style>
