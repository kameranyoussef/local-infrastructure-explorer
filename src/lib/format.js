const numberFormat = new Intl.NumberFormat('en-GB');

/** @param {number | null | undefined} value */
export function formatNumber(value) {
    return typeof value === 'number' ? numberFormat.format(value) : 'No data';
}

/** @param {number | null | undefined} value */
export function formatPercent(value) {
    if (typeof value !== 'number') return 'No data';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
}