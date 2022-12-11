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

export default function HistoryScreen() {
    const entries = useSelector(getEntries);
    const [entryType, setEntryType] = useState<entryType>('food');
    const [date, setDate] = useState<dayjs.Dayjs>(dayjs());

    const decrementDate = () => setDate(date.subtract(1, 'day'));
    const incrementDate = () => setDate(date.add(1, 'day'));

    return (<View style={{ flex: 1 }}>
        <EntryTypePicker entryType={entryType} setEntryType={setEntryType} />
        {entryType !== 'active' && <DateSlider {...{ decrementDate, date, incrementDate }} />}
        <FlatList data={entries.filter(entry => entry.entryType === entryType)}
            renderItem={({ item }) => <EntryListItem item={item} />}
            keyExtractor={item => item.date}
        />
    </View>
    );
}

function DateSlider({ decrementDate, date, incrementDate }: { decrementDate: () => void, date: dayjs.Dayjs, incrementDate: () => void }) {
    return <View style={{ flexDirection: 'row', height: Dimensions.get('window').width * .15, width: Dimensions.get('window').width, backgroundColor: 'lightblue' }}>
        <DateArrow Icon={ChevronLeft} action={decrementDate} />
        <DateDisplay {...{ date }} />
        <DateArrow Icon={ChevronRight} action={incrementDate} />
    </View>;
}

function DateArrow({ Icon, action }: { Icon: (props: SvgProps) => JSX.Element, action: () => void }) {
    return <Pressable style={{ width: Dimensions.get('window').width * .15 }} onPress={action}>
        <Icon color='white' height={Dimensions.get('window').width * .15} width={Dimensions.get('window').width * .15} />
    </Pressable>;
}

function DateDisplay({ date }: { date: dayjs.Dayjs }) {
    return <Pressable style={{ width: Dimensions.get('window').width * .7, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{displayDate(date, 'active')}</Text>
    </Pressable>;
}