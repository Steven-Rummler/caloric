import { Text, View } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';

import dayjs from 'dayjs';
import { getEntries } from '../store';
import { useSelector } from 'react-redux';

export default function WeightChart() {
  const entries = useSelector(getEntries);
  const weightEntries = entries.filter((e) => e.entryType === 'weight');
  const weightData = weightEntries.map((e) => ({
    x: dayjs(e.date).toDate(),
    y: e.number,
  }));

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
