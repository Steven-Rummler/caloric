import dayjs from 'dayjs';
import upperFirst from 'lodash/upperFirst';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ActionButton, DisabledActionButton } from '../components/ActionButton';
import { DatePicker } from '../components/DatePicker';
import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';
import Page from '../components/Page';
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
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.optionsSection}>
          <FoodButton onPress={() => setEntryType('food')}>
            <Text>Food</Text>
          </FoodButton>
          <WeightButton onPress={() => setEntryType('weight')}>
            <Text>Weight</Text>
          </WeightButton>
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
            multiline={true}
            numberOfLines={1}
            selectionColor={'#b9e2f5'}
          />
        </View>
        <View style={{ padding: 20, flexGrow: 1 }}>
          <LogButton
            onPress={submit}
          >
            <Text style={{ textAlign: 'center' }}          >
              {`Log ${upperFirst(entryType)}`}
            </Text>
          </LogButton>
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  optionsSection: {
    flex: 1,
    maxHeight: 133,
    flexDirection: 'row',
    padding: 0,
    paddingHorizontal: 10,
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
