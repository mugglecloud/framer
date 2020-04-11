import * as React from "react";
import { Layer } from "../Layer";
import { ConstraintValues, isConstraintSupportingChild, constraintDefaults, } from "../../types/Constraints";
import { Border } from "../../style/BorderComponent";
import { Color } from "../../types/Color";
import { imageUrlForFill } from "../../utils/imageForFill";
import { RenderTarget, RenderEnvironment } from "../../types/RenderEnvironment";
import { Animatable, isAnimatable } from "../../../animation/Animatable";
import { ObservableObject } from "../../../data/ObservableObject";
import { BackgroundImage } from "../../types/BackgroundImage";
import { collectVisualStyleFromProps } from "../../style/collectVisualStyleFromProps";
import { collectTransformFromProps, transformDefaults } from "../../traits/Transform";
import { collectBackgroundImageFromProps } from "../../style/collectBackgroundImageFromProps";
import { safeWindow } from "../../../utils/safeWindow";
import { ProvideParentSize, ConstraintsContext, ParentSizeState } from "../../types/NewConstraints";
import { isFiniteNumber } from "../../utils/isFiniteNumber";
function toPixelString(value) {
    return isFiniteNumber(value) ? `${value}px` : value;
}
function applyLayoutProp(style, props, key) {
    if (props[key] !== undefined) {
        const value = Animatable.get(props[key], undefined);
        style[key] = toPixelString(value);
    }
}
/**
 * @public
 */
