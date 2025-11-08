import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { CartesianChart, Line } from 'victory-native';
import { Skia } from '@shopify/react-native-skia';
import { useAssets } from 'expo-asset';
import {
  generateRunningCalorieSeries,
  generateRunningTotalCalorieSeries,
  passiveCaloriesAtTimestampFromEntries,
} from '../pure/generateSeries';
import { getFirstDay } from '../pure/entries';
import { createRunningCaloriesChartData } from '../pure/chartData';
import { getDateFormat, getEntries, getPassiveCalories } from '../store';

type SkiaFont = ReturnType<typeof Skia.Font>;

export default function RunningCaloriesChart({ dateRange }: { dateRange: number | null }) {
  const entries = useSelector(getEntries);
  const passiveCalories = useSelector(getPassiveCalories);
  const dateFormat = useSelector(getDateFormat);
  
  const filteredEntries = dateRange !== null ? entries.filter(e => dayjs(e.timestamp).isAfter(dayjs().subtract(dateRange, 'day'))) : entries;
  
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

  const netSeries = useMemo(() => {
    const result = generateRunningTotalCalorieSeries(filteredEntries, passiveCalories);
    return result;
  }, [filteredEntries, passiveCalories]);

  const foodSeries = useMemo(() => {
    const result = generateRunningCalorieSeries(filteredEntries, 'food');
    return result;
  }, [filteredEntries]);

  const passiveSeries = useMemo(() => {
    
    // Calculate start day once instead of for each timestamp
    const firstDayStart = getFirstDay(filteredEntries).startOf('day').toJSON();
    
    const result = netSeries.map(({ x }) => ({
      x,
      y: passiveCaloriesAtTimestampFromEntries({
        entries: filteredEntries,
        timestamp: x,
        dailyPassiveCalories: passiveCalories,
        startDay: firstDayStart
      }),
    }));
    return result;
  }, [filteredEntries, passiveCalories, netSeries]);

  const chartData = useMemo(() => {
    const result = createRunningCaloriesChartData({
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
            formatYLabel: (value) => {
              if (value == null) return '';
              const absValue = Math.abs(value);
              const sign = value < 0 ? '-' : '';
              
              if (absValue >= 1000000) {
                // Millions: show 1-3 digits (e.g., 2M, 2.5M, 25M)
                const millions = absValue / 1000000;
                if (millions >= 100) return `${sign}${Math.round(millions)}M`;
                if (millions >= 10) return `${sign}${millions.toFixed(0)}M`;
                return `${sign}${millions.toFixed(1)}M`;
              } else if (absValue >= 1000) {
                // Thousands: show 1-3 digits (e.g., 2k, 2.5k, 25k)
                const thousands = absValue / 1000;
                if (thousands >= 100) return `${sign}${Math.round(thousands)}k`;
                if (thousands >= 10) return `${sign}${thousands.toFixed(0)}k`;
                return `${sign}${thousands.toFixed(1)}k`;
              }
              return `${sign}${absValue.toFixed(0)}`;
            },
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
