import { Text, View } from 'react-native';

import { OptionButton } from '../components/OptionButton';
import { Props } from '../navigationTypes';
import dayjs from 'dayjs';
import { getEntries } from '../store';
import styled from 'styled-components/native';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function HomeScreen({ navigation }: Props) {
  const entries = useSelector(getEntries);

  const logEntry = () => navigation.navigate('LogEntry');
  const history = () => navigation.navigate('History');
  const stats = () => navigation.navigate('Stats');

  const totalActiveCalories = useMemo(() => {
    const activeEntries = entries.filter(
      (entry) => entry.entryType === 'active'
    );
    if (activeEntries.length === 0) return 0;
    return activeEntries.reduce((total, next) => total + next.number, 0);
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
  const lastWeight = useMemo(() => {
    const weightEntries = entries.filter(
      (entry) => entry.entryType === 'weight'
    );
    if (weightEntries.length === 0) return 0;
    return weightEntries[weightEntries.length - 1].number;
  }, [entries]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <TitleSection>
        <Title>Caloric</Title>
      </TitleSection>
      <InfoSection>
        <Info>Total Active Calories: {totalActiveCalories}</Info>
      </InfoSection>
      <InfoSection>
        <Info>Average Food Calories: {averageFoodCalories}</Info>
      </InfoSection>
      <InfoSection>
        <Info>Last Weight: {lastWeight}</Info>
      </InfoSection>
      <ActionSection>
        <ActionButton onPress={logEntry}>
          <Action>Log</Action>
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
    </View>
  );
}
const TitleSection = styled.View`
  flex: 2 1 0;
  align-items: center;
  justify-content: center;
  //border: 1px solid red;
`;
const Title = styled.Text`
  font-size: 50px;
`;
const InfoSection = styled.View`
  flex: 0.5 1 0;
  align-items: center;
  justify-content: center;
`;
const Info = styled.Text``;
const ActionSection = styled.View`
  flex: 5 1 0;
  padding: 20px 20px 10px 20px;
`;
const ActionButton = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  border: 1px solid lightgrey;
`;
const Action = styled.Text``;
const OptionsSection = styled.View`
  flex: 1.5 1 0;
  flex-direction: row;
  padding: 0px 10px 20px 10px;
`;
