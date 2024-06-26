import dayjs from 'dayjs';
import { entry, entryType } from '../types';
import { fillInFoodGaps } from './generateSeries';

function getEntriesForType(entries: entry[], entryType: entryType): entry[] {
  return entries.filter((entry) => entry.entryType === entryType);
}
function getEntriesForDay(entries: entry[], date: dayjs.Dayjs): entry[] {
  return entries.filter((entry) => date.isSame(entry.timestamp, 'day'));
}
function getFirstDay(entries: entry[]): dayjs.Dayjs {
  if (entries.length === 0) return dayjs();
  return dayjs(
    Math.min(...entries.map((entry) => dayjs(entry.timestamp).valueOf()))
  );
}
function getLastDay(entries: entry[]): dayjs.Dayjs {
  if (entries.length === 0) return dayjs();
  return dayjs(
    Math.max(...entries.map((entry) => dayjs(entry.timestamp).valueOf()))
  );
}
function caloriesAtTimestamp(
  entries: entry[],
  timestamp: dayjs.Dayjs,
  dailyPassiveCalories: number
): number {
  return (
    foodCaloriesAtTimestamp(entries, timestamp) +
    dailyPassiveCalories * dayDiff(getFirstDay(entries), timestamp)
  );
}
function foodCaloriesAtTimestamp(entries: entry[], timestamp: dayjs.Dayjs) {
  const entriesBeforeTimestamp = entries.filter((entry) =>
    dayjs(entry.timestamp).isBefore(timestamp)
  );
  const foodEntriesBeforeTimestamp = entriesBeforeTimestamp.filter(
    (entry) => entry.entryType === 'food'
  );
  return foodEntriesBeforeTimestamp.reduce(
    (total, next) => total + next.number,
    0
  );
}
function calculateDailyPassiveCalories(entries: entry[]) {
  if (entries.filter((entry) => entry.entryType === 'weight').length < 2)
    return -1500;

  const weightSeries = entries
    .filter((entry) => entry.entryType === 'weight')
    .map((entry) => ({
      x: dayjs(entry.timestamp).valueOf(),
      y: 3500 * entry.number,
    }));
  let runningTotalCalories = 0;
  const calorieSeries: { x: number; y: number }[] = [];
  const foodEntries = entries.filter((entry) => entry.entryType === 'food');
  fillInFoodGaps(foodEntries);
  foodEntries.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
  for (const entry of foodEntries) {
    runningTotalCalories += entry.number;
    calorieSeries.push({
      x: dayjs(entry.timestamp).valueOf(),
      y: runningTotalCalories,
    });
  }

  const weightLine = slopeForLine(weightSeries);
  const calorieLine = slopeForLine(calorieSeries);
  const passiveCaloriesPerMilli = weightLine.slope - calorieLine.slope;

  return passiveCaloriesPerMilli * 1000 * 60 * 60 * 24;
}
function slopeForLine(series: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} {
  const count = series.length;

  if (count < 2) return { slope: 0, intercept: 0 };

  const xSum = series.reduce((total, next) => total + next.x, 0);
  const ySum = series.reduce((total, next) => total + next.y, 0);
  const xxSum = series.reduce((total, next) => total + next.x * next.x, 0);
  const xySum = series.reduce((total, next) => total + next.x * next.y, 0);

  const slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
  const intercept = ySum / count - (slope * xSum) / count;

  return { slope, intercept };
}
function dayDiff(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  return (end.valueOf() - start.valueOf()) / 1000 / 60 / 60 / 24;
}
export {
  calculateDailyPassiveCalories, caloriesAtTimestamp, dayDiff, foodCaloriesAtTimestamp, getEntriesForDay, getEntriesForType, getFirstDay,
  getLastDay
};

