import { entry } from '../types';
import { entryTypes } from './entryTypes';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
  generateRunningTotalCalorieSeries,
} from './generateSeries';
import { maxAcceptableProcessingTime, generateLargeHistory, generateLargeHistoryWithGaps } from './test';
import dayjs from 'dayjs';
import { expect, it } from 'vitest';

const defaultPassiveCalories = 1500;
const noEntries: entry[] = [];
const foodEntry: entry = {
  entryType: 'food',
  timestamp: dayjs().toJSON(),
  number: 100,
};
const weightEntry: entry = {
  entryType: 'weight',
  timestamp: dayjs().toJSON(),
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

it('should be performant', () => {
  const now = dayjs().toJSON();

  // Generate 10 years of realistic dataset using the same logic as default entries
  const largeHistory = generateLargeHistory();

  const startDailyFood = performance.now();
  generateDailyCalorieSeries(largeHistory, 'food');
  const endDailyFood = performance.now();
  const dailyFoodTime = endDailyFood - startDailyFood;
  expect(dailyFoodTime).toBeLessThan(maxAcceptableProcessingTime);

  const startDailyWeight = performance.now();
  generateDailyCalorieSeries(largeHistory, 'weight');
  const endDailyWeight = performance.now();
  const dailyWeightTime = endDailyWeight - startDailyWeight;
  expect(dailyWeightTime).toBeLessThan(maxAcceptableProcessingTime);

  const startRunningTotal = performance.now();
  generateRunningTotalCalorieSeries(largeHistory, defaultPassiveCalories, now);
  const endRunningTotal = performance.now();
  const runningTotalTime = endRunningTotal - startRunningTotal;
  expect(runningTotalTime).toBeLessThan(maxAcceptableProcessingTime);

  const startDailyTotal = performance.now();
  generateDailyTotalCalorieSeries(largeHistory, defaultPassiveCalories);
  const endDailyTotal = performance.now();
  const dailyTotalTime = endDailyTotal - startDailyTotal;
  expect(dailyTotalTime).toBeLessThan(maxAcceptableProcessingTime);
});

it('should be performant with sparse data (many gaps)', () => {
  // Generate 10 years of sparse data with many gaps
  const sparseHistory = generateLargeHistoryWithGaps();

  const startDailyTotal = performance.now();
  generateDailyTotalCalorieSeries(sparseHistory, defaultPassiveCalories);
  const endDailyTotal = performance.now();
  expect(endDailyTotal - startDailyTotal).toBeLessThan(maxAcceptableProcessingTime);
});
