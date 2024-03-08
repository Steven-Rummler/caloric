import { entry } from '../types';
import { entryTypes } from './entryTypes';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
  generateRunningCalorieSeries,
  generateRunningTotalCalorieSeries,
  passiveCaloriesAtTimestampFromEntries,
} from './generateSeries';
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
    dayjs().toJSON(),
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
  expect(generateDailyCalorieSeries([weightEntry], 'weight')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
});

it('should be performant', () => {
  const now = dayjs().toJSON();
  const days = 2000;
  const meals = 5;

  const largeHistory: entry[] = [];
  for (let day = 0; day < days; day++) {
    largeHistory.push({
      entryType: 'weight',
      timestamp: dayjs()
        .subtract(days, 'days')
        .add(day, 'days')
        .startOf('day')
        .add(7, 'hours')
        .toJSON(),
      number: 150 + Math.random() * 2,
    });
    for (let meal = 0; meal < meals; meal++)
      largeHistory.push({
        entryType: 'food',
        timestamp: dayjs()
          .subtract(days, 'days')
          .add(day, 'days')
          .startOf('day')
          .add(8 + 2 * meal, 'hours')
          .toJSON(),
        number: 400,
      });
  }

  const startRunningFood = performance.now();
  generateRunningCalorieSeries(largeHistory, 'food', now);
  const endRunningFood = performance.now();
  const runningFoodTime = endRunningFood - startRunningFood;
  expect(runningFoodTime).toBeLessThan(100);

  const startRunningWeight = performance.now();
  generateRunningCalorieSeries(largeHistory, 'weight', now);
  const endRunningWeight = performance.now();
  const runningWeightTime = endRunningWeight - startRunningWeight;
  expect(runningWeightTime).toBeLessThan(100);

  const startDailyFood = performance.now();
  generateDailyCalorieSeries(largeHistory, 'food');
  const endDailyFood = performance.now();
  const dailyFoodTime = endDailyFood - startDailyFood;
  expect(dailyFoodTime).toBeLessThan(100);

  const startDailyWeight = performance.now();
  generateDailyCalorieSeries(largeHistory, 'weight');
  const endDailyWeight = performance.now();
  const dailyWeightTime = endDailyWeight - startDailyWeight;
  expect(dailyWeightTime).toBeLessThan(100);

  const startRunningTotal = performance.now();
  generateRunningTotalCalorieSeries(largeHistory, defaultPassiveCalories, now);
  const endRunningTotal = performance.now();
  const runningTotalTime = endRunningTotal - startRunningTotal;
  expect(runningTotalTime).toBeLessThan(100);

  const startDailyTotal = performance.now();
  generateDailyTotalCalorieSeries(largeHistory, defaultPassiveCalories);
  const endDailyTotal = performance.now();
  const dailyTotalTime = endDailyTotal - startDailyTotal;
  expect(dailyTotalTime).toBeLessThan(100);
});
