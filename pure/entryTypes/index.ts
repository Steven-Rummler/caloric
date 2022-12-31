import { Dayjs } from 'dayjs';
import { entryType } from '../../types';

const entryTypes: entryType[] = ['food', 'active', 'weight'];

const entryTypeUnits = {
    food: 'Calories',
    active: 'Calories',
    weight: 'Pounds'
};

function entryTypeUnit(entryType: entryType): string {
    return entryTypeUnits[entryType];
}

const entryTypeLabels = {
    food: 'Food\nCalories',
    active: 'Active\nCalories',
    weight: 'Weight'
};

function entryTypeLabel(entryType: entryType): string {
    return entryTypeLabels[entryType];
}

const entryTypeDateFormats = {
    food: 'dddd, MMMM D, h:mm a',
    active: 'dddd, MMMM D',
    weight: 'dddd, MMMM D, h:mm a'
};

function displayDate(date: Dayjs, entryType: entryType): string {
    return date.format(entryTypeDateFormats[entryType]);
}

export { entryTypes, entryTypeUnit, entryTypeLabel, displayDate };