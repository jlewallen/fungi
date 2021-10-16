/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import moment from "moment";

import React, { useState } from "react";
import { SafeAreaView, Switch, Button, StatusBar, StyleSheet, Text, FlatList, useColorScheme, View } from "react-native";
import { HStack, Checkbox, Center, NativeBaseProvider, Box } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery, PersistedStation, Registration } from "./src/discovery";

const discovery = new Discovery();

const StationInspection: React.FC<{ station: PersistedStation }> = ({ children, station }) => {
    return (
        <View style={{ paddingHorizontal: 24 }}>
            <Text>Name: {station.reply.status?.identity?.name}</Text>
            <Text>Uptime: {station.reply.status?.uptime}</Text>
            <Text>Firmware: {station.reply.status?.firmware?.version}</Text>
            <Text>Battery: {station.reply.status?.power?.battery?.voltage}</Text>
            <Text>Solar: {station.reply.status?.power?.solar?.voltage}</Text>
            <Text>GPS: {station.reply.status?.gps?.fix}</Text>
            <Text>Latitude: {station.reply.status?.gps?.latitude}</Text>
            <Text>Longitude: {station.reply.status?.gps?.longitude}</Text>
            {station.reply.streams.map((stream) => {
                return (
                    <View key={stream.name}>
                        <Text>
                            {stream.name}: {stream.block} blocks, {stream.size} bytes
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const RegistrationDetails: React.FC<{
    registration: Registration;
    showHeader: boolean;
    onPress: (registration: Registration) => void;
}> = ({ children, registration, showHeader, onPress }) => {
    const isDarkMode = useColorScheme() === "dark";

    const primaryColor = registration.lost ? "coral" : "darkseagreen";

    const renderAge = (value: Date | null): string => {
        if (!value) {
            return "Never";
        }
        return moment().diff(value, "seconds") + " seconds ago";
    };

    const sections = [];

    const pushAgeSection = (label: string, value: Date | null) => {
        if (!value) {
            return;
        }
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
                {label}: {renderAge(value)}
            </Text>
        );
    };

    if (showHeader) {
        sections.push(
            <Text
                key={sections.length}
                onPress={() => onPress(registration)}
                style={[
                    styles.stationTitle,
                    {
                        backgroundColor: primaryColor,
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}
            >
                {registration.address}
            </Text>
        );
    }
    if (registration.lost) {
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
                LOST: {renderAge(registration.lost)}
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
            {registration.deviceId}
        </Text>
    );

    pushAgeSection("ZeroConf", registration.zeroconf);
    pushAgeSection("UDP", registration.udp);
    pushAgeSection("Queried", registration.queried);
    pushAgeSection("Reply", registration.replied);

    sections.push(
        <View style={styles.buttonContainerStyle} key={sections.length}>
            <Button title="Query" onPress={() => discovery.query(registration.deviceId)} />
        </View>
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

const Stack = createNativeStackNavigator();

const StationDetailScreen = ({ route, navigation }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const stationNavigation: StationNavigation = route.params.station;

    console.log("station-detail-navigation", stationNavigation);

    const [station, setStation] = useState<PersistedStation | null>(null);
    const [registration, setRegistration] = useState<Registration | null>(null);

    React.useEffect(() => {
        const refreshStation = (station: PersistedStation) => {
            console.log("station-detail-station", station);
            console.log("station-detail-station", station.reply.status);
            setStation(station);
        };
        const refreshRegistration = (registration: Registration) => {
            console.log("station-detail-registration", registration);
            setRegistration(registration.clone());
        };
        const stationKey = `stations/${stationNavigation.deviceId}`;
        const registrationKey = `registrations/${stationNavigation.deviceId}`;
        discovery.on(stationKey, refreshStation);
        discovery.on(registrationKey, refreshRegistration);
        return function cleanupListener() {
            discovery.off(stationKey, refreshStation);
            discovery.off(registrationKey, refreshRegistration);
        };
    });

    if (!registration) {
        return (
            <View>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <Text style={{ margin: 20 }}>Loading</Text>
            </View>
        );
    }

    return (
        <View>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <RegistrationDetails registration={registration} showHeader={false} onPress={console.log} />
            {station && <StationInspection station={station} />}
        </View>
    );
};

class StationNavigation {
    constructor(public readonly deviceId: string, public readonly name: string) {}

    public static fromRegistration(registration: Registration): StationNavigation {
        return new StationNavigation(registration.deviceId, registration.address);
    }
}

const StationListingScreen = ({ navigation }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const [isPassive, setIsPassive] = useState<boolean>(true);
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    const togglePassive = () => {
        setIsPassive(!isPassive);
    };

    React.useEffect(() => {
        const handler = (registrations: Registration[]) => {
            setRegistrations(registrations);
        };
        discovery.on("registrations", handler);
        return function cleanupListener() {
            discovery.off("registrations", handler);
        };
    });

    const onSelected = (registration: Registration) => {
        navigation.navigate("StationDetail", { station: StationNavigation.fromRegistration(registration) });
    };

    return (
        <View>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <HStack space={6} marginTop={5} marginLeft={5} marginRight={5} style={backgroundStyle}>
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
                data={registrations}
                keyExtractor={(item) => item.deviceId}
                renderItem={(row) => <RegistrationDetails onPress={onSelected} registration={row.item} showHeader={true} />}
            />
        </View>
    );
};

const App = () => {
    const isDarkMode = useColorScheme() === "dark";

    const containerStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        flex: 1,
    };

    discovery.start();

    return (
        <NavigationContainer>
            <NativeBaseProvider>
                <SafeAreaView style={containerStyle}>
                    <Stack.Navigator>
                        <Stack.Screen name="Stations" component={StationListingScreen} options={{ title: "Stations" }} />
                        <Stack.Screen
                            name="StationDetail"
                            component={StationDetailScreen}
                            options={({ route }) => ({ title: route.params.station.name })}
                        />
                    </Stack.Navigator>
                </SafeAreaView>
            </NativeBaseProvider>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    stationContainer: {
        marginTop: 10,
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
        fontSize: 14,
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
    buttonContainerStyle: {
        marginTop: 10,
    },
});

export default App;
