import { Text, View } from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
} from '../pure/generateSeries';
import { getEntries, getPassiveCalories } from '../store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function DailyCaloriesChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  const foodSeries = useMemo(() => {
    return generateDailyCalorieSeries(entries, 'food');
  }, [entries]);

  const activeSeries = useMemo(() => {
    return generateDailyCalorieSeries(entries, 'active').map(({ x, y }) => ({
      x,
      y: -1 * y,
    }));
  }, [entries]);

  const totalSeries = useMemo(() => {
    return generateDailyTotalCalorieSeries(entries, passiveCalories);
  }, [entries]);

  const passiveSeries = useMemo(() => {
    return totalSeries.map(({ x }) => ({ x, y: passiveCalories }));
  }, [totalSeries]);

  const lines = [
    { name: 'Food', data: foodSeries, color: 'purple' },
    { name: 'Active', data: activeSeries, color: 'red' },
    { name: 'Total', data: totalSeries, color: 'green' },
    { name: 'Passive', data: passiveSeries, color: 'blue' },
  ];

  if (lines.some((line) => !Array.isArray(line.data)))
    return <Text>Loading</Text>;

  return (
    <View style={{ margin: 10 }}>
      <VictoryChart theme={VictoryTheme.material}>
        {lines.map((line, index) => (
          <VictoryLine
            key={index}
            style={{
              data: { stroke: line.color },
              parent: { border: '1px solid #ccc' },
            }}
            data={line.data.map(({ x, y }) => ({ x: dayjs(x).valueOf(), y }))}
          />
        ))}
        <VictoryLegend
          x={70}
          orientation="horizontal"
          gutter={20}
          data={lines.map((line) => ({
            name: line.name,
            symbol: { fill: line.color },
          }))}
        />
        <VictoryAxis
          style={{ grid: { stroke: 'none' } }}
          tickFormat={(t: dayjs.Dayjs) => dayjs(t).format('MMM DD')}
        />
        <VictoryAxis style={{ grid: { stroke: 'none' } }} dependentAxis />
      </VictoryChart>
    </View>
  );
}
