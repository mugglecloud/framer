import * as React from "react";
import { forwardRef } from "react";
import { motion, unwrapMotionValue, useExternalRef, isValidMotionProp } from "framer-motion";
import { safeWindow } from "../../../utils/safeWindow";
import isPropValid from "@emotion/is-prop-valid";
import { Layer } from "../Layer";
import { Border } from "../../style/BorderComponent";
import { collectBackgroundImageFromProps } from "../../style/collectBackgroundImageFromProps";
import { BackgroundImage } from "../../types/BackgroundImage";
import { setImageForFill } from "../../utils/imageForFill";
import { getStyleForFrameProps, hasLeftAndRight, hasTopAndBottom } from "./getStyleForFrameProps";
import { transformValues } from "../../utils/transformCustomValues";
import { useConstraints, useProvideParentSize, constraintsEnabled, ParentSizeState, calculateRect, } from "../../types/NewConstraints";
import { processOverrideForwarding } from "../../utils/processOverrideForwarding";
import { RenderTarget } from "../../types/RenderEnvironment";
import { injectComponentCSSRules } from "../../utils/injectComponentCSSRules";
function useBackgroundImage(props, rect, ref) {
    let backgroundImage;
    if (BackgroundImage.isImageObject(props.background)) {
        backgroundImage = props.background;
    }
    const nextBackgroundImageSrc = props.background && backgroundImage ? backgroundImage.src : null;
    if (!backgroundImage)
        return {};
    const style = {};
    if (nextBackgroundImageSrc) {
        if (rect === null) {
            setImageForFill(props.background, null, style);
            return style;
        }
    }
    collectBackgroundImageFromProps(props, rect, style);
    return style;
}
function hasEvents(props) {
    for (const key in props) {
        if (key === "drag" || key.startsWith("while") || (typeof props[key] === "function" && key.startsWith("on"))) {
            return true;
        }
    }
    return false;
}
export function unwrapFrameProps(frameProps) {
    const { left, top, bottom, right, width, height, center, _constraints, size } = frameProps;
    const constraintProps = {
        top: unwrapMotionValue(top),
        left: unwrapMotionValue(left),
        bottom: unwrapMotionValue(bottom),
        right: unwrapMotionValue(right),
        width: unwrapMotionValue(width),
        height: unwrapMotionValue(height),
        size: unwrapMotionValue(size),
        center,
        _constraints,
    };
    return constraintProps;
}
export const defaultFrameRect = { x: 0, y: 0, width: 200, height: 200 };
function useStyleAndRect(props, externalRef) {
    injectComponentCSSRules();
    const { style, _initialStyle, size } = props;
    const unwrappedProps = unwrapFrameProps(props);
    const constraintsRect = useConstraints(unwrappedProps);
    const backgroundStyle = useBackgroundImage(props, constraintsRect || defaultFrameRect, externalRef);
    const defaultStyle = {
        display: "block",
        flexShrink: 0,
        userSelect: "none",
        // XXX: this is hack until we find a better solution
        backgroundColor: props.background === undefined ? "rgba(0, 170, 255, 0.3)" : undefined,
    };
    if (!hasEvents(props)) {
        defaultStyle.pointerEvents = "none";
    }
    const addTextCentering = React.Children.count(props.children) > 0 &&
        React.Children.map(props.children, child => {
            return typeof child === "string" || typeof child === "number";
        }).every(value => !!value);
    const centerTextStyle = addTextCentering && {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    };
    const propsStyle = getStyleForFrameProps(props);
    if (size === undefined) {
        if (!hasLeftAndRight(propsStyle)) {
            defaultStyle.width = defaultFrameRect.width;
        }
        if (!hasTopAndBottom(propsStyle)) {
            defaultStyle.height = defaultFrameRect.height;
        }
    }
    let constraintsStyle = {};
    if (constraintsRect && constraintsEnabled(unwrappedProps)) {
        constraintsStyle = {
            left: constraintsRect.x,
            top: constraintsRect.y,
            width: constraintsRect.width,
            height: constraintsRect.height,
            right: undefined,
            bottom: undefined,
        };
        if (RenderTarget.current() === RenderTarget.canvas) {
            constraintsStyle = {
                ...constraintsStyle,
                left: 0,
                top: 0,
                // Framer Motion has an optimization where it will not set the transform if it is 0,
                // Setting the x or y to 0px works around that so transform is always set
                x: constraintsRect.x === 0 ? "0px" : constraintsRect.x,
                y: constraintsRect.y === 0 ? "0px" : constraintsRect.y,
            };
        }
    }
    // In theory we should not have constraints and props styles at the same time
    // because we use constraints internally in vekter and top level props are only for usage from customer code
    //
    // In practice we have it with code overrides
    // But we take `propsStyle` priority in any case now
    Object.assign(defaultStyle, backgroundStyle, centerTextStyle, _initialStyle, propsStyle, constraintsStyle, style);
    Layer.applyWillChange(props, defaultStyle, true);
    let resultStyle = defaultStyle;
    if (!defaultStyle.transform) {
        // Reset the transform explicitly, because Framer Motion will not treat undefined values as 0 and still generate a transform
        resultStyle = { x: 0, y: 0, ...defaultStyle };
    }
    return [resultStyle, constraintsRect];
}
// These properties are considered valid React DOM props because they're valid
// SVG props, so we need to manually exclude them.
const filteredProps = new Set([
    "width",
    "height",
    "opacity",
    "overflow",
    "radius",
    "background",
    "color",
    "x",
    "y",
    "z",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scaleX",
    "scaleY",
    "skew",
    "skewX",
    "skewY",
    "originX",
    "originY",
    "originZ",
]);
function getMotionProps(props) {
    const motionProps = {};
    for (const key in props) {
        const isValid = isValidMotionProp(key) || isPropValid(key);
        if (isValid && !filteredProps.has(key)) {
            motionProps[key] = props[key];
        }
    }
    return motionProps;
}
export const FrameWithMotion = Object.assign(
// tslint:disable-next-line:no-shadowed-variable
forwardRef(function FrameWithMotion(props, ref) {
    if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
        safeWindow["perf"].nodeRender();
    const { visible = true } = props;
    if (!visible) {
        return null;
    }
    return React.createElement(VisibleFrame, Object.assign({}, props, { ref: ref }));
}), {
    rect(props, parentSize) {
        return calculateRect(unwrapFrameProps(props), parentSize || ParentSizeState.Unknown);
    },
});
const VisibleFrame = forwardRef((props, ref) => {
    const { _border, style, name, center, border } = props;
    const { props: propsWithOverrides, children } = processOverrideForwarding(props);
    const motionProps = getMotionProps(propsWithOverrides);
    const externalRef = useExternalRef(ref);
    const [currentStyle, rect] = useStyleAndRect(propsWithOverrides, externalRef);
    if (center && !(rect && constraintsEnabled(unwrapFrameProps(propsWithOverrides)))) {
        motionProps.transformTemplate = (_, generated) => {
            if (center === true) {
                return `translate(-50%, -50%) ${generated}`;
            }
            else {
                if (center === "x") {
                    return `translateX(-50%) ${generated}`;
                }
                else if (center === "y") {
                    return `translateY(-50%) ${generated}`;
                }
            }
            return generated;
        };
    }
    const dataProps = {
        "data-framer-component-type": "Frame",
    };
    if (name !== undefined) {
        dataProps["data-framer-name"] = name;
    }
    const parentSize = rect ? { width: rect.width, height: rect.height } : ParentSizeState.Disabled;
    const wrappedContent = useProvideParentSize(React.createElement(React.Fragment, null,
        children,
        React.createElement(Border, Object.assign({}, _border, { border: border }))), parentSize);
    return (React.createElement(motion.div, Object.assign({}, dataProps, motionProps, { style: currentStyle, ref: externalRef, transformValues: transformValues }), wrappedContent));
});
