import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import {
  activeCaloriesAtTimestamp,
  caloriesAtTimestamp,
  foodCaloriesAtTimestamp,
  getFirstDay,
  getLastDay,
  passiveCaloriesAtTimestamp,
} from '../pure/entries';

import { View } from 'react-native';
import dayjs from 'dayjs';
import { entryList } from '../types';
import { getEntries } from '../store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function CaloriesChart() {
  const entries = useSelector(getEntries);

  const total = useMemo(
    () => calorieData(entries, caloriesAtTimestamp),
    [entries]
  );
  const food = useMemo(
    () => calorieData(entries, foodCaloriesAtTimestamp),
    [entries]
  );
  const active = useMemo(
    () => calorieData(entries, activeCaloriesAtTimestamp),
    [entries]
  );
  const passive = useMemo(
    () => calorieData(entries, passiveCaloriesAtTimestamp),
    [entries]
  );
  const lines = [total, food, active, passive];

  return (
    <View>
      <VictoryChart theme={VictoryTheme.material}>
        {lines.map((line, index) => (
          <VictoryLine
            key={index}
            style={{
              data: { stroke: '#c43a31' },
              parent: { border: '1px solid #ccc' },
            }}
            data={line}
          />
        ))}
      </VictoryChart>
    </View>
  );
}

function calorieData(
  entries: entryList,
  caloriesAtTimestampFunction: (
    entries: entryList,
    timestamp: dayjs.Dayjs
  ) => number
) {
  if (entries.length === 0) return [];

  const firstDay = getFirstDay(entries);
  const lastDay = getLastDay(entries);
  const days = [firstDay];

  while (days[days.length - 1] <= lastDay)
    days.push(days[days.length - 1].add(1, 'hour'));

  return days.map((day) => ({
    x: day.toDate(),
    y: caloriesAtTimestampFunction(entries, day),
  }));
}
