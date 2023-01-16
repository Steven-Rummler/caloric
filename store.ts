import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import { entry, entryList } from './types';

import _ from 'lodash';
import { calculateDailyPassiveCalories } from './pure/entries';
import dayjs from 'dayjs';

const arrayOfFifteen = Array(100)
  .fill(0)
  .map((e, i) => i);

const defaultEntries: entryList = [
  ...arrayOfFifteen.map(
    (): entry => ({
      entryType: 'food',
      timestamp: dayjs()
        .subtract(10 * 24 * 60 * Math.random(), 'minute')
        .toJSON(),
      number: _.round(100 + 200 * Math.random()),
      ...(Math.random() > 0.5 && { label: 'Eggs' }),
    })
  ),
  ...arrayOfFifteen.map(
    (): entry => ({
      entryType: 'active',
      timestamp: dayjs()
        .subtract(10 * 24 * 60 * Math.random(), 'minute')
        .toJSON(),
      number: _.round(25 + 50 * Math.random()),
    })
  ),
  ...arrayOfFifteen.map(
    (): entry => ({
      entryType: 'weight',
      timestamp: dayjs()
        .subtract(10 * 24 * 60 * Math.random(), 'minute')
        .toJSON(),
      number: _.round(150 + 2 * Math.random(), 1),
    })
  ),
];

const defaultPassive = calculateDailyPassiveCalories(defaultEntries);
console.log(defaultPassive);

const slice = createSlice({
  name: 'data',
  initialState: {
    passiveCalories: defaultPassive,
    entries: defaultEntries,
  },
  reducers: {
    addEntry: (state, action: { type: string; payload: entry }) => {
      state.entries.push(action.payload);
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    removeEntry: (state, action: { type: string; payload: entry }) => {
      const filteredEntries = state.entries.filter(
        (entry) => !_.isEqual(entry, action.payload)
      );
      state.entries = filteredEntries;
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
  },
});

const { addEntry, removeEntry } = slice.actions;

function getEntries(state: { data: { entries: entryList } }): entryList {
  return state.data.entries;
}

function getPassiveCalories(state: {
  data: { passiveCalories: number };
}): number {
  return state.data.passiveCalories;
}

const reducer = combineReducers({
  data: slice.reducer,
});

const store = configureStore({
  reducer,
});

export { store, addEntry, removeEntry, getEntries, getPassiveCalories };
