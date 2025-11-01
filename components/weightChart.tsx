import dayjs from 'dayjs';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { generateRunningTotalCalorieSeries } from '../pure/generateSeries';
import { getDateFormat, getEntries, getPassiveCalories } from '../store';
import { entry } from '../types';

export default function WeightChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);
  const dateFormat = useSelector(getDateFormat);

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
    [entries, weightData, passiveCalories]
  );

  // Transform data for CartesianChart
  const chartData = useMemo(() => {
    const allTimestamps = new Set([
      ...weightData.map(d => d.x),
      ...actualWeight.map(d => d.x)
    ]);
    
    return Array.from(allTimestamps).sort().map(timestamp => {
      const measured = weightData.find(d => d.x === timestamp);
      const estimated = actualWeight.find(d => d.x === timestamp);
      
      return {
        x: new Date(timestamp).getTime(),
        measured: measured?.y,
        estimated: estimated?.y,
      };
    });
  }, [weightData, actualWeight]);

  if (chartData.length < 2) return <></>;

  return (
    <View style={{ height: 300, margin: 10 }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['measured', 'estimated']}
      >
        {({ points }) => (
          <>
            {points.measured && <Scatter points={points.measured} color="red" radius={3} />}
            {points.estimated && <Line points={points.estimated} color="blue" strokeWidth={2} />}
          </>
        )}
      </CartesianChart>
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
  ).sort((a, b) => a.x.localeCompare(b.x));

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
