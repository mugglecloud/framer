import * as React from "react";
import { transformString } from "../utils/transformString";
import { Layer } from "./Layer";
import { SVGRoot } from "./SVGRoot";
import { transformValues } from "../utils/createTransformValues";
import { RenderTarget } from "../types/RenderEnvironment";
import { RenderEnvironment } from "../types/RenderEnvironment";
import { safeWindow } from "../../utils/safeWindow";
/**
 * @internal
 */
export class VectorGroup extends Layer {
    render() {
        if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
            safeWindow["perf"].nodeRender();
        const { id, name, opacity, visible, targetName, defaultName, children, includeTransform, x, y, width, height, rotation, isRootVectorNode, } = this.props;
        if (!visible)
            return null;
        const { target } = RenderEnvironment;
        const rect = { x, y, width, height };
        const transform = transformValues(rect, rotation, isRootVectorNode, includeTransform);
        const addNames = target === RenderTarget.preview;
        let name_ = undefined;
        if (addNames) {
            if (targetName) {
                name_ = targetName;
            }
            else if (name) {
                name_ = name;
            }
            else {
                name_ = defaultName;
            }
        }
        return this.renderElement(<g transform={transformString(transform)} {...{ id, name: name_, opacity }}>
                {children}
            </g>);
    }
    renderElement(element) {
        const { isRootVectorNode, width, height, frame, willChangeTransform } = this.props;
        if (!isRootVectorNode) {
            return element;
        } // else
        return <SVGRoot {...{ frame, width, height, willChangeTransform }}>{element}</SVGRoot>;
    }
}
VectorGroup.defaultVectorGroupProps = {
    name: undefined,
    opacity: undefined,
    visible: true,
    x: 0,
    y: 0,
    rotation: 0,
    width: 100,
    height: 100,
    targetName: undefined,
    defaultName: "",
    isRootVectorNode: false,
    includeTransform: undefined,
    frame: { x: 0, y: 0, width: 100, height: 100 },
};
VectorGroup.defaultProps = {
    ...Layer.defaultProps,
    ...VectorGroup.defaultVectorGroupProps,
};
