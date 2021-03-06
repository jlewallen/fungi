const React = require("react");
const ReactNative = require("react-native");

const Switch = function (props) {
    const [value, setValue] = React.useState(props.value);

    return (
        <ReactNative.TouchableOpacity
            onPress={() => {
                props.onValueChange(!value);
                setValue(!value);
            }}
            testID={props.testID}
        >
            <ReactNative.Text>{value.toString()}</ReactNative.Text>
        </ReactNative.TouchableOpacity>
    );
};

Object.defineProperty(ReactNative, "Switch", {
    get: function () {
        return Switch;
    },
});
