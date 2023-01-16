import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import { entry, entryList } from './types';

import _ from 'lodash';
import dayjs from 'dayjs';

const arrayOfFifteen = Array(100)
  .fill(0)
  .map((e, i) => i);

const slice = createSlice({
  name: 'data',
  initialState: {
    entries: [
      ...arrayOfFifteen.map(() => ({
        entryType: 'food',
        timestamp: dayjs()
          .subtract(10 * 24 * 60 * Math.random(), 'minute')
          .toJSON(),
        number: _.round(100 + 200 * Math.random()),
        ...(Math.random() > 0.5 && { label: 'Eggs' }),
      })),
      ...arrayOfFifteen.map(() => ({
        entryType: 'active',
        timestamp: dayjs()
          .subtract(10 * 24 * 60 * Math.random(), 'minute')
          .toJSON(),
        number: _.round(25 + 50 * Math.random()),
      })),
      ...arrayOfFifteen.map(() => ({
        entryType: 'weight',
        timestamp: dayjs()
          .subtract(10 * 24 * 60 * Math.random(), 'minute')
          .toJSON(),
        number: _.round(150 + 2 * Math.random(), 1),
      })),
    ],
  },
  reducers: {
    addEntry: (state, action: { type: string; payload: entry }) => {
      state.entries.push(action.payload);
    },
    removeEntry: (state, action: { type: string; payload: entry }) => {
      const filteredEntries = state.entries.filter(
        (entry) => !_.isEqual(entry, action.payload)
      );
      state.entries = filteredEntries;
    },
  },
});

const { addEntry, removeEntry } = slice.actions;

function getEntries(state: { data: { entries: entryList } }): entryList {
  return state.data.entries;
}

const reducer = combineReducers({
  data: slice.reducer,
});

const store = configureStore({
  reducer,
});

export { store, addEntry, removeEntry, getEntries };
