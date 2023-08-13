import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';

import DailyCaloriesChart from '../components/dailyCaloriesChart';
import Page from '../components/Page';
import RunningCaloriesChart from '../components/runningCaloriesChart';
import { Text } from 'react-native';
import WeightChart from '../components/weightChart';
import styled from 'styled-components/native';
import { useState } from 'react';

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
      <OptionsSection>
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
      </OptionsSection>
      {charts.get(chart)}
    </Page>
  );
}

const OptionsSection = styled.View`
  flex: 1 1 0;
  max-height: 133px;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
`;
