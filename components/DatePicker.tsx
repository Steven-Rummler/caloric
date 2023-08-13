import { OptionButton, OptionText } from './OptionButton';
import { useCallback, useState } from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { displayDate } from '../pure/entryTypes';
import styled from 'styled-components';

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

  const onDateChange = useCallback((newDate: Date | undefined) => {
    setShowDatePicker(false);
    if (newDate !== undefined) {
      setDate(dayjs(newDate).format('YYYY-MM-DD'));
      setShowTimePicker(true);
    }
  }, []);

  const onTimeChange = useCallback(
    (newTime: Date | undefined) => {
      setShowTimePicker(false);
      if (newTime !== undefined)
        setTimestamp(
          dayAndTimeToTimestamp(date, dayjs(newTime).format('HH:mm:ss'))
        );
    },
    [date]
  );

  return (
    <>
      <DatePickerButton onPress={() => setShowDatePicker(true)}>
        <OptionText style={{ textAlignVertical: 'center' }}>
          {displayDate(dayjs(timestamp), 'food').replace(/,\s/g, '\n')}
        </OptionText>
      </DatePickerButton>
      {showDatePicker && (
        <DateTimePicker
          value={new Date(timestamp)}
          mode="date"
          onChange={(_, newDate) => {
            onDateChange(newDate);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(timestamp)}
          mode="time"
          onChange={(_, newTime) => {
            onTimeChange(newTime);
          }}
        />
      )}
    </>
  );
}

function dayAndTimeToTimestamp(day: string, time: string) {
  return `${day}T${time}${dayjs().format('Z')}`;
}

const DatePickerButton = styled(OptionButton)`
border: 2px solid #b9e2f5;
background-color: white;
`;