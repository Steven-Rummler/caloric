import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  addEntries,
  clearEntries,
  getEntries,
  resetSettings,
  useDefaultEntries,
} from '../store';
import { entry, entryList } from '../types';
import { jsonToCSV, readString } from 'react-native-csv';
import { useDispatch, useSelector } from 'react-redux';

import { Props } from '../navigationTypes';
import dayjs from 'dayjs';
import { useMemo } from 'react';

export default function HomeScreen({ navigation }: Props) {
  const entries = useSelector(getEntries);
  const dispatch = useDispatch();

  const logEntry = () => navigation.navigate('LogEntry');
  const history = () => navigation.navigate('History');
  const stats = () => navigation.navigate('Stats');

  const totalActiveCalories = useMemo(() => {
    const activeEntries = entries.filter(
      (entry) => entry.entryType === 'active'
    );
    if (activeEntries.length === 0) return 0;
    return activeEntries.reduce((total, next) => total + next.number, 0);
  }, [entries]);
  const averageFoodCalories = useMemo(() => {
    const foodEntries = entries.filter((entry) => entry.entryType === 'food');
    if (foodEntries.length === 0) return 0;
    const totalFoodCalories = foodEntries.reduce(
      (total, next) => total + next.number,
      0
    );
    const days: string[] = [];
    foodEntries.forEach((foodEntry) => {
      const day = dayjs(foodEntry.timestamp).format('YYYY-MM-DD');
      if (days.includes(day)) return;
      days.push(day);
    });
    return Math.round(totalFoodCalories / days.length);
  }, [entries]);
  const lastWeight = useMemo(() => {
    const weightEntries = entries.filter(
      (entry) => entry.entryType === 'weight'
    );
    if (weightEntries.length === 0) return 0;
    return weightEntries[weightEntries.length - 1].number;
  }, [entries]);

  return (
    <View>
      <View style={styles.appTitleSection}>
        <Text adjustsFontSizeToFit style={styles.appTitle}>
          Caloric
        </Text>
      </View>
      <View style={styles.dynamicTextSection}>
        <Text style={styles.dynamicText}>
          Total Active Calories: {totalActiveCalories}
        </Text>
        <Text style={styles.dynamicText}>
          Average Food Calories: {averageFoodCalories}
        </Text>
        <Text style={styles.dynamicText}>Last Weight: {lastWeight}</Text>
      </View>
      <View style={styles.actionButtonSection}>
        <Pressable onPress={logEntry} style={styles.actionButton}>
          <Text>Log</Text>
        </Pressable>
      </View>
      <View style={styles.footerButtonSection}>
        <Pressable onPress={history} style={styles.footerButton}>
          <Text>History</Text>
        </Pressable>
        <Pressable onPress={stats} style={styles.footerButton}>
          <Text>Stats</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            exportData(entries).catch((error) => console.log(error));
          }}
          style={styles.footerButton}
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
          style={styles.footerButton}
        >
          <Text>Import</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            dispatch(clearEntries());
          }}
          style={styles.footerButton}
        >
          <Text>Clear</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            dispatch(useDefaultEntries());
          }}
          style={styles.footerButton}
        >
          <Text>Default</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            dispatch(resetSettings());
          }}
          style={styles.footerButton}
        >
          <Text>Reset Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appTitleSection: {
    height: Dimensions.get('window').height * 0.15,
    display: 'flex',
    justifyContent: 'center',
  },
  appTitle: {
    width: Dimensions.get('window').width,
    textAlign: 'center',
    fontSize: 30,
  },
  dynamicTextSection: {
    height: Dimensions.get('window').height * 0.25,
    display: 'flex',
  },
  dynamicText: {
    width: Dimensions.get('window').width,
    textAlign: 'center',
  },
  actionButtonSection: {
    height: Dimensions.get('window').height * 0.4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius:
      Math.round(
        Dimensions.get('window').width + Dimensions.get('window').height
      ) / 2,
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonSection: {
    height: Dimensions.get('window').height * 0.2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  footerButton: {},
});

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
