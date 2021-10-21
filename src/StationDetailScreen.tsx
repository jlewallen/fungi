import moment from "moment";

import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery } from "./discovery";
import { StationNavigation, PersistedStation, Registration } from "./types";

import { RegistrationDetails } from "./RegistrationDetails";

const StationInspection: React.FC<{ station: PersistedStation }> = ({ children, station }) => {
    console.log("modules", station.reply.modules);
    console.log("live-readings", station.reply.liveReadings);
    return (
        <ScrollView style={{ paddingHorizontal: 24 }}>
            <Text>Name: {station.reply.status?.identity?.name}</Text>
            <Text>Uptime: {station.reply.status?.uptime}</Text>
            <Text>Battery: {station.reply.status?.power?.battery?.voltage}</Text>
            {station.reply.liveReadings.map((lr) => {
                return lr.modules.map((mod, modIndex: number) => {
                    return (
                        <View key={modIndex} style={{ marginBottom: 5, marginTop: 5 }}>
                            <Text style={{ fontSize: 18, fontWeight: "800" }}>{mod.module?.name}</Text>
                            {mod.readings?.map((reading, readingIndex: number) => {
                                return (
                                    <View
                                        key={readingIndex}
                                        style={{
                                            flexDirection: "row",
                                            display: "flex",
                                            justifyContent: "space-evenly",
                                        }}
                                    >
                                        <Text style={{ fontWeight: "600" }}>{reading.sensor?.name}</Text>
                                        <Text>{reading.uncalibrated?.toFixed(3)}</Text>
                                        <Text>{reading.factory?.toFixed(3)}</Text>
                                        <Text>{reading.value?.toFixed(3)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    );
                });
            })}
            <Text>Firmware: {station.reply.status?.firmware?.version}</Text>
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
        </ScrollView>
    );
};

export const StationDetailScreen = ({ discovery, navigation, route }: { discovery: Discovery; navigation: unknown; route: unknown }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const stationNavigation: StationNavigation = route.params.station;

    console.log("station-detail-navigation", stationNavigation);

    const [station, setStation] = useState<PersistedStation | null>(null);
    const [registration, setRegistration] = useState<Registration | null>(null);

    React.useEffect(
        () =>
            discovery.subscribe(`stations/${stationNavigation.deviceId}`, (station: PersistedStation) => {
                console.log("station-detail-station", station);
                console.log("station-detail-station", station.reply.status);
                setStation(station);
            }),
        [stationNavigation.deviceId]
    );

    React.useEffect(
        () =>
            discovery.subscribe(`registrations/${stationNavigation.deviceId}`, (registration: Registration) => {
                console.log("station-detail-registration", registration);
                setRegistration(registration.clone());
            }),
        [stationNavigation.deviceId]
    );

    if (!registration) {
        return (
            <View>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <Text style={{ margin: 20 }}>Loading</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <RegistrationDetails registration={registration} showHeader={false} onPress={console.log} discovery={discovery} />
            {station && <StationInspection station={station} />}
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
