import { Text, View } from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import {
  generateRunningCalorieSeries,
  generateRunningTotalCalorieSeries,
  passiveCaloriesAtTimestampFromEntries,
} from '../pure/generateSeries';
import { getEntries, getPassiveCalories } from '../store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function DailyCaloriesChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const netSeries = useMemo(() => {
    return generateRunningTotalCalorieSeries(entries, passiveCalories);
  }, [entries]);

  const foodSeries = useMemo(() => {
    return generateRunningCalorieSeries(entries, 'food');
  }, [entries]);

  const passiveSeries = useMemo(() => {
    return netSeries.map(({ x }) => ({
      x,
      y: passiveCaloriesAtTimestampFromEntries(entries, x, passiveCalories),
    }));
  }, [entries, passiveCalories, netSeries]);

  const lines = [];
  if (netSeries.length > 1)
    lines.push({ name: 'Net', data: netSeries, color: 'green' });
  if (foodSeries.length > 1)
    lines.push({ name: 'Food', data: foodSeries, color: 'purple' });
  if (passiveSeries.length > 1)
    lines.push({ name: 'Burned', data: passiveSeries, color: 'blue' });

  if (lines.some((line) => !Array.isArray(line.data)))
    return <Text>Loading</Text>;

  const linesWithData = lines.filter((line) => line.data.length > 0);

  const blank = lines.every((line) => line.data.length === 0);

  return (
    <View style={{ margin: 10 }}>
      <VictoryChart theme={VictoryTheme.material}>
        {linesWithData.map((line, index) => (
          <VictoryLine
            key={index}
            style={{
              data: { stroke: line.color },
              parent: { border: '1px solid #ccc' },
            }}
            data={line.data.map(({ x, y }) => ({ x: x.valueOf(), y }))}
          />
        ))}
        <VictoryLegend
          x={70}
          orientation="horizontal"
          gutter={20}
          data={(blank ? lines : linesWithData).map((line) => ({
            name: line.name,
            symbol: { fill: line.color },
          }))}
        />
        <VictoryAxis
          style={{ grid: { stroke: 'none' } }}
          tickFormat={(t: dayjs.Dayjs) => dayjs(t).format('MMM \'YY')}
          fixLabelOverlap
        />
        <VictoryAxis style={{ grid: { stroke: 'none' } }} dependentAxis />
      </VictoryChart>
    </View>
  );
}
