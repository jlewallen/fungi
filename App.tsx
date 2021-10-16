/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState } from "react";
import {
  SafeAreaView,
  Switch,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  useColorScheme,
  View,
} from "react-native";
import { HStack, Checkbox, Center, NativeBaseProvider, Box } from "native-base";

import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery } from "./src/discovery";
import moment from "moment";

const discovery = new Discovery();

export class Station {
  public readonly address: string;

  constructor(
    public readonly id: string,
    public readonly addresses: string[],
    public readonly port: number,
    public readonly zeroconf: Date | null,
    public readonly udp: Date | null,
    public readonly lost: Date | null
  ) {
    this.address = this.addresses[0];
  }
}

const StationItem: React.FC<{
  station: Station;
}> = ({ children, station }) => {
  const isDarkMode = useColorScheme() === "dark";

  const primaryColor = station.lost ? "coral" : "darkseagreen";

  const renderAge = (value: Date | null): string => {
    if (!value) {
      return "Never";
    }
    return moment().diff(value, "seconds") + " seconds ago";
  };

  const sections = [];

  sections.push(
    <Text
      key={sections.length}
      style={[
        styles.stationTitle,
        {
          backgroundColor: primaryColor,
          color: isDarkMode ? Colors.white : Colors.black,
        },
      ]}
    >
      {station.address}
    </Text>
  );
  if (station.lost) {
    sections.push(
      <Text
        key={sections.length}
        style={[
          styles.stationSeen,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        LOST: {renderAge(station.lost)}
      </Text>
    );
  }
  sections.push(
    <Text
      key={sections.length}
      style={[
        styles.stationId,
        {
          color: isDarkMode ? Colors.white : Colors.black,
        },
      ]}
    >
      {station.id}
    </Text>
  );
  sections.push(
    <Text
      key={sections.length}
      style={[
        styles.stationSeen,
        {
          color: isDarkMode ? Colors.white : Colors.black,
        },
      ]}
    >
      ZeroConf: {renderAge(station.zeroconf)}
    </Text>
  );
  sections.push(
    <Text
      key={sections.length}
      style={[
        styles.stationSeen,
        {
          color: isDarkMode ? Colors.white : Colors.black,
        },
      ]}
    >
      UDP: {renderAge(station.udp)}
    </Text>
  );
  sections.push(
    <Button
      key={sections.length}
      title="Query"
      onPress={() => discovery.query(station.id)}
    ></Button>
  );

  return (
    <View style={styles.stationContainer}>
      {sections}
      <Text
        style={[
          styles.stationDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === "dark";

  const containerStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [isPassive, setIsPassive] = useState<boolean>(true);
  const [stations, setStations] = useState<Station[]>([]);

  const togglePassive = () => {
    setIsPassive(!isPassive);
  };

  discovery.start(async (services) => {
    const stations = services.map(
      (s) => new Station(s.name, s.addresses, s.port, s.zeroconf, s.udp, s.lost)
    );
    console.log("stations:", stations);
    setStations(stations);
    return Promise.resolve();
  });

  return (
    <NativeBaseProvider>
      <SafeAreaView style={containerStyle}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <HStack
          space={6}
          marginTop={5}
          marginLeft={5}
          marginRight={5}
          style={backgroundStyle}
        >
          <Switch
            accessibilityLabel="Passive networking mode."
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isPassive ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={togglePassive}
            value={isPassive}
          />
          <Text style={{ fontWeight: "800" }}>Passive Networking</Text>
        </HStack>
        <FlatList
          style={backgroundStyle}
          data={stations}
          keyExtractor={(item) => item.id}
          renderItem={(row) => <StationItem station={row.item}></StationItem>}
        />
      </SafeAreaView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  stationContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  stationTitle: {
    fontSize: 24,
    fontWeight: "600",
    padding: 5,
  },
  stationId: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "200",
  },
  stationSeen: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  stationDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  highlight: {
    fontWeight: "700",
  },
});

export default App;
