import * as Sentry from 'sentry-expo';

import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { persistor, store } from './store';
import { setCustomText, setCustomTextInput } from 'react-native-global-props';

import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

Sentry.init({
  dsn: 'https://7defc0a9e6a14cf98c568b8b9b8b451e@o4505059880468480.ingest.sentry.io/4505059883876352',
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

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
          <SafeAreaView style={styles.AndroidSafeArea}>
            <Navigator />
          </SafeAreaView>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
