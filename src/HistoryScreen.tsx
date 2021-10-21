import React, { useState } from "react";
import { StatusBar, StyleSheet, Text, FlatList, useColorScheme, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery, HistoryEntry, HistoryEntryType } from "./discovery";

const HistoryItem = ({ item }: { item: HistoryEntry }) => {
    const age = new Date() - item.time;

    const typeToView = (type: HistoryEntryType): string => {
        switch (type) {
            case HistoryEntryType.Query:
                return "Query";
            case HistoryEntryType.UdpMessage:
                return "UdpMessage";
            case HistoryEntryType.ZeroConfFound:
                return "ZeroConfFound";
            case HistoryEntryType.ZeroConfLost:
                return "ZeroConfLost";
        }
        return "Unknown";
    };

    return (
        <View style={{ margin: 10 }}>
            <Text style={{ fontWeight: "800" }}>{typeToView(item.type)}</Text>
            <Text style={{ fontSize: 14 }}>{item.deviceId}</Text>
            <Text style={{ fontSize: 12 }}>{age} ms ago.</Text>
        </View>
    );
};

export const HistoryScreen = ({ discovery, navigation }: { discovery: Discovery; navigation: unknown }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const [history, setHistory] = useState<HistoryEntry[]>([]);

    React.useEffect(() => discovery.subscribe("history", (history: HistoryEntry[]) => setHistory(history)), []);

    return (
        <View>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <FlatList
                style={backgroundStyle}
                data={history}
                keyExtractor={(item) => item.key}
                renderItem={(row) => <HistoryItem item={row.item} />}
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
