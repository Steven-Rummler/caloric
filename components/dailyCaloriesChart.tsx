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

export default function DailyCaloriesChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const total = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const startOfFirstDay = firstDay.startOf('day');
    const days = [startOfFirstDay];

    while (days[days.length - 1] <= lastDay.endOf('day'))
      days.push(days[days.length - 1].add(1, 'day'));

    const series = days.map((day) => ({
      x: day.toDate(),
      y: caloriesAtTimestamp(entries, day, passiveCalories),
    }));

    let previousTotal = 0;
    series.forEach((day) => {
      day.y -= previousTotal;
      previousTotal += day.y;
    });

    return series.slice(1);
  }, [entries]);
  const food = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const startOfFirstDay = firstDay.startOf('day');
    const days = [startOfFirstDay];

    while (days[days.length - 1] <= lastDay.endOf('day'))
      days.push(days[days.length - 1].add(1, 'day'));

    const series = days.map((day) => ({
      x: day.toDate(),
      y: foodCaloriesAtTimestamp(entries, day),
    }));

    let previousTotal = 0;
    series.forEach((day) => {
      day.y -= previousTotal;
      previousTotal += day.y;
    });

    return series.slice(1);
  }, [entries]);
  const active = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const startOfFirstDay = firstDay.startOf('day');
    const days = [startOfFirstDay];

    while (days[days.length - 1] <= lastDay.endOf('day'))
      days.push(days[days.length - 1].add(1, 'day'));

    const series = days.map((day) => ({
      x: day.toDate(),
      y: activeCaloriesAtTimestamp(entries, day),
    }));

    let previousTotal = 0;
    series.forEach((day) => {
      day.y -= previousTotal;
      previousTotal += day.y;
    });

    return series.slice(1);
  }, [entries]);
  const passive = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const startOfFirstDay = firstDay.startOf('day');
    const days = [startOfFirstDay];

    while (days[days.length - 1] <= lastDay.endOf('day'))
      days.push(days[days.length - 1].add(1, 'day'));

    const series = days.map((day) => ({
      x: day.toDate(),
      y: passiveCalories * dayDiff(firstDay, day),
    }));

    let previousTotal = 0;
    series.forEach((day) => {
      day.y -= previousTotal;
      previousTotal += day.y;
    });

    return series.slice(1);
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
