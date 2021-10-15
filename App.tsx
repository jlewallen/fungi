/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import {Discovery} from './src/discovery';
import moment from 'moment';

const discovery = new Discovery();

export class Station {
  public readonly address: string;

  constructor(
    public readonly id: string,
    public readonly addresses: string[],
    public readonly port: number,
    public readonly seen: Date | null,
    public readonly lost: Date | null,
  ) {
    this.address = this.addresses[0];
  }
}

const StationItem: React.FC<{
  station: Station;
}> = ({children, station}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const primaryColor = station.lost ? 'coral' : 'darkseagreen';

  const timeSeen = moment().diff(station.seen, 'seconds');

  return (
    <View style={styles.stationContainer}>
      <Text
        style={[
          styles.stationTitle,
          {
            backgroundColor: primaryColor,
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {station.address}
      </Text>
      <Text
        style={[
          styles.stationId,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {station.id}
      </Text>
      <Text
        style={[
          styles.stationSeen,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        Last Seen: {timeSeen} seconds ago
      </Text>
      <Text
        style={[
          styles.stationDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [stations, setStations] = useState<Station[]>([]);

  discovery.start(async services => {
    const stations = services.map(
      s => new Station(s.name, s.addresses, s.port, s.seen, s.lost),
    );
    console.log('stations:', stations);
    setStations(stations);
    return Promise.resolve();
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <FlatList
        style={backgroundStyle}
        data={stations}
        renderItem={row => <StationItem station={row.item}></StationItem>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  stationContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  stationTitle: {
    fontSize: 24,
    fontWeight: '600',
    padding: 5,
  },
  stationId: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '200',
  },
  stationSeen: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  stationDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
