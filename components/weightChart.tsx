import { Text, View } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';

import dayjs from 'dayjs';
import { getEntries } from '../store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function WeightChart() {
  const entries = useSelector(getEntries);
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

  return (
    <View>
      {weightEntries.length === 0 ? (
        <Text>No Data</Text>
      ) : (
        <VictoryChart theme={VictoryTheme.material}>
          <VictoryLine
            style={{
              data: { stroke: '#c43a31' },
              parent: { border: '1px solid #ccc' },
            }}
            data={weightData}
          />
        </VictoryChart>
      )}
    </View>
  );
}
