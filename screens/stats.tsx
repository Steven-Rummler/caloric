import DailyCaloriesChart from '../components/dailyCaloriesChart';
import { OptionButton } from '../components/OptionButton';
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
  const [chart, setChart] = useState<string>('dailyCalories');

  return (
    <Page style={{ paddingTop: 90 }}>
      <OptionsSection>
        <OptionButton onPress={() => setChart('dailyCalories')}>
          <Text
            style={{
              padding: 5,
              textAlign: 'center',
              color: chart === 'dailyCalories' ? undefined : 'lightgrey',
            }}
          >
            Daily Calories
          </Text>
        </OptionButton>
        <OptionButton onPress={() => setChart('runningCalories')}>
          <Text
            style={{
              padding: 5,
              textAlign: 'center',
              color: chart === 'runningCalories' ? undefined : 'lightgrey',
            }}
          >
            {'Running\nTotal\nCalories'}
          </Text>
        </OptionButton>
        <OptionButton onPress={() => setChart('weight')}>
          <Text
            style={{
              padding: 5,
              textAlign: 'center',
              color: chart === 'weight' ? undefined : 'lightgrey',
            }}
          >
            Weight
          </Text>
        </OptionButton>
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
