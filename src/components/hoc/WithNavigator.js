import * as React from "react";
import { NavigationTransitionType, } from "../../render";
import { NavigationContext } from "../Navigation";
const hoistNonReactStatic = require("hoist-non-react-statics");
/**
 * @internal
 * @deprecated - Will be replaced. Use navigation action instead.
 */
export function WithNavigator(BaseComponent, navigationTransition, navigationTransitionDirection, NavigationTarget, navigationTransitionOptions) {
    const withNavigator = class extends React.Component {
        render() {
            return (React.createElement(NavigationContext.Consumer, null, navigation => {
                const navigate = () => {
                    if (navigationTransition === "goBack") {
                        navigation.goBack();
                        return;
                    }
                    if (!NavigationTarget)
                        return;
                    const component = NavigationTarget();
                    const appearsFrom = transitionDirectionToSide(navigationTransitionDirection);
                    switch (navigationTransition) {
                        case NavigationTransitionType.instant:
                            navigation.instant(component);
                            break;
                        case NavigationTransitionType.fade:
                            navigation.fade(component);
                            break;
                        case NavigationTransitionType.modal:
                            navigation.modal(component, navigationTransitionOptions);
                            break;
                        case NavigationTransitionType.push:
                            navigation.push(component, { appearsFrom });
                            break;
                        case NavigationTransitionType.overlay:
                            navigation.overlay(component, {
                                ...navigationTransitionOptions,
                                appearsFrom,
                            });
                            break;
                        case NavigationTransitionType.flip:
                            navigation.flip(component, { appearsFrom });
                            break;
                    }
                };
                // Invoke the component’s normal onTap handler as well as the navigation function.
                const { onTap, ...props } = this.props;
                if (onTap) {
                    props.onTap = (...args) => {
                        onTap.apply(this, args);
                        navigate.apply(this, args);
                    };
                }
                else {
                    props.onTap = navigate;
                }
                return React.createElement(BaseComponent, Object.assign({}, props));
            }));
        }
    };
    hoistNonReactStatic(withNavigator, BaseComponent);
    return withNavigator;
}
// Convert deprecated transitionDirection to transitionSide
function transitionDirectionToSide(direction) {
    switch (direction) {
        case "left":
            return "right";
        case "right":
            return "left";
        case "up":
            return "bottom";
        case "down":
            return "top";
    }
}
