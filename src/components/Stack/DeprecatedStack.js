import * as React from "react";
import { Layer } from "../../render/presentation/Layer";
import { EmptyState } from "../EmptyState";
import { ConstraintValues, getMergedConstraintsProps } from "../../render/types/Constraints";
import { Size } from "../../render/types/Size";
import { RenderTarget } from "../../render/types/RenderEnvironment";
import { ControlType } from "../../render";
import { BackgroundImage } from "../../render/types/BackgroundImage";
import * as StackLayout from "./layoutUtils";
import { isReactChild, isReactElement } from "../../utils/type-guards";
import { DeprecatedFrame as DeprecatedCoreFrame, DeprecatedFrameWithEvents as DeprecatedFrame, } from "../../render/presentation/Frame";
import { ConsumeParentSize, deprecatedParentSize } from "../../render/types/NewConstraints";
/**
 * @beta
 */
const stackAlignmentOptions = ["start", "center", "end"];
/**
 * @beta
 */
const genericAlignmentTitles = stackAlignmentOptions.map(option => {
    switch (option) {
        case "start":
            return "Start";
        case "center":
            return "Center";
        case "end":
            return "End";
    }
});
/**
 * @beta
 */
const horizontalAlignmentTitles = stackAlignmentOptions.map(option => {
    switch (option) {
        case "start":
            return "Left";
        case "center":
            return "Center";
        case "end":
            return "Right";
    }
});
/**
 * @beta
 */
const verticalAlignmentTitles = stackAlignmentOptions.map(option => {
    switch (option) {
        case "start":
            return "Top";
        case "center":
            return "Center";
        case "end":
            return "Bottom";
    }
});
/**
 * The Stack component will automatically distribute it's contents based on its
 * props. See `StackProperties` for details on configuration.
 *
 * @remarks
 * ```jsx
 * const MyComponent: React.SFC<StackProperties> = props => {
 *   return (
 *     <Stack {...props}>
 *       <Frame>Hello</Frame>
 *     </Stack>
 *   )
 * }
 * ```
 * @internal
 */
