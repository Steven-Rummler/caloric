import dayjs from 'dayjs';
import clone from 'lodash/clone';
import { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import EditEntry from '../components/EditEntry';
import { OptionButton, UnselectedOptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import EntryListItem from '../components/entryListItem';
import { getEntries } from '../store';
import { entry, entryType } from '../types';

export default function HistoryScreen() {
  const entries = useSelector(getEntries);
  const [selectedEntryType, setSelectedEntryType] = useState<entryType>('food');
  const [selectedEntry, setSelectedEntry] = useState<entry | undefined>(
    undefined
  );
  const [editVisible, setEditVisible] = useState(false);

  const sortedEntries = useMemo(() => {
    const sortedEntries = clone(
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
      <View style={styles.optionsSection}>
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
      </View>
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
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

const styles = StyleSheet.create({
  optionsSection: {
    flex: 1,
    minHeight: 133,
    maxHeight: 133,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
