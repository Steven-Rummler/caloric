import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { Skia } from '@shopify/react-native-skia';
import { useAssets } from 'expo-asset';
import { useTheme } from '../ThemeProvider';
import { computeActualWeightSeries } from '../pure/generateSeries';
import { createWeightChartData } from '../pure/chartData';
import { getDateFormat, getEntries, getPassiveCalories } from '../store';


type SkiaFont = ReturnType<typeof Skia.Font>;

export default function WeightChart({ dateRange }: { dateRange: number | null }) {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);
  const dateFormat = useSelector(getDateFormat);
  const theme = useTheme();
  
  const [assets] = useAssets([require('../assets/fonts/Roboto-Regular.ttf')]);
  const [font, setFont] = useState<SkiaFont | null>(null);

  useEffect(() => {
    if (!assets || !assets[0]) return;
    
    const loadFont = async () => {
      try {
        const asset = assets[0];
        if (!asset) return;
        
        const fontUri = asset.localUri ?? asset.uri ?? '';
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
    
    void loadFont();
  }, [assets]);

  const weightEntries = useMemo(
    () => entries.filter((e) => e.entryType === 'weight'),
    [entries]
  );

  const weightData = useMemo(
    () => {
      const result = weightEntries.map((e) => ({
        x: e.timestamp,
        y: e.number,
      }));
      return result;
    },
    [weightEntries]
  );

  const actualWeight = useMemo(
    () => {
      const result = computeActualWeightSeries(entries, weightData, passiveCalories);
      return result;
    },
    [entries, weightData, passiveCalories]
  );

  const filteredWeightData = useMemo(
    () => dateRange !== null ? weightData.filter(d => dayjs(d.x).isAfter(dayjs().subtract(dateRange, 'day'))) : weightData,
    [weightData, dateRange]
  );

  const filteredActualWeight = useMemo(
    () => dateRange !== null ? actualWeight.filter(d => dayjs(d.x).isAfter(dayjs().subtract(dateRange, 'day'))) : actualWeight,
    [actualWeight, dateRange]
  );

  const chartData = useMemo(() => {
    const result = createWeightChartData({
      weightData: filteredWeightData,
      actualWeight: filteredActualWeight
    });

    return result;
  }, [filteredWeightData, filteredActualWeight]);

  if (
    entries.length < 2 ||
    entries.filter((entry) => entry.entryType === 'weight').length < 2
  )
    return <></>;

  if (!font) return null;

  return (
    <View style={{ margin: 10 }}>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={chartData}
          xKey='x'
          yKeys={['measured', 'estimated']}
          frame={{ lineWidth: 0 }}
          axisOptions={{
            font,
            tickCount: 5,
            labelOffset: { x: 0, y: 8 },
            lineWidth: { grid: { x: 0, y: 1 }, frame: 0 },
            formatXLabel: (value) => dayjs(value).format(dateFormat),
            formatYLabel: (value) => value != null ? `${value.toFixed(1)}` : '',
            labelColor: theme.text,
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Scatter points={points.measured} color={theme.chart.measured} radius={2} />
              <Line points={points.estimated} color={theme.chart.estimated} strokeWidth={2} />
            </>
          )}
        </CartesianChart>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.chart.measured }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>Measured</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: theme.chart.estimated }]} />
          <Text style={[styles.legendText, { color: theme.text }]}>Estimated</Text>
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