export class DeprecatedStack extends Layer {
    constructor() {
        super(...arguments);
        /** @internal */
        this.state = {
            size: null,
            shouldCheckImageAvailability: true,
            currentBackgroundImageSrc: null,
        };
    }
    /** @internal */
    get rect() {
        return StackLayout.calcStackRect(this.props, null);
    }
    /** @internal */
    static getDerivedStateFromProps(nextProps, prevState) {
        const size = StackLayout.calcUpdatedStackComponentSize(nextProps, prevState);
        const target = RenderTarget.current();
        const nextBackgroundImageSrc = nextProps.background && BackgroundImage.isImageObject(nextProps.background)
            ? nextProps.background.src
            : null;
        if (nextBackgroundImageSrc) {
            const shouldCheckImageAvailability = prevState.currentBackgroundImageSrc !== nextBackgroundImageSrc;
            if (shouldCheckImageAvailability !== prevState.shouldCheckImageAvailability) {
                return {
                    size: size,
                    currentBackgroundImageSrc: nextBackgroundImageSrc,
                    shouldCheckImageAvailability: shouldCheckImageAvailability,
                };
            }
        }
        if (prevState.size) {
            if (target === RenderTarget.preview) {
                return null;
            }
            if (prevState.size.width === size.width && prevState.size.height === size.height) {
                return null;
            }
        }
        return {
            size: size,
            currentBackgroundImageSrc: nextBackgroundImageSrc,
            shouldCheckImageAvailability: prevState.shouldCheckImageAvailability,
        };
    }
    /** @internal */
    render() {
        return (React.createElement(ConsumeParentSize, null, ({ size: newParentSize }) => {
            const parentSize = deprecatedParentSize(newParentSize);
            const props = this.props;
            const { visible, placeholders, _forwardedOverrides } = props;
            if (!visible) {
                return null;
            }
            let children = this.props.children;
            if (_forwardedOverrides && children) {
                children = React.Children.map(this.props.children, child => {
                    return React.cloneElement(child, { _forwardedOverrides });
                });
            }
            // Layout
            const invisibleItems = StackLayout.invisibleItemIndexes(children, placeholders);
            const padding = StackLayout.calcPaddingSize(props);
            const constraintValues = ConstraintValues.fromProperties(props);
            const minSize = ConstraintValues.toMinSize(constraintValues, parentSize);
            const minContentSize = Size.subtract(minSize, padding);
            const minChildrenSizes = StackLayout.calcMinChildSizes(children, minContentSize, placeholders);
            const autoSize = StackLayout.calcAutoSize(minChildrenSizes, props, invisibleItems);
            const size = ConstraintValues.toSize(constraintValues, parentSize, autoSize, null);
            const childFractions = StackLayout.calcChildFractions(children);
            const freeSpaceForChildren = StackLayout.calcFreeSpace(size, autoSize, childFractions, props);
            const contentSize = Size.subtract(size, padding);
            const childSizes = StackLayout.calcChildSizes(children, contentSize, freeSpaceForChildren, placeholders);
            const childRects = StackLayout.calcChildLayoutRects(childSizes, contentSize, props, invisibleItems);
            const frameProps = Object.assign({}, this.props);
            Object.keys(DeprecatedStack.defaultStackSpecificProps).map(key => {
                delete frameProps[key];
            });
            const borderProps = this.props;
            if (borderProps._border) {
                const { borderWidth, borderColor, borderStyle } = borderProps._border;
                Object.assign(frameProps, { borderWidth, borderColor, borderStyle });
            }
            return (React.createElement(DeprecatedFrame, Object.assign({}, frameProps),
                this.layoutChildren(childRects, placeholders),
                this.layoutPlaceholders(childRects, placeholders),
                React.createElement(EmptyState, { title: "Drop items", children: this.props.children, size: size, showArrow: false, hide: !!this.props.placeholders, insideUserCodeComponent: !props.__fromCodeComponentNode })));
        }));
    }
    layoutChildren(childRects, placeholders) {
        return React.Children.map(this.props.children, (child, index) => {
            if (!isReactChild(child) || !isReactElement(child)) {
                return child;
            }
            if (placeholders && index >= placeholders.index) {
                index += placeholders.sizes.length;
            }
            const rect = childRects[index];
            const constraints = {
                top: rect.y,
                left: rect.x,
                width: rect.width,
                height: rect.height,
                right: null,
                bottom: null,
                _constraints: { enabled: true },
            };
            const constraintProps = getMergedConstraintsProps(child.props, constraints);
            const props = {
                ...constraintProps,
                style: placeholders
                    ? {
                        ...child.props.style,
                        WebkitTransition: "transform 0.2s ease-out",
                    }
                    : child.props.style,
            };
            return React.cloneElement(child, props);
        });
    }
    layoutPlaceholders(childRects, placeholders) {
        if (!placeholders)
            return null;
        return placeholders.sizes.map((size, index) => {
            const rect = childRects[placeholders.index + index];
            return (React.createElement(DeprecatedFrame, { key: `stack-placeholder-${index}`, top: rect.y, left: rect.x, width: rect.width, height: rect.height, style: { WebkitTransition: "transform 0.2s ease-out" } }));
        });
    }
}
/** @internal */
DeprecatedStack.userInterfaceName = "Stack";
/** @internal */
DeprecatedStack.defaultStackSpecificProps = {
    direction: "vertical",
    distribution: "space-around",
    alignment: "center",
    gap: 10,
    padding: 0,
    paddingPerSide: false,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
};
/** @internal */
DeprecatedStack.defaultProps = {
    ...Layer.defaultProps,
    ...DeprecatedCoreFrame.defaultFrameSpecificProps,
    ...DeprecatedStack.defaultStackSpecificProps,
    background: null,
};
/** @internal */
DeprecatedStack.propertyControls = {
    direction: {
        type: ControlType.SegmentedEnum,
        options: ["horizontal", "vertical"],
        title: "Direction",
        defaultValue: "vertical",
    },
    distribution: {
        type: ControlType.Enum,
        options: ["start", "center", "end", "space-between", "space-around", "space-evenly"],
        optionTitles: ["Start", "Center", "End", "Space Between", "Space Around", "Space Evenly"],
        title: "Distribute",
        defaultValue: "space-around",
    },
    alignment: {
        type: ControlType.SegmentedEnum,
        options: ["start", "center", "end"],
        optionTitles(props) {
            if (!props)
                return genericAlignmentTitles;
            const crossDirectionIsHorizontal = props.direction !== "horizontal";
            return crossDirectionIsHorizontal ? horizontalAlignmentTitles : verticalAlignmentTitles;
        },
        title: "Align",
        defaultValue: "center",
    },
    gap: {
        type: ControlType.Number,
        min: 0,
        title: "Gap",
        hidden: props => {
            return (props.distribution !== undefined &&
                ["space-between", "space-around", "space-evenly"].indexOf(props.distribution) !== -1);
        },
        defaultValue: 10,
    },
    padding: {
        type: ControlType.FusedNumber,
        toggleKey: "paddingPerSide",
        toggleTitles: ["Padding", "Padding per side"],
        valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        valueLabels: ["t", "r", "b", "l"],
        min: 0,
        title: "Padding",
        defaultValue: 0,
    },
};
