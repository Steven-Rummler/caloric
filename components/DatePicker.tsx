import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Modal, View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { displayDate } from '../pure/entryTypes';
import { OptionButton, OptionText } from './OptionButton';

export function DatePicker(props: {
  timestamp: string;
  setTimestamp: (e: string) => void;
}) {
  const { timestamp, setTimestamp } = props;

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(timestamp));

  const [date, setDate] = useState<string>(
    dayjs(timestamp).format('YYYY-MM-DD')
  );

  const onDateChange = useCallback((event: DateTimePickerEvent, newDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && newDate !== undefined) {
        setDate(dayjs(newDate).format('YYYY-MM-DD'));
        setTempDate(newDate);
        setShowTimePicker(true);
      }
    } else if (newDate !== undefined)
      setTempDate(newDate);
  }, []);

  const onDateConfirm = useCallback(() => {
    setShowDatePicker(false);
    setDate(dayjs(tempDate).format('YYYY-MM-DD'));
    setShowTimePicker(true);
  }, [tempDate]);

  const onDateCancel = useCallback(() => {
    setShowDatePicker(false);
    setTempDate(new Date(timestamp));
  }, [timestamp]);

  const onTimeChange = useCallback((event: DateTimePickerEvent, newTime: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && newTime !== undefined)
        setTimestamp(
          dayAndTimeToTimestamp(date, dayjs(newTime).format('HH:mm:ss'))
        );
    } else if (newTime !== undefined)
      setTempDate(newTime);
  }, [date, setTimestamp]);

  const onTimeConfirm = useCallback(() => {
    setShowTimePicker(false);
    setTimestamp(
      dayAndTimeToTimestamp(date, dayjs(tempDate).format('HH:mm:ss'))
    );
  }, [date, tempDate, setTimestamp]);

  const onTimeCancel = useCallback(() => {
    setShowTimePicker(false);
    setTempDate(new Date(timestamp));
  }, [timestamp]);

  return (
    <>
      <OptionButton 
        onPress={() => setShowDatePicker(true)}
        style={{ 
          borderWidth: 2, 
          borderColor: '#b9e2f5', 
          backgroundColor: 'white',
          justifyContent: 'center',
        }}
      >
        <OptionText style={{ height: 'auto' }}>
          {displayDate(dayjs(timestamp), 'food').replace(/,\s/g, '\n')}
        </OptionText>
      </OptionButton>
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType='slide'>
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode='date'
                display='spinner'
                onChange={onDateChange}
              />
              <View style={styles.buttonRow}>
                <Pressable style={styles.button} onPress={onDateCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.confirmButton]} onPress={onDateConfirm}>
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode='date'
          onChange={onDateChange}
        />
      )}
      {showTimePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType='slide'>
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode='time'
                display='spinner'
                onChange={onTimeChange}
              />
              <View style={styles.buttonRow}>
                <Pressable style={styles.button} onPress={onTimeCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.confirmButton]} onPress={onTimeConfirm}>
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode='time'
          onChange={onTimeChange}
        />
      )}
    </>
  );
}

function dayAndTimeToTimestamp(day: string, time: string) {
  return `${day}T${time}${dayjs().format('Z')}`;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#edf7fc',
  },
  confirmButton: {
    backgroundColor: '#b9e2f5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButtonText: {
    color: '#000',
  },
});
