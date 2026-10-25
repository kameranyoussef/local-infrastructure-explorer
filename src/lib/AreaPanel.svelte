<script>
    import { formatNumber, formatPercent } from "./format.js";

    /** @type {{ area: any }} */
    let { area } = $props();
</script>

<section aria-labelledby="area-heading" aria-live="polite">
    {#if area}
        <h2 id="area-heading">{area.name}</h2>
        {#if typeof area.population === "number"}
            <dl>
                <div>
                    <dt>Type</dt>
                    <dd>{area.geography}</dd>
                </div>
                <div>
                    <dt>Population, mid-2025</dt>
                    <dd>{formatNumber(area.population)}</dd>
                </div>
                <div>
                    <dt>Population, mid-2015</dt>
                    <dd>{formatNumber(area.populationBase)}</dd>
                </div>
                <div>
                    <dt>Change since mid-2015</dt>
                    <dd>{formatPercent(area.growth10y)}</dd>
                </div>
                <div>
                    <dt>Change since mid-2024</dt>
                    <dd>{formatPercent(area.growth1y)}</dd>
                </div>
            </dl>
        {:else}
            <p>No population data is available for this area.</p>
        {/if}
    {:else}
        <h2 id="area-heading">Area details</h2>
        <p>
            Select a local authority on the map to see its population figures.
        </p>
    {/if}
</section>

<style>
    h2 {
        font-size: 1.25rem;
        margin: 0 0 0.75rem;
    }

    dl {
        margin: 0;
    }

    dl div {
        padding: 0.5rem 0;
        border-bottom: 1px solid #b1b4b6;
    }

    dt {
        font-weight: bold;
    }

    dd {
        margin: 0;
    }
</style>
