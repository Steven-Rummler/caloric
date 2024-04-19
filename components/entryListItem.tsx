import dayjs from 'dayjs';
import { Text, View } from 'react-native';
import { Edit } from 'react-native-feather';
import styled from 'styled-components/native';
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
    <ItemBox onPress={openEditEntry}>
      <View>
        <Text>
          {number} {entryTypeUnit(entryType).replace('\n', ' ')}
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
  background-color: #b9e2f5;
  border-radius: 16px;
  margin: 5px 10px;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
`;
