import * as React from "react";
import { forwardRef } from "react";
import { WithEvents } from "../../../components/hoc/WithEvents";
import { DeprecatedFrame } from "./DeprecatedFrame";
import { FrameWithMotion } from "./FrameWithMotion";
import { useParentSize, deprecatedParentSize } from "../../types/NewConstraints";
import { isDeprecatedFrameProps } from "./isDeprecatedFrameProps";
export { isDeprecatedFrameProps } from "./isDeprecatedFrameProps";
// Re-exports
export { DeprecatedFrame } from "./DeprecatedFrame";
export { FrameWithMotion } from "./FrameWithMotion";
export { BaseFrameProps, FrameLayoutProperties, CSSTransformProperties, VisualProperties } from "./types";
/** @public */
export const DeprecatedFrameWithEvents = WithEvents(DeprecatedFrame);
// const isPreview = RenderEnvironment.target === RenderTarget.preview
// We need switcher component to useContext without conditions
// THIS SHOULD NOT BE USED DIRECTLY IN LIBRARY NOR IN VEKTER
// Only for backwards compatibility
/** @public */
// tslint:disable-next-line:no-shadowed-variable
export const Frame = forwardRef(function Frame(props, ref) {
    const parentSize = useParentSize();
    if (isDeprecatedFrameProps(props)) {
        const currentParentSize = props.parentSize || deprecatedParentSize(parentSize);
        // We use here DeprecatedFrame WithEvents for simplicity
        return React.createElement(DeprecatedFrameWithEvents, Object.assign({}, props, { parentSize: currentParentSize }));
    }
    return React.createElement(FrameWithMotion, Object.assign({}, props, { ref: ref }));
});
Frame.rect = (props, parentSize) => {
    if (isDeprecatedFrameProps(props)) {
        return DeprecatedFrame.rect(props);
    }
    return FrameWithMotion.rect(props);
};
Frame.name = "Frame";
