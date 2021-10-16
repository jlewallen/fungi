/**
 * @format
 */

import "react-native";
import React from "react";
// Note: test renderer must be required after react-native.
import renderer from "react-test-renderer";
import EventEmitter from "tiny-emitter";

import { StationListingScreen } from "../src/StationListingScreen";

const fakeDiscovery = new EventEmitter();

it("renders correctly", () => {
    renderer.create(<StationListingScreen route={{ params: { station: { deviceId: "device-id" } } }} discovery={fakeDiscovery} />);
});
