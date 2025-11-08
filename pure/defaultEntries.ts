import dayjs from 'dayjs';
import { entry } from '../types';

export interface GenerateEntriesParams {
  days: number;
  meals: number;
  dailyCalories: number;
  calorieVariation: number;
  sections: number;
  gapDays: number;
  initialWeight: number;
}

export function generateDefaultEntries(params: GenerateEntriesParams): entry[] {
  const {
    days,
    meals,
    dailyCalories,
    calorieVariation,
    sections,
    gapDays,
    initialWeight,
  } = params;

  const mealVariation = calorieVariation / meals;
  const totalDays = days * sections + gapDays * (sections - 1);

  // Pre-calculate base timestamp to avoid repeated dayjs operations
  const baseTimestamp = dayjs().subtract(totalDays, 'days').valueOf();
  const entries: entry[] = [];
  let weight = initialWeight;

  // Pre-allocate array size for better performance
  const estimatedSize = sections * days * (meals + 1); // +1 for weight entries
  entries.length = estimatedSize;

  let entryIndex = 0;

  for (let section = 0; section < sections; section++) 
    for (let day = 0; day < days; day++) {
      const daysFromStart = day + section * gapDays + section * days;
      const calorieDiff = Math.random() * calorieVariation - calorieVariation / 2;
      const mealSize = (dailyCalories + calorieDiff) / meals;
      weight += calorieDiff / 3500;

      // Calculate timestamp once and reuse
      const dayTimestamp = baseTimestamp + daysFromStart * 24 * 60 * 60 * 1000;

      // Weight entry
      entries[entryIndex++] = {
        entryType: 'weight',
        timestamp: new Date(dayTimestamp + 8 * 60 * 60 * 1000).toJSON(),
        number: Math.round((weight + Math.random() - 0.51) * 100) / 100,
      };

      // Food entries
      for (let meal = 0; meal < meals; meal++) 
        entries[entryIndex++] = {
          entryType: 'food',
          timestamp: new Date(dayTimestamp + (8 + 4 * meal) * 60 * 60 * 1000).toJSON(),
          number: Math.round(
            (mealSize + Math.random() * mealVariation - mealVariation / 2) * 10
          ) / 10,
        };
    }

  // Trim array to actual size in case we over-allocated
  entries.length = entryIndex;

  return entries;
}
