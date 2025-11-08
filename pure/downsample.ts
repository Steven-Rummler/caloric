/**
 * Largest Triangle Three Bucket (LTTB) downsampling algorithm
 * Preserves the visual shape of time series data by selecting points that form the largest triangles
 */

export interface DataPoint {
  x: number;
  y?: number;
}

/**
 * Downsamples a time series using the Largest Triangle Three Bucket algorithm
 * @param data - Array of data points with x and optional y values
 * @param threshold - Maximum number of points to keep
 * @returns Downsampled array of data points
 */
export function downsampleLTTB(data: DataPoint[], threshold: number): DataPoint[] {
  if (data.length <= threshold || data.length < 2)
    return data;

  const sampled: DataPoint[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  // Always include first and last points
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  if (!firstPoint || !lastPoint) return data;

  sampled[0] = firstPoint;
  sampled[threshold - 1] = lastPoint;

  let a = 0; // Previous selected point index

  for (let i = 1; i < threshold - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
    const bucketEnd = Math.floor(i * bucketSize) + 1;
    const nextA = Math.floor((i + 1) * bucketSize) + 1;

    let maxArea = -1;
    let maxAreaPoint = bucketStart;

    // Find point with maximum triangle area in this bucket
    for (let j = bucketStart; j < Math.min(bucketEnd, data.length); j++) {
      const pointA = data[a];
      const pointJ = data[j];
      const pointNext = data[Math.min(nextA, data.length - 1)];

      if (!pointA || !pointJ || !pointNext) continue;

      const area = triangleArea({
        x1: pointA.x, y1: pointA.y ?? 0,
        x2: pointJ.x, y2: pointJ.y ?? 0,
        x3: pointNext.x, y3: pointNext.y ?? 0
      });

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    const selectedPoint = data[maxAreaPoint];
    if (selectedPoint)
      sampled[i] = selectedPoint;
    a = maxAreaPoint;
  }

  return sampled.filter(point => point !== undefined);
}

/**
 * Calculates the area of a triangle formed by three points using the cross product method
 * Area = | (x2 - x1)(y3 - y1) - (x3 - x1)(y2 - y1) | / 2
 */
function triangleArea({ x1, y1, x2, y2, x3, y3 }: {
  x1: number; y1: number; x2: number; y2: number; x3: number; y3: number;
}): number {
  return Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)) / 2;
}

/**
 * Downsamples multiple series simultaneously, ensuring they all have the same x values
 * This is important for charts with multiple lines that need to align
 */
export function downsampleMultipleSeries(
  series: DataPoint[][],
  threshold: number
): DataPoint[][] {
  if (series.length === 0)
    return series;

  // Find all unique x values across all series
  const allXValues = new Set<number>();
  for (const s of series)
    for (const point of s)
      allXValues.add(point.x);

  if (allXValues.size <= threshold)
    return series;

  const sortedXValues = Array.from(allXValues).sort((a, b) => a - b);

  // Create a combined dataset for LTTB
  const combinedData: DataPoint[] = sortedXValues.map(x => ({ x }));

  // Apply LTTB to the x values
  const downsampledX = downsampleLTTB(
    combinedData.map(p => ({ x: p.x, y: p.x })), // Use x as y for downsampling
    threshold
  ).map(p => p.x);

  // Filter each series to only include downsampled x values
  return series.map(s =>
    s.filter(point => downsampledX.includes(point.x))
  );
}