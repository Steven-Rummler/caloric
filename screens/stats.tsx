import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { useTheme } from '../ThemeProvider';
import DailyCaloriesChart from '../components/dailyCaloriesChart';
import RunningCaloriesChart from '../components/runningCaloriesChart';
import WeightChart from '../components/weightChart';

const charts = new Map(
  Object.entries({
    dailyCalories: (dateRange: number | null) => <DailyCaloriesChart dateRange={dateRange} />,
    runningCalories: (dateRange: number | null) => <RunningCaloriesChart dateRange={dateRange} />,
    weight: (dateRange: number | null) => <WeightChart dateRange={dateRange} />,
  })
);

const dateRanges = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '1Y', days: 365 },
  { label: 'All', days: null },
];

export default function StatsScreen() {
  const [chart, setChart] = useState<string>('weight');
  const [dateRange, setDateRange] = useState<number | null>(null);
  const theme = useTheme();

  const WeightButton = chart === 'weight' ? OptionButton : UnselectedOptionButton;
  const DailyCaloriesButton = chart === 'dailyCalories' ? OptionButton : UnselectedOptionButton;
  const RunningCaloriesButton = chart === 'runningCalories' ? OptionButton : UnselectedOptionButton;

  return (
    <Page>
      <View style={styles.optionsSection}>
        <WeightButton onPress={() => setChart('weight')}>
          <Text
            style={{
              padding: 5,
              textAlign: 'center',
              color: theme.primaryText,
            }}
          >
            Weight
          </Text>
        </WeightButton>
        <DailyCaloriesButton onPress={() => setChart('dailyCalories')}>
          <Text
            style={{
              padding: 5,
              textAlign: 'center',
              color: theme.primaryText,
            }}
          >
            Daily Calories
          </Text>
        </DailyCaloriesButton>
        <RunningCaloriesButton onPress={() => setChart('runningCalories')}>
          <Text
            style={{
              padding: 5,
              textAlign: 'center',
              color: theme.primaryText,
            }}
          >
            {'Running\nTotal\nCalories'}
          </Text>
        </RunningCaloriesButton>
      </View>
      <View style={styles.dateRangeSection}>
        {dateRanges.map(({ label, days }) => {
          const Button = dateRange === days ? OptionButton : UnselectedOptionButton;
          return (
            <Button key={label} onPress={() => setDateRange(days)}>
              <Text style={{ padding: 5, textAlign: 'center', color: theme.primaryText }}>{label}</Text>
            </Button>
          );
        })}
      </View>
      {charts.get(chart)?.(dateRange)}
    </Page>
  );
}

const styles = StyleSheet.create({
  optionsSection: {
    flex: 1,
    maxHeight: 133,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dateRangeSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
