import { Text, View } from 'react-native';
import { getEntries, getPassiveCalories } from '../store';

import { ActionButton } from '../components/ActionButton';
import Icon from '../assets/thin-margin-icon.png';
import { Image } from 'expo-image';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Props } from '../navigationTypes';
import _ from 'lodash';
import { computeActualWeightSeries } from '../components/weightChart';
import dayjs from 'dayjs';
import { entry } from '../types';
import { getLastDay } from '../pure/entries';
import styled from 'styled-components/native';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

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
  const averageFoodCalories = useMemo(
    () => computeAverageFoodCalories(entries),
    [entries]
  );
  const weeklyWeightChange = _.round(
    (7 * (averageFoodCalories + passiveCalories)) / 3500,
    1
  );
  const monthlyWeightChange = _.round(
    ((365 / 12) * (averageFoodCalories + passiveCalories)) / 3500,
    1
  );
  const totalWeightChange = useMemo(
    () => computeTotalWeightChange(entries, passiveCalories),
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
          <InfoCard label="Average Calories" value={`${averageFoodCalories}`} />
          <InfoCard
            label="Average Burned"
            value={`${Math.round(-1 * passiveCalories)}`}
          />
        </InfoColumn>
        <InfoColumn>
          <InfoCard
            label={`Weight ${totalWeightChange > 0 ? 'Gained' : 'Lost'}`}
            value={`${Math.abs(totalWeightChange)}lbs`}
          />
          <InfoCard
            label={`Weight ${weeklyWeightChange > 0 ? 'Gain' : 'Loss'} per Week`}
            value={`${Math.abs(weeklyWeightChange)}lbs`}
          />
          <InfoCard
            label={`Weight ${monthlyWeightChange > 0 ? 'Gain' : 'Loss'} per Month`}
            value={`${Math.abs(monthlyWeightChange)}lbs`}
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
  font-size: 16px;
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

function computeAverageFoodCalories(entries: entry[]) {
  const foodEntries = entries.filter((entry) => entry.entryType === 'food');
  if (foodEntries.length === 0) return 0;
  const totalFoodCalories = foodEntries.reduce(
    (total, next) => total + next.number,
    0
  );
  const days: string[] = [];
  foodEntries.forEach((foodEntry) => {
    const day = dayjs(foodEntry.timestamp).format('YYYY-MM-DD');
    if (days.includes(day)) return;
    days.push(day);
  });
  return Math.round(totalFoodCalories / days.length);
}

function computeTotalWeightChange(entries: entry[], passiveCalories: number) {
  const weightData = entries
    .filter((entry) => entry.entryType === 'weight')
    .map((e) => ({
      x: dayjs(e.timestamp).toDate(),
      y: e.number,
    }));

  const weightSeries = computeActualWeightSeries(
    entries,
    weightData,
    passiveCalories
  );

  if (weightSeries.length === 0) return 0;

  return _.round(
    weightSeries[weightSeries.length - 1].y - weightSeries[0].y,
    1
  );
}
