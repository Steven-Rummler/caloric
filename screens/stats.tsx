import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import DailyCaloriesChart from '../components/dailyCaloriesChart';
import RunningCaloriesChart from '../components/runningCaloriesChart';
import WeightChart from '../components/weightChart';

const charts = new Map(
  Object.entries({
    dailyCalories: <DailyCaloriesChart />,
    runningCalories: <RunningCaloriesChart />,
    weight: <WeightChart />,
  })
);

export default function StatsScreen() {
  const [chart, setChart] = useState<string>('weight');

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
            }}
          >
            {'Running\nTotal\nCalories'}
          </Text>
        </RunningCaloriesButton>
      </View>
      {charts.get(chart)}
    </Page>
  );
}

const styles = StyleSheet.create({
  optionsSection: {
    flex: 1,
    maxHeight: 133,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
});