export class DeprecatedFrame extends Layer {
    constructor() {
        super(...arguments);
        this.element = null;
        this.imageDidChange = false;
        this.state = {
            size: null,
        };
        this.updateStyle = () => {
            if (!this.element) {
                return;
            }
            Object.assign(this.element.style, this.getStyle());
        };
        this.setElement = (element) => {
            this.element = element;
        };
        this.onPropsChange = (props) => {
            const rect = DeprecatedFrame.rect(Animatable.objectToValues(props.value));
            if (this.state.size && isAnimatable(this.state.size.width) && isAnimatable(props.value.width)) {
                this.state.size.width.set(rect.width);
            }
            if (this.state.size && isAnimatable(this.state.size.height) && isAnimatable(props.value.height)) {
                this.state.size.height.set(rect.height);
            }
            this.updateStyle();
        };
        this.onSizeChange = () => {
            this.updateStyle();
        };
        /** @internal */
        this.checkImageAvailability = (qualityOptions) => {
            const { background } = this.props;
            if (!background || !BackgroundImage.isImageObject(background))
                return;
            const image = new Image();
            image.src = imageUrlForFill(background, qualityOptions);
            image.onerror = () => {
                if (!this.element)
                    return;
                this.element.style.backgroundImage = imageUrlForFill(background);
            };
        };
    }
    static rect(props) {
        const constraintValues = ConstraintValues.fromProperties(props);
        return ConstraintValues.toRect(constraintValues, props.parentSize || null, null, true);
    }
    get rect() {
        return DeprecatedFrame.rect(this.props);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const size = DeprecatedFrame.updatedSize(nextProps, prevState);
        const { target } = RenderEnvironment;
        const nextBackgroundImageSrc = nextProps.background && BackgroundImage.isImageObject(nextProps.background)
            ? nextProps.background.src
            : null;
        if (nextBackgroundImageSrc) {
            return {
                size: size,
            };
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
        };
    }
    static updatedSize(props, state) {
        const rect = DeprecatedFrame.rect(props);
        let size = state.size;
        const newSize = { width: rect.width, height: rect.height };
        const { target } = RenderEnvironment;
        if (!size) {
            if (target === RenderTarget.preview) {
                size = ObservableObject(newSize, true);
            }
            else {
                size = newSize;
            }
        }
        else {
            if (isAnimatable(size.width) && isAnimatable(size.height)) {
                size.width.set(newSize.width);
                size.height.set(newSize.height);
            }
            else {
                size = newSize;
            }
        }
        return size;
    }
    getStyle() {
        const rect = this.rect;
        const style = {
            display: "block",
            position: "absolute",
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            pointerEvents: undefined,
            userSelect: "none",
        };
        let left = Animatable.get(this.props.left, undefined);
        let top = Animatable.get(this.props.top, undefined);
        Object.assign(style, this.props._initialStyle);
        const hasParentSize = this.context.size !== ParentSizeState.Disabled;
        const perspective = Animatable.get(this.props.perspective, undefined);
        style.perspective = perspective;
        style.WebkitPerspective = perspective;
        let backfaceVisibility = undefined;
        const backfaceVisible = Animatable.get(this.props.backfaceVisible, undefined);
        if (backfaceVisible === true) {
            backfaceVisibility = "visible";
        }
        else if (backfaceVisible === false) {
            backfaceVisibility = "hidden";
        }
        style.backfaceVisibility = backfaceVisibility;
        style.WebkitBackfaceVisibility = backfaceVisibility;
        const preserve3d = Animatable.get(this.props.preserve3d, undefined);
        if (preserve3d === true) {
            style.transformStyle = "preserve-3d";
        }
        else if (preserve3d === false) {
            style.transformStyle = "flat";
        }
        /**
         * If we don't have ParentSizeState, we can't correctly figure out x/y position based
         * on the parent size and this component's width/height. So we can apply right and bottom
         * directly and let the DOM layout figure out the rest.
         */
        if (!hasParentSize) {
            applyLayoutProp(style, this.props, "right");
            applyLayoutProp(style, this.props, "bottom");
            // If `left` and `top` have been provided here as a percentage from Vekter,
            // these percentages are calculated from the center of the div
            const width = Animatable.get(this.props.width, undefined);
            const stringWidth = toPixelString(width);
            const height = Animatable.get(this.props.height, undefined);
            const stringHeight = toPixelString(height);
            if (typeof left === "string" && left.endsWith("%") && this.props.right === null) {
                left = `calc(${left} - calc(${stringWidth}} / 2))`;
                style.width = stringWidth;
            }
            if (typeof top === "string" && top.endsWith("%") && this.props.bottom === null) {
                top = `calc(${top} - calc(${stringHeight} / 2))`;
                style.height = stringHeight;
            }
            // If pinned to both, reset physical dimensions
            if (top !== undefined && style.bottom !== undefined) {
                style.height = undefined;
                top = toPixelString(Animatable.get(this.props.top, undefined));
            }
            else {
                style.height = stringHeight;
            }
            if (left !== undefined && style.right !== undefined) {
                style.width = undefined;
                left = toPixelString(Animatable.get(this.props.left, undefined));
            }
            else {
                style.width = stringWidth;
            }
        }
        const transformRect = { ...rect };
        if (typeof left !== "undefined") {
            transformRect.x = left;
        }
        if (typeof top !== "undefined") {
            transformRect.y = top;
        }
        collectTransformFromProps(this.props, transformRect, style);
        collectVisualStyleFromProps(this.props, style);
        collectBackgroundImageFromProps(this.props, rect, style);
        Layer.applyWillChange(this.props, style, false);
        // TODO disable style overrides in strict mode
        if (this.props.style) {
            Object.assign(style, this.props.style);
        }
        return style;
    }
    componentDidMount() {
        const { target } = RenderEnvironment;
        if (target === RenderTarget.preview) {
            this.propsObserver = ObservableObject(this.props, true);
            this.propsObserverCancel = ObservableObject.addObserver(this.propsObserver, this.onPropsChange);
            if (this.props.parentSize &&
                isAnimatable(this.props.parentSize.width) &&
                isAnimatable(this.props.parentSize.height)) {
                this.sizeObserver = ObservableObject(this.props.parentSize, true);
                this.sizeObserverCancel = ObservableObject.addObserver(this.sizeObserver, this.onSizeChange);
            }
        }
    }
    componentDidUpdate() {
        const { target } = RenderEnvironment;
        this.propsObserverCancel && this.propsObserverCancel();
        this.sizeObserverCancel && this.sizeObserverCancel();
        if (target === RenderTarget.preview) {
            this.propsObserver = ObservableObject(this.props, true);
            this.propsObserverCancel = ObservableObject.addObserver(this.propsObserver, this.onPropsChange);
            if (this.props.parentSize &&
                isAnimatable(this.props.parentSize.width) &&
                isAnimatable(this.props.parentSize.height)) {
                this.sizeObserver = ObservableObject(this.props.parentSize, true);
                this.sizeObserverCancel = ObservableObject.addObserver(this.sizeObserver, this.onSizeChange);
            }
        }
    }
    componentWillUnmount() {
        this.propsObserverCancel && this.propsObserverCancel();
        this.propsObserverCancel = undefined;
        this.sizeObserverCancel && this.sizeObserverCancel();
        this.sizeObserverCancel = undefined;
    }
    render() {
        if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
            safeWindow["perf"].nodeRender();
        const { visible, id, className } = this.props;
        if (!visible) {
            return null;
        }
        const style = this.getStyle();
        const rect = this.rect;
        const parentSize = { width: rect.width, height: rect.height };
        return (React.createElement("div", { id: id, style: style, ref: this.setElement, className: className },
            React.createElement(ProvideParentSize, { parentSize: parentSize }, this.layoutChildren()),
            React.createElement(Border, Object.assign({}, this.props))));
    }
    layoutChildren() {
        let _forwardedOverrides = this.props._forwardedOverrides;
        const extractions = this.props._overrideForwardingDescription;
        if (extractions) {
            let added = false;
            _forwardedOverrides = {};
            for (const key in extractions) {
                added = true;
                _forwardedOverrides[key] = this.props[extractions[key]];
            }
            if (!added) {
                _forwardedOverrides = undefined;
            }
        }
        let children = React.Children.map(this.props.children, (child) => {
            if (isConstraintSupportingChild(child)) {
                return React.cloneElement(child, {
                    parentSize: this.state.size,
                    _forwardedOverrides,
                });
            }
            else if (_forwardedOverrides && child) {
                return React.cloneElement(child, { _forwardedOverrides });
            }
            else {
                return child;
            }
        });
        // We wrap raw strings in a default style to display
        if (children && children.length === 1 && typeof children[0] === "string") {
            children = [React.createElement(Center, { key: "0" }, children)];
        }
        return children;
    }
}
DeprecatedFrame.supportsConstraints = true;
DeprecatedFrame.defaultFrameSpecificProps = {
    ...constraintDefaults,
    ...transformDefaults,
    opacity: 1,
    background: Color("rgba(0, 170, 255, 0.3)"),
    visible: true,
    borderWidth: 0,
    borderColor: "#222",
    borderStyle: "solid",
};
DeprecatedFrame.defaultProps = {
    ...Layer.defaultProps,
    ...DeprecatedFrame.defaultFrameSpecificProps,
};
DeprecatedFrame.contextType = ConstraintsContext;
export const Center = props => {
    const style = Object.assign({}, {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Helvetica",
    }, props.style || {});
    return React.createElement("div", { style: style }, props.children);
};
