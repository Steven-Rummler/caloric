import { Text, View } from 'react-native';
import {
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import { caloriesAtTimestamp, getFirstDay, getLastDay } from '../pure/entries';
import { getEntries, getPassiveCalories } from '../store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function WeightChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const weightEntries = useMemo(
    () => entries.filter((e) => e.entryType === 'weight'),
    [entries]
  );

  const weightData = useMemo(
    () =>
      weightEntries.map((e) => ({
        x: dayjs(e.timestamp).toDate(),
        y: e.number,
      })),
    [weightEntries]
  );

  const actualWeight = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const days = [firstDay];

    while (days[days.length - 1] <= lastDay)
      days.push(days[days.length - 1].add(1, 'hour'));

    const caloriesSeries = days.map((day) => ({
      x: day.toDate(),
      y: caloriesAtTimestamp(entries, day, passiveCalories),
    }));

    const averageWeight =
      weightData.reduce((total, next) => total + next.y, 0) / weightData.length;
    const averageCalories =
      caloriesSeries.reduce((total, next) => total + next.y, 0) /
      caloriesSeries.length;
    const gap = averageWeight - averageCalories / 3500;

    caloriesSeries.forEach((point) => {
      point.y = point.y / 3500 + gap;
    });

    return caloriesSeries;
  }, [entries, weightData]);

  return (
    <View style={{ margin: 10 }}>
      {weightEntries.length === 0 ? (
        <Text>No Data</Text>
      ) : (
        <VictoryChart theme={VictoryTheme.material}>
          <VictoryLine
            style={{
              data: { stroke: 'red' },
              parent: { border: '1px solid #ccc' },
            }}
            data={weightData}
          />
          <VictoryLine
            style={{
              data: { stroke: 'blue' },
              parent: { border: '1px solid #ccc' },
            }}
            data={actualWeight}
          />
          <VictoryLegend
            x={110}
            orientation="horizontal"
            gutter={20}
            data={[
              { name: 'Recorded', symbol: { fill: 'red' } },
              { name: 'Calculated', symbol: { fill: 'blue' } },
            ]}
          />
        </VictoryChart>
      )}
    </View>
  );
}
