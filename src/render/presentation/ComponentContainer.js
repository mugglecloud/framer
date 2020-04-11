import * as React from "react";
import { Layer } from "./Layer";
import { componentLoader } from "../componentLoader";
import { RenderEnvironment, RenderTarget } from "../types/RenderEnvironment";
import { FrameWithMotion } from "./Frame";
import { ComponentPlaceholder, PlaceholderType } from "./ComponentPlaceholder";
import { isReactChild, isReactElement } from "../../utils/type-guards";
import { safeWindow } from "../../utils/safeWindow";
import { calculateRect, ParentSizeState } from "../types/NewConstraints";
// tracking time limits for code components
const TIME_LIMIT = 150; // max millis a component may run for, due to GC etc, we cannot realistically do just 1 or 2 millis
const TIME_LIMIT_PREVIEW = 5000; // in preview, we still want to break endless loops, etc.
const COUNTER_START_VALUE = 200;
let budgetCounter = COUNTER_START_VALUE; // quick check counter
let budgetDeadLine = 0; // deadline
let isRunningInNextFrame = true;
// Called before the component container renders it's children
// children are basically `React.createElement(component.className)`, so will trigger the component's
// lifecycle when the component container's render() method returns.
// But due to react, async, or event handlers, it is hard to exactly maintain a per component budget.
// Basically any async will share it's budget with all other components.
function resetComponentTimeBudget() {
    budgetCounter = COUNTER_START_VALUE;
    const limit = RenderEnvironment.target === RenderTarget.preview ? TIME_LIMIT_PREVIEW : TIME_LIMIT;
    budgetDeadLine = Date.now() + limit;
    // for all async/callbacks/animations we have one global budget per frame
    if (isRunningInNextFrame) {
        isRunningInNextFrame = false;
        setTimeout(() => {
            isRunningInNextFrame = true;
        }, 1);
    }
    // make sure our version of checkbudget is installed
    if (safeWindow["__checkBudget__"] !== checkBudget) {
        safeWindow["__checkBudget__"] = checkBudget;
    }
}
// all component code (but not their libraries) will call this per function or loop entry
// will first do a quick check, then a slower check if we are out of time
function checkBudget() {
    if (--budgetCounter < 0)
        checkBudgetFull();
}
function checkBudgetFull() {
    if (isRunningInNextFrame) {
        resetComponentTimeBudget();
    }
    else if (Date.now() > budgetDeadLine) {
        throw Error("Component exceeded time limit.");
    }
    budgetCounter = COUNTER_START_VALUE;
}
safeWindow["__checkBudget__"] = checkBudget;
/**
 * React context used to determine if we're inside a code component.
 * @internal
 */
export const ComponentContainerContext = React.createContext(false);
/**
 * @internal
 */
export class ComponentContainer extends Layer {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    componentDidCatch(error, info) {
        let stack = info.componentStack.split("\n").filter(line => line.length !== 0);
        let currentIndex = 0;
        for (const line of stack) {
            if (line.startsWith(`    in ${this.constructor.name}`)) {
                break;
            }
            currentIndex++;
        }
        stack = stack.slice(0, currentIndex);
        this.setState({
            lastError: {
                children: this.props.children,
                name: error.name,
                message: error.message,
                componentStack: stack,
            },
        });
    }
    renderErrorPlaceholder(title, message) {
        return (React.createElement(FrameWithMotion, Object.assign({}, this.props, { background: null }),
            React.createElement(ComponentPlaceholder, { type: PlaceholderType.Error, title: title, message: message })));
    }
    render() {
        if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
            safeWindow["perf"].nodeRender();
        let { children } = this.props;
        const { componentIdentifier } = this.props;
        const { lastError: error } = this.state;
        // If the file of the component is in has a compile or load error, there will be no children
        // and there will be an error in the componentLoader. If so we render that error.
        // Note, cannot use React.Children.count when children = [null]
        const noChildren = !children || (Array.isArray(children) && children.filter(c => c).length === 0);
        if (noChildren) {
            const errorComponent = componentLoader.errorForIdentifier(componentIdentifier);
            if (errorComponent) {
                return this.renderErrorPlaceholder(errorComponent.file, errorComponent.error.toString());
            }
        }
        // If an error occurred, componentDidCatch will set error. Additionally, we keep track of the child(ren)
        // reference of this container and only render the error when nothing changed. This means we will
        // re-render the component when something does change, which will either take us out of the error state
        // or update the children reference and keep showing the error. Effectively, this re-probes the component
        // for errors, without throwing an error twice in a row which would make React skip this error boundary
        // and go up the stack.
        if (error && error.children === children) {
            const component = componentLoader.componentForIdentifier(componentIdentifier);
            const file = !!component ? component.file : "???";
            return this.renderErrorPlaceholder(file, error.message);
        }
        resetComponentTimeBudget();
        let frameProps = this.props;
        if (RenderTarget.current() !== RenderTarget.canvas) {
            // For Code Overrides, we want the styling properties to be applied to the Frame,
            // and the rest to the actual component
            const { left, right, top, bottom, center, centerX, centerY, aspectRatio, parentSize, width, height, rotation, opacity, visible, _constraints, _initialStyle, name, 
            // Remove the children and the componentIdentifier from the props passed into the component
            componentIdentifier: originalComponentIdentifier, children: originalChildren, style, ...childProps } = frameProps;
            children = React.Children.map(originalChildren, (child) => {
                if (!isReactChild(child) || !isReactElement(child)) {
                    return child;
                }
                return React.cloneElement(child, childProps);
            });
            frameProps = {
                style,
                _constraints,
                _initialStyle,
                left,
                right,
                top,
                bottom,
                center,
                centerX,
                centerY,
                aspectRatio,
                parentSize,
                width,
                height,
                rotation,
                visible,
                name,
            };
        }
        return (
        /* The background should come before the frameProps. It looks like there never should be a background in frameProps,
         * but published design components can contain an old version of the presentation tree that expects the background
         * that is passed to be rendered here
         * See the stackBackgroundTest.tsx integration test for an example of such a case
         */
        React.createElement(ComponentContainerContext.Provider, { value: true },
            React.createElement(FrameWithMotion, Object.assign({ background: null, overflow: "visible" }, frameProps), children)));
    }
}
ComponentContainer.supportsConstraints = true;
ComponentContainer.defaultComponentContainerProps = {
    style: {},
    visible: true,
    componentIdentifier: "",
};
ComponentContainer.defaultProps = {
    ...Layer.defaultProps,
    ...ComponentContainer.defaultComponentContainerProps,
};
;
ComponentContainer.rect = function (props, parentSize) {
    return calculateRect(props, parentSize || ParentSizeState.Unknown);
};
