import * as React from "react";
import { FrameWithMotion } from "../render/presentation/Frame";
import { isEqual, isFiniteNumber } from "../render";
export class NavigationContainer extends React.Component {
    constructor() {
        super(...arguments);
        this.unmounted = false;
        this.state = {
            visible: true,
            containerPerspective: 0,
            previousProps: null,
            origins: {},
        };
        this.onTransitionEnd = () => {
            if (this.unmounted)
                return;
            const visible = this.props.hideAfterTransition ? false : this.state.visible;
            const containerPerspective = needsPerspective(this.props.transitionProps) ? 1200 : 0;
            if (visible !== this.state.visible || containerPerspective !== this.state.containerPerspective) {
                this.setState({
                    visible,
                    containerPerspective,
                });
            }
        };
    }
    componentWillUnmount() {
        this.unmounted = true;
    }
    static getDerivedStateFromProps(props, state) {
        if (isEqual(props, state.previousProps))
            return null;
        const newState = { ...state, previousProps: props };
        const shouldBeVisible = props.visible && !props.hideAfterTransition;
        if (shouldBeVisible) {
            newState.visible = true;
        }
        if (!props.visible) {
            newState.visible = false;
        }
        const wantsPerspective = contains3Dprops(props.transitionProps) || contains3Dprops(props.initialProps);
        newState.containerPerspective = wantsPerspective ? 1200 : 0;
        newState.origins = getOriginProps(state.origins, props.initialProps, props.transitionProps);
        return newState;
    }
    componentDidUpdate() {
        const instant = this.props.instant || this.props.animation.type === false;
        if (instant)
            this.onTransitionEnd();
    }
    render() {
        const { backdropColor, onTapBackdrop, backfaceVisible, hideAfterTransition, animation, instant, initialProps, transitionProps, position = { top: 0, right: 0, bottom: 0, left: 0 }, } = this.props;
        const { visible, containerPerspective, origins } = this.state;
        const transition = instant ? { type: false } : animation;
        const layout = { ...position };
        if (layout.left === undefined || layout.right === undefined)
            layout.width = "auto";
        if (layout.top === undefined || layout.bottom === undefined)
            layout.height = "auto";
        return (React.createElement(FrameWithMotion, { width: "100%", height: "100%", style: {
                position: "absolute",
                transformStyle: "flat",
                background: "transparent",
                overflow: "hidden",
                perspective: containerPerspective,
                visibility: visible ? "visible" : "hidden",
            } },
            React.createElement(FrameWithMotion, { width: "100%", height: "100%", transition: transition, initial: { opacity: instant && visible ? 1 : 0 }, animate: { opacity: hideAfterTransition ? 0 : 1 }, background: backdropColor ? backdropColor : "transparent", onTap: onTapBackdrop }),
            React.createElement(FrameWithMotion, Object.assign({}, layout, { initial: { ...allAnimatableProperties, ...origins, ...initialProps }, animate: { ...allAnimatableProperties, ...origins, ...transitionProps }, transition: {
                    default: transition,
                    originX: { type: false },
                    originY: { type: false },
                    originZ: { type: false },
                }, background: "transparent", backfaceVisible: backfaceVisible, "data-framer-component-type": "NavigationContainer", onAnimationComplete: this.onTransitionEnd }),
                this.props.children,
                hideAfterTransition && (React.createElement(FrameWithMotion // Block pointer events from starting a new transition
                , { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "transparent", style: { pointerEvents: "auto" } })))));
    }
}
function getOriginProps(currentOriginProps, initialProps, transitionProps) {
    const result = { ...currentOriginProps };
    if (initialProps) {
        if (isFiniteNumber(initialProps.originX))
            result.originX = initialProps.originX;
        if (isFiniteNumber(initialProps.originY))
            result.originY = initialProps.originY;
        if (isFiniteNumber(initialProps.originZ))
            result.originZ = initialProps.originZ;
    }
    if (transitionProps) {
        if (isFiniteNumber(transitionProps.originX))
            result.originX = transitionProps.originX;
        if (isFiniteNumber(transitionProps.originY))
            result.originY = transitionProps.originY;
        if (isFiniteNumber(transitionProps.originZ))
            result.originZ = transitionProps.originZ;
    }
    return result;
}
function needsPerspective(containerProps) {
    if (!containerProps)
        return false;
    const { rotateX, rotateY, z } = containerProps;
    if (isFiniteNumber(rotateX) && rotateX % 180 !== 0)
        return true;
    if (isFiniteNumber(rotateY) && rotateY % 180 !== 0)
        return true;
    if (isFiniteNumber(z) && z !== 0)
        return true;
    return false;
}
function contains3Dprops(containerProps) {
    if (!containerProps)
        return false;
    return "rotateX" in containerProps || "rotateY" in containerProps || "z" in containerProps;
}
const allAnimatableProperties = {
    x: 0,
    y: 0,
    z: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    skew: 0,
    skewX: 0,
    skewY: 0,
    originX: 0.5,
    originY: 0.5,
    originZ: 0,
    opacity: 1,
};
