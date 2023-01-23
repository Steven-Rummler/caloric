import { Pressable, Switch, Text, View } from 'react-native';
import { getSettings, resetSettings, updateSetting } from '../store';
import { useDispatch, useSelector } from 'react-redux';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const settings = useSelector(getSettings);

  const { trackActiveCalories } = settings;
  return (
    <View>
      <Text>Track Active Calories</Text>
      <Switch
        value={trackActiveCalories}
        onChange={() => {
          dispatch(
            updateSetting({ trackActiveCalories: !trackActiveCalories })
          );
        }}
      />
      <Pressable
        onPress={() => {
          dispatch(resetSettings());
        }}
      >
        <Text>Reset Settings</Text>
      </Pressable>
    </View>
  );
}
