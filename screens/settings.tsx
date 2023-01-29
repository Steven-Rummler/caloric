import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { Pressable, Switch, Text, View } from 'react-native';
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

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const settings = useSelector(getSettings);
  const entries = useSelector(getEntries);

  const { trackActiveCalories } = settings;
  return (
    <View>
      <Text>Track Active Calories</Text>
      <Switch
        value={trackActiveCalories}
        onChange={() => {
          dispatch(
            updateSetting({ trackActiveCalories: !trackActiveCalories })
          );
        }}
      />
      <Pressable
        onPress={() => {
          exportData(entries).catch((error) => console.log(error));
        }}
        style={{}}
      >
        <Text>Export</Text>
      </Pressable>
      <Pressable
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
        <Text>Import</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(clearEntries());
        }}
        style={{}}
      >
        <Text>Clear</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(useDefaultEntries());
        }}
        style={{}}
      >
        <Text>Default</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resetSettings());
        }}
      >
        <Text>Reset Settings</Text>
      </Pressable>
    </View>
  );
}

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
