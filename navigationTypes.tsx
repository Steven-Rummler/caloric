import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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
