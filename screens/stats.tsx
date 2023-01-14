import CaloriesChart from '../components/caloriesChart';
import { View } from 'react-native';
import WeightChart from '../components/weightChart';

export default function StatsScreen() {
  return (
    <View>
      <WeightChart />
      <CaloriesChart />
    </View>
  );
}
