import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  combineReducers,
  configureStore,
  createSlice,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import isEqual from 'lodash/isEqual';
import round from 'lodash/round';
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
import { calculateDailyPassiveCalories } from './pure/entries';
import { entry, settings } from './types';

const persistConfig = {
  key: 'root',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  storage: AsyncStorage,
};

const days = 30;
const meals = 3;
const dailyCalories = 2000;
const calorieVariation = 1000;
const mealVariation = calorieVariation / meals;

const sections = 4;
const gapDays = 7;
const totalDays = days * sections + gapDays * (sections - 1);

const defaultEntries: entry[] = [];
let weight = 150;
for (let section = 0; section < sections; section++) for (let day = 0; day < days; day++) {
  const daysFromStart = day + section * gapDays + section * days;
  const calorieDiff = Math.random() * calorieVariation - calorieVariation / 2;
  const mealSize = (dailyCalories + calorieDiff) / meals;
  weight += calorieDiff / 3500;
  defaultEntries.push({
    entryType: 'weight',
    timestamp: dayjs()
      .subtract(totalDays, 'days')
      .add(daysFromStart, 'days')
      .startOf('day')
      .add(8, 'hours')
      .toJSON(),
    number: round(weight + Math.random() - 0.51, 2),
  });
  for (let meal = 0; meal < meals; meal++)
    defaultEntries.push({
      entryType: 'food',
      timestamp: dayjs()
        .subtract(totalDays, 'days')
        .add(daysFromStart, 'days')
        .startOf('day')
        .add(8 + 4 * meal, 'hours')
        .toJSON(),
      number: round(mealSize + Math.random() * mealVariation - mealVariation / 2, -1),
    });
}

const defaultPassive = calculateDailyPassiveCalories(defaultEntries);

const defaultSettings: settings = {};

interface DataSlice {
  passiveCalories: number;
  entries: entry[];
  settings: settings;
}
interface Store {
  data: DataSlice;
}

const initialState: DataSlice = {
  passiveCalories: defaultPassive,
  entries: [],
  settings: defaultSettings,
};

const slice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    addEntry: (state, action: { type: string; payload: entry }) => {
      state.entries.push(action.payload);
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    addEntries: (state, action: { type: string; payload: entry[] }) => {
      state.entries.push(...action.payload);
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    removeEntry: (state, action: { type: string; payload: entry }) => {
      const filteredEntries = state.entries.filter(
        (entry) => !isEqual(entry, action.payload)
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
        payload: settings;
      }
    ) => {
      for (const [key, value] of Object.entries(action.payload))
        state.settings[key] = value;
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
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

function getEntries(state: Store): entry[] {
  return state.data.entries;
}

function getPassiveCalories(state: Store): number {
  return state.data.passiveCalories;
}

function getDateFormat(state: Store) {
  const minDate = state.data.entries.reduce((min, entry) => entry.timestamp < min ? entry.timestamp : min, state.data.entries[0].timestamp);
  const maxDate = state.data.entries.reduce((max, entry) => entry.timestamp > max ? entry.timestamp : max, state.data.entries[0].timestamp);
  const diff = dayjs(maxDate).diff(dayjs(minDate), 'day');
  return diff > 3 * 365 ? 'YYYY' : diff > 2 * 30 ? 'MMM \'YY' : diff > 7 ? 'MMM D' : 'ddd';
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
  addEntries,
  addEntry,
  clearEntries, getDateFormat, getEntries,
  getPassiveCalories, getSettings,
  persistor,
  removeEntry,
  resetSettings,
  store,
  updateSetting,
  useDefaultEntries
};

