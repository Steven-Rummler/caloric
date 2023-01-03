import { Text, View } from 'react-native';

import CaloriesChart from '../components/caloriesChart';
import WeightChart from '../components/weightChart';

export default function StatsScreen() {
  return (
    <View>
      <Text>Stats</Text>
      <WeightChart />
      <CaloriesChart />
    </View>
  );
}
