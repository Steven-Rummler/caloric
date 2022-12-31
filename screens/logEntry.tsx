import {
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import dayjs, { Dayjs } from 'dayjs';
import { displayDate, entryTypeLabel, entryTypeUnit } from '../pure/entryTypes';
import { entry, entryType } from '../types';

import DateTimePicker from '@react-native-community/datetimepicker';
import EntryTypePicker from '../components/entryTypePicker';
import { Props } from '../navigationTypes';
import { addEntry } from '../store';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export default function LogEntryScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [entryType, setEntryType] = useState<entryType>('food');
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [number, setNumber] = useState<string>();
  const [label, setLabel] = useState<string>();

  const onDateChange = (
    event: unknown,
    newDate: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowDatePicker(false);
    if (entryType === 'active') setDate(dayjs(newDate));
    else setShowTimePicker(true);
  };

  const onTimeChange = (
    event: unknown,
    newDate: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowTimePicker(false);
    setDate(dayjs(newDate));
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const submit = () => {
    if (number === undefined) return;
    const newEntry: entry = {
      entryType,
      date: date.toJSON(),
      number: parseInt(number),
      ...(entryType === 'food' && label !== undefined && { label }),
    };
    navigation.pop();
    navigation.navigate('History');
    dispatch(addEntry(newEntry));
  };

  return (
    <KeyboardAvoidingView>
      <EntryTypePicker entryType={entryType} setEntryType={setEntryType} />
      <View style={styles.toggleButtonSection}>
        <Pressable style={styles.toggleButton} onPress={showDatepicker}>
          <Text style={styles.toggleButtonText}>
            {displayDate(date, entryType).replace(/,\s/g, '\n')}
          </Text>
        </Pressable>
        <TextInput
          autoFocus
          keyboardType="numeric"
          value={number}
          style={styles.toggleButton}
          placeholder={entryTypeUnit(entryType)}
          onChangeText={setNumber}
        />
        {entryType === 'food' ? (
          <TextInput
            style={styles.toggleButton}
            value={label}
            placeholder="Label"
            onChangeText={setLabel}
          />
        ) : entryType === 'active' ? (
          <Text style={styles.toggleButton}>
            Current Active Calories{'\n'}500
          </Text>
        ) : (
          <Text style={styles.toggleButton}>Info for Weight?</Text>
        )}
      </View>
      <View style={styles.actionButtonSection}>
        <Pressable
          disabled={number === undefined}
          onPress={submit}
          style={
            number === undefined
              ? styles.actionButtonDisabled
              : styles.actionButton
          }
        >
          <Text style={{ textAlign: 'center' }}>
            Submit{`\n${entryTypeLabel(entryType)}`}
          </Text>
        </Pressable>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date.toDate()}
          mode="date"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date.toDate()}
          mode="time"
          onChange={onTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  toggleButtonSection: {
    height: Dimensions.get('window').height * 0.15,
    width: Dimensions.get('window').width,
    display: 'flex',
    flexDirection: 'row',
  },
  toggleButton: {
    height: Dimensions.get('window').height * 0.15,
    width: Dimensions.get('window').width * 0.33,
    textAlign: 'center',
  },
  toggleButtonText: {
    height: Dimensions.get('window').height * 0.15,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  actionButtonSection: {
    height: Dimensions.get('window').height * 0.4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius:
      Math.round(
        Dimensions.get('window').width + Dimensions.get('window').height
      ) / 2,
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    borderRadius:
      Math.round(
        Dimensions.get('window').width + Dimensions.get('window').height
      ) / 2,
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    backgroundColor: '#e0e0e0',
    color: '#a0a0a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
