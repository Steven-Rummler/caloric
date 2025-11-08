import dayjs from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Edit } from 'react-native-feather';
import { useTheme } from '../ThemeProvider';
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
  const theme = useTheme();
  const { entryType, number, timestamp } = entry;

  const openEditEntry = () => {
    setSelectedEntry(entry);
    setEditVisible(true);
  };

  return (
    <Pressable style={[styles.itemBox, { backgroundColor: theme.primary }]} onPress={openEditEntry}>
      <View>
        <Text style={{ color: theme.primaryText }}>
          {number} {entryTypeUnit(entryType).replace('\n', ' ')}
        </Text>
        <Text style={{ color: theme.primaryText }}>{displayDate(dayjs(timestamp), entryType)}</Text>
      </View>
      <View>
        <Edit color={theme.text} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    margin: 4,
    flexDirection: 'row',
    padding: 20,
  },
});
