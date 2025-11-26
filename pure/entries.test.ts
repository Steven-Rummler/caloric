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

const defaultPassiveCalories = 1500;

it('getEntriesForType should filter entries by type', () => {
  const entries: entry[] = [
    { entryType: 'food', timestamp: '2023-01-01T08:00:00.000Z', number: 500 },
    { entryType: 'weight', timestamp: '2023-01-01T07:00:00.000Z', number: 150 },
    { entryType: 'food', timestamp: '2023-01-01T12:00:00.000Z', number: 600 },
  ];
  const foodEntries = getEntriesForType(entries, 'food');
  const weightEntries = getEntriesForType(entries, 'weight');

  expect(foodEntries).toHaveLength(2);
  expect(weightEntries).toHaveLength(1);
  expect(foodEntries.every(entry => entry.entryType === 'food')).toBe(true);
  expect(weightEntries.every(entry => entry.entryType === 'weight')).toBe(true);
});

it('getEntriesForDay should filter entries by day', () => {
  const twoDaysAgo = dayjs().subtract(2, 'days').startOf('day');
  const entries: entry[] = [
    { entryType: 'food', timestamp: twoDaysAgo.add(8, 'hours').toJSON(), number: 500 },
    { entryType: 'food', timestamp: twoDaysAgo.add(12, 'hours').toJSON(), number: 600 },
    { entryType: 'weight', timestamp: twoDaysAgo.add(7, 'hours').toJSON(), number: 150 },
    { entryType: 'food', timestamp: dayjs().subtract(1, 'days').startOf('day').add(8, 'hours').toJSON(), number: 700 },
  ];
  const entriesForTwoDaysAgo = getEntriesForDay(entries, twoDaysAgo);

  expect(entriesForTwoDaysAgo).toHaveLength(3);
  expect(entriesForTwoDaysAgo.every(entry =>
    dayjs(entry.timestamp).isSame(twoDaysAgo, 'day')
  )).toBe(true);
});

it('getFirstDay should return the earliest day', () => {
  const dayOne = dayjs().subtract(2, 'days').startOf('day');
  const dayTwo = dayjs().subtract(1, 'days').startOf('day');
  const firstDay = getFirstDay([
    { entryType: 'food', timestamp: dayTwo.toJSON(), number: 100 },
    { entryType: 'food', timestamp: dayOne.toJSON(), number: 200 },
  ]);
  
  expect(firstDay.isSame(dayOne, 'day')).toBe(true);
});

it('getLastDay should return the latest day', () => {
  const dayOne = dayjs().subtract(2, 'days').startOf('day');
  const dayTwo = dayjs().subtract(1, 'days').startOf('day');
  const lastDay = getLastDay([
    { entryType: 'food', timestamp: dayOne.toJSON(), number: 100 },
    { entryType: 'food', timestamp: dayTwo.toJSON(), number: 200 },
  ]);

  expect(lastDay.isSame(dayTwo, 'day')).toBe(true);
});

it('getFirstDay and getLastDay should handle empty entries', () => {
  const now = dayjs();
  expect(getFirstDay([]).isSame(now, 'day')).toBe(true);
  expect(getLastDay([]).isSame(now, 'day')).toBe(true);
});

it('foodCaloriesAtTimestamp should calculate cumulative food calories', () => {
  const timestamp = dayjs().subtract(1, 'days').add(10, 'hours');
  const entries: entry[] = [
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(8, 'hours').toJSON(), number: 500 },
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(12, 'hours').toJSON(), number: 600 },
    { entryType: 'food', timestamp: dayjs().subtract(1, 'days').add(8, 'hours').toJSON(), number: 700 },
  ];
  const calories = foodCaloriesAtTimestamp(entries, timestamp);

  // Should include the 500 + 600 from 2 days ago, and the 700 from yesterday before 10am
  expect(calories).toBe(1800);
});

it('caloriesAtTimestamp should include passive calories', () => {
  const timestamp = dayjs().subtract(1, 'days').add(10, 'hours');
  const entries: entry[] = [
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(8, 'hours').toJSON(), number: 500 },
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(12, 'hours').toJSON(), number: 600 },
    { entryType: 'weight', timestamp: dayjs().subtract(2, 'days').add(7, 'hours').toJSON(), number: 150 },
    { entryType: 'food', timestamp: dayjs().subtract(1, 'days').add(8, 'hours').toJSON(), number: 700 },
    { entryType: 'weight', timestamp: dayjs().subtract(1, 'days').add(7, 'hours').toJSON(), number: 149 },
  ];
  const calories = caloriesAtTimestamp(entries, timestamp, defaultPassiveCalories);

  // Food calories (1800) + passive calories for days from first entry to timestamp
  expect(calories).toBeCloseTo(3487.5, 0);
});

it('dayDiff should calculate days between dates', () => {
  const start = dayjs('2023-01-01');
  const end = dayjs('2023-01-03');

  expect(dayDiff(start, end)).toBe(2);
});

it('calculateDailyPassiveCalories should return default when insufficient weight data', () => {
  const foodOnlyEntries: entry[] = [
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(8, 'hours').toJSON(), number: 500 },
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(12, 'hours').toJSON(), number: 600 },
    { entryType: 'food', timestamp: dayjs().subtract(1, 'days').add(8, 'hours').toJSON(), number: 700 },
  ];
  expect(calculateDailyPassiveCalories(foodOnlyEntries)).toBe(-1500);

  const singleWeightEntry: entry[] = [
    { entryType: 'weight', timestamp: dayjs().subtract(2, 'days').add(7, 'hours').toJSON(), number: 150 },
  ];
  expect(calculateDailyPassiveCalories(singleWeightEntry)).toBe(-1500);
});

it('calculateDailyPassiveCalories should calculate passive calories from weight and food data', () => {
  const entries: entry[] = [
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(8, 'hours').toJSON(), number: 500 },
    { entryType: 'food', timestamp: dayjs().subtract(2, 'days').add(12, 'hours').toJSON(), number: 600 },
    { entryType: 'weight', timestamp: dayjs().subtract(2, 'days').add(7, 'hours').toJSON(), number: 150 },
    { entryType: 'food', timestamp: dayjs().subtract(1, 'days').add(8, 'hours').toJSON(), number: 700 },
    { entryType: 'weight', timestamp: dayjs().subtract(1, 'days').add(7, 'hours').toJSON(), number: 149 },
  ];
  const result = calculateDailyPassiveCalories(entries);
  expect(typeof result).toBe('number');
  expect(result).not.toBe(-1500); // Should be calculated, not default
});
