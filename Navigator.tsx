import { ArrowLeft, Settings } from 'react-native-feather';
import { Props, RootStackParamList } from './navigationTypes';

import HistoryScreen from './screens/history';
import HomeScreen from './screens/home';
import LogEntryScreen from './screens/logEntry';
import SettingsScreen from './screens/settings';
import StatsScreen from './screens/stats';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigator() {
  return (
    <Stack.Navigator
      screenOptions={(props: Props) => ({
        header: () => <CustomHeader {...props} />,
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LogEntry" component={LogEntryScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function BackButton({ navigation, disabled }: Props & { disabled: boolean }) {
  const action = () => {
    navigation.goBack();
  };

  return (
    <HeaderButton onPress={action} disabled={disabled}>
      <ArrowLeft stroke={disabled ? 'white' : 'black'} width={32} height={32} />
    </HeaderButton>
  );
}

function SettingsButton({
  navigation,
  disabled,
}: Props & { disabled: boolean }) {
  const action = () => {
    navigation.navigate('Settings');
  };

  return (
    <HeaderButton onPress={action} disabled={disabled}>
      <Settings stroke={disabled ? 'white' : 'black'} width={32} height={32} />
    </HeaderButton>
  );
}

const HeaderButton = styled.Pressable``;

function CustomHeader(props: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 18,
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <BackButton {...props} disabled={props.route.name === 'Home'} />
      <SettingsButton {...props} disabled={props.route.name === 'Settings'} />
    </View>
  );
}
