import CaloriesChart from '../components/caloriesChart';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Text } from 'react-native';
import WeightChart from '../components/weightChart';
import styled from 'styled-components/native';
import { useState } from 'react';

const charts = new Map(
  Object.entries({
    calories: <CaloriesChart />,
    weight: <WeightChart />,
  })
);

export default function StatsScreen() {
  const [chart, setChart] = useState<string>('calories');
  return (
    <Page style={{ paddingTop: 90 }}>
      <OptionsSection>
        <OptionButton onPress={() => setChart('calories')}>
          <Text style={chart === 'calories' ? {} : { color: 'lightgrey' }}>
            Calories
          </Text>
        </OptionButton>
        <OptionButton onPress={() => setChart('weight')}>
          <Text style={chart === 'weight' ? {} : { color: 'lightgrey' }}>
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
