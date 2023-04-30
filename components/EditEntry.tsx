import { Alert, Dimensions, Text, View } from 'react-native';
import { addEntry, removeEntry } from '../store';

import { DatePicker } from './DatePicker';
import { OptionButton } from './OptionButton';
import { Trash2 } from 'react-native-feather';
import _ from 'lodash';
import { entry } from '../types';
import { entryTypeUnit } from '../pure/entryTypes';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

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
    <ModalArea style={{ height: Dimensions.get('window').height * 0.55 }}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 0.5,
        }}
      >
        <Text style={{ fontSize: 25.89 }}>
          Edit {_.startCase(entryType)} Entry
        </Text>
      </View>
      <OptionsSection>
        <DatePicker {...{ timestamp, setTimestamp }} />
        <OptionTextInput
          autoFocus
          keyboardType="numeric"
          value={number}
          placeholder={entryTypeUnit(entryType)}
          textAlign="center"
          onChangeText={setNumber}
          multiline={true}
          numberOfLines={1}
        />
      </OptionsSection>
      <OptionsSection>
        <OptionButton onPress={() => setVisible(false)}>
          <Text>Cancel</Text>
        </OptionButton>
        <OptionButton onPress={onSave}>
          <Text>Save Changes</Text>
        </OptionButton>
      </OptionsSection>
      <OptionButton
        onPress={() => onDelete(selectedEntry)}
        style={{ borderColor: '#ab0000', flexGrow: 0.5 }}
      >
        <Trash2 color="#ab0000" />
        <Text style={{ color: '#ab0000' }}>Delete Entry</Text>
      </OptionButton>
    </ModalArea>
  );
}

const ModalArea = styled.View`
  width: 90%;
  margin: 16% auto 5% auto;
  padding: 10px 10px 20px 10px;
  background-color: white;
  border: 1px solid lightgrey;
`;

const OptionsSection = styled.View`
  flex: 1 1 0;
  flex-direction: row;
`;
const OptionTextInput = styled.TextInput`
  flex: 1;
  text-align: center;
  border: 1px solid lightgrey;
  margin: 10px;
`;
