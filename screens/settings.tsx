import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import {
  addEntries,
  clearEntries,
  getEntries,
  getSettings,
  resetSettings,
  updateSetting,
  useDefaultEntries,
} from '../store';
import { entry, entryList } from '../types';
import { jsonToCSV, readString } from 'react-native-csv';
import { useDispatch, useSelector } from 'react-redux';

import { OptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Text } from 'react-native';
import styled from 'styled-components/native';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const settings = useSelector(getSettings);
  const entries = useSelector(getEntries);

  const { trackActiveCalories } = settings;
  return (
    <Page>
      <TitleSection>
        <Title>Preferences</Title>
      </TitleSection>
      <OptionButton
        onPress={() => {
          dispatch(
            updateSetting({ trackActiveCalories: !trackActiveCalories })
          );
        }}
      >
        <Text>Track Active Calories: {trackActiveCalories ? 'Yes' : 'No'}</Text>
      </OptionButton>
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
          exportData(entries).catch((error) => console.log(error));
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
        }}
        style={{}}
      >
        <Text>Clear Log</Text>
      </OptionButton>
      <OptionButton
        onPress={() => {
          dispatch(useDefaultEntries());
        }}
        style={{}}
      >
        <Text>Reset Log to Demo</Text>
      </OptionButton>
    </Page>
  );
}

const TitleSection = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const Title = styled.Text`
  font-size: 25.89px;
`;

async function exportData(entries: entryList) {
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
    const validEntries: entryList = entries.filter(
      (entry): entry is entry => entry !== null
    );
    return validEntries;
  }
  return [];
}
