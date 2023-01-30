import { persistor, store } from './store';
import { setCustomText, setCustomTextInput } from 'react-native-global-props';

import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  setCustomText({
    style: {
      fontSize: 16,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  setCustomTextInput({
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
