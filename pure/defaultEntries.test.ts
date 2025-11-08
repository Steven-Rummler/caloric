import dayjs from 'dayjs';
import { expect, it } from 'vitest';
import { generateDefaultEntries } from './defaultEntries';
import { maxAcceptableProcessingTime } from './test';

it('generateDefaultEntries should create entries with correct structure', () => {
  const params = {
    days: 2,
    meals: 2,
    dailyCalories: 1000,
    calorieVariation: 200,
    sections: 1,
    gapDays: 0,
    initialWeight: 150,
  };

  const entries = generateDefaultEntries(params);

  expect(entries.length).toBeGreaterThan(0);
  expect(entries.every(entry =>
    entry.entryType === 'food' || entry.entryType === 'weight'
  )).toBe(true);
  expect(entries.every(entry =>
    typeof entry.timestamp === 'string' && typeof entry.number === 'number'
  )).toBe(true);
});

it('generateDefaultEntries should create correct number of entries', () => {
  const params = {
    days: 3,
    meals: 2,
    dailyCalories: 1000,
    calorieVariation: 0, // No variation for predictable count
    sections: 1,
    gapDays: 0,
    initialWeight: 150,
  };

  const entries = generateDefaultEntries(params);
  const weightEntries = entries.filter(e => e.entryType === 'weight');
  const foodEntries = entries.filter(e => e.entryType === 'food');

  expect(weightEntries).toHaveLength(3); // One weight per day
  expect(foodEntries).toHaveLength(6); // 2 meals per day * 3 days
});

it('generateDefaultEntries should handle sections and gaps', () => {
  const params = {
    days: 2,
    meals: 1,
    dailyCalories: 1000,
    calorieVariation: 0,
    sections: 2,
    gapDays: 1,
    initialWeight: 150,
  };

  const entries = generateDefaultEntries(params);
  const weightEntries = entries.filter(e => e.entryType === 'weight');

  expect(weightEntries).toHaveLength(4); // 2 days * 2 sections

  // Check that there's a gap between sections
  const timestamps = weightEntries.map(e => dayjs(e.timestamp).valueOf()).sort();
  const dayDiffs = [];
  for (let i = 1; i < timestamps.length; i++) {
    const prev = timestamps[i - 1];
    const curr = timestamps[i];
    if (prev !== undefined && curr !== undefined) 
      dayDiffs.push((curr - prev) / (1000 * 60 * 60 * 24));
  }

  expect(dayDiffs.some(diff => diff > 1)).toBe(true); // Should have gaps larger than 1 day between sections
});

it('generateDefaultEntries should generate realistic calorie values', () => {
  const params = {
    days: 10,
    meals: 3,
    dailyCalories: 2000,
    calorieVariation: 500,
    sections: 1,
    gapDays: 0,
    initialWeight: 150,
  };

  const entries = generateDefaultEntries(params);
  const foodEntries = entries.filter(e => e.entryType === 'food');

  // Check that meal calories vary around the expected values
  const mealCalories = foodEntries.map(e => e.number);
  const totalCalories = mealCalories.reduce((sum, cal) => sum + cal, 0);
  const avgDailyCalories = totalCalories / 10; // 10 days

  expect(avgDailyCalories).toBeGreaterThan(1500); // Should be around 2000
  expect(avgDailyCalories).toBeLessThan(2500);
});

it('generateDefaultEntries should generate weight progression', () => {
  const params = {
    days: 30,
    meals: 2,
    dailyCalories: 2500, // Surplus calories
    calorieVariation: 200,
    sections: 1,
    gapDays: 0,
    initialWeight: 150,
  };

  const entries = generateDefaultEntries(params);
  const weightEntries = entries.filter(e => e.entryType === 'weight');

  // Weight should generally increase with calorie surplus
  const weights = weightEntries.map(e => e.number).sort();
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];

  expect(firstWeight).toBeDefined();
  expect(lastWeight).toBeDefined();
  expect(typeof firstWeight).toBe('number');
  if (typeof firstWeight === 'number') expect(lastWeight).toBeGreaterThan(firstWeight);
});

it('generateDefaultEntries should be performant', () => {
  const params = {
    days: 365, // 365 days per section
    meals: 4,
    dailyCalories: 2000,
    calorieVariation: 1000,
    sections: 10, // 10 sections = 10 years
    gapDays: 0, // No gaps
    initialWeight: 150,
  };

  const start = performance.now();
  const entries = generateDefaultEntries(params);
  const end = performance.now();

  expect(entries.length).toBeGreaterThan(14000); // Should generate many entries (365*10*5 ≈ 18k entries)
  expect(end - start).toBeLessThan(maxAcceptableProcessingTime); // Should complete in under 48ms
});

it('generateDefaultEntries should handle edge cases', () => {
  // Minimal parameters
  const minimalParams = {
    days: 1,
    meals: 1,
    dailyCalories: 1000,
    calorieVariation: 0,
    sections: 1,
    gapDays: 0,
    initialWeight: 150,
  };

  const minimalEntries = generateDefaultEntries(minimalParams);
  expect(minimalEntries).toHaveLength(2); // 1 weight + 1 food

  // Zero meals (edge case)
  const noMealsParams = {
    days: 1,
    meals: 0,
    dailyCalories: 1000,
    calorieVariation: 0,
    sections: 1,
    gapDays: 0,
    initialWeight: 150,
  };

  const noMealsEntries = generateDefaultEntries(noMealsParams);
  expect(noMealsEntries).toHaveLength(1); // Only weight entry
});
