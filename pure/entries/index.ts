import { entryList, entryType } from '../../types';

import dayjs from 'dayjs';

function getEntriesForType(
  entries: entryList,
  entryType: entryType
): entryList {
  return entries.filter((entry) => entry.entryType === entryType);
}
function getEntriesForDay(entries: entryList, date: dayjs.Dayjs): entryList {
  return entries.filter((entry) => date.isSame(entry.timestamp, 'day'));
}
function getFirstDay(entries: entryList): dayjs.Dayjs {
  if (entries.length === 0) return dayjs();
  return dayjs(
    Math.min(...entries.map((entry) => dayjs(entry.timestamp).valueOf()))
  );
}
function getLastDay(entries: entryList): dayjs.Dayjs {
  if (entries.length === 0) return dayjs();
  return dayjs(
    Math.max(...entries.map((entry) => dayjs(entry.timestamp).valueOf()))
  );
}
function caloriesAtTimestamp(
  entries: entryList,
  timestamp: dayjs.Dayjs
): number {
  return (
    foodCaloriesAtTimestamp(entries, timestamp) -
    activeCaloriesAtTimestamp(entries, timestamp) -
    passiveCaloriesAtTimestamp(entries, timestamp)
  );
}
function foodCaloriesAtTimestamp(entries: entryList, timestamp: dayjs.Dayjs) {
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
function activeCaloriesAtTimestamp(entries: entryList, timestamp: dayjs.Dayjs) {
  const entriesBeforeTimestamp = entries.filter((entry) =>
    dayjs(entry.timestamp).isBefore(timestamp)
  );
  const activeEntriesBeforeTimestamp = entriesBeforeTimestamp.filter(
    (entry) => entry.entryType === 'active'
  );
  return activeEntriesBeforeTimestamp.reduce(
    (total, next) => total + next.number,
    0
  );
}
function passiveCaloriesAtTimestamp(
  entries: entryList,
  timestamp: dayjs.Dayjs
) {
  const weightSeries = entries
    .filter((entry) => entry.entryType === 'weight')
    .map((entry) => ({
      x: dayjs(entry.timestamp).valueOf(),
      y: 3500 * entry.number,
    }));
  const calorieSeries = entries
    .filter((entry) => entry.entryType !== 'weight')
    .map((entry) => ({
      x: dayjs(entry.timestamp).valueOf(),
      y: entry.number,
    }));

  const weightLine = slopeForLine(weightSeries);
  const calorieLine = slopeForLine(calorieSeries);
  const x = timestamp.valueOf();
  const passiveCalories =
    (weightLine.slope - calorieLine.slope) * x +
    (weightLine.intercept - calorieLine.intercept);

  // console.log(passiveCalories);

  return passiveCalories;
}
function slopeForLine(series: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} {
  const count = series.length;
  const xSum = series.reduce((total, next) => total + next.x, 0);
  const ySum = series.reduce((total, next) => total + next.y, 0);
  const xxSum = series.reduce((total, next) => total + next.x * next.x, 0);
  const xySum = series.reduce((total, next) => total + next.x * next.y, 0);

  const slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
  const intercept = ySum / count - (slope * xSum) / count;

  return { slope, intercept };
}

export {
  getEntriesForType,
  getEntriesForDay,
  getFirstDay,
  getLastDay,
  caloriesAtTimestamp,
  foodCaloriesAtTimestamp,
  activeCaloriesAtTimestamp,
  passiveCaloriesAtTimestamp,
};
