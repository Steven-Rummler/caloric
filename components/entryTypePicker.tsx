import {
  Dimensions,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { entryTypeLabel, entryTypes } from '../pure/entryTypes';

import { entryType } from '../types';
import { getSettings } from '../store';
import { useSelector } from 'react-redux';

interface props {
  entryType: entryType;
  setEntryType: React.Dispatch<React.SetStateAction<entryType>>;
}

export default function EntryTypePicker({ entryType, setEntryType }: props) {
  const settings = useSelector(getSettings);

  const onEntryTypeChange = (
    event: GestureResponderEvent,
    newType: entryType
  ) => {
    setEntryType(newType);
  };

  const onButtonStyle = {
    ...styles.toggleButton,
    backgroundColor: 'lightgreen',
  };
  const offButtonStyle = {
    ...styles.toggleButton,
    backgroundColor: 'lightgray',
  };

  const availableEntryTypes = settings.trackActiveCalories
    ? entryTypes
    : entryTypes.filter((entryType) => entryType !== 'active');

  return (
    <View style={styles.toggleButtonSection}>
      {availableEntryTypes.map((type) => (
        <Pressable
          key={type}
          style={type === entryType ? onButtonStyle : offButtonStyle}
          onPress={(e) => onEntryTypeChange(e, type)}
        >
          <Text style={styles.toggleButtonText}>{entryTypeLabel(type)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButtonSection: {
    height: Dimensions.get('window').height * 0.15,
    width: Dimensions.get('window').width,
    flexDirection: 'row',
  },
  toggleButton: {
    height: Dimensions.get('window').height * 0.15,
    flex: 1,
    textAlign: 'center',
  },
  toggleButtonText: {
    height: Dimensions.get('window').height * 0.15,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
