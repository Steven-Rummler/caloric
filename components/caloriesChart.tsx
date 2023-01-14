import { Text, View } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import {
  getCaloriesAtTimestamp,
  getFirstDay,
  getLastDay,
} from '../pure/entries';

import { getEntries } from '../store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function CaloriesChart() {
  const entries = useSelector(getEntries);

  const caloriesData = useMemo(() => {
    if (entries.length === 0) return [];

    const firstDay = getFirstDay(entries);
    const lastDay = getLastDay(entries);
    const days = [firstDay];

    while (days[days.length - 1] <= lastDay)
      days.push(days[days.length - 1].add(1, 'hour'));

    return days.map((day) => ({
      x: day.toDate(),
      y: getCaloriesAtTimestamp(entries, day),
    }));
  }, [entries]);

  return (
    <View>
      {caloriesData.length === 0 ? (
        <Text>No Data</Text>
      ) : (
        <VictoryChart theme={VictoryTheme.material}>
          <VictoryLine
            style={{
              data: { stroke: '#c43a31' },
              parent: { border: '1px solid #ccc' },
            }}
            data={caloriesData}
          />
        </VictoryChart>
      )}
    </View>
  );
}
