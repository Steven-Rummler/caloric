import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import { entry, entryList } from './types';

import _ from 'lodash';
import dayjs from 'dayjs';

const arrayOfFifteen = Array(15);

const slice = createSlice({
  name: 'data',
  initialState: [
    ...arrayOfFifteen.map(() => ({
      entryType: 'food',
      date: dayjs()
        .subtract(10 * 24 * 60 * Math.random(), 'minute')
        .toJSON(),
      number: 10 * _.round(10 + 40 * Math.random()),
      ...(Math.random() > 0.5 && { label: 'Eggs' }),
    })),
    ...arrayOfFifteen.map(() => ({
      entryType: 'active',
      date: dayjs()
        .subtract(10 * 24 * 60 * Math.random(), 'minute')
        .toJSON(),
      number: 10 * _.round(100 * Math.random()),
    })),
    ...arrayOfFifteen.map(() => ({
      entryType: 'weight',
      date: dayjs()
        .subtract(10 * 24 * 60 * Math.random(), 'minute')
        .toJSON(),
      number: _.round(150 + 5 * Math.random(), 1),
    })),
  ] as entryList,
  reducers: {
    addEntry: (state: entryList, action: { type: string; payload: entry }) => {
      state.push(action.payload);
    },
    removeEntry: (
      state: entryList,
      action: { type: string; payload: entry }
    ) => {
      state = state.filter((entry) => !_.isEqual(entry, action.payload));
    },
  },
});

const { addEntry, removeEntry } = slice.actions;

function getEntries(state: { data: entryList }): entryList {
  return state.data;
}

const reducer = combineReducers({
  data: slice.reducer,
});

const store = configureStore({
  reducer,
});

export { store, addEntry, removeEntry, getEntries };
