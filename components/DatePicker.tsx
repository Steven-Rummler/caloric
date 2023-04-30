import { OptionButton, OptionText } from './OptionButton';
import { useCallback, useState } from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { displayDate } from '../pure/entryTypes';

export function DatePicker(props: {
  timestamp: string;
  setTimestamp: (e: string) => void;
}) {
  const { timestamp, setTimestamp } = props;

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const [date, setDate] = useState<string>(
    dayjs(timestamp).format('YYYY-MM-DD')
  );

  const onDateChange = useCallback((newDate: Date) => {
    setDate(dayjs(newDate).format('YYYY-MM-DD'));
    setShowDatePicker(false);
    setShowTimePicker(true);
  }, []);

  const onTimeChange = useCallback((newTime: Date) => {
    setShowTimePicker(false);
    setTimestamp(
      dayAndTimeToTimestamp(date, dayjs(newTime).format('HH:mm:ss'))
    );
  }, []);

  return (
    <>
      <OptionButton onPress={() => setShowDatePicker(true)}>
        <OptionText style={{ textAlignVertical: 'center' }}>
          {displayDate(dayjs(timestamp), 'food').replace(/,\s/g, '\n')}
        </OptionText>
      </OptionButton>
      {showDatePicker && (
        <DateTimePicker
          value={new Date(timestamp)}
          mode="date"
          onChange={(_, newDate) => {
            if (newDate !== undefined) onDateChange(newDate);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(timestamp)}
          mode="time"
          onChange={(_, newTime) => {
            if (newTime !== undefined) onTimeChange(newTime);
          }}
        />
      )}
    </>
  );
}

function dayAndTimeToTimestamp(day: string, time: string) {
  return `${day}T${time}${dayjs().format('Z')}`;
}
