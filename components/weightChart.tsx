import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory-native';
import { getEntries, getPassiveCalories } from '../store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { generateRunningTotalCalorieSeries } from '../pure/generateSeries';
import { entry } from '../types';

export default function WeightChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);

  if (
    entries.length < 2 ||
    entries.filter((entry) => entry.entryType === 'weight').length < 2
  )
    return <></>;

  const weightEntries = useMemo(
    () => entries.filter((e) => e.entryType === 'weight'),
    [entries]
  );

  const weightData = useMemo(
    () =>
      weightEntries.map((e) => ({
        x: e.timestamp,
        y: e.number,
      })),
    [weightEntries]
  );

  const actualWeight = useMemo(
    () => computeActualWeightSeries(entries, weightData, passiveCalories),
    [entries, weightData]
  );

  const weightDataDates = weightData.map(point => ({ x: new Date(point.x), y: point.y }));
  const actualWeightDates = actualWeight.map(point => ({ x: new Date(point.x), y: point.y }));

  return (
    <View style={{ margin: 10 }}>
      <VictoryChart theme={VictoryTheme.material}>
        {weightDataDates.length > 1 && (
          <VictoryScatter
            style={{ data: { fill: 'red' } }}
            size={2}
            data={weightDataDates}
          />
        )}
        {actualWeightDates.length > 1 && (
          <VictoryLine
            style={{
              data: { stroke: 'blue' },
              parent: { border: '1px solid #ccc' },
            }}
            data={actualWeightDates}
          />
        )}
        <VictoryLegend
          x={110}
          orientation="horizontal"
          gutter={20}
          data={[
            { name: 'Measured', symbol: { fill: 'red' } },
            { name: 'Estimated', symbol: { fill: 'blue' } },
          ]}
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

export function computeActualWeightSeries(
  entries: entry[],
  weightData: { x: string; y: number }[],
  passiveCalories: number
) {
  if (entries.length === 0) return [];

  const caloriesSeries = generateRunningTotalCalorieSeries(
    entries,
    passiveCalories
  );

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
}
