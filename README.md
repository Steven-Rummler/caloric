# Caloric

A React Native app for tracking daily calories and weight, built with Expo.

## Features

- Log food entries and track calorie intake
- Monitor weight changes over time
- View charts for daily calories, running totals, and weight trends
- Quick log buttons for common calorie amounts
- History and stats screens with customizable date ranges
- Data persistence with Redux and AsyncStorage

## Technologies

- React Native
- Expo
- Redux Toolkit
- React Navigation
- Victory Charts
- React Native Skia
- TypeScript

## Chart Data Generation

The app uses pure functions in `pure/generateSeries.ts` to generate data series for three main charts.

### Daily Calories Chart

- **Series Generated**:
  - Daily food calorie intake (sum of food entries per day)
  - Daily total calories (food + passive basal metabolic rate)
- **Calculations**:
  - Aggregates food entries by date (YYYY-MM-DD).
  - Adds passive calories (constant daily value) to food totals.
  - Fills gaps in food data by estimating meals: distributes average daily calories across breakfast (25%), lunch (25%), and dinner (50%) on missing days.

### Running Calories Chart

- **Series Generated**:
  - Time-series of cumulative calorie totals (food + passive over time)
- **Calculations**:
  - Starts from the earliest entry date.
  - Accumulates food calories chronologically.
  - Adds passive calories proportional to days elapsed since start (passive * days).
  - Includes a final point at current time for ongoing visualization.

### Weight Chart

- **Series Generated**:
  - Measured weight (actual logged weight entries)
  - Estimated weight (computed based on calorie balance)
- **Calculations**:
  - Converts running calorie totals to weight change using 3500 calories per pound.
  - Adjusts the baseline to align with actual logged weight data (gap = average measured weight - average calories / 3500).
  - Assumes weight loss/gain from calorie deficit/surplus.

Gap filling ensures continuous chart visualization even with incomplete logging, using historical averages to estimate missing food entries.