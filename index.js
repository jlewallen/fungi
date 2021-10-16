/**
 * @format
 */

import { AppRegistry, LogBox } from "react-native";

LogBox.ignoreLogs([
    // "Remote debugger is in a background tab which may cause apps to perform slowly",
    "Require cycle: node_modules/react-native-fetch-blob/index.js",
    "Require cycle: node_modules/react-native-fetch-blob/index.js -> node_modules/react-native-fetch-blob/polyfill/index.js -> node_modules/react-native-fetch-blob/polyfill/Fetch.js -> node_modules/react-native-fetch-blob/index.js",
]);

import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
