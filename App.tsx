// import * as Sentry from '@sentry/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';
import Navigator from './Navigator';

// Sentry.init({
//   dsn: 'https://7defc0a9e6a14cf98c568b8b9b8b451e@o4505059880468480.ingest.sentry.io/4505059883876352',
//   debug: true,
//   tracesSampleRate: 1.0,
// });

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}> 
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}