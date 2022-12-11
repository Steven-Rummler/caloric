import { entry, entryList, entryType } from "../../types";
import dayjs from 'dayjs';

function getEntriesForType(entries: entryList, entryType: entryType): entryList {
    return entries.filter(entry => entry.entryType === entryType);
}
function getEntriesForDate(entries: entryList, date: dayjs.Dayjs): entryList {
    return entries.filter(entry => date.isSame(entry.date, 'day'));
}
function getMinDate(entries: entryList): dayjs.Dayjs {
    if (entries.length === 0) return dayjs();
    return entries.reduce<dayjs.Dayjs>((min: dayjs.Dayjs, next: entry) => dayjs(next.date).isBefore(min) ? dayjs(next.date) : min, dayjs(entries[0].date));
}
function getMaxDate(entries: entryList): dayjs.Dayjs {
    if (entries.length === 0) return dayjs();
    return entries.reduce<dayjs.Dayjs>((max: dayjs.Dayjs, next: entry) => dayjs(next.date).isAfter(max) ? dayjs(next.date) : max, dayjs(entries[0].date));
}

export { getEntriesForType, getEntriesForDate, getMinDate, getMaxDate };