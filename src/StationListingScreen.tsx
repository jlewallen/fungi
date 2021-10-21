import React, { useState } from "react";
import { StyleSheet, StatusBar, Button, Text, FlatList, useColorScheme, View, Switch } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery } from "./discovery";
import { StationNavigation, PersistedStation, Registration } from "./types";

import { RegistrationDetails } from "./RegistrationDetails";

export const StationListingScreen = ({ discovery, navigation }: { discovery: Discovery; navigation: unknown }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const [isPassive, setIsPassive] = useState<boolean>(discovery.passive);
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    const togglePassive = () => {
        setIsPassive(!isPassive);
        discovery.setPassive(!isPassive);
    };

    React.useEffect(() => discovery.subscribe("registrations", (registrations: Registration[]) => setRegistrations(registrations)), []);

    const onSelected = (registration: Registration) => {
        navigation.navigate("StationDetail", { station: StationNavigation.fromRegistration(registration) });
    };

    const onHistory = () => {
        navigation.navigate("History");
    };

    return (
        <View>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View
                style={{
                    margin: 20,
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    ...backgroundStyle,
                }}
            >
                <Switch
                    accessibilityLabel="Query Stations."
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isPassive ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={togglePassive}
                    value={!isPassive}
                />
                <Text style={{ marginLeft: 10, fontWeight: "800" }}>Query Stations ({isPassive ? "No" : "Yes"})</Text>
            </View>
            <View
                style={{
                    margin: 20,
                    ...backgroundStyle,
                }}
            >
                <Button title="History" onPress={() => onHistory()} />
            </View>
            <FlatList
                style={backgroundStyle}
                data={registrations}
                keyExtractor={(item) => item.deviceId}
                renderItem={(row) => (
                    <RegistrationDetails onPress={onSelected} registration={row.item} showHeader={true} discovery={discovery} />
                )}
            />
        </View>
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
