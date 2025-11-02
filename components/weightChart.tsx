import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { Skia } from '@shopify/react-native-skia';
import { useAssets } from 'expo-asset';
import { generateRunningTotalCalorieSeries } from '../pure/generateSeries';
import { getDateFormat, getEntries, getPassiveCalories } from '../store';
import { entry } from '../types';

export default function WeightChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);
  const dateFormat = useSelector(getDateFormat);
  
  const [assets] = useAssets([require('../assets/fonts/Roboto-Regular.ttf')]);
  const [font, setFont] = useState<any>(null);

  useEffect(() => {
    if (!assets || !assets[0]) return;
    
    const loadFont = async () => {
      try {
        const asset = assets[0];
        if (!asset) return;
        
        const fontUri = asset.localUri || asset.uri;
        if (!fontUri) return;
        
        const response = await fetch(fontUri);
        const arrayBuffer = await response.arrayBuffer();
        const fontData = Skia.Data.fromBytes(new Uint8Array(arrayBuffer));
        const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(fontData);
        
        if (typeface) {
          const skiaFont = Skia.Font(typeface, 12);
          setFont(skiaFont);
        }
      } catch (error) {
        console.error('Error loading font:', error);
      }
    };
    
    loadFont();
  }, [assets]);

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

  if (
    entries.length < 2 ||
    entries.filter((entry) => entry.entryType === 'weight').length < 2
  )
    return <></>;

  if (chartData.length < 2) return <></>;
  if (!font) return null;

  return (
    <View style={{ margin: 10 }}>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['measured', 'estimated']}
          frame={{ lineWidth: 0 }}
          axisOptions={{
            font,
            tickCount: 5,
            labelOffset: { x: 0, y: 8 },
            lineWidth: { grid: { x: 0, y: 1 }, frame: 0 },
            formatXLabel: (value) => dayjs(value).format(dateFormat),
            formatYLabel: (value) => value ? `${value.toFixed(1)}` : '',
          }}
        >
          {({ points, chartBounds }) => (
            <>
              {points.measured && <Scatter points={points.measured} color="red" radius={4} />}
              {points.estimated && <Line points={points.estimated} color="blue" strokeWidth={2} />}
            </>
          )}
        </CartesianChart>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Measured</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: 'blue' }]} />
          <Text style={styles.legendText}>Estimated</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLine: {
    width: 20,
    height: 2,
  },
  legendText: {
    fontSize: 12,
  },
});

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
