import dayjs from 'dayjs';
import upperFirst from 'lodash/upperFirst';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../ThemeProvider';
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
  const theme = useTheme();
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
        style={[styles.container, { backgroundColor: theme.background }]}
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
            style={[styles.optionTextInput, { borderColor: theme.inputBorder }]}
            autoFocus
            keyboardType='numeric'
            value={number}
            placeholder={entryTypeUnit(entryType)}
            textAlign='center'
            onChangeText={setNumber}
            selectionColor={theme.inputSelection}
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
  },
  optionsSection: {
    flex: 1,
    maxHeight: 133,
    flexDirection: 'row',
    padding: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  optionTextInput: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 2,
    borderRadius: 16,
    margin: 10,
  },
});
