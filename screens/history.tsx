import { ChevronLeft, ChevronRight } from 'react-native-feather';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { getFirstDay, getLastDay } from '../pure/entries';

import EntryListItem from '../components/entryListItem';
import EntryTypePicker from '../components/entryTypePicker';
import { SvgProps } from 'react-native-svg';
import dayjs from 'dayjs';
import { displayDate } from '../pure/entryTypes';
import { entryType } from '../types';
import { getEntries } from '../store';
import { useSelector } from 'react-redux';
import { useState } from 'react';

export default function HistoryScreen() {
  const entries = useSelector(getEntries);
  const [entryType, setEntryType] = useState<entryType>('food');
  const [timestamp, setTimestamp] = useState<dayjs.Dayjs>(dayjs());

  const entriesForType = entries.filter(
    (entry) => entry.entryType === entryType
  );
  const firstDayForType = getFirstDay(entriesForType);
  const lastDayForType = getLastDay(entriesForType);
  if (timestamp.isBefore(firstDayForType, 'day')) setTimestamp(firstDayForType);
  if (timestamp.isAfter(lastDayForType, 'day')) setTimestamp(lastDayForType);

  const currentlyOnFirstDay = timestamp.isSame(firstDayForType, 'day');
  const currentlyOnLastDay = timestamp.isSame(lastDayForType, 'day');
  const entriesToDisplay = entriesForType.filter((entry) =>
    dayjs(entry.timestamp).isSame(timestamp, 'day')
  );

  const decrementDate = () => setTimestamp(timestamp.subtract(1, 'day'));
  const incrementDate = () => setTimestamp(timestamp.add(1, 'day'));

  return (
    <View style={{ flex: 1 }}>
      <EntryTypePicker entryType={entryType} setEntryType={setEntryType} />
      {entryType !== 'active' && (
        <DateSlider
          {...{
            currentlyOnFirstDay,
            decrementDate,
            timestamp,
            incrementDate,
            currentlyOnLastDay,
          }}
        />
      )}
      <FlatList
        data={entriesToDisplay}
        renderItem={({ item }) => <EntryListItem item={item} />}
        keyExtractor={(item) => item.timestamp}
      />
    </View>
  );
}

interface DateSliderProps {
  currentlyOnFirstDay: boolean;
  decrementDate: () => void;
  timestamp: dayjs.Dayjs;
  incrementDate: () => void;
  currentlyOnLastDay: boolean;
}

function DateSlider({
  currentlyOnFirstDay,
  decrementDate,
  timestamp,
  incrementDate,
  currentlyOnLastDay,
}: DateSliderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: Dimensions.get('window').width * 0.15,
        width: Dimensions.get('window').width,
        backgroundColor: 'lightblue',
      }}
    >
      <DateArrow
        Icon={ChevronLeft}
        active={currentlyOnFirstDay}
        action={decrementDate}
      />
      <DateDisplay {...{ timestamp }} />
      <DateArrow
        Icon={ChevronRight}
        active={currentlyOnLastDay}
        action={incrementDate}
      />
    </View>
  );
}

function DateArrow({
  Icon,
  active,
  action,
}: {
  Icon: (props: SvgProps) => JSX.Element;
  active: boolean;
  action: () => void;
}) {
  return (
    <Pressable
      style={{ width: Dimensions.get('window').width * 0.15 }}
      onPress={action}
    >
      <Icon
        color={active ? 'lightblue' : 'white'}
        height={Dimensions.get('window').width * 0.15}
        width={Dimensions.get('window').width * 0.15}
      />
    </Pressable>
  );
}

function DateDisplay({ timestamp }: { timestamp: dayjs.Dayjs }) {
  return (
    <Pressable
      style={{
        width: Dimensions.get('window').width * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>{displayDate(timestamp, 'active')}</Text>
    </Pressable>
  );
}
