import { Props, RootStackParamList } from './navigationTypes';

import HistoryScreen from './screens/history';
import HomeScreen from './screens/home';
import LogEntryScreen from './screens/logEntry';
import { Pressable } from 'react-native';
import { Settings } from 'react-native-feather';
import SettingsScreen from './screens/settings';
import StatsScreen from './screens/stats';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }: Props) => {
        if (route.name === 'Settings') return {};
        return {
          headerShadowVisible: false,
          headerRight: () => (
            <SettingsButton navigation={navigation} route={route} />
          ),
        };
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LogEntry" component={LogEntryScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function SettingsButton({ navigation }: Props) {
  return (
    <Pressable
      onPress={() => {
        navigation.navigate('Settings');
      }}
    >
      <Settings stroke={'black'} />
    </Pressable>
  );
}
