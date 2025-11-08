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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  },
});

const {
  addEntry,
  addEntries,
  removeEntry,
  clearEntries,
  useDefaultEntries,
} = slice.actions;

function getEntries(state: Store): entry[] {
  return state.data.entries;
}

function getPassiveCalories(state: Store): number {
  return state.data.passiveCalories;
}

function getDateFormat(state: Store) {
  if (state.data.entries.length === 0) {
    return 'MMM D'; // Default format when no entries
  }
  const firstTimestamp = state.data.entries[0]!.timestamp;
  const minDate = state.data.entries.reduce((min, entry) => entry.timestamp < min ? entry.timestamp : min, firstTimestamp);
  const maxDate = state.data.entries.reduce((max, entry) => entry.timestamp > max ? entry.timestamp : max, firstTimestamp);
  const diff = dayjs(maxDate).diff(dayjs(minDate), 'day');
  return diff > 3 * 365 ? 'YYYY' : diff > 2 * 30 ? 'MMM \'YY' : diff > 7 ? 'MMM D' : 'ddd';
}

const reducer = combineReducers({
  data: slice.reducer,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
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
  getPassiveCalories,
  persistor,
  removeEntry,
  store,
  useDefaultEntries
};

