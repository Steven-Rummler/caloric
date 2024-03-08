import { entry } from '../types';
import { entryTypes } from './entryTypes';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
  generateRunningCalorieSeries,
  generateRunningTotalCalorieSeries,
  passiveCaloriesAtTimestampFromEntries,
} from './generateSeries';
import { generateDailyCalorieSeriesFast } from './generateSeriesFast';
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
  expect(generateDailyCalorieSeries([weightEntry], 'weight')).toEqual([
    { x: dayjs().format('YYYY-MM-DD'), y: 100 },
  ]);
});

it('should be performant', () => {
  const days = 1000;
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
  generateRunningCalorieSeries(largeHistory, 'food');
  const endRunningFood = performance.now();
  console.log(
    `generateRunningCalorieSeries(largeHistory, 'food') took ${
      endRunningFood - startRunningFood
    }ms`
  );

  const startRunningWeight = performance.now();
  generateRunningCalorieSeries(largeHistory, 'weight');
  const endRunningWeight = performance.now();
  console.log(
    `generateRunningCalorieSeries(largeHistory, 'weight') took ${
      endRunningWeight - startRunningWeight
    }ms`
  );

  const startDailyFood = performance.now();
  const dailyFood = generateDailyCalorieSeries(largeHistory, 'food').sort(
    (a, b) => a.x.localeCompare(b.x)
  ); // sorting because the old code is wrong
  const endDailyFood = performance.now();
  console.log(
    `generateDailyCalorieSeries(largeHistory, 'food') took ${
      endDailyFood - startDailyFood
    }ms`
  );

  const startDailyFoodFast = performance.now();
  const dailyFoodFast = generateDailyCalorieSeriesFast(largeHistory, 'food');
  const endDailyFoodFast = performance.now();
  console.log(
    `generateDailyCalorieSeriesFast(largeHistory, 'food') took ${
      endDailyFoodFast - startDailyFoodFast
    }ms`
  );

  expect(dailyFood).toEqual(dailyFoodFast);

  const startDailyWeight = performance.now();
  generateDailyCalorieSeries(largeHistory, 'weight');
  const endDailyWeight = performance.now();
  console.log(
    `generateDailyCalorieSeries(largeHistory, 'weight') took ${
      endDailyWeight - startDailyWeight
    }ms`
  );

  const startRunningTotal = performance.now();
  generateRunningTotalCalorieSeries(largeHistory, defaultPassiveCalories);
  const endRunningTotal = performance.now();
  console.log(
    `generateRunningTotalCalorieSeries(largeHistory, defaultPassiveCalories) took ${
      endRunningTotal - startRunningTotal
    }ms`
  );

  const startDailyTotal = performance.now();
  generateDailyTotalCalorieSeries(largeHistory, defaultPassiveCalories);
  const endDailyTotal = performance.now();
  console.log(
    `generateDailyTotalCalorieSeries(largeHistory, defaultPassiveCalories) took ${
      endDailyTotal - startDailyTotal
    }ms`
  );
});
