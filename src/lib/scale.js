// Colour scale for 10-year population growth (%), shared by the map
// and, later, the legend.
export const BREAKS = [0, 4, 8, 12, 16];

export const COLOURS = [
    '#e08e45', // below 0%: population fell
    '#deebf7',
    '#9ecae1',
    '#6baed6',
    '#3182bd',
    '#08519c'
];

export const NO_DATA_COLOUR = '#cccccc';

/**
 * MapLibre expression colouring a feature by a numeric property,
 * with a neutral colour where the property is missing.
 * @param {string} property
 * @returns {import('maplibre-gl').ExpressionSpecification}
 */
export function growthColourExpression(property = 'growth10y') {
    /** @type {any[]} */
    const steps = ['step', ['get', property], COLOURS[0]];
    BREAKS.forEach((breakpoint, i) => steps.push(breakpoint, COLOURS[i + 1]));

    return /** @type {any} */ ([
        'case',
        ['==', ['typeof', ['get', property]], 'number'],
        steps,
        NO_DATA_COLOUR
    ]);
}