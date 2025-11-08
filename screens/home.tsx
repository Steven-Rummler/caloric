import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import dayjs from 'dayjs';
import round from 'lodash/round';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Props } from '../navigationTypes';
import { getEntries, getPassiveCalories } from '../store';
import { entry } from '../types';
import { getLastDay } from '../pure/entries';
import { computeActualWeightSeries } from '../components/weightChart';
import { ActionButton } from '../components/ActionButton';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import Icon from '../assets/thin-margin-icon.png';

export default function HomeScreen({ navigation }: Props) {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const logEntry = () => navigation.navigate('LogEntry');
  const history = () => navigation.navigate('History');
  const stats = () => navigation.navigate('Stats');
  const settings = () => navigation.navigate('Settings');

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
      <View style={styles.titleSection}>
        <Image source={Icon as string} style={{ width: 96, height: 96 }} />
      </View>
      <View style={styles.infoSection}>
        <View style={styles.infoColumn}>
          <InfoCard label='Calories Today' value={`${recentFoodCalories}`} />
          <InfoCard
            label='Average Calories Burned'
            value={`${Math.round(-1 * passiveCalories)}`}
          />
        </View>
        <View style={styles.infoColumn}>
          <InfoCard label='Current Weight' value={`${currentWeight.toFixed(1)}`} />
          <InfoCard
            label={`Weight ${totalWeightChange > 0 ? 'Gained' : 'Lost'}`}
            value={`${Math.abs(totalWeightChange).toFixed(1)}`}
          />
        </View>
      </View>
      <View style={styles.actionSection}>
        <ActionButton onPress={logEntry}>
          <Text>Log</Text>
        </ActionButton>
      </View>
      <View style={styles.optionsSection}>
        <OptionButton onPress={history}>
          <Text>History</Text>
        </OptionButton>
        <OptionButton onPress={stats}>
          <Text>Stats</Text>
        </OptionButton>
        <OptionButton onPress={settings}>
          <Text>Settings</Text>
        </OptionButton>
      </View>
    </Page>
  );
}

function InfoCard(props: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.infoLabel}>{props.label}</Text>
      <Text style={styles.infoValue}>{props.value}</Text>
    </View>
  );
}

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

  const firstWeight = weightSeries[0];
  const lastWeight = weightSeries[weightSeries.length - 1];
  
  if (!firstWeight || !lastWeight) return 0;

  return round(lastWeight.y - firstWeight.y, 1);
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

  const lastWeight = weightSeries[weightSeries.length - 1];
  
  if (!lastWeight) return 0;

  return round(lastWeight.y, 1);
}

const styles = StyleSheet.create({
  titleSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    flex: 1.5,
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  infoLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 18,
    textAlign: 'center',
  },
  actionSection: {
    flex: 5,
    padding: 20,
    paddingBottom: 10,
  },
  optionsSection: {
    flex: 1.667,
    flexDirection: 'row',
    padding: 0,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});