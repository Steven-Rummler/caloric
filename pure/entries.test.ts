import dayjs from 'dayjs';
import { expect, it } from 'vitest';
import { entry } from '../types';
import {
  calculateDailyPassiveCalories,
  caloriesAtTimestamp,
  dayDiff,
  foodCaloriesAtTimestamp,
  getEntriesForDay,
  getEntriesForType,
  getFirstDay,
  getLastDay,
} from './entries';
import { generateDefaultEntries } from './defaultEntries';
import { maxAcceptableProcessingTime } from './test';

const defaultPassiveCalories = 1500;

const sampleEntries: entry[] = [
  {
    entryType: 'food',
    timestamp: dayjs().subtract(2, 'days').add(8, 'hours').toJSON(),
    number: 500,
  },
  {
    entryType: 'food',
    timestamp: dayjs().subtract(2, 'days').add(12, 'hours').toJSON(),
    number: 600,
  },
  {
    entryType: 'weight',
    timestamp: dayjs().subtract(2, 'days').add(7, 'hours').toJSON(),
    number: 150,
  },
  {
    entryType: 'food',
    timestamp: dayjs().subtract(1, 'days').add(8, 'hours').toJSON(),
    number: 700,
  },
  {
    entryType: 'weight',
    timestamp: dayjs().subtract(1, 'days').add(7, 'hours').toJSON(),
    number: 149,
  },
];

it('getEntriesForType should filter entries by type', () => {
  const foodEntries = getEntriesForType(sampleEntries, 'food');
  const weightEntries = getEntriesForType(sampleEntries, 'weight');

  expect(foodEntries).toHaveLength(3);
  expect(weightEntries).toHaveLength(2);
  expect(foodEntries.every(entry => entry.entryType === 'food')).toBe(true);
  expect(weightEntries.every(entry => entry.entryType === 'weight')).toBe(true);
});

it('getEntriesForDay should filter entries by day', () => {
  const twoDaysAgo = dayjs().subtract(2, 'days');
  const entriesForTwoDaysAgo = getEntriesForDay(sampleEntries, twoDaysAgo);

  expect(entriesForTwoDaysAgo).toHaveLength(2);
  expect(entriesForTwoDaysAgo.every(entry =>
    dayjs(entry.timestamp).isSame(twoDaysAgo, 'day')
  )).toBe(true);
});

it('getFirstDay should return the earliest day', () => {
  const firstDay = getFirstDay(sampleEntries);
  const expectedFirstDay = dayjs().subtract(2, 'days').startOf('day');

  expect(firstDay.isSame(expectedFirstDay, 'day')).toBe(true);
});

it('getLastDay should return the latest day', () => {
  const lastDay = getLastDay(sampleEntries);
  const expectedLastDay = dayjs().subtract(1, 'days').startOf('day');

  expect(lastDay.isSame(expectedLastDay, 'day')).toBe(true);
});

it('getFirstDay and getLastDay should handle empty entries', () => {
  const now = dayjs();
  expect(getFirstDay([]).isSame(now, 'day')).toBe(true);
  expect(getLastDay([]).isSame(now, 'day')).toBe(true);
});

it('foodCaloriesAtTimestamp should calculate cumulative food calories', () => {
  const timestamp = dayjs().subtract(1, 'days').add(10, 'hours');
  const calories = foodCaloriesAtTimestamp(sampleEntries, timestamp);

  // Should include the 500 + 600 from 2 days ago, and the 700 from yesterday before 10am
  expect(calories).toBe(1800);
});

it('caloriesAtTimestamp should include passive calories', () => {
  const timestamp = dayjs().subtract(1, 'days').add(10, 'hours');
  const calories = caloriesAtTimestamp(sampleEntries, timestamp, defaultPassiveCalories);

  // Food calories (1800) + passive calories for days from first entry to timestamp
  expect(calories).toBeCloseTo(3487.5, 0);
});

it('dayDiff should calculate days between dates', () => {
  const start = dayjs('2023-01-01');
  const end = dayjs('2023-01-03');

  expect(dayDiff(start, end)).toBe(2);
});

it('calculateDailyPassiveCalories should return default when insufficient weight data', () => {
  const foodOnlyEntries = sampleEntries.filter(entry => entry.entryType === 'food');
  expect(calculateDailyPassiveCalories(foodOnlyEntries)).toBe(-1500);

  const singleWeightEntry = sampleEntries.filter(entry => entry.entryType === 'weight').slice(0, 1);
  expect(calculateDailyPassiveCalories(singleWeightEntry)).toBe(-1500);
});

it('calculateDailyPassiveCalories should calculate passive calories from weight and food data', () => {
  const result = calculateDailyPassiveCalories(sampleEntries);
  expect(typeof result).toBe('number');
  expect(result).not.toBe(-1500); // Should be calculated, not default
});

it('calculateDailyPassiveCalories should be performant with large datasets', () => {
  const largeEntries = generateDefaultEntries({
    days: 365, // 365 days per section
    meals: 3,
    dailyCalories: 2000,
    calorieVariation: 500,
    sections: 10, // 10 sections = 10 years
    gapDays: 0, // No gaps
    initialWeight: 150,
  });

  const start = performance.now();
  const result = calculateDailyPassiveCalories(largeEntries);
  const end = performance.now();

  expect(typeof result).toBe('number');
  expect(end - start).toBeLessThan(maxAcceptableProcessingTime); // Should complete in under 48ms
});

it('caloriesAtTimestamp should be performant with large datasets', () => {
  const largeEntries = generateDefaultEntries({
    days: 365, // 365 days per section
    meals: 4,
    dailyCalories: 2200,
    calorieVariation: 800,
    sections: 10, // 10 sections = 10 years
    gapDays: 0, // No gaps
    initialWeight: 160,
  });

  const timestamp = dayjs().subtract(100, 'days');

  const start = performance.now();
  const result = caloriesAtTimestamp(largeEntries, timestamp, defaultPassiveCalories);
  const end = performance.now();

  expect(typeof result).toBe('number');
  expect(end - start).toBeLessThan(maxAcceptableProcessingTime); // Should complete in under 48ms
});

it('foodCaloriesAtTimestamp should be performant with large datasets', () => {
  const largeEntries = generateDefaultEntries({
    days: 365, // 365 days per section
    meals: 6,
    dailyCalories: 2500,
    calorieVariation: 1000,
    sections: 10, // 10 sections = 10 years
    gapDays: 0, // No gaps
    initialWeight: 140,
  });

  const timestamp = dayjs().subtract(50, 'days');

  const start = performance.now();
  const result = foodCaloriesAtTimestamp(largeEntries, timestamp);
  const end = performance.now();

  expect(typeof result).toBe('number');
  expect(end - start).toBeLessThan(maxAcceptableProcessingTime); // Should complete in under 48ms
});
