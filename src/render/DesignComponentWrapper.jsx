import * as React from "react";
import { Frame, Vector, VectorGroup, SVG, Text, ComponentContainer, ConstraintValues, componentLoader, isReactDefinition, } from ".";
import { isArray } from "../utils/utils";
import { safeWindow } from "../utils/safeWindow";
/**
 * @internal
 */
export class CanvasStore {
    constructor() {
        this.canvas = { children: [] };
        this.listeners = [];
        this.ids = [];
    }
    static shared(data) {
        // the build files (standalone, packages, live-preview) will have data and should not hook into the global shared store
        if (data) {
            const store = new CanvasStore();
            store.setCanvas(data);
            return store;
        }
        // vekter and preview are served the live version which has no data and should hook into the same shared store
        if (!CanvasStore.__shared) {
            CanvasStore.__shared = new CanvasStore();
        }
        return CanvasStore.__shared;
    }
    updateNode(presentationNode) {
        const id = presentationNode.props.id;
        let children = this.canvas.children;
        if (!children) {
            this.canvas.children = children = [];
        }
        let found = false;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.props.id === id) {
                found = true;
                children[i] = presentationNode;
                break;
            }
        }
        if (!found) {
            children.push(presentationNode);
        }
        this.setCanvas(this.canvas);
    }
    setCanvas(canvas) {
        if (!canvas.children)
            return;
        this.canvas = canvas;
        this.listeners.forEach((l, at) => {
            const id = this.ids[at];
            const data = findNodeFor(canvas, id);
            l.setState({ data });
        });
    }
    registerListener(listener, idOrName) {
        this.listeners.push(listener);
        this.ids.push(idOrName);
        return findNodeFor(this.canvas, idOrName);
    }
    removeListener(listener) {
        const at = this.listeners.indexOf(listener);
        if (at < 0)
            return;
        this.listeners.splice(at, 1);
        this.ids.splice(at, 1);
    }
}
CanvasStore.__shared = null;
/**
 * @internal
 */
const buildInComponents = { Frame, Vector, VectorGroup, SVG, Text, ComponentContainer };
/**
 * check via the react fiber all our parents, and if this component class is a parent
 * @internal
 */
export function hasSelfInParentChain(self) {
    const constructor = self.constructor;
    let fiber = self._reactInternalFiber;
    if (!fiber) {
        // tslint:disable-next-line:no-console
        console.warn("_reactInternalFiber not found for:", self);
        return false;
    }
    // start from our parent
    fiber = fiber.return;
    while (fiber) {
        const stateNode = fiber.stateNode;
        if (stateNode && stateNode.constructor === constructor)
            return true;
        fiber = fiber.return;
    }
    return false;
}
class DesignComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.checkedParent = false;
        this.parentError = false;
    }
    hasParentError() {
        if (!this.checkedParent) {
            this.checkedParent = true;
            this.parentError = hasSelfInParentChain(this);
        }
        return this.parentError;
    }
    _typeForName(name) {
        const buildin = buildInComponents[name];
        if (buildin)
            return buildin;
        const codeComponent = componentLoader.componentForIdentifier(name);
        if (codeComponent && isReactDefinition(codeComponent)) {
            return codeComponent.class;
        }
        return Frame;
    }
    _renderData(presentation, componentProps, topLevelProps) {
        safeWindow["__checkBudget__"]();
        // notice, we don't own the presentation tree, but share it with all instances
        // so we have to be careful not to mutate any aspect of it
        const { componentClass, name } = presentation;
        let { props, children } = presentation;
        props = { ...props, _constraints: { enabled: false } };
        const type = this._typeForName(componentClass);
        if (!type)
            return null;
        if (topLevelProps) {
            const { style, ...rest } = props;
            // Similar to WithOverride,
            // 'style' take presidence over the props, _initialStyle reverses that
            props = { ...rest, ...topLevelProps, _initialStyle: style };
        }
        if (!props.size && props._sizeOfMasterOnCanvas) {
            // We have already copied the props above, so it's safe to modify them here
            if (!props.width) {
                props.width = props._sizeOfMasterOnCanvas.width;
            }
            if (!props.height) {
                props.height = props._sizeOfMasterOnCanvas.height;
            }
        }
        if (name && componentProps.hasOwnProperty(name)) {
            if (componentClass === "Text") {
                const text = componentProps[name];
                if (text) {
                    props = { ...props, text: componentProps[name] };
                }
            }
            else {
                const orig = props.background;
                const background = { src: componentProps[name], fit: orig.fit };
                props = { ...props, background };
            }
        }
        const c = children &&
            children.map((child, childIndex) => this._renderData(child, componentProps, undefined));
        children = children ? c : [];
        return React.createElement(type, props, children);
    }
    render() {
        safeWindow["__checkBudget__"]();
        if (this.hasParentError()) {
            return React.createElement("div", { style: errorStyle }, React.createElement("p", { style: errorMessageStyle }, "Design Component cannot be nested in itself."));
        }
        const data = this.state.data;
        if (!data) {
            return React.createElement("div", { style: errorStyle }, React.createElement("p", { style: errorMessageStyle }, "Unable to connect to canvas data store."));
        }
        return this._renderData(this.state.data, this.props, this.props);
    }
}
function isNode(id, presentation) {
    const { name, props } = presentation;
    return (props && props.id === id) || name === id;
}
/**
 * @internal
 */
function findNodeFor(presentation, id) {
    if (!presentation)
        return null;
    if (isNode(id, presentation)) {
        return presentation;
    }
    const { children } = presentation;
    if (!children || !isArray(children))
        return null;
    /* This looks like it could be one loop, but we want this search to be breadth-first.
     * Masters of design components can contain other masters,
     * and we want to find the ones created (and adjusted) by the code-generator,
     * not the ones that are contained by others
     * This fixes https://github.com/framer/company/issues/13070
     */
    for (const child of children) {
        if (isNode(id, child)) {
            return child;
        }
    }
    for (const child of children) {
        const result = findNodeFor(child, id);
        if (result)
            return result;
    }
    return null;
}
/**
 * @internal
 */
export function createDesignComponent(canvasStore, id, propertyControls, width = 200, height = 200) {
    var _a;
    return _a = class extends DesignComponent {
            constructor(props, context) {
                super(props, context);
                const data = canvasStore.registerListener(this, id);
                this.state = { data };
            }
            static rect(props) {
                const constraintValues = ConstraintValues.fromProperties(props);
                return ConstraintValues.toRect(constraintValues, props.parentSize || null, null);
            }
            static minSize(props, parentSize) {
                const constraintValues = ConstraintValues.fromProperties(props);
                return ConstraintValues.toMinSize(constraintValues, parentSize || null);
            }
            static size(props, parentSize, freeSpace) {
                const constraintValues = ConstraintValues.fromProperties(props);
                return ConstraintValues.toSize(constraintValues, parentSize || null, null, freeSpace);
            }
            componentWillUnmount() {
                canvasStore.removeListener(this);
            }
        },
        _a.displayName = `DesignComponent(${id})`,
        _a.propertyControls = propertyControls,
        _a.supportsConstraints = true,
        _a.defaultProps = {
            _sizeOfMasterOnCanvas: {
                width,
                height,
            },
        },
        _a;
}
const errorStyle = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 85, .1)",
    fontSize: "11px",
    lineHeight: "1.2em",
};
const errorMessageStyle = {
    listStyle: "disc inside",
    margin: 0,
    padding: 0,
    paddingLeft: 0,
    color: "rgba(255, 0, 85, .5)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    textAlign: "left",
};
