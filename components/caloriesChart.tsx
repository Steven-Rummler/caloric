import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import {
  activeCaloriesAtTimestamp,
  caloriesAtTimestamp,
  foodCaloriesAtTimestamp,
  getFirstDay,
  getLastDay,
} from '../pure/entries';
import { getEntries, getPassiveCalories } from '../store';

import { View } from 'react-native';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function CaloriesChart() {
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
      y: passiveCalories * (day.valueOf() - firstDay.valueOf()),
    }));
  }, [entries]);
  const lines = [total, food, active, passive];

  return (
    <View>
      <VictoryChart theme={VictoryTheme.material}>
        {lines.map((line, index) => (
          <VictoryLine
            key={index}
            style={{
              data: { stroke: ['purple', 'red', 'green', 'blue'][index] },
              parent: { border: '1px solid #ccc' },
            }}
            data={line}
          />
        ))}
      </VictoryChart>
    </View>
  );
}
