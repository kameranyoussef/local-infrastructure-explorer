<script>
    import { formatNumber, formatPercent } from "./format.js";

    /** @type {{ rows: any[] }} */
    let { rows } = $props();

    const columns = [
        { key: "name", label: "Area", numeric: false },
        { key: "geography", label: "Type", numeric: false },
        { key: "population", label: "Population, mid-2025", numeric: true },
        { key: "growth10y", label: "Change since mid-2015", numeric: true },
        { key: "growth1y", label: "Change since mid-2024", numeric: true },
    ];

    let sortKey = $state("name");
    let sortAscending = $state(true);

    const sorted = $derived(
        [...rows].sort((a, b) => {
            const x = a[sortKey];
            const y = b[sortKey];
            if (x == null) return 1;
            if (y == null) return -1;
            const result =
                typeof x === "number"
                    ? x - y
                    : String(x).localeCompare(String(y));
            return sortAscending ? result : -result;
        }),
    );

    /**
     * @param {string} key
     * @param {boolean} numeric
     */
    function setSort(key, numeric) {
        if (sortKey === key) {
            sortAscending = !sortAscending;
        } else {
            sortKey = key;
            sortAscending = !numeric;
        }
    }

    /**
     * @param {string} key
     * @returns {'ascending' | 'descending' | 'none'}
     */
    function ariaSort(key) {
        if (sortKey !== key) return "none";
        return sortAscending ? "ascending" : "descending";
    }

    /**
     * @param {any} row
     * @param {string} key
     */
    function cell(row, key) {
        if (key === "population") return formatNumber(row[key]);
        if (key === "growth10y" || key === "growth1y")
            return formatPercent(row[key]);
        return row[key] ?? "";
    }
</script>

<div
    class="table-wrap"
    role="region"
    aria-label="Population by local authority"
>
    <table>
        <caption>
            Population and change by local authority, ONS mid-year estimates for
            mid-2025. Use the column headings to sort.
        </caption>
        <thead>
            <tr>
                {#each columns as column}
                    <th
                        scope="col"
                        aria-sort={ariaSort(column.key)}
                        class:numeric={column.numeric}
                    >
                        <button
                            type="button"
                            onclick={() => setSort(column.key, column.numeric)}
                        >
                            {column.label}
                        </button>
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each sorted as row (row.code)}
                <tr>
                    {#each columns as column}
                        {#if column.key === "name"}
                            <th scope="row">{row.name}</th>
                        {:else}
                            <td class:numeric={column.numeric}
                                >{cell(row, column.key)}</td
                            >
                        {/if}
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .table-wrap {
        max-height: calc(100vh - 14rem);
        overflow: auto;
        margin: 0 1.5rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    caption {
        text-align: left;
        padding: 0.5rem 0;
    }

    th,
    td {
        padding: 0.5rem;
        border-bottom: 1px solid #b1b4b6;
        text-align: left;
    }

    thead th {
        position: sticky;
        top: 0;
        background: #ffffff;
    }

    tbody th {
        font-weight: normal;
    }

    .numeric {
        text-align: right;
    }

    button {
        font: inherit;
        font-weight: bold;
        background: none;
        border: 0;
        padding: 0;
        cursor: pointer;
        color: #1d70b8;
        text-align: inherit;
    }
</style>
