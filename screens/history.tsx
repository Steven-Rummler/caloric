import { View, FlatList, Pressable, Text, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { getEntries } from '../store';
import { useState } from 'react';
import EntryTypePicker from '../components/entryTypePicker';
import EntryListItem from '../components/entryListItem';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'react-native-feather';
import { entryType } from '../types';
import { displayDate } from '../pure/entryTypes';
import { SvgProps } from 'react-native-svg';
import { getMaxDate, getMinDate } from '../pure/entries';

export default function HistoryScreen() {
    const entries = useSelector(getEntries);
    const [entryType, setEntryType] = useState<entryType>('food');
    const [date, setDate] = useState<dayjs.Dayjs>(dayjs());

    const entriesForType = entries.filter(entry => entry.entryType === entryType);
    const minDateForType = getMinDate(entriesForType);
    const maxDateForType = getMaxDate(entriesForType);
    if (date.isBefore(minDateForType, 'day')) setDate(minDateForType);
    if (date.isAfter(maxDateForType, 'day')) setDate(maxDateForType);

    const currentlyOnMinDate = date.isSame(minDateForType, 'day');
    const currentlyOnMaxDate = date.isSame(maxDateForType, 'day');
    const entriesToDisplay = entriesForType.filter(entry => dayjs(entry.date).isSame(date, 'day'));

    const decrementDate = () => setDate(date.subtract(1, 'day'));
    const incrementDate = () => setDate(date.add(1, 'day'));

    return (<View style={{ flex: 1 }}>
        <EntryTypePicker entryType={entryType} setEntryType={setEntryType} />
        {entryType !== 'active' && <DateSlider {...{ currentlyOnMinDate, decrementDate, date, incrementDate, currentlyOnMaxDate }} />}
        <FlatList data={entriesToDisplay}
            renderItem={({ item }) => <EntryListItem item={item} />}
            keyExtractor={item => item.date}
        />
    </View>
    );
}

type DateSliderProps = { currentlyOnMinDate: boolean, decrementDate: () => void, date: dayjs.Dayjs, incrementDate: () => void, currentlyOnMaxDate: boolean };

function DateSlider({ currentlyOnMinDate, decrementDate, date, incrementDate, currentlyOnMaxDate }: DateSliderProps) {
    return <View style={{ flexDirection: 'row', height: Dimensions.get('window').width * .15, width: Dimensions.get('window').width, backgroundColor: 'lightblue' }}>
        <DateArrow Icon={ChevronLeft} active={currentlyOnMinDate} action={decrementDate} />
        <DateDisplay {...{ date }} />
        <DateArrow Icon={ChevronRight} active={currentlyOnMaxDate} action={incrementDate} />
    </View>;
}

function DateArrow({ Icon, active, action }: { Icon: (props: SvgProps) => JSX.Element, active: boolean, action: () => void }) {
    return <Pressable style={{ width: Dimensions.get('window').width * .15 }} onPress={action}>
        <Icon color={active ? 'lightblue' : 'white'} height={Dimensions.get('window').width * .15} width={Dimensions.get('window').width * .15} />
    </Pressable>;
}

function DateDisplay({ date }: { date: dayjs.Dayjs }) {
    return <Pressable style={{ width: Dimensions.get('window').width * .7, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{displayDate(date, 'active')}</Text>
    </Pressable>;
}