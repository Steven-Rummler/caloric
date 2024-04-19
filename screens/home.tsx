import dayjs from 'dayjs';
import { Image } from 'expo-image';
import round from 'lodash/round';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import Icon from '../assets/thin-margin-icon.png';
import { ActionButton } from '../components/ActionButton';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { computeActualWeightSeries } from '../components/weightChart';
import { Props } from '../navigationTypes';
import { getLastDay } from '../pure/entries';
import { getEntries, getPassiveCalories } from '../store';
import { entry } from '../types';

export default function HomeScreen({ navigation }: Props) {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const logEntry = () => navigation.navigate('LogEntry');
  const history = () => navigation.navigate('History');
  const stats = () => navigation.navigate('Stats');

  const recentFoodCalories = useMemo(
    () => computeRecentFoodCalories(entries),
    [entries]
  );
  const totalWeightChange = useMemo(
    () => computeTotalWeightChange(entries, passiveCalories),
    [entries, passiveCalories]
  );
  const currentWeight = useMemo(
    () => computeCurrentWeight(entries, passiveCalories),
    [entries, passiveCalories]
  );

  return (
    <Page>
      <TitleSection>
        <Image source={Icon as string} style={{ width: 96, height: 96 }} />
      </TitleSection>
      <InfoSection>
        <InfoColumn>
          <InfoCard label="Calories Today" value={`${recentFoodCalories}`} />
          <InfoCard
            label="Average Calories Burned"
            value={`${Math.round(-1 * passiveCalories)}`}
          />
        </InfoColumn>
        <InfoColumn>
          <InfoCard label="Current Weight" value={`${currentWeight.toFixed(1)}`} />
          <InfoCard
            label={`Weight ${totalWeightChange > 0 ? 'Gained' : 'Lost'}`}
            value={`${Math.abs(totalWeightChange).toFixed(1)}`}
          />
        </InfoColumn>
      </InfoSection>
      <ActionSection>
        <ActionButton onPress={logEntry}>
          <Text>Log</Text>
        </ActionButton>
      </ActionSection>
      <OptionsSection>
        <OptionButton onPress={history}>
          <Text>History</Text>
        </OptionButton>
        <OptionButton onPress={stats}>
          <Text>Stats</Text>
        </OptionButton>
      </OptionsSection>
    </Page>
  );
}
const TitleSection = styled.View`
  flex: 2 1 0;
  align-items: center;
  justify-content: center;
`;
const InfoSection = styled.View`
  flex: 1.5 1 0;
  flex-direction: row;
`;
const InfoColumn = styled.View`
  flex: 1 1 0;
  justify-content: space-evenly;
`;
const ActionSection = styled.View`
  flex: 5 1 0;
  padding: 20px 20px 10px 20px;
`;
const OptionsSection = styled.View`
  flex: 1.667 1 0;
  flex-direction: row;
  padding: 0px 10px 20px 10px;
`;

function InfoCard(props: { label: string; value: string }) {
  return (
    <View>
      <InfoLabel>{props.label}</InfoLabel>
      <InfoValue>{props.value}</InfoValue>
    </View>
  );
}
const InfoLabel = styled.Text`
  font-size: 12px;
  text-align: center;
`;
const InfoValue = styled.Text`
  font-size: 18px;
  text-align: center;
`;

function computeRecentFoodCalories(entries: entry[]) {
  const foodEntries = entries.filter((entry) => entry.entryType === 'food');
  if (foodEntries.length === 0) return 0;
  const lastDay = getLastDay(foodEntries);
  const recentFoodEntries = foodEntries.filter((entry) =>
    dayjs(entry.timestamp).isSame(lastDay, 'day')
  );
  const recentFoodCalories = recentFoodEntries.reduce(
    (total, next) => total + next.number,
    0
  );
  return Math.round(recentFoodCalories);
}

function computeTotalWeightChange(entries: entry[], passiveCalories: number) {
  const weightData = entries
    .filter((entry) => entry.entryType === 'weight')
    .map((e) => ({
      x: e.timestamp,
      y: e.number,
    }));

  const weightSeries = computeActualWeightSeries(
    entries,
    weightData,
    passiveCalories
  );

  if (weightSeries.length === 0) return 0;

  return round(
    weightSeries[weightSeries.length - 1].y - weightSeries[0].y,
    1
  );
}

function computeCurrentWeight(entries: entry[], passiveCalories: number) {
  const weightData = entries
    .filter((entry) => entry.entryType === 'weight')
    .map((e) => ({
      x: e.timestamp,
      y: e.number,
    }));

  const weightSeries = computeActualWeightSeries(
    entries,
    weightData,
    passiveCalories
  );

  if (weightSeries.length === 0) return 0;

  return round(weightSeries[weightSeries.length - 1].y, 1);
}