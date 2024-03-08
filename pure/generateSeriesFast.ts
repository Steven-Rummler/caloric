import { daySeries, entry, entryType, timeSeries } from '../types';
import dayjs from 'dayjs';

export function generateDailyCalorieSeriesFast(
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

  fillInSeriesGapDaysFast(series);

  return series;
}

export function generateDailyTotalCalorieSeriesFast(
  entries: entry[],
  passiveCalories: number
): daySeries {
  const foodSeries = generateDailyCalorieSeriesFast(entries, 'food');
  const series: daySeries = [];
  for (const foodPoint of foodSeries) {
    const existingPoint = series.find((point) => point.x === foodPoint.x);
    if (existingPoint) existingPoint.y += foodPoint.y;
    else series.push({ x: foodPoint.x, y: foodPoint.y });
  }
  for (const point of series) point.y += passiveCalories;
  series.sort((a, b) => (a.x > b.x ? 1 : -1));
  return series;
}

function fillInSeriesGapDaysFast(series: daySeries) {
  if (series.length === 0) return;
  for (
    let day = dayjs(series[0].x).startOf('day');
    day.isBefore(dayjs(series[series.length - 1].x).startOf('day'));
    day = day.add(1, 'day')
  ) {
    const dayString = day.format('YYYY-MM-DD');
    if (!series.some((point) => point.x === dayString))
      series.push({
        x: dayString,
        y: 0,
      });
  }
}

export function generateRunningCalorieSeriesFast(
  entries: entry[],
  entryType: entryType
): timeSeries {
  if (entries.length === 0) return [];
  const startDay = entries
    .reduce(
      (start, entry) =>
        dayjs(entry.timestamp).isBefore(start) ? dayjs(entry.timestamp) : start,
      dayjs(entries[0].timestamp)
    )
    .startOf('day');
  const filteredEntries = entries.filter(
    (entry) => entry.entryType === entryType
  );
  if (filteredEntries.length === 0) return [];
  filteredEntries.sort((a, b) =>
    dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? -1 : 1
  );

  let runningTotal = 0;
  const series = [
    { x: startDay, y: 0 },
    ...filteredEntries.map((entry) => {
      runningTotal += entry.number;
      return { x: dayjs(entry.timestamp), y: runningTotal };
    }),
    { x: dayjs(), y: runningTotal },
  ];

  return series;
}

export function generateRunningTotalCalorieSeriesFast(
  entries: entry[],
  dailyPassiveCalories: number
): timeSeries {
  if (entries.length === 0) return [];
  const startDay = entries
    .reduce(
      (start, entry) =>
        dayjs(entry.timestamp).isBefore(start) ? dayjs(entry.timestamp) : start,
      dayjs(entries[0].timestamp)
    )
    .startOf('day');
  const filteredEntries = entries.filter(
    (entry) => entry.entryType !== 'weight'
  );
  if (filteredEntries.length === 0) return [];
  filteredEntries.sort((a, b) =>
    dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? -1 : 1
  );

  let runningTotal = 0;
  const series = [
    { x: startDay, y: 0 },
    ...filteredEntries.map((entry) => {
      const timestamp = dayjs(entry.timestamp);
      const number = entry.number;
      runningTotal += number;
      return {
        x: timestamp,
        y:
          runningTotal +
          passiveCaloriesAtTimestampFast(
            startDay,
            timestamp,
            dailyPassiveCalories
          ),
      };
    }),
    {
      x: dayjs(),
      y:
        runningTotal +
        passiveCaloriesAtTimestampFast(startDay, dayjs(), dailyPassiveCalories),
    },
  ];

  return series;
}

export function passiveCaloriesAtTimestampFromEntriesFast(
  entries: entry[],
  timestamp: dayjs.Dayjs,
  dailyPassiveCalories: number
) {
  const startDay = entries
    .reduce(
      (start, entry) =>
        dayjs(entry.timestamp).isBefore(start) ? dayjs(entry.timestamp) : start,
      dayjs(entries[0]?.timestamp ?? dayjs())
    )
    .startOf('day');
  return (
    (dailyPassiveCalories * (timestamp.valueOf() - startDay.valueOf())) /
    1000 /
    60 /
    60 /
    24
  );
}

function passiveCaloriesAtTimestampFast(
  startDay: dayjs.Dayjs,
  timestamp: dayjs.Dayjs,
  dailyPassiveCalories: number
) {
  return (
    (dailyPassiveCalories * (timestamp.valueOf() - startDay.valueOf())) /
    1000 /
    60 /
    60 /
    24
  );
}
