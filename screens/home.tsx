import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { Props } from '../navigationTypes';

export default function HomeScreen({ navigation }: Props) {
  const logEntry = () => navigation.navigate('LogEntry');
  const history = () => navigation.navigate('History');
  const stats = () => navigation.navigate('Stats');

  return (
    <View>
      <View style={styles.appTitleSection}>
        <Text adjustsFontSizeToFit style={styles.appTitle}>
          Calories
        </Text>
      </View>
      <View style={styles.dynamicTextSection}>
        <Text style={styles.dynamicText}>Active Calories Today</Text>
        <Text style={styles.dynamicText}>Other Stats</Text>
        <Text style={styles.dynamicText}>Dynamic Text (based on data)</Text>
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
