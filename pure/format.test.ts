import { expect, it } from 'vitest';
import { sig3 } from './format';

it('sig3 should format numbers with maximum 3 significant digits', () => {
  expect(sig3(1234)).toBe('1,230');
  expect(sig3(123.4)).toBe('123');
  expect(sig3(12.34)).toBe('12.3');
  expect(sig3(1.234)).toBe('1.23');
  expect(sig3(0.1234)).toBe('0.123');
  expect(sig3(0.01234)).toBe('0.0123');
});

it('sig3 should handle edge cases', () => {
  expect(sig3(0)).toBe('0');
  expect(sig3(1000000)).toBe('1,000,000');
  expect(sig3(-123.4)).toBe('-123');
  expect(sig3(1.0001)).toBe('1');
});

it('sig3 should format large numbers correctly', () => {
  expect(sig3(1000000000)).toBe('1,000,000,000');
  expect(sig3(123456789)).toBe('123,000,000');
});

it('sig3 should format small decimals correctly', () => {
  expect(sig3(0.0001234)).toBe('0.000123');
  expect(sig3(0.00001234)).toBe('0.0000123');
});
