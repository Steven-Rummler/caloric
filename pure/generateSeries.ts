import dayjs from 'dayjs';
import { daySeries, entry, entryType, timeSeries } from '../types';

export function generateDailyCalorieSeries(
  entries: entry[],
  entryType: entryType
): daySeries {
  // Pre-filter entries to avoid multiple iterations
  const filteredEntries = entries.filter(entry => entry.entryType === entryType);
  if (filteredEntries.length === 0) return [];

  // Fill in gaps for food entries if needed
  if (entryType === 'food') fillInFoodGaps(filteredEntries);

  // Sort entries by timestamp once
  filteredEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Group by day and accumulate totals in one pass
  const dayMap = new Map<string, number>();
  let minDay = '';
  let maxDay = '';

  for (const entry of filteredEntries) {
    // Extract date directly from ISO timestamp (YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD)
    const day = entry.timestamp.substring(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + entry.number);

    if (!minDay || day < minDay) minDay = day;
    if (!maxDay || day > maxDay) maxDay = day;
  }

  // Convert map to sorted array
  const series: daySeries = [];
  for (const day of dayMap.keys()) 
    series.push({ x: day, y: dayMap.get(day) ?? 0 });
  series.sort((a, b) => a.x.localeCompare(b.x));

  // Add today if needed
  const today = dayjs().format('YYYY-MM-DD');
  const lastSeries = series[series.length - 1];
  if (series.length === 0 || (lastSeries && lastSeries.x < today)) 
    series.push({ x: today, y: 0 });

  fillInSeriesGapDays(series);

  return series;
}

export function generateDailyTotalCalorieSeries(
  entries: entry[],
  passiveCalories: number
): daySeries {
  const foodSeries = generateDailyCalorieSeries(entries, 'food');
  return foodSeries.map((point) => ({
    x: point.x,
    y: point.y + passiveCalories,
  }));
}

function fillInSeriesGapDays(series: daySeries) {
  if (series.length === 0) return;
  
  const lastSeries = series[series.length - 1];
  const firstSeries = series[0];
  
  if (!lastSeries || !firstSeries) return;
  
  const lastDay = lastSeries.x;
  let seriesIndex = 0;
  
  for (
    let day = firstSeries.x;
    day < lastDay;
    day = dayjs(day).add(1, 'day').format('YYYY-MM-DD')
  ) {
    const currentSeries = series[seriesIndex];
    if (currentSeries && currentSeries.x !== day)
      series.push({
        x: day,
        y: 0,
      });
    else seriesIndex++;
  }
}

export function generateRunningCalorieSeries(
  entries: entry[],
  entryType: entryType,
  now?: string
): timeSeries {
  if (entries.length === 0) return [];

  // Pre-filter entries by type to avoid multiple iterations
  const filteredEntries = entries.filter(entry => entry.entryType === entryType);
  if (filteredEntries.length === 0) return [];

  // Fill in gaps for food entries
  if (entryType === 'food') fillInFoodGaps(filteredEntries);

  // Sort once
  filteredEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const firstEntry = filteredEntries[0];
  if (!firstEntry) return [];

  // Use direct timestamp math for start day calculation
  const startTimestamp = dayjs(firstEntry.timestamp).valueOf();
  const startOfDay = startTimestamp - (startTimestamp % (24 * 60 * 60 * 1000));
  const startDay = new Date(startOfDay).toJSON();

  // Build series with pre-calculated capacity
  const series: timeSeries = [ { x: startDay, y: 0 } ];

  let runningTotal = 0;
  for (const entry of filteredEntries) {
    runningTotal += entry.number;
    series.push({ x: entry.timestamp, y: runningTotal });
  }

  const endTime = now ?? dayjs().toJSON();
  series.push({ x: endTime, y: runningTotal });

  return series;
}

export function generateRunningTotalCalorieSeries(
  entries: entry[],
  dailyPassiveCalories: number,
  now?: string
): timeSeries {
  if (entries.length === 0) return [];
  const startDay = startOfFirstDay(entries);
  const foodEntries = entries.filter(
    (entry) => entry.entryType === 'food'
  );
  if (foodEntries.length === 0) return [];
  fillInFoodGaps(foodEntries);
  foodEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Pre-calculate start timestamp for passive calories calculation
  const startTimestamp = new Date(startDay).getTime();

  let runningTotal = 0;
  const series = [
    { x: startDay, y: 0 },
    ...foodEntries.map((entry) => {
      const timestamp = entry.timestamp;
      const number = entry.number;
      // Calculate passive calories using direct timestamp math
      const entryTimestamp = new Date(timestamp).getTime();
      const daysDiff = (entryTimestamp - startTimestamp) / (1000 * 60 * 60 * 24);
      const passiveCalories = dailyPassiveCalories * daysDiff;
      runningTotal += number;
      return {
        x: timestamp,
        y: runningTotal + passiveCalories,
      };
    }),
    {
      x: now ?? dayjs().toJSON(),
      y: (() => {
        const endTimestamp = new Date(now ?? dayjs().toJSON()).getTime();
        const daysDiff = (endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24);
        return runningTotal + dailyPassiveCalories * daysDiff;
      })(),
    },
  ];

  return series;
}

export function passiveCaloriesAtTimestampFromEntries(
  entries: entry[],
  timestamp: string,
  dailyPassiveCalories: number
) {
  const startDay = startOfFirstDay(entries);
  return (
    (dailyPassiveCalories *
      (dayjs(timestamp).valueOf() - dayjs(startDay).valueOf())) /
    1000 /
    60 /
    60 /
    24
  );
}

function startOfFirstDay(entries: entry[]) {
  return dayjs(
    entries.reduce(
      (start, entry) => (entry.timestamp < start ? entry.timestamp : start),
      entries[0]?.timestamp ?? dayjs().toJSON()
    )
  )
    .startOf('day')
    .toJSON();
}

export function fillInFoodGaps(
  entries: entry[],
) {
  const foodEntries = entries.filter((entry) => entry.entryType === 'food');
  if (foodEntries.length === 0) return [];
  const startDay = dayjs(startOfFirstDay(foodEntries)).format('YYYY-MM-DD');
  const endDay = foodEntries.reduce(
    (end, entry) => (entry.timestamp > end ? entry.timestamp : end),
    dayjs().hour() >= 18
      ? dayjs().format('YYYY-MM-DD')
      : dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  );
  const daysWithFood = new Set<string>();
  for (const entry of foodEntries) {
    const day = dayjs(entry.timestamp).format('YYYY-MM-DD');
    daysWithFood.add(day);
  }
  const averageDailyCalories = foodEntries.reduce(
    (total, entry) => total + entry.number,
    0
  ) / daysWithFood.size;
  for (
    let day = startDay;
    day < endDay;
    day = dayjs(day).add(1, 'day').format('YYYY-MM-DD')
  ) if (!daysWithFood.has(day)) entries.push(...[{
    entryType: 'food' as const,
    timestamp: dayjs(day).add(8, 'hours').toJSON(),
    number: averageDailyCalories / 4,
  }, {
    entryType: 'food' as const,
    timestamp: dayjs(day).add(12, 'hours').toJSON(),
    number: averageDailyCalories / 4,
  }, {
    entryType: 'food' as const,
    timestamp: dayjs(day).add(18, 'hours').toJSON(),
    number: averageDailyCalories / 2,
  }]);
}