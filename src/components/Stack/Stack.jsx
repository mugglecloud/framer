import * as React from "react";
import { FrameWithMotion, isFiniteNumber, Layer } from "../../render";
import { isReactChild, isReactElement } from "../../utils/type-guards";
import { paddingFromProps, makePaddingString } from "../utils/paddingFromProps";
import { useProvideParentSize, ParentSizeState, constraintsEnabled } from "../../render/types/NewConstraints";
import { unwrapFrameProps } from "../../render/presentation/Frame/FrameWithMotion";
import { processOverrideForwarding } from "../../render/utils/processOverrideForwarding";
import { injectComponentCSSRules } from "../../render/utils/injectComponentCSSRules";
/**
 * @beta
 */
// tslint:disable-next-line:no-shadowed-variable
export const Stack = React.memo(function Stack({ direction = "vertical", distribution = "start", alignment = "center", gap = 10, children, style: styleProp, willChangeTransform, __fromCodeComponentNode, ...containerProps }) {
    injectComponentCSSRules();
    const flexDirection = toFlexDirection(direction);
    const isReverse = isReverseDirection(flexDirection);
    const justifyContent = toJustifyOrAlignment(distribution);
    const style = {
        display: "flex",
        flexDirection,
        justifyContent: justifyContent,
        alignItems: toJustifyOrAlignment(alignment),
        padding: makePaddingString(paddingFromProps(containerProps)),
        ...styleProp,
    };
    Layer.applyWillChange({ willChangeTransform }, style, true);
    if (__fromCodeComponentNode && !constraintsEnabled(unwrapFrameProps(containerProps))) {
        containerProps.width = "100%";
        containerProps.height = "100%";
        containerProps._constraints = { enabled: true };
    }
    const { children: _children, props } = processOverrideForwarding(containerProps, children);
    children = _children;
    containerProps = props;
    const childCount = React.Children.count(children);
    let background = "none";
    if (!__fromCodeComponentNode && childCount === 0) {
        background = "rgba(0, 170, 255, 0.3)";
    }
    const fractionChildren = handleFraction(children, direction);
    const gapChildren = wrapInGapElement(fractionChildren, gap, flexDirection, justifyContent);
    const content = useProvideParentSize(gapChildren, ParentSizeState.Disabled);
    return (<FrameWithMotion background={background} // need to set here to prevent default background from Frame
     {...containerProps} data-framer-component-type={"Stack"} data-framer-stack-direction-reverse={isReverse} style={style}>
            {content}
        </FrameWithMotion>);
});
/**
 * Private helper function
 */
function isFractionDimension(dimension) {
    return typeof dimension === "string" && dimension.endsWith("fr");
}
function fraction(dimension) {
    const value = parseFloat(dimension);
    return isFiniteNumber(value) ? value : 0;
}
function handleFraction(children, direction) {
    return React.Children.map(children, child => {
        if (!isReactChild(child) || !isReactElement(child))
            return;
        const isVertical = direction === "vertical";
        const style = {};
        let hasFraction = false;
        const { style: propsStyle, size } = child.props;
        let { width, height } = child.props;
        // convert size to width and height if they are not set already
        if (size !== undefined) {
            if (width === undefined)
                width = size;
            if (height === undefined)
                height = size;
        }
        let newWidth = width;
        let newHeight = height;
        if (isFractionDimension(width)) {
            hasFraction = true;
            hasFraction = true;
            if (isVertical) {
                newWidth = `${fraction(width) * 100}%`;
            }
            else {
                newWidth = 1;
                style.flexGrow = fraction(width);
                style.flexBasis = 0;
            }
            style.width = newWidth;
        }
        if (isFractionDimension(height)) {
            hasFraction = true;
            if (isVertical) {
                newHeight = 1;
                style.flexGrow = fraction(height);
                style.flexBasis = 0;
            }
            else {
                newHeight = `${fraction(height) * 100}%`;
            }
            style.height = newHeight;
        }
        if (!hasFraction)
            return child;
        const nextStyle = { ...propsStyle, ...style };
        return React.cloneElement(child, {
            width: newWidth,
            height: newHeight,
            style: nextStyle,
        });
    });
}
function isGapEnabled(gap, justifyContent) {
    if (!gap) {
        return false;
    }
    if (justifyContent && ["space-between", "space-around", "space-evenly", "stretch"].indexOf(justifyContent) !== -1) {
        return false;
    }
    return true;
}
function wrapInGapElement(children, gap, direction, justifyContent) {
    if (!isGapEnabled(gap, justifyContent)) {
        return children;
    }
    const isVertical = isVerticalDirection(direction);
    const gapStyle = {
        display: "contents",
        ["--stack-gap-x"]: `${isVertical ? 0 : gap}px`,
        ["--stack-gap-y"]: `${isVertical ? gap : 0}px`,
    };
    return (<div data-framer-stack-gap={true} style={gapStyle}>
            {children}
        </div>);
}
function toFlexDirection(direction) {
    switch (direction) {
        case "vertical":
            return "column";
        case "horizontal":
            return "row";
        default:
            return direction;
    }
}
function isVerticalDirection(direction) {
    return direction === "column" || direction === "column-reverse";
}
function isReverseDirection(direction) {
    switch (direction) {
        case "column-reverse":
        case "row-reverse":
            return true;
        default:
            return false;
    }
}
/** @internal */
export function toJustifyOrAlignment(distribution) {
    switch (distribution) {
        case "start":
            return "flex-start";
        case "end":
            return "flex-end";
        default:
            return distribution;
    }
}
