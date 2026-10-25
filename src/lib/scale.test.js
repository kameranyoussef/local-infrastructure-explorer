import { describe, expect, it } from 'vitest';
import {
    BREAKS,
    COLOURS,
    LEGEND_ITEMS,
    NO_DATA_COLOUR,
    growthColourExpression
} from './scale.js';

describe('colour scale', () => {
    it('has one more colour than breakpoints', () => {
        expect(COLOURS).toHaveLength(BREAKS.length + 1);
    });

    it('has breakpoints in ascending order', () => {
        const sorted = [...BREAKS].sort((a, b) => a - b);
        expect(BREAKS).toEqual(sorted);
    });
});

describe('LEGEND_ITEMS', () => {
    it('has one entry per colour', () => {
        expect(LEGEND_ITEMS).toHaveLength(COLOURS.length);
    });

    it('labels the first, middle and last classes', () => {
        expect(LEGEND_ITEMS[0].label).toBe('Below 0%');
        expect(LEGEND_ITEMS[2].label).toBe('4% to under 8%');
        expect(LEGEND_ITEMS.at(-1)?.label).toBe('16% or more');
    });
});

describe('growthColourExpression', () => {
    it('falls back to the no-data colour when the property is not a number', () => {
        const expression = /** @type {any[]} */ (growthColourExpression('growth10y'));

        expect(expression[0]).toBe('case');
        expect(expression.at(-1)).toBe(NO_DATA_COLOUR);
    });

    it('builds a step expression covering every colour', () => {
        const expression = /** @type {any[]} */ (growthColourExpression('growth10y'));
        const steps = expression[2];

        expect(steps).toEqual([
            'step',
            ['get', 'growth10y'],
            COLOURS[0],
            0, COLOURS[1],
            4, COLOURS[2],
            8, COLOURS[3],
            12, COLOURS[4],
            16, COLOURS[5]
        ]);
    });
});