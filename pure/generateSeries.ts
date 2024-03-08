import { daySeries, entry, entryType, timeSeries } from '../types';
import dayjs from 'dayjs';

export function generateDailyCalorieSeries(
  entries: entry[],
  entryType: entryType
): daySeries {
  const filteredEntries = entries
    .filter((entry) => entry.entryType === entryType)
    .map(({ timestamp, number }) => ({
      x: dayjs(timestamp).format('YYYY-MM-DD'),
      y: number,
    }))
    .sort((a, b) => a.x.localeCompare(b.x));
  if (filteredEntries.length === 0) return [];

  const series: daySeries = [];
  let currentDay = filteredEntries[0].x;
  let currentTotal = 0;

  for (const entry of filteredEntries) {
    if (entry.x !== currentDay) {
      series.push({ x: currentDay, y: currentTotal });
      currentDay = entry.x;
      currentTotal = 0;
    }
    currentTotal += entry.y;
  }
  series.push({ x: currentDay, y: currentTotal });

  const today = dayjs().format('YYYY-MM-DD');
  if (series.length === 0 || series[series.length - 1].x < today)
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
  const lastDay = series[series.length - 1].x;
  let seriesIndex = 0; // Start at the first day
  for (
    let day = series[0].x;
    day < lastDay;
    day = dayjs(day).add(1, 'day').format('YYYY-MM-DD')
  )
    if (series[seriesIndex].x !== day)
      // If the current day is not in the series, add it
      series.push({
        x: day,
        y: 0,
      });
    else seriesIndex++; // Otherwise, move to the next day in the series
}

export function generateRunningCalorieSeries(
  entries: entry[],
  entryType: entryType,
  now?: string
): timeSeries {
  if (entries.length === 0) return [];
  const startDay = dayjs(
    entries.reduce(
      (start, entry) => (entry.timestamp < start ? entry.timestamp : start),
      entries[0].timestamp
    )
  )
    .startOf('day')
    .toJSON();
  const filteredEntries = entries.filter(
    (entry) => entry.entryType === entryType
  );
  if (filteredEntries.length === 0) return [];
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
  const filteredEntries = entries.filter(
    (entry) => entry.entryType !== 'weight'
  );
  if (filteredEntries.length === 0) return [];
  filteredEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  let runningTotal = 0;
  const series = [
    { x: startDay, y: 0 },
    ...filteredEntries.map((entry) => {
      const timestamp = entry.timestamp;
      const number = entry.number;
      runningTotal += number;
      return {
        x: timestamp,
        y:
          runningTotal +
          passiveCaloriesAtTimestamp(startDay, timestamp, dailyPassiveCalories),
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
