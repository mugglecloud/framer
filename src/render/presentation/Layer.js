import * as React from "react";
import { isEqual } from "../utils/isEqual";
import { RenderEnvironment, RenderTarget } from "../types/RenderEnvironment";
import { resetSetStyle } from "../utils/useWebkitFixes";
import { elementForComponent } from "../utils/elementForComponent";
import { forceLayerBackingWithMotionStyle, forceLayerBackingWithCSSProperties } from "../utils/setLayerBacked";
/**
 * @public
 */
export class Layer extends React.Component {
    constructor() {
        super(...arguments);
        this.previousZoom = RenderEnvironment.zoom;
    }
    static applyWillChange(props, style, usingMotionStyle) {
        const shouldApply = props.willChangeTransform || RenderTarget.current() === RenderTarget.export;
        if (shouldApply) {
            if (usingMotionStyle) {
                forceLayerBackingWithMotionStyle(style);
            }
            else {
                forceLayerBackingWithCSSProperties(style);
            }
        }
    }
    /** @internal */
    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || !isEqual(this.props, nextProps);
    }
    /** @internal */
    componentDidUpdate(prevProps) {
        const { zoom } = RenderEnvironment;
        // Workarounds for WebKit bugs
        // Some styles have to be toggled to take effect in certain situations.
        // Not using type safety, uses lots of internal knowledge for efficiency
        // To use this as a hook, see useWebKitFixes
        const element = elementForComponent(this);
        if (zoom !== this.previousZoom && this.props["blendingMode"] && this.props["blendingMode"] !== "normal") {
            resetSetStyle(element, "mixBlendMode", this.props["blendingMode"]);
        }
        if (this.props["clip"] && this.props["radius"] === 0 && prevProps["radius"] !== 0) {
            resetSetStyle(element, "overflow", "hidden", false);
        }
        this.previousZoom = zoom;
    }
}
Layer.defaultProps = {};
