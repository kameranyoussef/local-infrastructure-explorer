/**
 * Fetch and parse a JSON file, throwing a clear error on failure.
 * @param {string} url
 */
export async function loadJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.json();
}

/**
 * Attach population statistics to boundary features, matching on area code.
 * Returns the joined GeoJSON and the names of any areas with no match.
 *
 * @param {{ type: string, features: any[] }} boundaries
 * @param {{ areas: Record<string, object> }} population
 */
export function joinPopulation(boundaries, population) {
    /** @type {string[]} */
    const unmatched = [];

    const features = boundaries.features.map((feature) => {
        const stats = population.areas[feature.properties.code];
        if (!stats) {
            unmatched.push(feature.properties.name);
            return feature;
        }
        return { ...feature, properties: { ...feature.properties, ...stats } };
    });

    return { geojson: { ...boundaries, features }, unmatched };
}