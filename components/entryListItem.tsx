import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { addEntry, removeEntry } from '../store';
import { displayDate, entryTypeLabel, entryTypeUnit } from '../pure/entryTypes';

import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Edit
} from 'react-native-feather';
import dayjs from 'dayjs';
import { entry } from '../types';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export default function EntryTypePicker({ item }: { item: entry }) {
  const { entryType, label, number, timestamp } = item;
  const dispatch = useDispatch();
  const [editVisible, setEditVisible] = useState(false);
  const [editLabel, setEditLabel] = useState<string | undefined>(label);
  const [editNumber, setEditNumber] = useState<string>(number.toString());
  const [editTimestamp, setEditTimestamp] = useState<dayjs.Dayjs>(
    dayjs(timestamp)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (
    event: unknown,
    newTimestamp: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowDatePicker(false);
    if (entryType === 'active') setEditTimestamp(dayjs(newTimestamp));
    else setShowTimePicker(true);
  };

  const onTimeChange = (
    event: unknown,
    newDate: string | number | dayjs.Dayjs | Date | null | undefined
  ) => {
    setShowTimePicker(false);
    setEditTimestamp(dayjs(newDate));
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // const onDelete = (entry: entry) => {
  //   return Alert.alert(
  //     'Delete Entry?',
  //     'Entry will be gone forever (a long time)',
  //     [
  //       {
  //         text: 'Delete',
  //         onPress: () => {
  //           dispatch(removeEntry(entry));
  //         },
  //       },
  //       {
  //         text: 'Cancel',
  //       },
  //     ]
  //   );
  // };

  return (
    <ItemBox onPress={() => setEditVisible(true)}>
      <View>
        <Text>
          {number} {entryTypeLabel(entryType).replace('\n', ' ')}
        </Text>
        <Text>{displayDate(dayjs(timestamp), entryType)}</Text>
      </View>
      <View>
        <Edit color="black" />
        {/* <Pressable onPress={() => onDelete(item)}>
          <Trash2 color="black" />
        </Pressable> */}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editVisible}
        onRequestClose={() => setEditVisible(!editVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {entryType === 'food' && (
              <TextInput
                style={styles.toggleButton}
                value={editLabel}
                onChangeText={setEditLabel}
              />
            )}
            <TextInput
              autoFocus
              keyboardType="numeric"
              value={editNumber}
              onChangeText={setEditNumber}
            />
            <Text>{entryTypeUnit(entryType)}</Text>
            <Pressable onPress={showDatepicker}>
              <Text>{displayDate(editTimestamp, entryType)}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                style={[styles.button, { backgroundColor: 'lightgrey' }]}
                onPress={() => setEditVisible(!editVisible)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: 'lightblue' }]}
                onPress={() => {
                  dispatch(
                    addEntry({
                      entryType,
                      timestamp: editTimestamp.toJSON(),
                      number: Number.parseInt(editNumber),
                      ...(entryType === 'food' && {
                        label: editLabel,
                      }),
                    })
                  );
                  dispatch(removeEntry(item));
                  setEditVisible(!editVisible);
                }}
              >
                <Text style={styles.textStyle}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {showDatePicker && (
        <DateTimePicker
          value={editTimestamp.toDate()}
          mode="date"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={editTimestamp.toDate()}
          mode="time"
          onChange={onTimeChange}
        />
      )}
    </ItemBox>
  );
}

const ItemBox = styled.Pressable`
  align-items: center;
  justify-content: center;
  border: 1px solid lightgrey;
  margin: 10px;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  margin-vertical: 8px;
  margin-horizontal: 16px;
`;

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  toggleButton: {
    height: Dimensions.get('window').height * 0.15,
    width: Dimensions.get('window').width * 0.3333,
    textAlign: 'center',
  },
});
