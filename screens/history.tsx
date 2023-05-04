import { FlatList, Modal, Text } from 'react-native';
import { entry, entryType } from '../types';
import { getEntries, getSettings } from '../store';
import { useMemo, useState } from 'react';

import EditEntry from '../components/EditEntry';
import EntryListItem from '../components/entryListItem';
import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import _ from 'lodash';
import dayjs from 'dayjs';
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
