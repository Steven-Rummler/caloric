import { persistor, store } from './store';

import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { setCustomText } from 'react-native-global-props';

export default function App() {
  setCustomText({
    style: {
      fontSize: 16,
    },
  });

  return (
    <Provider store={store}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
