import { persistor, store } from './store';

import HistoryScreen from './screens/history';
import HomeScreen from './screens/home';
import LogEntryScreen from './screens/logEntry';
import { NavigationContainer } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { RootStackParamList } from './navigationTypes';
import StatsScreen from './screens/stats';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="LogEntry" component={LogEntryScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
