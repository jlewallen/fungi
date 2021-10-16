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

const RegistrationDetails: React.FC<{
    registration: Registration;
    onPress: (registration: Registration) => void;
}> = ({ children, registration, onPress }) => {
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
            {registration.name}
        </Text>
    );

    pushAgeSection("ZeroConf", registration.zeroconf);
    pushAgeSection("UDP", registration.udp);
    pushAgeSection("Queried", registration.queried);
    pushAgeSection("Reply", registration.replied);

    sections.push(
        <View style={styles.buttonContainerStyle} key={sections.length}>
            <Button title="Query" onPress={() => discovery.query(registration.name)} />
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

    React.useEffect(() => {
        const handler = (station: PersistedStation) => {
            console.log("station-detail-station", station);
        };
        const key = `stations/${stationNavigation.id}`;
        discovery.on(key, handler);
        return function cleanupListener() {
            discovery.off(key, handler);
        };
    });

    return (
        <View style={{ margin: 20 }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={styles.buttonContainerStyle}>
                <Button title="Query" onPress={() => discovery.query(stationNavigation.id)} />
            </View>
            <HStack space={6} marginTop={5} marginLeft={5} marginRight={5} style={backgroundStyle}></HStack>
        </View>
    );
};

class StationNavigation {
    constructor(public readonly id: string, public readonly name: string) {}

    public static fromRegistration(registration: Registration): StationNavigation {
        return new StationNavigation(registration.name, registration.address);
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
                keyExtractor={(item) => item.name}
                renderItem={(row) => <RegistrationDetails onPress={onSelected} registration={row.item}></RegistrationDetails>}
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
