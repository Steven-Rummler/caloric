import dayjs from 'dayjs';
import upperFirst from 'lodash/upperFirst';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import { ActionButton, DisabledActionButton } from '../components/ActionButton';
import { DatePicker } from '../components/DatePicker';
import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';
import { Props } from '../navigationTypes';
import { entryTypeUnit } from '../pure/entryTypes';
import { addEntry } from '../store';
import { entry, entryType } from '../types';

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

  const FoodButton = entryType === 'food' ? OptionButton : UnselectedOptionButton;
  const WeightButton = entryType === 'weight' ? OptionButton : UnselectedOptionButton;
  const LogButton = [undefined, '', '0'].includes(number) ? DisabledActionButton : ActionButton;

  return (
    <Page>
      <OptionsSection>
        <FoodButton onPress={() => setEntryType('food')}>
          <Text>Food</Text>
        </FoodButton>
        <WeightButton onPress={() => setEntryType('weight')}>
          <Text>Weight</Text>
        </WeightButton>
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
          selectionColor={'#b9e2f5'}
        />
      </OptionsSection>
      <View style={{ padding: 20, flexGrow: 1 }}>
        <LogButton
          onPress={submit}
        >
          <Text style={{ textAlign: 'center' }}          >
            {`Log ${upperFirst(entryType)}`}
          </Text>
        </LogButton>
      </View>
    </Page>
  );
}

const Page = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: white;
  padding-top: 40px;
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
  border: 2px solid #b9e2f5;
  padding: -10px;
  border-radius: 16px;
  margin: 10px;
`;
