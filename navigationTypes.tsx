import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  Home: undefined;
  LogEntry: undefined;
  History: undefined;
  Stats: undefined;
};

export type Props = NativeStackScreenProps<
  RootStackParamList,
  'Home' | 'LogEntry' | 'History' | 'Stats'
>;
