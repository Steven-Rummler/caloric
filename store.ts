import { calculateDailyPassiveCalories } from './pure/entries';
import { entry, settings } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  combineReducers,
  configureStore,
  createSlice,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import _ from 'lodash';
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

const persistConfig = {
  key: 'root',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  storage: AsyncStorage,
};

const days = 365;
const meals = 5;
const dailyCalories = 2000;
const calorieVariation = 500;
const mealVariation = calorieVariation / meals;

const defaultEntries: entry[] = [];
let weight = 150;
for (let day = 0; day < days; day++) {
  const calorieDiff = Math.random() * calorieVariation - calorieVariation / 2;
  const mealSize = (dailyCalories + calorieDiff) / meals;
  weight += calorieDiff / 3500;
  defaultEntries.push({
    entryType: 'weight',
    timestamp: dayjs()
      .subtract(days, 'days')
      .add(day, 'days')
      .startOf('day')
      .add(8, 'hours')
      .toJSON(),
    number: weight + Math.random() - 0.5,
  });
  for (let meal = 0; meal < meals; meal++)
    defaultEntries.push({
      entryType: 'food',
      timestamp: dayjs()
        .subtract(days, 'days')
        .add(day, 'days')
        .startOf('day')
        .add(8 + 2 * meal, 'hours')
        .toJSON(),
      number: mealSize + Math.random() * mealVariation - mealVariation / 2,
    });
}

const defaultPassive = calculateDailyPassiveCalories(defaultEntries);

const defaultSettings: settings = {};

const initialState: {
  passiveCalories: number;
  entries: entry[];
  settings: settings;
} = {
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

function getEntries(state: {
  data: { entries: entry[]; settings: settings };
}): entry[] {
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
  addEntries,
  addEntry,
  clearEntries,
  getEntries,
  getPassiveCalories,
  getSettings,
  persistor,
  removeEntry,
  resetSettings,
  store,
  updateSetting,
  useDefaultEntries,
};
