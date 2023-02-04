import {
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import {
  activeCaloriesAtTimestamp,
  caloriesAtTimestamp,
  dayDiff,
  foodCaloriesAtTimestamp,
  getFirstDay,
  getLastDay,
} from '../pure/entries';
import { getEntries, getPassiveCalories } from '../store';

import { View } from 'react-native';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function RunningCaloriesChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const total = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const days = [firstDay];

    while (days[days.length - 1] <= lastDay)
      days.push(days[days.length - 1].add(1, 'hour'));

    return days.map((day) => ({
      x: day.toDate(),
      y: caloriesAtTimestamp(entries, day, passiveCalories),
    }));
  }, [entries]);
  const food = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const days = [firstDay];

    while (days[days.length - 1] <= lastDay)
      days.push(days[days.length - 1].add(1, 'hour'));

    return days.map((day) => ({
      x: day.toDate(),
      y: foodCaloriesAtTimestamp(entries, day),
    }));
  }, [entries]);
  const active = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const days = [firstDay];

    while (days[days.length - 1] <= lastDay)
      days.push(days[days.length - 1].add(1, 'hour'));

    return days.map((day) => ({
      x: day.toDate(),
      y: activeCaloriesAtTimestamp(entries, day),
    }));
  }, [entries]);
  const passive = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const days = [firstDay];

    while (days[days.length - 1] <= lastDay)
      days.push(days[days.length - 1].add(1, 'hour'));

    return days.map((day) => ({
      x: day.toDate(),
      y: passiveCalories * dayDiff(firstDay, day),
    }));
  }, [entries]);
  const lines = [total, food, active, passive];
  const titles = ['Total', 'Food', 'Active', 'Passive'];
  const colors = ['purple', 'red', 'green', 'blue'];

  return (
    <View style={{ margin: 10 }}>
      <VictoryChart theme={VictoryTheme.material}>
        {lines.map((line, index) => (
          <VictoryLine
            key={index}
            style={{
              data: { stroke: colors[index] },
              parent: { border: '1px solid #ccc' },
            }}
            data={line}
          />
        ))}
        <VictoryLegend
          x={70}
          orientation="horizontal"
          gutter={20}
          data={lines.map((line, index) => ({
            name: titles[index],
            symbol: { fill: colors[index] },
          }))}
        />
      </VictoryChart>
    </View>
  );
}
