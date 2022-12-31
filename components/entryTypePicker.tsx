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

type props = {
  entryType: entryType;
  setEntryType: React.Dispatch<React.SetStateAction<entryType>>;
};

export default function EntryTypePicker({ entryType, setEntryType }: props) {
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

  return (
    <View style={styles.toggleButtonSection}>
      {entryTypes.map((type) => (
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
    width: Dimensions.get('window').width * 0.3333,
    textAlign: 'center',
  },
  toggleButtonText: {
    height: Dimensions.get('window').height * 0.15,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
