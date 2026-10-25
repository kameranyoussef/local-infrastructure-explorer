// Prints each sheet's name, size and first rows so we can see a
// spreadsheet's layout before writing code against it.
import ExcelJS from 'exceljs';

const [path, maxRows = '8'] = process.argv.slice(2);

if (!path) {
    console.error('Usage: node scripts/inspect-xlsx.mjs <file.xlsx> [rowsPerSheet]');
    process.exit(1);
}

/** Flatten ExcelJS cell values (formulas, rich text) to plain text. */
function plain(value) {
    if (value == null) return '';
    if (typeof value === 'object') {
        if ('result' in value) return String(value.result ?? '');
        if ('richText' in value) return value.richText.map((r) => r.text).join('');
        if ('text' in value) return String(value.text);
        return JSON.stringify(value);
    }
    return String(value);
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(path);

workbook.eachSheet((sheet) => {
    console.log(`\n=== "${sheet.name}" (${sheet.rowCount} rows x ${sheet.columnCount} cols)`);
    const limit = Math.min(Number(maxRows), sheet.rowCount);
    for (let r = 1; r <= limit; r++) {
        const cells = sheet.getRow(r).values.slice(1, 9).map(plain);
        console.log(`${r}: ${cells.join(' | ').slice(0, 220)}`);
    }
});