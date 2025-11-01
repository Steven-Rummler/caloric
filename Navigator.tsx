import { RootStackParamList } from './navigationTypes';
import HomeScreen from './screens/home';
import LogEntryScreen from './screens/logEntry';
import HistoryScreen from './screens/history';
import StatsScreen from './screens/stats';
import SettingsScreen from './screens/settings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      {/* <Stack.Screen name="Home" component={() => <Text>Hello World</Text>} /> */}
       <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LogEntry" component={LogEntryScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
