import { getEntries, getPassiveCalories } from '../store';

import ActionButton from '../components/ActionButton';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Props } from '../navigationTypes';
import { Text } from 'react-native';
import dayjs from 'dayjs';
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

  const recentFoodCalories = useMemo(() => {
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
  }, [entries]);
  const averageFoodCalories = useMemo(() => {
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
  }, [entries]);

  return (
    <Page>
      <TitleSection>
        <Title>Caloric</Title>
      </TitleSection>
      <InfoSection>
        <Info>Food Calories Today: {recentFoodCalories}</Info>
      </InfoSection>
      <InfoSection>
        <Info>Average Food Calories: {averageFoodCalories}</Info>
      </InfoSection>
      <InfoSection>
        <Info>
          Equilibrium Food Calories: {Math.round(-1 * passiveCalories)}
        </Info>
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
const Title = styled.Text`
  font-size: 67.77px;
`;
const InfoSection = styled.View`
  flex: 0.667 1 0;
  align-items: center;
  justify-content: center;
`;
const Info = styled.Text``;
const ActionSection = styled.View`
  flex: 5 1 0;
  padding: 20px 20px 10px 20px;
`;
const OptionsSection = styled.View`
  flex: 1.667 1 0;
  flex-direction: row;
  padding: 0px 10px 20px 10px;
`;
