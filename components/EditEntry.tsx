import startCase from 'lodash/startCase';
import { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import { Trash2 } from 'react-native-feather';
import { useDispatch } from 'react-redux';
import { entryTypeUnit } from '../pure/entryTypes';
import { addEntry, removeEntry } from '../store';
import { entry } from '../types';
import { DatePicker } from './DatePicker';
import { OptionButton, OutlineOptionButton } from './OptionButton';

export default function EditEntry({
  selectedEntry,
  setVisible,
}: {
  selectedEntry: entry;
  setVisible: (visible: boolean) => void;
}) {
  const dispatch = useDispatch();

  const entryType = selectedEntry.entryType;
  const [number, setNumber] = useState<string>(`${selectedEntry.number}`);
  const [timestamp, setTimestamp] = useState<string>(selectedEntry.timestamp);

  const onDelete = (entry: entry) =>
    Alert.alert('Delete Entry?', 'Entry will be gone forever (a long time)', [
      {
        text: 'Delete',
        onPress: () => {
          dispatch(removeEntry(entry));
          setVisible(false);
        },
      },
      { text: 'Cancel' },
    ]);

  const onSave = () => {
    dispatch(
      addEntry({
        entryType,
        timestamp,
        number: Number.parseFloat(number),
      })
    );
    dispatch(removeEntry(selectedEntry));
    setVisible(false);
  };

  return (
    <View style={[styles.modalArea, { height: Dimensions.get('window').height * 0.55 }]}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 0.5,
        }}
      >
        <Text style={{ fontSize: 25.89 }}>
          Edit {startCase(entryType)} Entry
        </Text>
      </View>
      <View style={styles.optionsSection}>
        <DatePicker {...{ timestamp, setTimestamp }} />
        <TextInput
          style={styles.optionTextInput}
          autoFocus
          keyboardType="numeric"
          value={number}
          placeholder={entryTypeUnit(entryType)}
          textAlign="center"
          onChangeText={setNumber}
          selectionColor={'#b9e2f5'}
        />
      </View>
      <View style={styles.optionsSection}>
        <OptionButton onPress={() => setVisible(false)}>
          <Text>Cancel</Text>
        </OptionButton>
        <OptionButton onPress={onSave}>
          <Text>Save Changes</Text>
        </OptionButton>
      </View>
      <OutlineOptionButton
        onPress={() => onDelete(selectedEntry)}
        style={{ borderColor: '#ff4444', flexGrow: 0.5 }}
      >
        <Trash2 color="#ff4444" />
        <Text style={{ color: '#ff4444' }}>Delete Entry</Text>
      </OutlineOptionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  modalArea: {
    width: '90%',
    marginVertical: '16%',
    marginHorizontal: 'auto',
    marginBottom: '5%',
    padding: 10,
    paddingBottom: 20,
    borderWidth: 2,
    borderColor: '#b9e2f5',
    backgroundColor: 'white',
    borderRadius: 16,
  },
  optionsSection: {
    flex: 1,
    flexDirection: 'row',
  },
  optionTextInput: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#b9e2f5',
    borderRadius: 16,
    margin: 10,
  },
});
