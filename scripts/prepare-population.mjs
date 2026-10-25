// Reads the ONS mid-year population estimates (sheet MYE4) and writes a
// compact JSON file of population and growth figures keyed by area code.
import ExcelJS from 'exceljs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/prepare-population.mjs <input.xlsx> <output.json>');
    process.exit(1);
}

const SHEET_NAME = 'MYE4';
const LATEST_YEAR = 2025;
const PREVIOUS_YEAR = 2024;
const BASE_YEAR = 2015;
const AREA_CODE = /^[ENSW]\d{8}$/;

/** Flatten ExcelJS cell values (formulas, rich text) to plain text or numbers. */
function plain(value) {
    if (value == null) return '';
    if (typeof value === 'object') {
        if ('result' in value) return value.result ?? '';
        if ('richText' in value) return value.richText.map((r) => r.text).join('');
        if ('text' in value) return String(value.text);
        return JSON.stringify(value);
    }
    return value;
}

function toNumber(value) {
    if (typeof value === 'number') return value;
    const parsed = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : NaN;
}

const percentChange = (latest, earlier) =>
    Number((((latest - earlier) / earlier) * 100).toFixed(1));

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(inputPath);

const sheet = workbook.getWorksheet(SHEET_NAME);
if (!sheet) {
    console.error(`Sheet "${SHEET_NAME}" not found in ${inputPath}`);
    process.exit(1);
}

// Find the header row rather than hard-coding its position.
let headerRow = 0;
for (let r = 1; r <= 20; r++) {
    if (String(plain(sheet.getRow(r).getCell(1).value)).trim() === 'Code') {
        headerRow = r;
        break;
    }
}
if (!headerRow) {
    console.error('Could not find a header row starting with "Code"');
    process.exit(1);
}

const columns = {};
sheet.getRow(headerRow).eachCell((cell, colNumber) => {
    columns[String(plain(cell.value)).trim()] = colNumber;
});

const required = [`Mid-${LATEST_YEAR}`, `Mid-${PREVIOUS_YEAR}`, `Mid-${BASE_YEAR}`];
for (const name of required) {
    if (!columns[name]) {
        console.error(`Column "${name}" not found. Headers seen: ${Object.keys(columns).join(', ')}`);
        process.exit(1);
    }
}

const areas = {};
for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const code = String(plain(row.getCell(columns['Code']).value)).trim();
    if (!AREA_CODE.test(code)) continue;

    const latest = toNumber(plain(row.getCell(columns[`Mid-${LATEST_YEAR}`]).value));
    const previous = toNumber(plain(row.getCell(columns[`Mid-${PREVIOUS_YEAR}`]).value));
    const base = toNumber(plain(row.getCell(columns[`Mid-${BASE_YEAR}`]).value));
    if ([latest, previous, base].some(Number.isNaN)) continue;

    areas[code] = {
        geography: String(plain(row.getCell(columns['Geography']).value)).trim(),
        population: latest,
        populationPrevious: previous,
        populationBase: base,
        growth1y: percentChange(latest, previous),
        growth10y: percentChange(latest, base)
    };
}

// Barnsley and Sheffield have new codes in the December 2025 boundaries but
// still use their previous codes in the mid-2025 population release. They
// were matched by name and area type (metropolitan district). Keys are the
// boundary codes, values are the population-file codes.
const CODE_ALIASES = {
    E08000038: 'E08000016', // Barnsley
    E08000039: 'E08000019' // Sheffield
};

for (const [boundaryCode, populationCode] of Object.entries(CODE_ALIASES)) {
    if (areas[populationCode]) {
        areas[boundaryCode] = areas[populationCode];
    } else {
        console.warn(`Alias target ${populationCode} not found for ${boundaryCode}`);
    }
}

const output = {
    meta: {
        source: 'ONS mid-year population estimates, mid-2025 release (table MYE4)',
        latestYear: LATEST_YEAR,
        baseYear: BASE_YEAR
    },
    areas
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(output));
console.log(`Wrote ${Object.keys(areas).length} areas to ${outputPath}`);