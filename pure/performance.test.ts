import dayjs from 'dayjs';
import { expect, it, describe } from 'vitest';
import { maxAcceptableProcessingTime, generateLargeHistory } from './test';
import {
  createChartData,
  createWeightChartData,
  createRunningCaloriesChartData,
  TimeSeriesPoint
} from './chartData';
import { downsampleLTTB } from './downsample';
import { generateDailyCalorieSeries, generateRunningTotalCalorieSeries } from './generateSeries';
import { generateDefaultEntries } from './defaultEntries';
import {
  calculateDailyPassiveCalories,
  caloriesAtTimestamp,
  foodCaloriesAtTimestamp,
} from './entries';

describe('Performance tests', () => {
  it('createChartData should be performant with large datasets', () => {
    const largeSeries1: TimeSeriesPoint[] = [];
    const largeSeries2: TimeSeriesPoint[] = [];
    const largeSeries3: TimeSeriesPoint[] = [];

    for (let i = 0; i < 10000; i++) {
      const date = new Date(2020, 0, i + 1).toISOString().slice(0, 10);
      largeSeries1.push({ x: date, y: Math.random() * 100 });
      largeSeries2.push({ x: date, y: Math.random() * 200 });
      largeSeries3.push({ x: date, y: Math.random() * 50 });
    }

    const start = performance.now();
    const result = createChartData([largeSeries1, largeSeries2, largeSeries3], ['s1', 's2', 's3'], 400);
    const end = performance.now();

    const processingTime = end - start;
    console.log(`createChartData performance test: ${processingTime.toFixed(2)}ms for 10,000 points`);

    expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
    expect(result.length).toBeLessThanOrEqual(400);
  });

  it('createWeightChartData should be performant', () => {
    const weightData: TimeSeriesPoint[] = [];
    const actualWeight: TimeSeriesPoint[] = [];

    for (let i = 0; i < 5000; i++) {
      const date = new Date(2020, 0, i + 1).toISOString().slice(0, 10);
      weightData.push({ x: date, y: 150 + Math.random() * 10 });
      actualWeight.push({ x: date, y: 149 + Math.random() * 10 });
    }

    const start = performance.now();
    const result = createWeightChartData({ weightData, actualWeight, maxPoints: 400 });
    const end = performance.now();

    const processingTime = end - start;
    console.log(`createWeightChartData performance test: ${processingTime.toFixed(2)}ms`);

    expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
    expect(result.length).toBeLessThanOrEqual(400);
  });

  it('createRunningCaloriesChartData should be performant', () => {
    const netSeries: TimeSeriesPoint[] = [];

    for (let i = 0; i < 5000; i++) {
      const date = new Date(2020, 0, i + 1).toISOString().slice(0, 10);
      netSeries.push({ x: date, y: 2000 + Math.random() * 500 });
    }

    const start = performance.now();
    const result = createRunningCaloriesChartData({ netSeries, maxPoints: 400 });
    const end = performance.now();

    const processingTime = end - start;
    console.log(`createRunningCaloriesChartData performance test: ${processingTime.toFixed(2)}ms`);

    expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
    expect(result.length).toBeLessThanOrEqual(400);
  });

  it('downsampleLTTB should be performant with large datasets', () => {
    const largeHistory = generateLargeHistory();
    const dailySeries = generateDailyCalorieSeries(largeHistory, 'food');

    const largeData = dailySeries.map(point => ({ x: new Date(point.x).getTime(), y: point.y }));

    const startTime = performance.now();
    const result = downsampleLTTB(largeData, 200);
    const endTime = performance.now();

    const processingTime = endTime - startTime;
    expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
    expect(result).toHaveLength(200);
  });

  it('calculateDailyPassiveCalories should be performant with large datasets', () => {
    const largeEntries = generateDefaultEntries({
      days: 365,
      meals: 3,
      dailyCalories: 2000,
      calorieVariation: 500,
      sections: 10,
      gapDays: 0,
      initialWeight: 150,
    });

    const start = performance.now();
    const result = calculateDailyPassiveCalories(largeEntries);
    const end = performance.now();

    expect(typeof result).toBe('number');
    expect(end - start).toBeLessThan(maxAcceptableProcessingTime);
  });

  it('caloriesAtTimestamp should be performant with large datasets', () => {
    const largeEntries = generateDefaultEntries({
      days: 365,
      meals: 4,
      dailyCalories: 2200,
      calorieVariation: 800,
      sections: 10,
      gapDays: 0,
      initialWeight: 160,
    });

    const timestamp = dayjs().subtract(100, 'days');

    const start = performance.now();
    const result = caloriesAtTimestamp(largeEntries, timestamp, -1500);
    const end = performance.now();

    expect(typeof result).toBe('number');
    expect(end - start).toBeLessThan(maxAcceptableProcessingTime);
  });

  it('foodCaloriesAtTimestamp should be performant with large datasets', () => {
    const largeEntries = generateDefaultEntries({
      days: 365,
      meals: 6,
      dailyCalories: 2500,
      calorieVariation: 1000,
      sections: 10,
      gapDays: 0,
      initialWeight: 140,
    });

    const timestamp = dayjs().subtract(50, 'days');

    const start = performance.now();
    const result = foodCaloriesAtTimestamp(largeEntries, timestamp);
    const end = performance.now();

    expect(typeof result).toBe('number');
    expect(end - start).toBeLessThan(maxAcceptableProcessingTime);
  });

  it('generateDefaultEntries should be performant', () => {
    const params = {
      days: 365,
      meals: 4,
      dailyCalories: 2000,
      calorieVariation: 1000,
      sections: 10,
      gapDays: 0,
      initialWeight: 150,
    };

    const start = performance.now();
    const entries = generateDefaultEntries(params);
    const end = performance.now();

    expect(entries.length).toBeGreaterThan(14000);
    expect(end - start).toBeLessThan(maxAcceptableProcessingTime);
  });

  it('generateDailyCalorieSeries should be performant', () => {
    const now = dayjs().toJSON();
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
    generateRunningTotalCalorieSeries(largeHistory, -1500, now);
    const endRunningTotal = performance.now();
    const runningTotalTime = endRunningTotal - startRunningTotal;
    expect(runningTotalTime).toBeLessThan(maxAcceptableProcessingTime);

    const startDailyTotal = performance.now();
    generateDailyCalorieSeries(largeHistory, 'food');
    const endDailyTotal = performance.now();
    const dailyTotalTime = endDailyTotal - startDailyTotal;
    expect(dailyTotalTime).toBeLessThan(maxAcceptableProcessingTime);
  });
});
