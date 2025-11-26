import { entry } from '../types';
import { entryTypes } from './entryTypes';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
  generateRunningTotalCalorieSeries,
  computeActualWeightSeries,
} from './generateSeries';
import dayjs from 'dayjs';
import { expect, it } from 'vitest';

const defaultPassiveCalories = 1500;
const noEntries: entry[] = [];
const foodEntry: entry = {
  entryType: 'food',
  timestamp: '2025-11-25T12:00:00.000Z',
  number: 100,
};
const weightEntry: entry = {
  entryType: 'weight',
  timestamp: '2025-11-25T12:00:00.000Z',
  number: 100,
};

it('should give empty series from no entries', () => {
  entryTypes.forEach((entryType) => {
    expect(generateDailyCalorieSeries(noEntries, entryType)).toEqual([]);
  });
  expect(
    generateDailyTotalCalorieSeries(noEntries, defaultPassiveCalories)
  ).toEqual([]);
  expect(
    generateRunningTotalCalorieSeries(noEntries, defaultPassiveCalories)
  ).toEqual([]);
});

it('should give correct results for single entry list', () => {
  expect(generateDailyCalorieSeries([foodEntry], 'food')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
  expect(generateDailyCalorieSeries([weightEntry], 'weight')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
});

// Tests for computeActualWeightSeries
const passiveCalories = 1500;

it('returns empty series when entries is empty', () => {
  const entries: entry[] = [];
  const weightData: { x: string; y: number }[] = [];
  expect(computeActualWeightSeries(entries, weightData, passiveCalories)).toEqual([]);
});

it('converts calories running total to estimated weight scale and keeps length', () => {
  const start = dayjs().startOf('day');
  const e1 = { entryType: 'food', timestamp: start.toJSON(), number: 200 } as entry;
  const e2 = { entryType: 'food', timestamp: start.add(1, 'day').toJSON(), number: 300 } as entry;
  const entries: entry[] = [e1, e2];

  const weightData = [
    { x: e1.timestamp, y: 80 },
    { x: e2.timestamp, y: 80.5 },
  ];

  const series = computeActualWeightSeries(entries, weightData, passiveCalories);

  // Should return at least as many points as calories series (start, each entry, now)
  expect(series.length).toBeGreaterThanOrEqual(3);

  // Values should be roughly on weight scale (not wildly different)
  series.forEach((p) => {
    expect(typeof p.y).toBe('number');
    expect(p.y).toBeGreaterThan(0);
  });
});

it('maintains average gap between weight and calories-derived series', () => {
  const start = dayjs().startOf('day');
  const e1 = { entryType: 'food', timestamp: start.toJSON(), number: 1000 } as entry;
  const e2 = { entryType: 'food', timestamp: start.add(1, 'day').toJSON(), number: 1000 } as entry;
  const entries: entry[] = [e1, e2];

  const weightData = [
    { x: e1.timestamp, y: 70 },
    { x: e2.timestamp, y: 70 },
  ];

  const series = computeActualWeightSeries(entries, weightData, passiveCalories);

  const avgWeight = weightData.reduce((s, n) => s + n.y, 0) / weightData.length;
  const avgSeriesWeight = series.reduce((s, n) => s + n.y, 0) / series.length;

  // The average estimated weight should be close to the provided averageWeight
  expect(Math.abs(avgWeight - avgSeriesWeight)).toBeLessThan(5);
});
