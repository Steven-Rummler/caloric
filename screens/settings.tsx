import React from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File } from 'expo-file-system';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jsonToCSV, readString } from 'react-native-csv';
import { useDispatch, useSelector } from 'react-redux';
import { OptionButton, OutlineOptionButton } from '../components/OptionButton';
import Page from '../components/Page';
import { Props } from '../navigationTypes';
import {
  addEntries,
  clearEntries,
  getEntries,
  demoEntriesMonth,
  demoEntriesYear,
  demoEntriesDecade,
} from '../store';
import { entry } from '../types';

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const entries = useSelector(getEntries);
  const [showDemoModal, setShowDemoModal] = React.useState(false);

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
        onPress={() => setShowDemoModal(true)}
        style={{ borderColor: '#ff4444' }}
      >
        <Text style={{ color: '#ff4444' }}>Reset Log to Demo</Text>
      </OutlineOptionButton>
      <Modal
        visible={showDemoModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowDemoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Demo Data Size</Text>
            <Text style={styles.modalSubtitle}>
              All current entries will be replaced with demo data
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                dispatch(demoEntriesMonth());
                setShowDemoModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalOptionText}>1 Month (30 days)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                dispatch(demoEntriesYear());
                setShowDemoModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalOptionText}>1 Year (365 days)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                dispatch(demoEntriesDecade());
                setShowDemoModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalOptionText}>10 Years (3,650 days)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowDemoModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalOptionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  modalCancel: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  modalCancelText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
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
    if (selectedDirectory == null) return;

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
  if (fileUri == null) return [];
  
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
