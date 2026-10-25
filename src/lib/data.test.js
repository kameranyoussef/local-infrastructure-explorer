import { afterEach, describe, expect, it, vi } from 'vitest';
import { joinPopulation, loadJson } from './data.js';

const boundaries = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', properties: { code: 'E06000001', name: 'Hartlepool' }, geometry: null },
        { type: 'Feature', properties: { code: 'E06000002', name: 'Middlesbrough' }, geometry: null }
    ]
};

const population = {
    areas: {
        E06000001: { geography: 'Unitary Authority', population: 100, growth10y: 5.2 }
    }
};

describe('joinPopulation', () => {
    it('attaches statistics to features with a matching code', () => {
        const { geojson } = joinPopulation(boundaries, population);

        expect(geojson.features[0].properties).toEqual({
            code: 'E06000001',
            name: 'Hartlepool',
            geography: 'Unitary Authority',
            population: 100,
            growth10y: 5.2
        });
    });

    it('leaves unmatched features unchanged and reports their names', () => {
        const { geojson, unmatched } = joinPopulation(boundaries, population);

        expect(unmatched).toEqual(['Middlesbrough']);
        expect(geojson.features[1].properties).toEqual({
            code: 'E06000002',
            name: 'Middlesbrough'
        });
    });

    it('reports nothing when every area matches', () => {
        const everyArea = {
            areas: {
                E06000001: { population: 1 },
                E06000002: { population: 2 }
            }
        };

        expect(joinPopulation(boundaries, everyArea).unmatched).toEqual([]);
    });

    it('does not modify the original boundaries', () => {
        const before = structuredClone(boundaries);

        joinPopulation(boundaries, population);

        expect(boundaries).toEqual(before);
    });
});

describe('loadJson', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns parsed JSON for a successful response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ a: 1 }) })
        );

        await expect(loadJson('/data.json')).resolves.toEqual({ a: 1 });
    });

    it('throws a clear error when the response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

        await expect(loadJson('/missing.json')).rejects.toThrow('Failed to load /missing.json: 404');
    });
});