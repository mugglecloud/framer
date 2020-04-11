import * as React from "react";
import { FrameWithMotion } from "../render/presentation/Frame";
import { TransitionDefaults, pushTransition, overlayTransition, flipTransition, } from "./NavigationTransitions";
import { NavigationContainer } from "./NavigationContainer";
import { isReactChild, isReactElement } from "../utils/type-guards";
import { injectComponentCSSRules } from "../render/utils/injectComponentCSSRules";
import { navigatorMock } from "./NavigatorMock";
/**
 * @internal
 */
export const NavigationContext = React.createContext(navigatorMock);
/**
 * Provides {@link NavigationInterface} that can be used to start transitions in Framer X.
 * @beta
 */
export const NavigationConsumer = NavigationContext.Consumer;
/**
 * @internal
 */
export class Navigation extends React.Component {
    constructor() {
        super(...arguments);
        this.stack = [];
        this.overlayStack = [];
        this.stackItemID = 0;
        this.state = {
            current: -1,
            previous: -1,
            currentOverlay: -1,
            previousOverlay: -1,
        };
        this.goBack = () => {
            if (this.state.currentOverlay !== -1) {
                this.setState({ currentOverlay: -1, previousOverlay: this.state.currentOverlay });
                return;
            }
            if (this.state.current === 0 || !this.state)
                return;
            this.setState({ current: this.state.current - 1, previous: this.state.current });
        };
    }
    componentDidMount() {
        if (this.stack.length === 0) {
            this.transition(this.props.children, TransitionDefaults.Instant);
        }
        injectComponentCSSRules();
    }
    componentWillReceiveProps(props) {
        this.stack[0].component = props["children"];
    }
    getStackState(options) {
        const { current, previous, currentOverlay, previousOverlay } = this.state;
        if (options.overCurrentContext) {
            return {
                current: currentOverlay,
                previous: previousOverlay,
                stack: this.overlayStack,
            };
        }
        else {
            return { current, previous, stack: this.stack };
        }
    }
    newStackItem(component, transition) {
        this.stackItemID++;
        return {
            key: `stack-${this.stackItemID}`,
            component,
            transition,
        };
    }
    transition(component, transitionTraits, transitionOptions) {
        if (!component)
            return;
        const transition = { ...transitionTraits, ...transitionOptions };
        const overCurrentContext = !!transition.overCurrentContext;
        const stackState = this.getStackState({ overCurrentContext });
        // Don't push to the same Frame twice
        const currentNavigationItem = stackState.stack[stackState.current];
        if (currentNavigationItem && currentNavigationItem.component === component) {
            return;
        }
        const stackItem = this.newStackItem(component, transition);
        if (overCurrentContext) {
            this.overlayStack = [stackItem];
            this.setState({
                currentOverlay: Math.max(0, Math.min(this.state.currentOverlay + 1, this.overlayStack.length - 1)),
                previousOverlay: this.state.currentOverlay,
            });
        }
        else {
            this.stack = this.stack.slice(0, stackState.current + 1);
            this.stack.push(stackItem);
            this.setState({
                current: Math.min(this.state.current + 1, this.stack.length - 1),
                previous: this.state.current,
                currentOverlay: -1,
                previousOverlay: this.state.currentOverlay,
            });
        }
    }
    instant(component) {
        this.transition(component, TransitionDefaults.Instant);
    }
    fade(component, options) {
        this.transition(component, TransitionDefaults.Fade, options);
    }
    push(component, options) {
        this.transition(component, pushTransition(options), options);
    }
    modal(component, options) {
        this.transition(component, TransitionDefaults.Modal, options);
    }
    overlay(component, options) {
        this.transition(component, overlayTransition(options), options);
    }
    flip(component, options) {
        this.transition(component, flipTransition(options), options);
    }
    customTransition(component, transition) {
        this.transition(component, transition);
    }
    render() {
        const stackState = this.getStackState({ overCurrentContext: false });
        const overlayStackState = this.getStackState({ overCurrentContext: true });
        const activeOverlay = activeOverlayItem(overlayStackState);
        return (<FrameWithMotion top={0} left={0} width={"100%"} height={"100%"} position={"relative"} style={{ overflow: "hidden", background: "unset", ...this.props.style }}>
                <NavigationContext.Provider value={this}>
                    <NavigationContainer position={undefined} initialProps={{}} instant={false} transitionProps={transitionPropsForStackWrapper(activeOverlay)} animation={animationForStackWrapper(activeOverlay)} backfaceVisible={backfaceVisibleForStackWrapper(activeOverlay)} visible={true} hideAfterTransition={false} backdropColor={undefined} onTapBackdrop={undefined}>
                        {this.stack.map((item, stackIndex) => {
            return (<NavigationContainer key={item.key} position={item.transition.position} initialProps={initialPropsForContainer(stackIndex, stackState)} transitionProps={transitionPropsForContainer(stackIndex, stackState)} instant={isInstantContainerTransition(stackIndex, stackState)} animation={animationPropsForContainer(stackIndex, stackState)} visible={containerIsVisible(stackIndex, stackState)} hideAfterTransition={containerShouldHideAfterTransition(stackIndex, stackState)} backfaceVisible={getBackfaceVisible(stackIndex, stackState)} backdropColor={undefined} onTapBackdrop={undefined}>
                                    {containerContent(item)}
                                </NavigationContainer>);
        })}
                    </NavigationContainer>
                    {this.overlayStack.map((item, stackIndex) => {
            const hideAfterTransition = containerShouldHideAfterTransition(stackIndex, overlayStackState);
            return (<NavigationContainer key={item.key} position={item.transition.position} initialProps={initialPropsForContainer(stackIndex, overlayStackState)} transitionProps={transitionPropsForContainer(stackIndex, overlayStackState)} instant={isInstantContainerTransition(stackIndex, overlayStackState)} animation={animationPropsForContainer(stackIndex, overlayStackState)} visible={containerIsVisible(stackIndex, overlayStackState)} hideAfterTransition={hideAfterTransition} backdropColor={backdropColorForTransition(item.transition)} backfaceVisible={getBackfaceVisible(stackIndex, overlayStackState)} onTapBackdrop={backdropTapAction(item.transition, hideAfterTransition, this.goBack)}>
                                {containerContent(item)}
                            </NavigationContainer>);
        })}
                </NavigationContext.Provider>
            </FrameWithMotion>);
    }
}
const animationDefault = {
    stiffness: 500,
    damping: 50,
    restDelta: 1,
    type: "spring",
};
function activeOverlayItem(overlayStack) {
    let currentOverlayItem;
    let previousOverlayItem;
    if (overlayStack.current !== -1) {
        currentOverlayItem = overlayStack.stack[overlayStack.current];
    }
    else {
        previousOverlayItem = overlayStack.stack[overlayStack.previous];
    }
    return { currentOverlayItem, previousOverlayItem };
}
function transitionPropsForStackWrapper({ currentOverlayItem }) {
    return currentOverlayItem && currentOverlayItem.transition.exit;
}
function animationForStackWrapper({ currentOverlayItem, previousOverlayItem }) {
    if (currentOverlayItem && currentOverlayItem.transition.animation) {
        return currentOverlayItem.transition.animation;
    }
    if (previousOverlayItem && previousOverlayItem.transition.animation) {
        return previousOverlayItem.transition.animation;
    }
    return animationDefault;
}
function backfaceVisibleForStackWrapper({ currentOverlayItem, previousOverlayItem }) {
    if (currentOverlayItem)
        return currentOverlayItem.transition.backfaceVisible;
    return previousOverlayItem && previousOverlayItem.transition.backfaceVisible;
}
function backdropColorForTransition(transition) {
    if (transition.backdropColor)
        return transition.backdropColor;
    if (transition.overCurrentContext)
        return "rgba(4,4,15,.4)"; // iOS dim color
    return undefined;
}
function getBackfaceVisible(containerIndex, stackState) {
    const { current, stack } = stackState;
    if (containerIndex === current) {
        // current
        const navigationItem = stack[containerIndex];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.backfaceVisible;
        }
        return true;
    }
    else if (containerIndex < current) {
        // old
        const navigationItem = stack[containerIndex + 1];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.backfaceVisible;
        }
        return true;
    }
    else {
        // future
        const navigationItem = stack[containerIndex];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.backfaceVisible;
        }
        return true;
    }
}
function initialPropsForContainer(containerIndex, stackState) {
    const navigationItem = stackState.stack[containerIndex];
    if (navigationItem) {
        return navigationItem.transition.enter;
    }
}
function transitionPropsForContainer(containerIndex, stackState) {
    const { current, stack } = stackState;
    if (containerIndex === current) {
        // current
        return;
    }
    else if (containerIndex < current) {
        // old
        const navigationItem = stack[containerIndex + 1];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.exit;
        }
    }
    else {
        // future
        const navigationItem = stack[containerIndex];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.enter;
        }
    }
}
function animationPropsForContainer(containerIndex, stackState) {
    const { previous, stack } = stackState;
    const current = previous > stackState.current ? stackState.previous : stackState.current;
    if (containerIndex < current) {
        // old
        const navigationItem = stack[containerIndex + 1];
        if (navigationItem && navigationItem.transition.animation) {
            return navigationItem.transition.animation;
        }
    }
    else if (containerIndex !== current) {
        // future
        const navigationItem = stack[containerIndex];
        if (navigationItem && navigationItem.transition.animation) {
            return navigationItem.transition.animation;
        }
    }
    else {
        // current
        const navigationItem = stack[containerIndex];
        if (navigationItem.transition.animation)
            return navigationItem.transition.animation;
    }
    return animationDefault;
}
function isInstantContainerTransition(containerIndex, stackState) {
    const { current, previous } = stackState;
    if (containerIndex !== previous && containerIndex !== current)
        return true;
    if (current === previous)
        return true;
    return false;
}
function containerIsVisible(containerIndex, stackState) {
    const { current, previous, stack } = stackState;
    if (containerIndex > current && containerIndex > previous)
        return false;
    if (containerIndex === current || containerIndex === previous)
        return true;
    // containerIndex is smaller then previous or current
    const nextNavigationItem = stack[containerIndex];
    return nextNavigationItem && nextNavigationItem.transition.overCurrentContext === true;
}
function containerShouldHideAfterTransition(containerIndex, stackState) {
    const { current, previous, stack } = stackState;
    if (containerIndex !== previous)
        return false;
    if (containerIndex > current) {
        return true;
    }
    else {
        const navigationItem = stack[current];
        return !navigationItem || navigationItem.transition.overCurrentContext !== true;
    }
}
function containerContent(item) {
    return React.Children.map(item.component, (child) => {
        if (!isReactChild(child) || !isReactElement(child) || !child.props) {
            return child;
        }
        const props = {};
        const { position } = item.transition;
        const shouldStretchWidth = !position || (position.left !== undefined && position.right !== undefined);
        const shouldStretchHeight = !position || (position.top !== undefined && position.bottom !== undefined);
        const canStretchWidth = "width" in child.props;
        const canStretchHeight = "height" in child.props;
        if (shouldStretchWidth && canStretchWidth) {
            props.width = "100%";
        }
        if (shouldStretchHeight && canStretchHeight) {
            props.height = "100%";
        }
        return React.cloneElement(child, props);
    });
}
function backdropTapAction(transition, hideAfterTransition, goBackAction) {
    if (!hideAfterTransition && transition.goBackOnTapOutside !== false) {
        return goBackAction;
    }
}
