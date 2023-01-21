import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import {
  combineReducers,
  configureStore,
  createSlice,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { entry, entryList } from './types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import { calculateDailyPassiveCalories } from './pure/entries';
import dayjs from 'dayjs';

const persistConfig = {
  key: 'root',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  storage: AsyncStorage,
};

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
    addEntries: (state, action: { type: string; payload: entryList }) => {
      state.entries.push(...action.payload);
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    removeEntry: (state, action: { type: string; payload: entry }) => {
      const filteredEntries = state.entries.filter(
        (entry) => !_.isEqual(entry, action.payload)
      );
      state.entries = filteredEntries;
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    clearEntries: (state) => {
      state.entries = [];
      state.passiveCalories = 1500;
    },
    useDefaultEntries: (state) => {
      state.entries = defaultEntries;
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
  },
});

const { addEntry, addEntries, removeEntry, clearEntries, useDefaultEntries } =
  slice.actions;

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const persistor = persistStore(store);

export {
  store,
  persistor,
  addEntry,
  addEntries,
  removeEntry,
  clearEntries,
  useDefaultEntries,
  getEntries,
  getPassiveCalories,
};
