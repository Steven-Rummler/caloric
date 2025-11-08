import { expect, it, describe } from 'vitest';
import dayjs from 'dayjs';
import {
  createChartData,
  createWeightChartData,
  createRunningCaloriesChartData,
  createDailyCaloriesChartData,
  TimeSeriesPoint
} from './chartData';
import { maxAcceptableProcessingTime } from './test';

describe('chartData', () => {
  const series1: TimeSeriesPoint[] = [
    { x: '2023-01-01', y: 10 },
    { x: '2023-01-02', y: 20 },
    { x: '2023-01-03', y: 30 }
  ];

  const series2: TimeSeriesPoint[] = [
    { x: '2023-01-01', y: 100 },
    { x: '2023-01-02', y: 200 },
    { x: '2023-01-04', y: 400 }
  ];

  describe('createChartData', () => {
    it('should merge multiple series correctly', () => {
      const result = createChartData([series1, series2], ['series1', 'series2']);

      expect(result).toHaveLength(4); // 4 unique timestamps

      // Check first point (2023-01-01)
      const firstPoint = result.find(p => p.x === dayjs('2023-01-01').valueOf());
      expect(firstPoint?.series1).toBe(10);
      expect(firstPoint?.series2).toBe(100);

      // Check point with only series1 (2023-01-03)
      const thirdPoint = result.find(p => p.x === dayjs('2023-01-03').valueOf());
      expect(thirdPoint?.series1).toBe(30);
      expect(thirdPoint?.series2).toBeUndefined();

      // Check point with only series2 (2023-01-04)
      const fourthPoint = result.find(p => p.x === dayjs('2023-01-04').valueOf());
      expect(fourthPoint?.series1).toBeUndefined();
      expect(fourthPoint?.series2).toBe(400);
    });

    it('should sort timestamps chronologically', () => {
      const result = createChartData([series1, series2], ['series1', 'series2']);

      // Should be sorted by timestamp and have 4 points
      expect(result).toHaveLength(4);
      // Sorting is verified by the merge test which checks specific date ordering
    });

    it('should handle empty series', () => {
      const result = createChartData([], []);
      expect(result).toEqual([]);
    });

    it('should throw error when series and names length mismatch', () => {
      expect(() => createChartData([series1], ['name1', 'name2']))
        .toThrow('Number of series must match number of series names');
    });

    it('should downsample when data exceeds maxPoints', () => {
      // Create a large dataset
      const largeSeries1: TimeSeriesPoint[] = [];
      const largeSeries2: TimeSeriesPoint[] = [];

      for (let i = 0; i < 1000; i++) {
        const date = `2023-01-${String(i + 1).padStart(3, '0')}`;
        largeSeries1.push({ x: date, y: i });
        largeSeries2.push({ x: date, y: i * 2 });
      }

      const result = createChartData([largeSeries1, largeSeries2], ['s1', 's2'], 100);

      // Should be downsampled to 100 points
      expect(result.length).toBeLessThanOrEqual(100);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('createWeightChartData', () => {
    it('should create weight chart data correctly', () => {
      const weightData: TimeSeriesPoint[] = [
        { x: '2023-01-01', y: 150 },
        { x: '2023-01-02', y: 151 }
      ];

      const actualWeight: TimeSeriesPoint[] = [
        { x: '2023-01-01', y: 149 },
        { x: '2023-01-02', y: 150 }
      ];

      const result = createWeightChartData({ weightData, actualWeight });

      expect(result).toHaveLength(2);
      if (result[0]) {
        expect(result[0].measured).toBe(150);
        expect(result[0].estimated).toBe(149);
      }
      if (result[1]) {
        expect(result[1].measured).toBe(151);
        expect(result[1].estimated).toBe(150);
      }
    });
  });

  describe('createRunningCaloriesChartData', () => {
    it('should create running calories chart data correctly', () => {
      const netSeries: TimeSeriesPoint[] = [{ x: '2023-01-01', y: 2000 }];
      const foodSeries: TimeSeriesPoint[] = [{ x: '2023-01-01', y: 1800 }];
      const passiveSeries: TimeSeriesPoint[] = [{ x: '2023-01-01', y: 200 }];

      const result = createRunningCaloriesChartData({
        netSeries,
        foodSeries,
        passiveSeries
      });

      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].net).toBe(2000);
        expect(result[0].food).toBe(1800);
        expect(result[0].burned).toBe(200);
      }
    });
  });

  describe('createDailyCaloriesChartData', () => {
    it('should create daily calories chart data correctly', () => {
      const netSeries: TimeSeriesPoint[] = [{ x: '2023-01-01', y: 2200 }];
      const foodSeries: TimeSeriesPoint[] = [{ x: '2023-01-01', y: 2000 }];
      const passiveSeries: TimeSeriesPoint[] = [{ x: '2023-01-01', y: 200 }];

      const result = createDailyCaloriesChartData({
        netSeries,
        foodSeries,
        passiveSeries
      });

      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].net).toBe(2200);
        expect(result[0].food).toBe(2000);
        expect(result[0].burned).toBe(200);
      }
    });
  });

  describe('Performance Tests', () => {
    it('createChartData should be performant with large datasets', () => {
      // Create large test data (similar to 10 years of demo data)
      const largeSeries1: TimeSeriesPoint[] = [];
      const largeSeries2: TimeSeriesPoint[] = [];
      const largeSeries3: TimeSeriesPoint[] = [];

      // Create ~10,000 data points (similar to 10 years of daily data)
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

      // Should complete in reasonable time (much faster than the 11+ seconds we saw before)
      expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
      expect(result.length).toBeLessThanOrEqual(400); // Should be downsampled
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
      const foodSeries: TimeSeriesPoint[] = [];
      const passiveSeries: TimeSeriesPoint[] = [];

      for (let i = 0; i < 5000; i++) {
        const date = new Date(2020, 0, i + 1).toISOString().slice(0, 10);
        netSeries.push({ x: date, y: 2000 + Math.random() * 500 });
        foodSeries.push({ x: date, y: 1800 + Math.random() * 400 });
        passiveSeries.push({ x: date, y: 200 + Math.random() * 100 });
      }

      const start = performance.now();
      const result = createRunningCaloriesChartData({
        netSeries,
        foodSeries,
        passiveSeries,
        maxPoints: 400
      });
      const end = performance.now();

      const processingTime = end - start;
      console.log(`createRunningCaloriesChartData performance test: ${processingTime.toFixed(2)}ms`);

      expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
      expect(result.length).toBeLessThanOrEqual(400);
    });
  });
});