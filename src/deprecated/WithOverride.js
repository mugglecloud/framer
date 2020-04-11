import * as React from "react";
import { useContext } from "react";
import { DataObserverContext } from "./DataObserver";
import { convertColorProps } from "./convertColorProps";
const hoistNonReactStatic = require("hoist-non-react-statics");
/**
 * @deprecated No longer used by Framer X because built into preview. From version ## TODO: add correct version
 * @internal
 */
export function WithOverride(Component, override) {
    const useOverride = typeof override === "function"
        ? (props) => override(convertColorProps(props))
        : () => convertColorProps(override);
    const ComponentWithOverride = function (props) {
        useContext(DataObserverContext);
        const overrideProps = useOverride(props);
        const { style, ...rest } = props;
        return React.createElement(Component, Object.assign({}, rest, overrideProps, { _initialStyle: style }));
    };
    hoistNonReactStatic(ComponentWithOverride, Component);
    return ComponentWithOverride;
}
