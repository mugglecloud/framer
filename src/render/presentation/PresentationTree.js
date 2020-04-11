import * as React from "react";
import { componentLoader, isReactDefinition } from "../componentLoader";
import { ComponentContainerLoader } from "./ComponentContainerLoader";
import { isEqual } from "../utils/isEqual";
import { isShallowEqualArray } from "../utils/isShallowEqualArray";
import { serverURL } from "../utils/serverURL";
import { safeWindow } from "../../utils/safeWindow";
/**
 * @internal
 */
export function addServerUrlToResourceProps(props) {
    const serverResources = props.__serverResources;
    if (serverResources && Array.isArray(serverResources)) {
        const previousProps = props;
        props = { ...props };
        for (const resourceName of serverResources) {
            if (Array.isArray(resourceName)) {
                const [name, at] = resourceName;
                let array = props[name];
                if (!array)
                    continue;
                // make sure to copy-on-write
                if (previousProps[name] === array) {
                    array = array.slice();
                    props[name] = array;
                }
                array[at] = serverURL(array[at]);
            }
            else if (typeof resourceName === "string") {
                const value = props[resourceName];
                if (!value)
                    continue;
                props[resourceName] = serverURL(value);
            }
        }
    }
    return props;
}
// For performance, we cache the React element on the node.cache, so we only have to create elements
// for nodes that actually changed. Which is a 10x speedup.
function reactConverter(componentForNode) {
    return function (node, children) {
        const cache = node.cache;
        if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
            safeWindow["perf"].nodeCreateElement();
        let props = cache.props;
        if (!props) {
            if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
                safeWindow["perf"].nodeGetProps();
            props = cache.props = node.getProps();
        }
        const canvasZoom = cache.canvasZoom;
        const willChangeTransform = cache.willChangeTransform;
        if (canvasZoom || willChangeTransform) {
            props = { ...props, canvasZoom, willChangeTransform };
        }
        props = addServerUrlToResourceProps(props);
        if (!(node instanceof CodeComponentPresentation)) {
            const component = componentForNode(node);
            return (cache.reactElement = React.createElement(component, props, children));
        }
        else {
            const component = componentLoader.componentForIdentifier(node.componentIdentifier);
            if (!component) {
                // if there is an error, the componentcontainer will take care of it
                const error = componentLoader.errorForIdentifier(node.componentIdentifier);
                if (error)
                    return null;
                // otherwise show a loading object
                return (cache.reactElement = React.createElement(ComponentContainerLoader, {
                    key: "component-container-loader",
                    error,
                }));
            }
            if (!isReactDefinition(component))
                return null;
            return (cache.reactElement = React.createElement(component.class, props, children));
        }
    };
}
export function renderPresentationTree(node, componentForNode) {
    return convertPresentationTree(node, reactConverter(componentForNode), (n) => n.cache.reactElement);
}
export function convertPresentationTree(node, converter, getCachedNode) {
    // if there is a cached node, we use it without looking at any children etc.
    const cachedNode = getCachedNode && getCachedNode(node);
    if (cachedNode)
        return cachedNode;
    // otherwise build children depth first and convert node
    let children;
    if (isCodeComponentContainerPresentation(node)) {
        children = convertCodeComponentContainer(node, converter, getCachedNode);
    }
    else if (node.children) {
        children = node.children.map(n => convertPresentationTree(n, converter, getCachedNode));
    }
    return converter(node, children);
}
function isCodeComponentContainerPresentation(value) {
    return !!value.codeComponentIdentifier;
}
function convertCodeComponentContainer(node, converter, getCachedNode) {
    const codeComponentChildren = !!node.getComponentChildren ? node.getComponentChildren() : [];
    const codeComponentSlots = !!node.getComponentSlotChildren ? node.getComponentSlotChildren() : {};
    let codeComponentPresentation;
    const props = node.getCodeComponentProps ? node.getCodeComponentProps() : undefined;
    if (node.cache.codeComponentPresentation) {
        codeComponentPresentation = node.cache.codeComponentPresentation;
        if (!isShallowEqualArray(codeComponentPresentation.children, codeComponentChildren)) {
            codeComponentPresentation.cache.reactElement = null;
            codeComponentPresentation.children = codeComponentChildren;
        }
        if (!isEqual(codeComponentPresentation.props, props)) {
            codeComponentPresentation.cache.reactElement = null;
            codeComponentPresentation.cache.props = null;
            codeComponentPresentation.props = props;
        }
    }
    else {
        const { id: containerId, codeComponentIdentifier: identifier } = node;
        node.cache.codeComponentPresentation = codeComponentPresentation = new CodeComponentPresentation(containerId + identifier, identifier, props, codeComponentChildren);
    }
    codeComponentPresentation.props.placeholders = node.cache.placeholders;
    const slotKeys = Object.keys(codeComponentSlots);
    if (slotKeys.length) {
        codeComponentPresentation.props = { ...codeComponentPresentation.props };
        codeComponentPresentation.props.__slotKeys = slotKeys;
        for (const slotKey of slotKeys) {
            const slotChildren = codeComponentSlots[slotKey].map(child => convertPresentationTree(child, converter, getCachedNode));
            codeComponentPresentation.props[slotKey] = slotChildren;
        }
    }
    return [
        converter(codeComponentPresentation, codeComponentPresentation.children.map(child => convertPresentationTree(child, converter, getCachedNode))),
    ];
}
class CodeComponentPresentation {
    constructor(id, componentIdentifier, props, children, codeOverrideIdentifier) {
        this.id = id;
        this.componentIdentifier = componentIdentifier;
        this.props = props;
        this.children = children;
        this.codeOverrideIdentifier = codeOverrideIdentifier;
        this.cache = {};
        this.getProps = () => {
            return {
                ...this.props,
                id: this.id,
                key: this.id,
            };
        };
        this.rect = (parentSize) => {
            // N.B. This is never called.
            return { x: 0, y: 0, width: 0, height: 0 };
        };
    }
}
