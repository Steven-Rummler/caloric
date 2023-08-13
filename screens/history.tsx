import { FlatList, Modal, Text } from 'react-native';
import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';
import { entry, entryType } from '../types';
import { useMemo, useState } from 'react';

import EditEntry from '../components/EditEntry';
import EntryListItem from '../components/entryListItem';
import Page from '../components/Page';
import _ from 'lodash';
import dayjs from 'dayjs';
import { getEntries } from '../store';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';

export default function HistoryScreen() {
  const entries = useSelector(getEntries);
  const [selectedEntryType, setSelectedEntryType] = useState<entryType>('food');
  const [selectedEntry, setSelectedEntry] = useState<entry | undefined>(
    undefined
  );
  const [editVisible, setEditVisible] = useState(false);

  const sortedEntries = useMemo(() => {
    const sortedEntries = _.clone(
      entries.filter((entry) => entry.entryType === selectedEntryType)
    );
    sortedEntries.sort(
      (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
    );
    return sortedEntries;
  }, [entries, selectedEntryType]);

  const FoodButton = selectedEntryType === 'food' ? OptionButton : UnselectedOptionButton;
  const WeightButton = selectedEntryType === 'weight' ? OptionButton : UnselectedOptionButton;

  return (
    <Page>
      <OptionsSection>
        <FoodButton onPress={() => setSelectedEntryType('food')}>
          <Text          >
            Food
          </Text>
        </FoodButton>
        <WeightButton onPress={() => setSelectedEntryType('weight')}>
          <Text          >
            Weight
          </Text>
        </WeightButton>
      </OptionsSection>
      <FlatList
        data={sortedEntries}
        renderItem={({ item }) => (
          <EntryListItem
            entry={item}
            setSelectedEntry={setSelectedEntry}
            setEditVisible={setEditVisible}
          />
        )}
        keyExtractor={(item) => item.timestamp}
      />
      <Modal
        transparent={true}
        visible={editVisible}
        onRequestClose={() => setEditVisible(!editVisible)}
      >
        {selectedEntry !== undefined && (
          <EditEntry
            selectedEntry={selectedEntry}
            setVisible={setEditVisible}
          />
        )}
      </Modal>
    </Page>
  );
}

const OptionsSection = styled.View`
  flex: 1 1 0;
  min-height: 133px;
  max-height: 133px;
  flex-direction: row;
`;
