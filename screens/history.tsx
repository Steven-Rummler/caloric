import { FlatList, Text } from 'react-native';
import { getEntries, getSettings } from '../store';
import { useMemo, useState } from 'react';

import EntryListItem from '../components/entryListItem';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import _ from 'lodash';
import dayjs from 'dayjs';
import { entryType } from '../types';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';

export default function HistoryScreen() {
  const entries = useSelector(getEntries);
  const settings = useSelector(getSettings);
  const { trackActiveCalories } = settings;
  const [selectedEntryType, setSelectedEntryType] = useState<entryType>('food');

  const sortedEntries = useMemo(() => {
    const sortedEntries = _.clone(
      entries.filter((entry) => entry.entryType === selectedEntryType)
    );
    sortedEntries.sort(
      (a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf()
    );
    return sortedEntries;
  }, [entries, selectedEntryType]);

  return (
    <Page style={{ paddingTop: 90 }}>
      <OptionsSection>
        <OptionButton onPress={() => setSelectedEntryType('food')}>
          <Text
            style={selectedEntryType === 'food' ? {} : { color: 'lightgrey' }}
          >
            Food
          </Text>
        </OptionButton>
        {trackActiveCalories && (
          <OptionButton onPress={() => setSelectedEntryType('active')}>
            <Text
              style={
                selectedEntryType === 'active' ? {} : { color: 'lightgrey' }
              }
            >
              Active
            </Text>
          </OptionButton>
        )}
        <OptionButton onPress={() => setSelectedEntryType('weight')}>
          <Text
            style={selectedEntryType === 'weight' ? {} : { color: 'lightgrey' }}
          >
            Weight
          </Text>
        </OptionButton>
      </OptionsSection>
      <FlatList
        data={sortedEntries}
        renderItem={({ item }) => <EntryListItem item={item} />}
        keyExtractor={(item) => item.timestamp}
      />
    </Page>
  );
}

const OptionsSection = styled.View`
  flex: 1 1 0;
  min-height: 133px;
  max-height: 133px;
  flex-direction: row;
`;
