import * as DocumentPicker from 'expo-document-picker';
import { Directory, File } from 'expo-file-system';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { jsonToCSV, readString } from 'react-native-csv';
import { useDispatch, useSelector } from 'react-redux';
import { OptionButton, OutlineOptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Props } from '../navigationTypes';
import {
  addEntries,
  clearEntries,
  getEntries,
  useDefaultEntries,
} from '../store';
import { entry } from '../types';

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const entries = useSelector(getEntries);

  return (
    <Page>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Manage Log</Text>
      </View>
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
      <OutlineOptionButton
        onPress={() => {
          Alert.alert(
            'Clear Log?',
            'All entries will be gone forever (a long time)',
            [
              {
                text: 'Clear',
                onPress: () => {
                  dispatch(clearEntries());
                  navigation.goBack();
                },
              },
              { text: 'Cancel' },
            ]
          );
        }}
        style={{ borderColor: '#ff4444' }}
      >
        <Text style={{ color: '#ff4444' }}>Clear Log</Text>
      </OutlineOptionButton>
      <OutlineOptionButton
        onPress={() => {
          Alert.alert(
            'Reset to Demo?',
            'All current entries will be replaced with demo data',
            [
              {
                text: 'Reset',
                onPress: () => {
                  dispatch(useDefaultEntries());
                  navigation.goBack();
                },
              },
              { text: 'Cancel' },
            ]
          );
        }}
        style={{ borderColor: '#ff4444' }}
      >
        <Text style={{ color: '#ff4444' }}>Reset Log to Demo</Text>
      </OutlineOptionButton>
    </Page>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    flex: 0.667,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25.89,
  },
});

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

    const selectedDirectory = await Directory.pickDirectoryAsync();
    if (!selectedDirectory) return;

    const file = new File(selectedDirectory.uri, 'caloric.csv');
    file.write(csvString);
  } catch (error) {
    console.error(error);
  }
}

async function importData() {
  const importFile = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: ['text/csv', 'text/comma-separated-values'],
  });
  if (importFile.canceled) return [];
  const fileUri = importFile.assets[0]?.uri;
  if (!fileUri) return [];
  
  const file = new File(fileUri);
  const fileString = await file.text();
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
