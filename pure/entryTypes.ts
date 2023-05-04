import { Dayjs } from 'dayjs';
import { entryType } from '../types';

const entryTypes: entryType[] = ['food', 'weight'];

const entryTypeUnits: Record<entryType, string> = {
  food: 'Calories',
  weight: 'Pounds',
};

function entryTypeUnit(entryType: entryType): string {
  return entryTypeUnits[entryType];
}

const entryTypeLabels: Record<entryType, string> = {
  food: 'Food\nCalories',
  weight: 'Weight',
};

function entryTypeLabel(entryType: entryType): string {
  return entryTypeLabels[entryType];
}

const entryTypeDateFormats: Record<entryType, string> = {
  food: 'dddd, MMMM D, h:mm a',
  weight: 'dddd, MMMM D, h:mm a',
};

function displayDate(date: Dayjs, entryType: entryType): string {
  return date.format(entryTypeDateFormats[entryType]);
}

export { entryTypes, entryTypeUnit, entryTypeLabel, displayDate };
