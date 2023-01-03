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
function getCaloriesAtTimestamp(
  entries: entryList,
  timestamp: dayjs.Dayjs
): number {
  const entriesBeforeTimestamp = entries.filter((entry) =>
    dayjs(entry.timestamp).isBefore(timestamp)
  );

  const foodEntriesBeforeTimestamp = entriesBeforeTimestamp.filter(
    (entry) => entry.entryType === 'food'
  );
  const foodCalories = foodEntriesBeforeTimestamp.reduce(
    (total, next) => total + next.number,
    0
  );

  const activeEntriesBeforeTimestamp = entriesBeforeTimestamp.filter(
    (entry) => entry.entryType === 'active'
  );
  const activeCalories = activeEntriesBeforeTimestamp.reduce(
    (total, next) => total + next.number,
    0
  );

  return foodCalories - activeCalories;
}

export {
  getEntriesForType,
  getEntriesForDay,
  getFirstDay,
  getLastDay,
  getCaloriesAtTimestamp,
};
