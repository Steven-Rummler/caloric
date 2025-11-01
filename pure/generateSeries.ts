import dayjs from 'dayjs';
import { daySeries, entry, entryType, timeSeries } from '../types';

export function generateDailyCalorieSeries(
  entries: entry[],
  entryType: entryType
): daySeries {
  const filteredEntries = entries
    .filter((entry) => entry.entryType === entryType);
  if (entryType === 'food') fillInFoodGaps(filteredEntries);
  const dayValues = filteredEntries
    .map(({ timestamp, number }) => ({
      x: dayjs(timestamp).format('YYYY-MM-DD'),
      y: number,
    }))
    .sort((a, b) => a.x.localeCompare(b.x));
  if (dayValues.length === 0) return [];

  const firstValue = dayValues[0];
  if (!firstValue) return [];

  const series: daySeries = [];
  let currentDay = firstValue.x;
  let currentTotal = 0;

  for (const entry of dayValues) {
    if (entry.x !== currentDay) {
      series.push({ x: currentDay, y: currentTotal });
      currentDay = entry.x;
      currentTotal = 0;
    }
    currentTotal += entry.y;
  }
  series.push({ x: currentDay, y: currentTotal });

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
  
  const firstEntry = entries[0];
  if (!firstEntry) return [];
  
  const startDay = dayjs(
    entries.reduce(
      (start, entry) => (entry.timestamp < start ? entry.timestamp : start),
      firstEntry.timestamp
    )
  )
    .startOf('day')
    .toJSON();
  const filteredEntries = entries.filter(
    (entry) => entry.entryType === entryType
  );
  if (filteredEntries.length === 0) return [];
  if (entryType === 'food') fillInFoodGaps(filteredEntries);
  filteredEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  let runningTotal = 0;
  const series = [
    { x: startDay, y: 0 },
    ...filteredEntries.map((entry) => {
      runningTotal += entry.number;
      return { x: entry.timestamp, y: runningTotal };
    }),
    { x: now ?? dayjs().toJSON(), y: runningTotal },
  ];

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

  let runningTotal = 0;
  const series = [
    { x: startDay, y: 0 },
    ...foodEntries.map((entry) => {
      const timestamp = entry.timestamp;
      const number = entry.number;
      const passiveCalories = passiveCaloriesAtTimestamp(startDay, timestamp, dailyPassiveCalories);
      runningTotal += number;
      return {
        x: timestamp,
        y: runningTotal + passiveCalories,
      };
    }),
    {
      x: now ?? dayjs().toJSON(),
      y:
        runningTotal +
        passiveCaloriesAtTimestamp(
          startDay,
          now ?? dayjs().toJSON(),
          dailyPassiveCalories
        ),
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

function passiveCaloriesAtTimestamp(
  startDay: string,
  timestamp: string,
  dailyPassiveCalories: number
) {
  return (
    (dailyPassiveCalories *
      (dayjs(timestamp).valueOf() - dayjs(startDay).valueOf())) /
    1000 /
    60 /
    60 /
    24
  );
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