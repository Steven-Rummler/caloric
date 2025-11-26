import { expect, it } from 'vitest';
import { downsampleLTTB, downsampleMultipleSeries, DataPoint } from './downsample';
import { maxAcceptableProcessingTime, generateLargeHistory } from './test';
import { generateDailyCalorieSeries } from './generateSeries';

const sampleData: DataPoint[] = [
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 15 },
  { x: 4, y: 30 },
  { x: 5, y: 25 },
  { x: 6, y: 35 },
  { x: 7, y: 20 },
  { x: 8, y: 40 },
  { x: 9, y: 45 },
  { x: 10, y: 30 },
];

it('downsampleLTTB should return original data when threshold >= data length', () => {
  const result = downsampleLTTB(sampleData, 15);
  expect(result).toEqual(sampleData);
});

it('downsampleLTTB should return first and last points when threshold = 2', () => {
  const result = downsampleLTTB(sampleData, 2);
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual(sampleData[0]);
  expect(result[1]).toEqual(sampleData[sampleData.length - 1]);
});

it('downsampleLTTB should return empty array for empty input', () => {
  const result = downsampleLTTB([], 10);
  expect(result).toEqual([]);
});

it('downsampleLTTB should always include first and last points', () => {
  const result = downsampleLTTB(sampleData, 5);
  expect(result[0]).toEqual(sampleData[0]);
  expect(result[result.length - 1]).toEqual(sampleData[sampleData.length - 1]);
});

it('downsampleLTTB should reduce data to threshold size', () => {
  const result = downsampleLTTB(sampleData, 5);
  expect(result).toHaveLength(5);
});

it('downsampleLTTB should preserve x values in ascending order', () => {
  const result = downsampleLTTB(sampleData, 5);
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    const previous = result[i - 1];
    if (current && previous)
      expect(current.x).toBeGreaterThan(previous.x);
  }
});

it('downsampleLTTB should handle data with undefined y values', () => {
  const dataWithUndefined: DataPoint[] = [
    { x: 1, y: 10 },
    { x: 2 }, // undefined y
    { x: 3, y: 15 },
    { x: 4 }, // undefined y
    { x: 5, y: 25 },
  ];

  const result = downsampleLTTB(dataWithUndefined, 3);
  expect(result).toHaveLength(3);
  expect(result[0]).toEqual(dataWithUndefined[0]);
  expect(result[result.length - 1]).toEqual(dataWithUndefined[4]);
});

it('downsampleLTTB should handle data with all undefined y values', () => {
  const dataAllUndefined: DataPoint[] = [
    { x: 1 },
    { x: 2 },
    { x: 3 },
    { x: 4 },
    { x: 5 },
  ];

  const result = downsampleLTTB(dataAllUndefined, 3);
  expect(result).toHaveLength(3);
  expect(result[0]).toEqual(dataAllUndefined[0]);
  expect(result[result.length - 1]).toEqual(dataAllUndefined[4]);
});

it('downsampleMultipleSeries should return original series when no downsampling needed', () => {
  const series: DataPoint[][] = [
    [{ x: 1, y: 10 }, { x: 2, y: 20 }],
    [{ x: 1, y: 15 }, { x: 2, y: 25 }],
  ];

  const result = downsampleMultipleSeries(series, 5);
  expect(result).toEqual(series);
});

it('downsampleMultipleSeries should handle empty series array', () => {
  const result = downsampleMultipleSeries([], 10);
  expect(result).toEqual([]);
});

it('downsampleMultipleSeries should handle series with different lengths', () => {
  const series: DataPoint[][] = [
    [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }],
    [{ x: 1, y: 15 }, { x: 2, y: 25 }], // shorter series
  ];

  const result = downsampleMultipleSeries(series, 2);
  expect(result).toHaveLength(2);
  if (result[0] && result[1]) {
    // The result lengths depend on which x values are selected during downsampling
    // Both series should have at most 2 points
    expect(result[0].length).toBeLessThanOrEqual(2);
    expect(result[1].length).toBeLessThanOrEqual(2);
    // Both should include the first x value (1)
    expect(result[0].some(p => p.x === 1)).toBe(true);
    expect(result[1].some(p => p.x === 1)).toBe(true);
  }
});

