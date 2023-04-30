import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { addEntry, getSettings } from '../store';
import dayjs, { Dayjs } from 'dayjs';
import { displayDate, entryTypeUnit } from '../pure/entryTypes';
import { entry, entryType } from '../types';
import { useDispatch, useSelector } from 'react-redux';

import ActionButton from '../components/ActionButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OptionButton } from '../components/OptionButton';
import { Props } from '../navigationTypes';
import _ from 'lodash';
import styled from 'styled-components/native';
import { useState } from 'react';

export default function LogEntryScreen({ navigation }: Props) {
  const settings = useSelector(getSettings);
  const { trackActiveCalories } = settings;

  const dispatch = useDispatch();
  const [entryType, setEntryType] = useState<entryType>('food');
  const [timestamp, setTimestamp] = useState<Dayjs>(dayjs());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [number, setNumber] = useState<string>();
  // const [label, setLabel] = useState<string>();

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
    newTimestamp: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowTimePicker(false);
    setTimestamp(dayjs(newTimestamp));
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const submit = () => {
    if (number === undefined) return;
    const newEntry: entry = {
      entryType,
      timestamp: timestamp.toJSON(),
      number: parseFloat(number),
      // ...(entryType === 'food' && label !== undefined && { label }),
    };
    navigation.pop();
    dispatch(addEntry(newEntry));
  };

  return (
    <Page>
      <OptionsSection>
        <OptionButton onPress={() => setEntryType('food')}>
          <Text style={entryType === 'food' ? {} : { color: 'lightgrey' }}>
            Food
          </Text>
        </OptionButton>
        {trackActiveCalories && (
          <OptionButton onPress={() => setEntryType('active')}>
            <Text style={entryType === 'active' ? {} : { color: 'lightgrey' }}>
              Active
            </Text>
          </OptionButton>
        )}
        <OptionButton onPress={() => setEntryType('weight')}>
          <Text style={entryType === 'weight' ? {} : { color: 'lightgrey' }}>
            Weight
          </Text>
        </OptionButton>
      </OptionsSection>
      <OptionsSection>
        <OptionButton onPress={showDatepicker}>
          <Text style={styles.toggleButtonText}>
            {displayDate(timestamp, entryType).replace(/,\s/g, '\n')}
          </Text>
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
      <View style={{ padding: 20, flexGrow: 1 }}>
        <ActionButton
          disabled={[undefined, '', '0'].includes(number)}
          onPress={submit}
        >
          <Text
            style={{
              textAlign: 'center',
              color: [undefined, '', '0'].includes(number)
                ? 'lightgrey'
                : 'black',
            }}
          >
            {`Log ${_.upperFirst(entryType)}`}
          </Text>
        </ActionButton>
      </View>
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
    </Page>
  );
}

const Page = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: white;
  padding-top: 90px;
`;
const OptionsSection = styled.View`
  flex: 1 1 0;
  max-height: 133px;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
`;
const OptionTextInput = styled.TextInput`
  flex: 1;
  text-align: center;
  border: 1px solid lightgrey;
  margin: 10px;
`;

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
