import { entryList, entryType, series } from '../types';

import dayjs from 'dayjs';

function generateDailyCalorieSeries(entries: entryList, entryType: entryType) {
  const filteredEntries = entries.filter(
    (entry) => entry.entryType === entryType
  );
  if (filteredEntries.length === 0) return [];

  const series: series = [];
  filteredEntries.forEach(({ timestamp, number }) => {
    const existingPoint = series.find(
      (point) => point.x === dayjs(timestamp).format('YYYY-MM-DD')
    );
    if (existingPoint) existingPoint.y += number;
    else
      series.push({
        x: dayjs(timestamp).format('YYYY-MM-DD'),
        y: number,
      });
  });
  series.sort((a, b) => (a.x > b.x ? 1 : -1));

  fillInSeriesGapDays(series);

  return series;
}

function generateDailyTotalCalorieSeries(
  entries: entryList,
  passiveCalories: number
) {
  const foodSeries = generateDailyCalorieSeries(entries, 'food');
  const activeSeries = generateDailyCalorieSeries(entries, 'active');
  const series: series = [];
  for (const foodPoint of foodSeries) {
    const existingPoint = series.find((point) => point.x === foodPoint.x);
    if (existingPoint) existingPoint.y += foodPoint.y;
    else series.push({ x: foodPoint.x, y: foodPoint.y });
  }
  for (const activePoint of activeSeries) {
    const existingPoint = series.find((point) => point.x === activePoint.x);
    if (existingPoint) existingPoint.y -= activePoint.y;
    else series.push({ x: activePoint.x, y: -1 * activePoint.y });
  }
  for (const point of series) point.y += passiveCalories;
  series.sort((a, b) => (a.x > b.x ? 1 : -1));
  return series;
}

function fillInSeriesGapDays(series: series) {
  if (series.length === 0) return;
  for (
    let day = dayjs(series[0].x);
    day < dayjs(series[series.length - 1].x);
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

export { generateDailyCalorieSeries, generateDailyTotalCalorieSeries };
