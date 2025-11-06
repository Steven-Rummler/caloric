import { generateDefaultEntries } from './defaultEntries';

export const maxAcceptableProcessingTime = 48;

export function generateLargeHistory() {
  return generateDefaultEntries({
    days: 365, // 365 days per section
    meals: 5,
    dailyCalories: 2000,
    calorieVariation: 1000,
    sections: 10, // 10 sections = 10 years
    gapDays: 0, // No gaps for continuous data
    initialWeight: 150,
  });
}

export function generateLargeHistoryWithGaps() {
  return generateDefaultEntries({
    days: 30, // 30 days per section
    meals: 3,
    dailyCalories: 2000,
    calorieVariation: 800,
    sections: 40, // 40 sections with gaps = ~10 years total
    gapDays: 30, // 30 day gaps
    initialWeight: 160,
  });
}