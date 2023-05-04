import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import {
  addEntries,
  clearEntries,
  getEntries,
  resetSettings,
  useDefaultEntries,
} from '../store';
import { jsonToCSV, readString } from 'react-native-csv';
import { useDispatch, useSelector } from 'react-redux';

import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Props } from '../navigationTypes';
import { Text } from 'react-native';
import { entry } from '../types';
import styled from 'styled-components/native';

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const entries = useSelector(getEntries);

  return (
    <Page>
      <TitleSection>
        <Title>Preferences</Title>
      </TitleSection>
      <OptionButton
        onPress={() => {
          dispatch(resetSettings());
        }}
      >
        <Text>Reset Preferences to Defaults</Text>
      </OptionButton>
      <TitleSection>
        <Title>Manage Log</Title>
      </TitleSection>
      <OptionButton
        onPress={() => {
          exportData(entries)
            .then(() => navigation.goBack())
            .catch((error) => console.log(error));
        }}
        style={{}}
      >
        <Text>Export Log to CSV</Text>
      </OptionButton>
      <OptionButton
        onPress={() => {
          importData()
            .then((newEntries) => {
              if (newEntries.length === 0) return;
              dispatch(clearEntries());
              dispatch(addEntries(newEntries));
              navigation.goBack();
            })
            .catch((error) => console.log(error));
        }}
        style={{}}
      >
        <Text>Import Log from CSV</Text>
      </OptionButton>
      <OptionButton
        onPress={() => {
          dispatch(clearEntries());
          navigation.goBack();
        }}
        style={{ borderColor: '#ab0000' }}
      >
        <Text style={{ color: '#ab0000' }}>Clear Log</Text>
      </OptionButton>
      <OptionButton
        onPress={() => {
          dispatch(useDefaultEntries());
          navigation.goBack();
        }}
        style={{ borderColor: '#ab0000' }}
      >
        <Text style={{ color: '#ab0000' }}>Reset Log to Demo</Text>
      </OptionButton>
    </Page>
  );
}

const TitleSection = styled.View`
  flex: 0.667;
  align-items: center;
  justify-content: center;
`;
const Title = styled.Text`
  font-size: 25.89px;
`;

async function exportData(entries: entry[]) {
  try {
    const csvString = jsonToCSV(
      JSON.stringify(
        entries.map((entry) => {
          if (entry.label !== undefined) return entry;
          return { ...entry, label: '' };
        })
      )
    );

    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) return;

    const filePath = await FileSystem.StorageAccessFramework.createFileAsync(
      `${permissions.directoryUri}`,
      'caloric',
      'text/csv'
    );

    await FileSystem.writeAsStringAsync(filePath, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    console.error(error);
  }
}

async function importData() {
  const importFile = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: ['text/csv', 'text/comma-separated-values'],
  });
  if (importFile.type !== 'success') return [];
  const fileString = await FileSystem.readAsStringAsync(importFile.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const fileData = readString(fileString);
  if (Array.isArray(fileData.data)) {
    const dataRows = fileData.data.slice(1);
    const entries = dataRows.map((row) => {
      if (!Array.isArray(row)) return null;
      if (typeof row[0] !== 'string') return null;
      if (typeof row[1] !== 'string') return null;
      if (typeof row[2] !== 'string') return null;
      if (typeof row[3] !== 'string') return null;
      const entry = {
        entryType: row[0],
        timestamp: row[1],
        number: Number.parseFloat(row[2]),
        ...(row[3] === '' ? {} : { label: row[3] }),
      };
      return entry;
    });
    const validEntries: entry[] = entries.filter(
      (entry): entry is entry => entry !== null
    );
    return validEntries;
  }
  return [];
}
