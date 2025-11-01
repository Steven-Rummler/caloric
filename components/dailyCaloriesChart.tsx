import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CartesianChart, Line } from 'victory-native';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
} from '../pure/generateSeries';
import { getDateFormat, getEntries, getPassiveCalories } from '../store';

export default function DailyCaloriesChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);
  const dateFormat = useSelector(getDateFormat);

  const netSeries = useMemo(() => {
    return generateDailyTotalCalorieSeries(entries, passiveCalories);
  }, [entries, passiveCalories]);

  const foodSeries = useMemo(() => {
    return generateDailyCalorieSeries(entries, 'food');
  }, [entries]);

  const passiveSeries = useMemo(() => {
    return netSeries.map(({ x }) => ({ x, y: passiveCalories }));
  }, [netSeries, passiveCalories]);

  // Transform data for CartesianChart
  const chartData = useMemo(() => {
    const allTimestamps = new Set([
      ...netSeries.map(d => d.x),
      ...foodSeries.map(d => d.x),
      ...passiveSeries.map(d => d.x)
    ]);
    
    return Array.from(allTimestamps).sort().map(timestamp => {
      const net = netSeries.find(d => d.x === timestamp);
      const food = foodSeries.find(d => d.x === timestamp);
      const passive = passiveSeries.find(d => d.x === timestamp);
      
      return {
        x: dayjs(timestamp).valueOf(),
        net: net?.y,
        food: food?.y,
        burned: passive?.y,
      };
    });
  }, [netSeries, foodSeries, passiveSeries]);

  if (chartData.length < 2) return <Text>Not enough data</Text>;

  return (
    <View style={{ height: 300, margin: 10 }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['net', 'food', 'burned']}
      >
        {({ points }) => (
          <>
            {points.net && <Line points={points.net} color="green" strokeWidth={2} />}
            {points.food && <Line points={points.food} color="purple" strokeWidth={2} />}
            {points.burned && <Line points={points.burned} color="blue" strokeWidth={2} />}
          </>
        )}
      </CartesianChart>
    </View>
  );
}
