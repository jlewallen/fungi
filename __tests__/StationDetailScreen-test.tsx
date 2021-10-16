/**
 * @format
 */

import "react-native";
import React from "react";
// Note: test renderer must be required after react-native.
import renderer from "react-test-renderer";
import EventEmitter from "tiny-emitter";

import { StationDetailScreen } from "../src/StationDetailScreen";

const fakeDiscovery = new EventEmitter();

it("renders correctly", () => {
    const root = renderer.create(
        <StationDetailScreen
            route={{ params: { station: { deviceId: "device-id" } } }}
            discovery={fakeDiscovery}
            navigation={{ navigate: () => console.log("navigate") }}
        />
    );

    expect(root.toJSON()).toMatchSnapshot();
});
