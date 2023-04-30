import { expect, it } from 'vitest';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
  generateRunningCalorieSeries,
  generateRunningTotalCalorieSeries,
  passiveCaloriesAtTimestampFromEntries,
} from './generateSeries';

import dayjs from 'dayjs';
import { entry } from '../types';
import { entryTypes } from './entryTypes';

const defaultPassiveCalories = 1500;
const noEntries: entry[] = [];
const foodEntry: entry = {
  entryType: 'food',
  timestamp: dayjs().toJSON(),
  number: 100,
};
const activeEntry: entry = {
  entryType: 'active',
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
  entryTypes.forEach((entryType) => {
    const runningCalorieSeries = generateRunningCalorieSeries(
      noEntries,
      entryType
    );
    expect(runningCalorieSeries).toEqual([]);
  });
  expect(
    generateRunningTotalCalorieSeries(noEntries, defaultPassiveCalories)
  ).toEqual([]);
  const passiveCaloriesAtTimestamp = passiveCaloriesAtTimestampFromEntries(
    noEntries,
    dayjs(),
    defaultPassiveCalories
  );
  expect(passiveCaloriesAtTimestamp).toBeGreaterThanOrEqual(0);
  expect(passiveCaloriesAtTimestamp).toBeLessThanOrEqual(
    defaultPassiveCalories
  );
});

it('should give correct results for single entry list', () => {
  expect(generateDailyCalorieSeries([foodEntry], 'food')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
  expect(generateDailyCalorieSeries([activeEntry], 'active')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
  expect(generateDailyCalorieSeries([weightEntry], 'weight')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
});
