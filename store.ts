import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  combineReducers,
  configureStore,
  createSlice,
} from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import isEqual from 'lodash/isEqual';
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
import { generateDefaultEntries } from './pure/defaultEntries';
import { entry } from './types';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const defaultEntries = generateDefaultEntries({
  days: 30,
  meals: 3,
  dailyCalories: 2000,
  calorieVariation: 1000,
  sections: 4,
  gapDays: 7,
  initialWeight: 150,
});

const defaultPassive = calculateDailyPassiveCalories(defaultEntries);

interface DataSlice {
  passiveCalories: number;
  entries: entry[];
}
interface Store {
  data: DataSlice;
}

const initialState: DataSlice = {
  passiveCalories: defaultPassive,
  entries: [],
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
    demoEntriesMonth: (state) => {
      state.entries = generateDefaultEntries({
        days: 30,
        meals: 3,
        dailyCalories: 2000,
        calorieVariation: 1000,
        sections: 1,
        gapDays: 0,
        initialWeight: 150,
      });
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    demoEntriesYear: (state) => {
      state.entries = generateDefaultEntries({
        days: 365,
        meals: 3,
        dailyCalories: 2000,
        calorieVariation: 1000,
        sections: 1,
        gapDays: 0,
        initialWeight: 150,
      });
      state.passiveCalories = calculateDailyPassiveCalories(state.entries);
    },
    demoEntriesDecade: (state) => {
      state.entries = generateDefaultEntries({
        days: 3650,
        meals: 3,
        dailyCalories: 2000,
        calorieVariation: 1000,
        sections: 1,
        gapDays: 0,
        initialWeight: 150,
      });
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
  demoEntriesMonth,
  demoEntriesYear,
  demoEntriesDecade,
} = slice.actions;

function getEntries(state: Store): entry[] {
  return state.data.entries;
}

function getPassiveCalories(state: Store): number {
  return state.data.passiveCalories;
}

function getDateFormat(state: Store) {
  if (state.data.entries.length === 0)
    return 'MMM D'; // Default format when no entries
  const timestamps = state.data.entries.map(entry => dayjs(entry.timestamp).valueOf());
  const minDate = Math.min(...timestamps);
  const maxDate = Math.max(...timestamps);
  const diff = dayjs(maxDate).diff(dayjs(minDate), 'day');
  return diff > 3 * 365 ? 'YYYY' : diff > 2 * 30 ? 'MMM \'YY' : diff > 7 ? 'MMM D' : 'ddd';
}

const reducer = combineReducers({
  data: slice.reducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export {
  addEntries,
  addEntry,
  clearEntries,
  getDateFormat,
  getEntries,
  getPassiveCalories,
  persistor,
  removeEntry,
  store,
  useDefaultEntries,
  demoEntriesMonth,
  demoEntriesYear,
  demoEntriesDecade,
};

