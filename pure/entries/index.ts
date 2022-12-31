import { entryList, entryType } from '../../types';

import dayjs from 'dayjs';

function getEntriesForType(
  entries: entryList,
  entryType: entryType
): entryList {
  return entries.filter((entry) => entry.entryType === entryType);
}
function getEntriesForDate(entries: entryList, date: dayjs.Dayjs): entryList {
  return entries.filter((entry) => date.isSame(entry.date, 'day'));
}
function getMinDate(entries: entryList): dayjs.Dayjs {
  if (entries.length === 0) return dayjs();
  return dayjs(
    Math.min(...entries.map((entry) => dayjs(entry.date).valueOf()))
  );
}
function getMaxDate(entries: entryList): dayjs.Dayjs {
  if (entries.length === 0) return dayjs();
  return dayjs(
    Math.max(...entries.map((entry) => dayjs(entry.date).valueOf()))
  );
}

export { getEntriesForType, getEntriesForDate, getMinDate, getMaxDate };
