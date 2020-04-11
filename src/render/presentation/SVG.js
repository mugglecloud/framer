import * as React from "react";
import { safeWindow } from "../../utils/safeWindow";
import { Layer } from "./Layer";
import { Color } from "../types/Color";
import { LinearGradient } from "../types/LinearGradient";
import { RadialGradient } from "../types/RadialGradient";
import { collectOpacityFromProps } from "../traits/Opacity";
import { collectFiltersFromProps } from "../utils/filtersForNode";
import { RenderEnvironment } from "../types/RenderEnvironment";
import { useParentSize, ParentSizeState, calculateRect, constraintsEnabled, } from "../types/NewConstraints";
import { Animatable } from "../../animation/Animatable";
import { BackgroundImage, imagePatternPropsForFill, isFiniteNumber, } from "../";
import { ImagePatternElement } from "./ImagePatternElement";
import { injectComponentCSSRules } from "../utils/injectComponentCSSRules";
import { elementForComponent } from "../utils/elementForComponent";
import { resetSetStyle } from "../utils/useWebkitFixes";
import { elementPropertiesForLinearGradient, elementPropertiesForRadialGradient, } from "../utils/elementPropertiesForGradient";
// Before migrating to functional components we need to get parentSize data from context
/**
 * @internal
 */
export function SVG(props) {
    const parentSize = useParentSize();
    return React.createElement(SVGComponent, Object.assign({}, props, { parentSize: parentSize }));
}
function sizeSVG(container, props) {
    const div = container.current;
    const hasConstraints = constraintsEnabled(props) && props.parentSize !== ParentSizeState.Disabled;
    if (hasConstraints || !div) {
        return;
    }
    const svg = div.firstElementChild;
    if (!svg || !(svg instanceof SVGSVGElement)) {
        return;
    }
    const { intrinsicWidth, intrinsicHeight, _constraints } = props;
    if (svg.viewBox.baseVal.width === 0 &&
        svg.viewBox.baseVal.height === 0 &&
        isFiniteNumber(intrinsicWidth) &&
        isFiniteNumber(intrinsicHeight)) {
        svg.setAttribute("viewBox", `0 0 ${intrinsicWidth} ${intrinsicHeight}`);
    }
    // XXX TODO take the value from _constraints.aspectRatio into account
    if (_constraints && _constraints.aspectRatio) {
        svg.setAttribute("preserveAspectRatio", "");
    }
    else {
        svg.setAttribute("preserveAspectRatio", "none");
    }
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
}
class SVGComponent extends Layer {
    constructor() {
        super(...arguments);
        this.container = React.createRef();
    }
    static frame(props) {
        return calculateRect(props, props.parentSize || ParentSizeState.Unknown);
    }
    get frame() {
        return calculateRect(this.props, this.props.parentSize || ParentSizeState.Unknown);
    }
    componentDidMount() {
        sizeSVG(this.container, this.props);
    }
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        const { fill } = this.props;
        if (BackgroundImage.isImageObject(fill) &&
            BackgroundImage.isImageObject(prevProps.fill) &&
            fill.src !== prevProps.fill.src) {
            const element = elementForComponent(this);
            resetSetStyle(element, "fill", null, false);
        }
        sizeSVG(this.container, this.props);
    }
    render() {
        if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
            safeWindow["perf"].nodeRender();
        const { id, visible, fill, rotation, svg, intrinsicHeight, intrinsicWidth, width, height } = this.props;
        if (!visible || !id) {
            return null;
        }
        injectComponentCSSRules();
        const frame = this.frame;
        // XXX find another way to not need these defaults
        const size = frame || { width: intrinsicWidth || 100, height: intrinsicHeight || 100 };
        const style = {
            transform: `rotate(${Animatable.getNumber(rotation).toFixed(4)}deg)`,
            imageRendering: "pixelated",
            opacity: isFiniteNumber(this.props.opacity) ? this.props.opacity : 1,
        };
        const innerStyle = {};
        if (frame) {
            Object.assign(style, {
                transform: `translate(${frame.x}px, ${frame.y}px) ${style.transform}`,
                width: `${frame.width}px`,
                height: `${frame.height}px`,
            });
            if (constraintsEnabled(this.props)) {
                style.position = "absolute";
            }
            const xFactor = frame.width / (intrinsicWidth || 1);
            const yFactor = frame.height / (intrinsicHeight || 1);
            // if we zoom differently again in export, we might need this again: canvasMode !== CanvasModeExport
            const { zoom } = RenderEnvironment;
            const zoomFactor = zoom > 1 ? zoom : 1;
            innerStyle.transform = `scale(${xFactor * zoomFactor}, ${yFactor * zoomFactor})`;
            innerStyle.transformOrigin = "top left";
            innerStyle.zoom = 1 / zoomFactor;
            if (intrinsicWidth && intrinsicHeight) {
                innerStyle.width = intrinsicWidth;
                innerStyle.height = intrinsicHeight;
            }
        }
        else {
            const { left, right, top, bottom, center } = this.props;
            Object.assign(style, {
                left,
                right,
                top,
                bottom,
                width,
                height,
            });
            let additionalTransform = "";
            if (center === true) {
                additionalTransform = "translate(-50%, -50%) ";
            }
            else {
                if (center === "x") {
                    additionalTransform = "translateX(-50%) ";
                }
                else if (center === "y") {
                    additionalTransform = "translateY(-50%) ";
                }
            }
            style.transform = `${additionalTransform}${style.transform}`;
            Object.assign(innerStyle, {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
            });
        }
        collectOpacityFromProps(this.props, style);
        collectFiltersFromProps(this.props, style);
        Layer.applyWillChange(this.props, style, false);
        let fillElement = null;
        if (typeof fill === "string" || Color.isColorObject(fill)) {
            const fillColor = Color.isColorObject(fill) ? fill.initialValue || Color.toRgbString(fill) : fill;
            style.fill = fillColor;
            style.color = fillColor;
        }
        else if (LinearGradient.isLinearGradient(fill)) {
            const gradient = fill;
            // We need encodeURI() here to handle our old id's that contained special characters like ';'
            // Creating an url() entry for those id's unescapes them, so we need to use the URI encoded version
            const gradientId = `${encodeURI(id || "")}g${LinearGradient.hash(gradient)}`;
            style.fill = `url(#${gradientId})`;
            const elementProperties = elementPropertiesForLinearGradient(gradient, id);
            fillElement = (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", style: { position: "absolute" } },
                React.createElement("linearGradient", { id: gradientId, gradientTransform: `rotate(${elementProperties.angle}, 0.5, 0.5)` }, elementProperties.stops.map((stop, idx) => {
                    return (React.createElement("stop", { key: idx, offset: stop.position, stopColor: stop.color, stopOpacity: stop.alpha }));
                }))));
        }
        else if (RadialGradient.isRadialGradient(fill)) {
            const gradient = fill;
            // We need encodeURI() here to handle our old id's that contained special characters like ';'
            // Creating an url() entry for those id's unescapes them, so we need to use the URI encoded version
            const gradientId = `${encodeURI(id || "")}g${RadialGradient.hash(gradient)}`;
            style.fill = `url(#${gradientId})`;
            const elementProperties = elementPropertiesForRadialGradient(gradient, id);
            fillElement = (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", style: { position: "absolute" } },
                React.createElement("radialGradient", { id: gradientId, cy: gradient.centerAnchorY, cx: gradient.centerAnchorX, r: gradient.widthFactor }, elementProperties.stops.map((stop, idx) => {
                    return (React.createElement("stop", { key: idx, offset: stop.position, stopColor: stop.color, stopOpacity: stop.alpha }));
                }))));
        }
        else if (BackgroundImage.isImageObject(fill)) {
            const imagePattern = imagePatternPropsForFill(fill, size, id);
            if (imagePattern) {
                style.fill = `url(#${imagePattern.id})`;
                fillElement = (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: "100%", height: "100%", style: { position: "absolute" } },
                    React.createElement("defs", null,
                        React.createElement(ImagePatternElement, Object.assign({}, imagePattern)))));
            }
        }
        const dataProps = {
            "data-framer-component-type": "SVG",
        };
        return (React.createElement("div", Object.assign({}, dataProps, { id: id, style: style }),
            fillElement,
            React.createElement("div", { key: BackgroundImage.isImageObject(fill) ? fill.src : "", className: "svgContainer", style: innerStyle, ref: this.container, dangerouslySetInnerHTML: { __html: svg } })));
    }
}
SVGComponent.supportsConstraints = true;
SVGComponent.defaultSVGProps = {
    left: undefined,
    right: undefined,
    top: undefined,
    bottom: undefined,
    _constraints: {
        enabled: true,
        aspectRatio: null,
    },
    parentSize: ParentSizeState.Unknown,
    rotation: 0,
    visible: true,
    svg: "",
    shadows: [],
};
SVGComponent.defaultProps = {
    ...Layer.defaultProps,
    ...SVGComponent.defaultSVGProps,
};
