/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import Zeroconf from 'react-native-zeroconf';
const zeroconf = new Zeroconf();

console.log('Hello');
console.log(zeroconf);

AppRegistry.registerComponent(appName, () => App);
