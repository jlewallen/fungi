/**
 * @format
 */

import React from "react";
import { SafeAreaView, useColorScheme } from "react-native";
import { NativeBaseProvider } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { Discovery } from "./src/discovery";

import { StationListingScreen } from "./src/StationListingScreen";
import { StationDetailScreen } from "./src/StationDetailScreen";
import { HistoryScreen } from "./src/HistoryScreen";

const discovery = new Discovery();

const Stack = createNativeStackNavigator();

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
                        <Stack.Screen name="Stations" options={{ title: "Stations" }}>
                            {(props) => <StationListingScreen discovery={discovery} {...props} />}
                        </Stack.Screen>
                        <Stack.Screen name="StationDetail" options={({ route }) => ({ title: route.params.station.name })}>
                            {(props) => <StationDetailScreen discovery={discovery} {...props} />}
                        </Stack.Screen>
                        <Stack.Screen name="History" options={({ route }) => ({ title: "History" })}>
                            {(props) => <HistoryScreen discovery={discovery} {...props} />}
                        </Stack.Screen>
                    </Stack.Navigator>
                </SafeAreaView>
            </NativeBaseProvider>
        </NavigationContainer>
    );
};

export default App;
