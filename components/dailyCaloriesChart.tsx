import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { CartesianChart, Line } from 'victory-native';
import { Skia } from '@shopify/react-native-skia';
import { useAssets } from 'expo-asset';
import {
  generateDailyCalorieSeries,
  generateDailyTotalCalorieSeries,
} from '../pure/generateSeries';
import { createDailyCaloriesChartData } from '../pure/chartData';
import { getDateFormat, getEntries, getPassiveCalories } from '../store';

type SkiaFont = ReturnType<typeof Skia.Font>;

export default function DailyCaloriesChart() {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);
  const dateFormat = useSelector(getDateFormat);
  
  const [assets] = useAssets([require('../assets/fonts/Roboto-Regular.ttf')]);
  const [font, setFont] = useState<SkiaFont | null>(null);

  useEffect(() => {
    if (!assets || !assets[0]) return;
    
    const loadFont = async () => {
      try {
        const asset = assets[0];
        if (!asset) return;
        
        let fontUri: string;
        if (asset.localUri != null)
          fontUri = asset.localUri;
        else if (asset.uri != null)
          fontUri = asset.uri;
        else
          return;
        
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

  const netSeries = useMemo(() => {
    const result = generateDailyTotalCalorieSeries(entries, passiveCalories);
    return result;
  }, [entries, passiveCalories]);

  const foodSeries = useMemo(() => {
    const result = generateDailyCalorieSeries(entries, 'food');
    return result;
  }, [entries]);

  const passiveSeries = useMemo(() => {
    const result = netSeries.map(({ x }) => ({ x, y: passiveCalories }));
    return result;
  }, [netSeries, passiveCalories]);

  const chartData = useMemo(() => {
    const result = createDailyCaloriesChartData({
      netSeries,
      foodSeries,
      passiveSeries
    });

    return result;
  }, [netSeries, foodSeries, passiveSeries]);

  if (chartData.length < 2) return <Text>Not enough data</Text>;
  if (!font) return null;

  return (
    <View style={{ margin: 10 }}>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={chartData}
          xKey='x'
          yKeys={['net', 'food', 'burned']}
          frame={{ lineWidth: 0 }}
          axisOptions={{
            font,
            tickCount: 5,
            labelOffset: { x: 0, y: 8 },
            lineWidth: { grid: { x: 0, y: 1 }, frame: 0 },
            formatXLabel: (value) => dayjs(value).format(dateFormat),
            formatYLabel: (value) => value != null ? value.toLocaleString() : '',
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Line points={points.net} color='green' strokeWidth={2} />
              <Line points={points.food} color='purple' strokeWidth={2} />
              <Line points={points.burned} color='blue' strokeWidth={2} />
            </>
          )}
        </CartesianChart>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: 'green' }]} />
          <Text style={styles.legendText}>Net</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: 'purple' }]} />
          <Text style={styles.legendText}>Food</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: 'blue' }]} />
          <Text style={styles.legendText}>Burned</Text>
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
  legendLine: {
    width: 20,
    height: 2,
  },
  legendText: {
    fontSize: 12,
  },
});
