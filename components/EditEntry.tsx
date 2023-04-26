import { Alert, Dimensions, Text, View } from 'react-native';
import { addEntry, removeEntry } from '../store';
import { displayDate, entryTypeUnit } from '../pure/entryTypes';

import DateTimePicker from '@react-native-community/datetimepicker';
import { OptionButton } from './OptionButton';
import { Trash2 } from 'react-native-feather';
import _ from 'lodash';
import dayjs from 'dayjs';
import { entry } from '../types';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export default function EditEntry({
  selectedEntry,
  setVisible,
}: {
  selectedEntry: entry | undefined;
  setVisible: (visible: boolean) => void;
}) {
  const dispatch = useDispatch();

  const entryType = selectedEntry?.entryType ?? 'food';
  const [number, setNumber] = useState<string | undefined>();
  const [timestamp, setTimestamp] = useState<dayjs.Dayjs | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const blank = number === undefined && timestamp === undefined;
  if (selectedEntry !== undefined && blank) {
    setNumber(selectedEntry.number.toString());
    setTimestamp(dayjs(selectedEntry.timestamp));
  }

  if (selectedEntry === undefined) return null;
  if (number === undefined) return null;
  if (timestamp === undefined) return null;

  const onDateChange = (
    event: unknown,
    newTimestamp: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowDatePicker(false);
    if (entryType === 'active') setTimestamp(dayjs(newTimestamp));
    else setShowTimePicker(true);
  };

  const onTimeChange = (
    event: unknown,
    newDate: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowTimePicker(false);
    setTimestamp(dayjs(newDate));
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

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
        timestamp: timestamp.toJSON(),
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
        <OptionButton onPress={showDatepicker}>
          <Text>{displayDate(timestamp, entryType).replace(/,\s/g, '\n')}</Text>
        </OptionButton>
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
      {showDatePicker && (
        <DateTimePicker
          value={timestamp.toDate()}
          mode="date"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={timestamp.toDate()}
          mode="time"
          onChange={onTimeChange}
        />
      )}
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
