import * as React from "react";
import { isFiniteNumber } from "../utils/isFiniteNumber";
import { roundedNumberString } from "../utils/roundedNumber";
import { ConvertColor } from "../types/Color";
import { Rect } from "../types/Rect";
import { BoxShadow } from "../types/Shadow";
import { RenderTarget } from "../types/RenderEnvironment";
import { CustomPropertiesContext } from "../presentation/CustomProperties";
const DISABLE_SHADOWS_AT_ZOOM = 16;
const MAX_SHADOW_BUFFER_PIXELS = 1024 * 1024;
export function shadowsAsFilter(shadows) {
    const filters = [];
    if (shadows && shadows.length) {
        const dropShadows = shadows.map((shadowItem) => {
            return `drop-shadow(${shadowItem.x}px ${shadowItem.y}px ${shadowItem.blur}px ${shadowItem.color})`;
        });
        filters.push(...dropShadows);
    }
    return filters;
}
export function collectTextShadowsForProps(props, style) {
    if (!props.shadows || props.shadows.length === 0)
        return;
    const textShadow = props.shadows
        .map((shadow) => {
        return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`;
    })
        .join(", ");
    if (!textShadow)
        return;
    style.textShadow = textShadow;
}
export function collectBoxShadowsForProps(props, style) {
    if (!props.shadows || props.shadows.length === 0)
        return;
    const boxShadow = props.shadows.map((shadowItem) => BoxShadow.toCSS(shadowItem)).join(", ");
    if (!boxShadow)
        return;
    style.boxShadow = boxShadow;
}
function shadowBufferResultion(shadowRect, canvasZoom, canvasMode) {
    let scaled = false;
    if (canvasMode === RenderTarget.export || canvasMode === RenderTarget.preview)
        return { scaled };
    let width = shadowRect.width * canvasZoom;
    let height = shadowRect.height * canvasZoom;
    while (width * height > MAX_SHADOW_BUFFER_PIXELS) {
        scaled = true;
        width /= 2;
        height /= 2;
        if (width < 32)
            width = 32;
        if (height < 32)
            height = 32;
    }
    return { string: `${Math.ceil(width)} ${Math.ceil(height)}`, scaled };
}
export function shadowForShape(boxShadows, rect, shapeId, fillAlpha, strokeAlpha, strokeWidth, strokeClipId, svgStrokeAttributes, canvasZoom, renderTarget) {
    const definition = [];
    let outsetElement = null;
    let insetElement = null;
    let needsStrokeClip = false;
    // disable shadows if deeply zoomed
    if (renderTarget !== RenderTarget.export &&
        renderTarget !== RenderTarget.preview &&
        canvasZoom >= DISABLE_SHADOWS_AT_ZOOM) {
        return { definition, outsetElement, insetElement, needsStrokeClip };
    }
    const shadows = [];
    const insetShadows = [];
    const boxShadowsCount = boxShadows.length;
    for (let i = 0, il = boxShadowsCount; i < il; i++) {
        const shadow = boxShadows[i];
        shadow.inset ? insetShadows.push(shadow) : shadows.push(shadow);
    }
    if (shadows.length > 0) {
        shadows.reverse();
        const outsideShadowId = shapeId.add("_shadow_out");
        const normalizedFrame = Rect.atOrigin(rect);
        const shadowRects = [normalizedFrame];
        for (let i = 0, il = shadows.length; i < il; i++) {
            const shadow = shadows[i];
            const shadowFrame = localShadowFrame(shadow, normalizedFrame, true);
            if (shadowFrame === null) {
                continue;
            }
            shadowRects.push(shadowFrame);
        }
        let maxBlur = 0;
        const filterElements = [];
        const mergeElements = [];
        for (let i = 0, il = shadows.length; i < il; i++) {
            const shadow = shadows[i];
            const shadowElements = outerShadowElements(shapeId, shadow, i);
            maxBlur = Math.max(maxBlur, shadow.blur);
            filterElements.push(shadowElements.filterElements);
            mergeElements.push(shadowElements.mergeElement);
        }
        let expandStrokeWidth = strokeWidth;
        if (!isFiniteNumber(expandStrokeWidth))
            expandStrokeWidth = 0;
        let miter = svgStrokeAttributes.strokeMiterlimit;
        if (!isFiniteNumber(miter))
            miter = 4;
        let shadowRect = Rect.merge(...shadowRects);
        shadowRect = Rect.inflate(shadowRect, ((expandStrokeWidth * miter) / 2 + maxBlur) * 1.1);
        const filterRes = shadowBufferResultion(shadowRect, canvasZoom, renderTarget);
        // calculate percentage of shadow frame compared to node frame
        const width = rect.width + (strokeWidth ? strokeWidth / 2 : 0.1);
        const height = rect.height + (strokeWidth ? strokeWidth / 2 : 0.1);
        const filterX = (shadowRect.x / width) * 100;
        const filterY = (shadowRect.y / height) * 100;
        const filterWidth = (shadowRect.width / width) * 100;
        const filterHeight = (shadowRect.height / height) * 100;
        definition.push(<filter key={outsideShadowId.id} id={outsideShadowId.id} x={`${filterX.toFixed(1)}%`} y={`${filterY.toFixed(1)}%`} width={`${filterWidth.toFixed(1)}%`} height={`${filterHeight.toFixed(1)}%`} filterUnits="objectBoundingBox" filterRes={filterRes.string}>
                {filterElements}
                {shadows.length > 1 ? <feMerge>{mergeElements}</feMerge> : null}
            </filter>);
        outsetElement = (<g filter={outsideShadowId.urlLink}>
                <use {...svgStrokeAttributes} fill="black" fillOpacity={fillAlpha <= 0 ? 0 : 1} stroke="black" strokeOpacity={strokeAlpha <= 0 ? 0 : 1} strokeWidth={strokeAlpha > 0 ? strokeWidth : 0} xlinkHref={shapeId.link} clipPath={strokeClipId.urlLink}/>
            </g>);
    }
    if (insetShadows.length) {
        insetShadows.reverse();
        const insideShadowId = shapeId.add("_shadow_inside");
        const normalizedFrame = Rect.atOrigin(rect);
        const shadowFrames = [normalizedFrame];
        for (let i = 0, il = insetShadows.length; i < il; i++) {
            const shadow = insetShadows[i];
            const shadowFrame = localShadowFrame(shadow, normalizedFrame, true);
            if (shadowFrame === null) {
                continue;
            }
            shadowFrames.push(shadowFrame);
        }
        const shadowRect = Rect.merge(...shadowFrames);
        const filterRes = shadowBufferResultion(shadowRect, canvasZoom, renderTarget);
        needsStrokeClip = needsStrokeClip || filterRes.scaled;
        // calculate percentage of shadow frame compared to node frame
        const width = rect.width + (strokeWidth ? strokeWidth / 2 : 0.1);
        const height = rect.height + (strokeWidth ? strokeWidth / 2 : 0.1);
        const filterX = (shadowRect.x / width) * 100;
        const filterY = (shadowRect.y / height) * 100;
        const filterWidth = (shadowRect.width / width) * 100;
        const filterHeight = (shadowRect.height / height) * 100;
        const filterElements = [];
        const mergeElements = [];
        for (let i = 0, il = insetShadows.length; i < il; i++) {
            const shadow = insetShadows[i];
            const shadowElements = innerShadowElements(shapeId, shadow, i);
            filterElements.push(shadowElements.filterElements);
            mergeElements.push(shadowElements.mergeElement);
        }
        definition.push(<filter key={insideShadowId.id} id={insideShadowId.id} x={`${filterX.toFixed(1)}%`} y={`${filterY.toFixed(1)}%`} width={`${filterWidth.toFixed(1)}%`} height={`${filterHeight.toFixed(1)}%`} filterUnits="objectBoundingBox" filterRes={filterRes.string}>
                {filterElements}
                {insetShadows.length > 1 ? <feMerge>{mergeElements}</feMerge> : null}
            </filter>);
        // if we rendered at lower resolution, we need a clip path ...
        let clipPath;
        if (needsStrokeClip) {
            clipPath = strokeClipId.urlLink;
        }
        insetElement = (<use fill="black" fillOpacity="1" filter={insideShadowId.urlLink} xlinkHref={shapeId.link} clipPath={clipPath}/>);
    }
    return { definition, outsetElement, insetElement, needsStrokeClip };
}
function outerShadowElements(shapeID, shadow, index) {
    const shadowKey = shapeID.add("_outer_shadow" + index);
    const offsetResultId = shadowKey.add("offset").id;
    const blurResultId = shadowKey.add("blur").id;
    const matrixResultId = shadowKey.add("matrix").id;
    const filterElements = (<OuterShadowFilterElements key={shadowKey.id + "-filters"} shadow={shadow} blurId={blurResultId} offsetId={offsetResultId} matrixId={matrixResultId}/>);
    const mergeElement = <feMergeNode key={shadowKey.id + "-merge"} in={matrixResultId}/>;
    return { filterElements, mergeElement };
}
const OuterShadowFilterElements = props => {
    const lookup = React.useContext(CustomPropertiesContext);
    const { shadow, blurId, offsetId, matrixId } = props;
    // We need to lookup the actual value for the color when dealing with CSS variables.
    // This needs to be extracted into an API provided to Library dependants via a context.
    let color = shadow.color;
    const result = lookup(color);
    if (result) {
        color = result;
    }
    const rgb = ConvertColor.toRgb(color);
    const r = roundedNumberString(rgb.r / 255, 3);
    const g = roundedNumberString(rgb.g / 255, 3);
    const b = roundedNumberString(rgb.b / 255, 3);
    const matrixValues = `0 0 0 0 ${r}   0 0 0 0 ${g}   0 0 0 0 ${b}  0 0 0 ${rgb.a} 0`;
    return (<>
            <feOffset dx={shadow.x} dy={shadow.y} in={"SourceAlpha"} result={offsetId}/>
            <feGaussianBlur stdDeviation={shadow.blur / 2} in={offsetId} result={blurId}/>
            
            
            <feColorMatrix colorInterpolationFilters={"sRGB"} values={matrixValues} type="matrix" in={blurId} result={matrixId}/>
        </>);
};
function innerShadowElements(shapeID, shadow, index) {
    const shadowKey = shapeID.add("_inside_shadow" + index);
    const blurId = shadowKey.add("blur").id;
    const offsetId = shadowKey.add("offset").id;
    const compositeId = shadowKey.add("composite").id;
    const matrixId = shadowKey.add("matrix").id;
    const filterElements = (<InnerShadowFilterElements key={shadowKey.id + "-filters"} shadow={shadow} blurId={blurId} offsetId={offsetId} compositeId={compositeId} matrixId={matrixId}/>);
    const mergeElement = <feMergeNode key={shadowKey.id + "-merge"} in={matrixId}/>;
    return { filterElements, mergeElement };
}
const InnerShadowFilterElements = props => {
    const lookup = React.useContext(CustomPropertiesContext);
    const { shadow, blurId, offsetId, compositeId, matrixId } = props;
    // We need to lookup the actual value for the color when dealing with CSS variables.
    // This needs to be extracted into an API provided to Library dependants via a context.
    let color = shadow.color;
    const result = lookup(color);
    if (result) {
        color = result;
    }
    const rgb = ConvertColor.toRgb(color);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const matrixValues = `0 0 0 0 ${r}   0 0 0 0 ${g}   0 0 0 0 ${b}  0 0 0 ${rgb.a} 0`;
    return (<>
            <feGaussianBlur stdDeviation={shadow.blur / 2} in={"SourceAlpha"} result={blurId}/>
            <feOffset dx={shadow.x} dy={shadow.y} in={blurId} result={offsetId}/>
            <feComposite in={offsetId} in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result={compositeId}/>
            <feColorMatrix colorInterpolationFilters={"sRGB"} values={matrixValues} type="matrix" in={compositeId} result={matrixId}/>
        </>);
};
export function localShadowFrame(shadow, frame, isSVG) {
    let growth = shadow.blur;
    if (BoxShadow.is(shadow)) {
        if (isSVG !== true) {
            if (shadow.inset)
                return null;
            growth += shadow.spread;
        }
    }
    let minX;
    let maxX;
    let minY;
    let maxY;
    if (isSVG === true) {
        minX = -Math.abs(shadow.x) - growth;
        maxX = Math.abs(shadow.x) + frame.width + growth;
        minY = -Math.abs(shadow.y) - growth;
        maxY = Math.abs(shadow.y) + frame.height + growth;
    }
    else {
        minX = shadow.x - growth;
        maxX = shadow.x + frame.width + growth;
        minY = shadow.y - growth;
        maxY = shadow.y + frame.height + growth;
    }
    if (maxX <= minX || maxY <= minY)
        return null;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
