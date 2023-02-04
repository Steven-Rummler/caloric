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
import { entry, entryList, settings } from './types';

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

const startDay = dayjs().startOf('day').subtract(10, 'day');

const defaultEntries: entryList = [
  ...arrayOfFifteen.map(
    (): entry => ({
      entryType: 'food',
      timestamp: startDay.add(10 * 24 * 60 * Math.random(), 'minute').toJSON(),
      number: _.round(100 + 200 * Math.random()),
      ...(Math.random() > 0.5 && { label: 'Eggs' }),
    })
  ),
  ...arrayOfFifteen.map(
    (): entry => ({
      entryType: 'active',
      timestamp: startDay.add(10 * 24 * 60 * Math.random(), 'minute').toJSON(),
      number: _.round(25 + 50 * Math.random()),
    })
  ),
  ...arrayOfFifteen.map(
    (): entry => ({
      entryType: 'weight',
      timestamp: startDay.add(10 * 24 * 60 * Math.random(), 'minute').toJSON(),
      number: _.round(150 + 2 * Math.random(), 1),
    })
  ),
];

const defaultPassive = calculateDailyPassiveCalories(defaultEntries);

const defaultSettings: settings = {
  trackActiveCalories: false,
};

const slice = createSlice({
  name: 'data',
  initialState: {
    passiveCalories: defaultPassive,
    entries: defaultEntries,
    settings: defaultSettings,
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
    updateSetting: (
      state,
      action: {
        type: string;
        payload: Partial<settings>;
      }
    ) => {
      for (const [key, value] of Object.entries(action.payload))
        state.settings[key as keyof typeof state.settings] = value;
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
    },
  },
});

const {
  addEntry,
  addEntries,
  removeEntry,
  clearEntries,
  useDefaultEntries,
  updateSetting,
  resetSettings,
} = slice.actions;

function getEntries(state: { data: { entries: entryList } }): entryList {
  return state.data.entries;
}

function getPassiveCalories(state: {
  data: { passiveCalories: number };
}): number {
  return state.data.passiveCalories;
}

function getSettings(state: { data: { settings: settings } }) {
  return state.data.settings;
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
  updateSetting,
  resetSettings,
  getEntries,
  getPassiveCalories,
  getSettings,
};