it('downsampleLTTB should be performant with large datasets', () => {
  // Generate a large dataset similar to real usage
  const largeHistory = generateLargeHistory();
  const dailySeries = generateDailyCalorieSeries(largeHistory, 'food');

  // Convert to DataPoint format
  const largeData: DataPoint[] = dailySeries.map(point => ({
    x: new Date(point.x).getTime(),
    y: point.y
  }));

  const startTime = performance.now();
  const result = downsampleLTTB(largeData, 200); // Downsample to 200 points
  const endTime = performance.now();

  const processingTime = endTime - startTime;
  expect(processingTime).toBeLessThan(maxAcceptableProcessingTime);
  expect(result).toHaveLength(200);
  expect(result[0]).toEqual(largeData[0]);
  expect(result[result.length - 1]).toEqual(largeData[largeData.length - 1]);
});

it('downsampleLTTB should preserve visual features (peaks and valleys)', () => {
  // Create data with clear peaks and valleys
  const peakValleyData: DataPoint[] = [
    { x: 1, y: 10 },
    { x: 2, y: 50 }, // peak
    { x: 3, y: 20 },
    { x: 4, y: 5 },  // valley
    { x: 5, y: 30 },
    { x: 6, y: 60 }, // peak
    { x: 7, y: 25 },
    { x: 8, y: 2 },  // valley
    { x: 9, y: 15 },
    { x: 10, y: 45 }, // peak
  ];

  const result = downsampleLTTB(peakValleyData, 6);

  // Should include first and last points
  expect(result[0]).toEqual(peakValleyData[0]);
  expect(result[result.length - 1]).toEqual(peakValleyData[peakValleyData.length - 1]);

  // Should include some of the significant peaks/valleys
  const resultYValues = result.map(p => p.y).filter(y => y !== undefined);
  const originalYValues = peakValleyData.map(p => p.y).filter(y => y !== undefined);

  // The downsampled result should include some high values (peaks)
  const maxOriginal = Math.max(...originalYValues);
  const maxResult = Math.max(...resultYValues);
  expect(maxResult).toBeGreaterThan(maxOriginal * 0.7); // At least 70% of max

  // The downsampled result should include some low values (valleys)
  const minOriginal = Math.min(...originalYValues);
  const minResult = Math.min(...resultYValues);
  expect(minResult).toBeLessThan(minOriginal * 1.5); // At most 150% of min
});

it('downsampleLTTB should handle single point datasets', () => {
  const singlePoint: DataPoint[] = [{ x: 1, y: 10 }];
  const result = downsampleLTTB(singlePoint, 5);
  expect(result).toEqual(singlePoint);
});

it('downsampleLTTB should handle two point datasets', () => {
  const twoPoints: DataPoint[] = [{ x: 1, y: 10 }, { x: 2, y: 20 }];
  const result = downsampleLTTB(twoPoints, 5);
  expect(result).toEqual(twoPoints);
});

it('downsampleMultipleSeries should interpolate y values at downsampled x points', () => {
  const series: DataPoint[][] = [
    [{ x: 1, y: 10 }, { x: 3, y: 30 }, { x: 5, y: 50 }],
    [{ x: 1, y: 20 }, { x: 3, y: 40 }, { x: 5, y: 60 }],
  ];

  const result = downsampleMultipleSeries(series, 3);
  expect(result).toHaveLength(2);
  expect(result[0]).toHaveLength(3);
  expect(result[1]).toHaveLength(3);

  // Should include all downsampled x points
  const xValues = result[0]?.map(p => p.x);
  expect(xValues).toEqual([1, 3, 5]);

  // Y values should be exact matches in this case
  expect(result[0]?.[0]?.y).toBe(10);
  expect(result[0]?.[1]?.y).toBe(30);
  expect(result[0]?.[2]?.y).toBe(50);
  expect(result[1]?.[0]?.y).toBe(20);
  expect(result[1]?.[1]?.y).toBe(40);
  expect(result[1]?.[2]?.y).toBe(60);
});

it('downsampleMultipleSeries should interpolate missing y values', () => {
  const series: DataPoint[][] = [
    [{ x: 1, y: 10 }, { x: 5, y: 50 }], // Missing x=3
    [{ x: 1, y: 20 }, { x: 3, y: 40 }, { x: 5, y: 60 }],
  ];

  const result = downsampleMultipleSeries(series, 3);
  expect(result).toHaveLength(2);
  expect(result[0]).toHaveLength(3);
  expect(result[1]).toHaveLength(3);

  // First series should have interpolated y at x=3
  expect(result[0]?.[0]?.y).toBe(10);
  expect(result[0]?.[1]?.y).toBe(30); // Interpolated: (50-10)*(3-1)/(5-1) + 10 = 30
  expect(result[0]?.[2]?.y).toBe(50);

  // Second series has exact matches
  expect(result[1]?.[0]?.y).toBe(20);
  expect(result[1]?.[1]?.y).toBe(40);
  expect(result[1]?.[2]?.y).toBe(60);
});