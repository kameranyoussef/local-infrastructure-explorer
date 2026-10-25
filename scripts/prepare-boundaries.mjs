// Reprojects ONS local authority boundaries from British National Grid
// (EPSG:27700) to WGS84 longitude/latitude, as MapLibre expects, and
// keeps only the properties the app uses.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import proj4 from 'proj4';

const BRITISH_NATIONAL_GRID =
    '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 ' +
    '+ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/prepare-boundaries.mjs <input.geojson> <output.geojson>');
    process.exit(1);
}

const converter = proj4(BRITISH_NATIONAL_GRID, 'WGS84');

/** Recursively reproject nested coordinate arrays, rounding to ~1m. */
function reproject(coords) {
    if (typeof coords[0] === 'number') {
        const [lng, lat] = converter.forward(coords);
        return [Number(lng.toFixed(5)), Number(lat.toFixed(5))];
    }
    return coords.map(reproject);
}

const input = JSON.parse(readFileSync(inputPath, 'utf8'));

const output = {
    type: 'FeatureCollection',
    features: input.features.map((feature) => ({
        type: 'Feature',
        properties: {
            code: feature.properties.LAD25CD,
            name: feature.properties.LAD25NM
        },
        geometry: {
            type: feature.geometry.type,
            coordinates: reproject(feature.geometry.coordinates)
        }
    }))
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(output));
console.log(`Wrote ${output.features.length} features to ${outputPath}`);