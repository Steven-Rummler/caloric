import dayjs from 'dayjs';
import { downsampleMultipleSeries } from './downsample';

export interface TimeSeriesPoint {
  x: string;
  y: number;
}

export interface ChartDataPoint extends Record<string, number | undefined> {
  x: number;
}

/**
 * Creates chart data by merging multiple time series efficiently
 * @param series - Array of time series to merge
 * @param seriesNames - Names for each series in the output data
 * @param maxPoints - Maximum number of points to keep (will downsample if exceeded)
 * @returns Array of chart data points
 */
export function createChartData(
  series: TimeSeriesPoint[][],
  seriesNames: string[],
  maxPoints: number = 400
): ChartDataPoint[] {
  if (series.length === 0) return [];
  if (series.length !== seriesNames.length)
    throw new Error('Number of series must match number of series names');

  // Collect all unique timestamps
  const timestampSet = new Set<string>();
  for (const s of series)
    for (const point of s)
      timestampSet.add(point.x);

  // Sort timestamps chronologically
  const timestamps = Array.from(timestampSet).sort();

  // Create maps for O(1) lookups instead of O(n) finds
  const seriesMaps = series.map(s => {
    const map = new Map<string, number>();
    for (const point of s)
      map.set(point.x, point.y);
    return map;
  });

  // Build initial data
  let data: ChartDataPoint[] = timestamps.map(timestamp => {
    const point: ChartDataPoint = {
      x: dayjs(timestamp).valueOf()
    };

    for (let i = 0; i < seriesNames.length; i++) {
      const seriesName = seriesNames[i];
      if (seriesName != null)
        (point as Record<string, number | undefined>)[seriesName] = seriesMaps[i]?.get(timestamp);
    }

    return point;
  });

  // Apply downsampling if needed
  if (data.length > maxPoints) {
    // Convert to DataPoint format for downsampling
    const seriesForDownsampling = series.map(s =>
      s.map(p => ({ x: dayjs(p.x).valueOf(), y: p.y }))
    );

    const downsampledSeries = downsampleMultipleSeries(seriesForDownsampling, maxPoints);

    // Reconstruct data with downsampled points
    const downsampledX = new Set<number>();
    for (const s of downsampledSeries)
      for (const point of s)
        downsampledX.add(point.x);

    data = data.filter(d => downsampledX.has(d.x));
  }

  return data;
}

/**
 * Creates chart data for weight charts (measured vs estimated)
 */
export function createWeightChartData(options: {
  weightData: TimeSeriesPoint[],
  actualWeight: TimeSeriesPoint[],
  maxPoints?: number
}): ChartDataPoint[] {
  const { weightData, actualWeight, maxPoints = 400 } = options;
  return createChartData(
    [weightData, actualWeight],
    ['measured', 'estimated'],
    maxPoints
  );
}

/**
 * Creates chart data for running calories charts (net, food, burned)
 */
export function createRunningCaloriesChartData(options: {
  netSeries: TimeSeriesPoint[],
  foodSeries: TimeSeriesPoint[],
  passiveSeries: TimeSeriesPoint[],
  maxPoints?: number
}): ChartDataPoint[] {
  const { netSeries, foodSeries, passiveSeries, maxPoints = 400 } = options;
  return createChartData(
    [netSeries, foodSeries, passiveSeries],
    ['net', 'food', 'burned'],
    maxPoints
  );
}

/**
 * Creates chart data for daily calories charts (net, food, burned)
 */
export function createDailyCaloriesChartData(options: {
  netSeries: TimeSeriesPoint[],
  foodSeries: TimeSeriesPoint[],
  passiveSeries: TimeSeriesPoint[],
  maxPoints?: number
}): ChartDataPoint[] {
  const { netSeries, foodSeries, passiveSeries, maxPoints = 400 } = options;
  return createChartData(
    [netSeries, foodSeries, passiveSeries],
    ['net', 'food', 'burned'],
    maxPoints
  );
}