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
import { getDateFormat, getEntries, getPassiveCalories } from '../store';

export default function RunningCaloriesChart() {
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

  const netSeries = useMemo(() => {
    return generateRunningTotalCalorieSeries(entries, passiveCalories);
  }, [entries, passiveCalories]);

  const foodSeries = useMemo(() => {
    return generateRunningCalorieSeries(entries, 'food');
  }, [entries]);

  const passiveSeries = useMemo(() => {
    return netSeries.map(({ x }) => ({
      x,
      y: passiveCaloriesAtTimestampFromEntries(entries, x, passiveCalories),
    }));
  }, [entries, passiveCalories, netSeries]);

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
  if (!font) return null;

  return (
    <View style={{ margin: 10 }}>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['net', 'food', 'burned']}
          frame={{ lineWidth: 0 }}
          axisOptions={{
            font,
            tickCount: 5,
            labelOffset: { x: 0, y: 8 },
            lineWidth: { grid: { x: 0, y: 1 }, frame: 0 },
            formatXLabel: (value) => dayjs(value).format(dateFormat),
            formatYLabel: (value) => {
              if (!value) return '';
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
              {points.net && <Line points={points.net} color="green" strokeWidth={2} />}
              {points.food && <Line points={points.food} color="purple" strokeWidth={2} />}
              {points.burned && <Line points={points.burned} color="blue" strokeWidth={2} />}
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
