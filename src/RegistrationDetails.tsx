import moment from "moment";

import React, { useState } from "react";
import { Button, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery, PersistedStation, Registration } from "./discovery";
import { StationNavigation } from "./types";

export const RegistrationDetails: React.FC<{
    registration: Registration;
    showHeader: boolean;
    discovery: Discovery;
    onPress: (registration: Registration) => void;
}> = ({ children, registration, showHeader, discovery, onPress }) => {
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
