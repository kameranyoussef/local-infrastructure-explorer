import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent } from './format.js';

describe('formatNumber', () => {
    it('adds thousands separators', () => {
        expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('shows "No data" for missing values', () => {
        expect(formatNumber(null)).toBe('No data');
        expect(formatNumber(undefined)).toBe('No data');
    });
});

describe('formatPercent', () => {
    it('adds a plus sign to growth and rounds to one decimal place', () => {
        expect(formatPercent(4.24)).toBe('+4.2%');
    });

    it('keeps the minus sign for decline', () => {
        expect(formatPercent(-2.06)).toBe('-2.1%');
    });

    it('shows zero without a sign', () => {
        expect(formatPercent(0)).toBe('0.0%');
    });

    it('shows "No data" for missing values', () => {
        expect(formatPercent(null)).toBe('No data');
    });
});