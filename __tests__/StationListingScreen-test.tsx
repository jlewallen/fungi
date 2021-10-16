/**
 * @format
 */

import "react-native";
import React from "react";
// Note: test renderer must be required after react-native.
import renderer from "react-test-renderer";
import EventEmitter from "tiny-emitter";

jest.mock("react-native/Libraries/Components/Switch/Switch", () => {
    const mockComponent = require("react-native/jest/mockComponent");
    return mockComponent("react-native/Libraries/Components/Switch/Switch");
});

import { StationListingScreen } from "../src/StationListingScreen";

const fakeDiscovery = new EventEmitter();

it("renders correctly", async () => {
    const root = renderer.create(
        <StationListingScreen discovery={fakeDiscovery} navigation={{ navigate: () => console.log("navigate") }} />
    );

    expect(root.toJSON()).toMatchSnapshot();
});
