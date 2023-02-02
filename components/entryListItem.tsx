import { Text, View } from 'react-native';
import { displayDate, entryTypeLabel } from '../pure/entryTypes';

import { Edit } from 'react-native-feather';
import dayjs from 'dayjs';
import { entry } from '../types';
import styled from 'styled-components/native';

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
    <ItemBox onPress={openEditEntry}>
      <View>
        <Text>
          {number} {entryTypeLabel(entryType).replace('\n', ' ')}
        </Text>
        <Text>{displayDate(dayjs(timestamp), entryType)}</Text>
      </View>
      <View>
        <Edit color="black" />
      </View>
    </ItemBox>
  );
}

const ItemBox = styled.Pressable`
  align-items: center;
  justify-content: center;
  border: 1px solid lightgrey;
  margin: 10px;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  margin-vertical: 8px;
  margin-horizontal: 16px;
`;
