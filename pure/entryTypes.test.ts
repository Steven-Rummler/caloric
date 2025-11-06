import dayjs from 'dayjs';
import { expect, it } from 'vitest';
import { entryTypes, entryTypeUnit, entryTypeLabel, displayDate } from './entryTypes';

it('entryTypes should contain food and weight', () => {
  expect(entryTypes).toEqual(['food', 'weight']);
});

it('entryTypeUnit should return correct units', () => {
  expect(entryTypeUnit('food')).toBe('Calories');
  expect(entryTypeUnit('weight')).toBe('Pounds');
});

it('entryTypeLabel should return correct labels', () => {
  expect(entryTypeLabel('food')).toBe('Food\nCalories');
  expect(entryTypeLabel('weight')).toBe('Weight');
});

it('displayDate should format dates correctly for food entries', () => {
  const date = dayjs('2023-12-25 14:30:00');
  const formatted = displayDate(date, 'food');
  expect(formatted).toBe('Monday, December 25, 2:30 pm');
});

it('displayDate should format dates correctly for weight entries', () => {
  const date = dayjs('2023-12-25 14:30:00');
  const formatted = displayDate(date, 'weight');
  expect(formatted).toBe('Monday, December 25, 2:30 pm');
});

it('displayDate should handle different times correctly', () => {
  const morningDate = dayjs('2023-01-01 08:15:00');
  const eveningDate = dayjs('2023-01-01 20:45:00');

  expect(displayDate(morningDate, 'food')).toBe('Sunday, January 1, 8:15 am');
  expect(displayDate(eveningDate, 'food')).toBe('Sunday, January 1, 8:45 pm');
});
