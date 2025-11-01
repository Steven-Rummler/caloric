import dayjs from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Edit } from 'react-native-feather';
import { displayDate, entryTypeUnit } from '../pure/entryTypes';
import { entry } from '../types';

export default function EntryTypePicker({
  entry,
  setSelectedEntry,
  setEditVisible,
}: {
  entry: entry;
  setSelectedEntry: (entry: entry) => void;
  setEditVisible: (visible: boolean) => void;
}) {
  const { entryType, number, timestamp } = entry;

  const openEditEntry = () => {
    setSelectedEntry(entry);
    setEditVisible(true);
  };

  return (
    <Pressable style={styles.itemBox} onPress={openEditEntry}>
      <View>
        <Text>
          {number} {entryTypeUnit(entryType).replace('\n', ' ')}
        </Text>
        <Text>{displayDate(dayjs(timestamp), entryType)}</Text>
      </View>
      <View>
        <Edit color="black" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#b9e2f5',
    borderRadius: 16,
    margin: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    padding: 20,
  },
});
