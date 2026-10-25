<script>
    import { LEGEND_ITEMS, NO_DATA_COLOUR } from "./scale.js";
</script>

<section aria-labelledby="legend-heading">
    <h2 id="legend-heading">Population change, mid-2015 to mid-2025</h2>
    <ul>
        {#each LEGEND_ITEMS as item}
            <li>
                <span class="swatch" style:background-color={item.colour}
                ></span>
                {item.label}
            </li>
        {/each}
        <li>
            <span class="swatch" style:background-color={NO_DATA_COLOUR}></span>
            No data
        </li>
    </ul>
</section>

<style>
    h2 {
        font-size: 1.1rem;
        margin: 0 0 0.5rem;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    li {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.3rem;
    }

    .swatch {
        display: inline-block;
        width: 1.4rem;
        height: 1.1rem;
        border: 1px solid #505a5f;
    }
</style>
