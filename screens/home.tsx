import { Text, View } from 'react-native';

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
    <View style={{ flex: 1 }}>
      <TitleSection>
        <Title>Caloric</Title>
      </TitleSection>
      <Info>
        <Text>Total Active Calories: {totalActiveCalories}</Text>
      </Info>
      <Info>
        <Text>Average Food Calories: {averageFoodCalories}</Text>
      </Info>
      <Info>
        <Text>Last Weight: {lastWeight}</Text>
      </Info>
      <ActionButton onPress={logEntry}>
        <Text adjustsFontSizeToFit>Log</Text>
      </ActionButton>
      <OptionsSection>
        <OptionButton onPress={history}>
          <Text adjustsFontSizeToFit>History</Text>
        </OptionButton>
        <OptionButton onPress={stats}>
          <Text adjustsFontSizeToFit>Stats</Text>
        </OptionButton>
      </OptionsSection>
    </View>
  );
}
const TitleSection = styled.View`
  flex: 2 1 0;
  align-items: center;
  justify-content: center;
  border: 1px solid red;
`;
const Title = styled.Text`
  font-size: 50px;
`;
const Info = styled.View`
  flex: 0.5 1 0;
  align-items: center;
  justify-content: center;
  border: 1px solid blue;
`;
const ActionButton = styled.Pressable`
  flex: 5 1 0;
  align-items: center;
  justify-content: center;
  border: 1px solid green;
`;
const OptionsSection = styled.View`
  flex: 1.5 1 0;
  flex-direction: row;
  border: 1px solid purple;
`;
const OptionButton = styled.Pressable`
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  border: 1px solid orange;
`;
