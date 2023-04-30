import { Text, View } from 'react-native';
import { entry, entryType } from '../types';

import ActionButton from '../components/ActionButton';
import { DatePicker } from '../components/DatePicker';
import { OptionButton } from '../components/OptionButton';
import { Props } from '../navigationTypes';
import _ from 'lodash';
import { addEntry } from '../store';
import dayjs from 'dayjs';
import { entryTypeUnit } from '../pure/entryTypes';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export default function LogEntryScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [entryType, setEntryType] = useState<entryType>('food');
  const [timestamp, setTimestamp] = useState<string>(dayjs().toJSON());
  const [number, setNumber] = useState<string>();

  const submit = () => {
    if (number === undefined) return;
    const newEntry: entry = {
      entryType,
      timestamp,
      number: parseFloat(number),
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
        <OptionButton onPress={() => setEntryType('weight')}>
          <Text style={entryType === 'weight' ? {} : { color: 'lightgrey' }}>
            Weight
          </Text>
        </OptionButton>
      </OptionsSection>
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
