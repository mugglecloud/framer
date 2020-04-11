import * as React from "react";
import { useMemo, useRef, useCallback } from "react";
import { useMotionValue, unwrapMotionValue } from "framer-motion";
import { useChildrenSize } from "./useChildrenSize";
import { isRectProviding } from "../utils/RectProvider";
import { Rect, ControlType } from "../../render";
import { FrameWithMotion, defaultFrameRect, unwrapFrameProps } from "../../render/presentation/Frame/FrameWithMotion";
import { EmptyState } from "../../components/EmptyState";
import { addPropertyControls } from "../../utils/addPropertyControls";
import { isMotionValue } from "../../render/utils/isMotionValue";
import { RenderTarget } from "../../render/types/RenderEnvironment";
import { constraintsEnabled, useConstraints } from "../../render/types/NewConstraints";
import { useMeasureSize } from "./useMeasureSize";
import { useWheelScroll } from "./useWheelScroll";
export { ScrollProps, ScrollEvents, ScrollConfig } from "./types";
const directionMap = {
    horizontal: "x",
    vertical: "y",
    both: true,
};
function convertScrollDirectionToDrag(scrollDirection) {
    return scrollDirection ? directionMap[scrollDirection] : scrollDirection;
}
const useScrollConstraints = (size, dragDirection, children) => {
    return useMemo(() => {
        let contentSize;
        if (!size)
            return [contentSize, children];
        contentSize = {
            width: size.width,
            height: size.height,
        };
        const resizedChildren = React.Children.map(children, (child) => {
            if (child === null || typeof child !== "object" || typeof child.type === "string") {
                return child;
            }
            const type = child.type;
            if (isRectProviding(type)) {
                const frame = type.rect(child.props, size);
                if (frame && contentSize) {
                    contentSize.width = Math.max(Rect.maxX(frame), contentSize.width);
                    contentSize.height = Math.max(Rect.maxY(frame), contentSize.height);
                }
                else {
                    // Reset the contentSize, to signify that we can't calculate it
                    contentSize = undefined;
                }
            }
            else {
                // Reset the contentSize, to signify that we can't calculate it
                contentSize = undefined;
            }
            const update = {};
            if (dragDirection === "vertical") {
                update.width = size.width;
                if (contentSize) {
                    contentSize.width = size.width;
                }
            }
            else if (dragDirection === "horizontal") {
                update.height = size.height;
                if (contentSize) {
                    contentSize.height = size.height;
                }
            }
            return React.cloneElement(child, update);
        });
        return [contentSize, resizedChildren];
    }, [size, dragDirection, children]);
};
/**
 * @public
 */
export function Scroll(props) {
    const { direction = "vertical", directionLock = false, dragEnabled: dragEnabled = true, wheelEnabled = true, contentOffsetX = 0, contentOffsetY = 0, contentWidth, contentHeight, onScrollStart, onScroll, onScrollEnd, onDragStart, onDrag, onDragEnd, onUpdate, onDirectionLock, style, children, scrollAnimate, overflow = "hidden", ...containerProps } = props;
    const defaultX = useMotionValue(typeof contentOffsetX === "number" ? contentOffsetX : 0);
    const defaultY = useMotionValue(typeof contentOffsetY === "number" ? contentOffsetY : 0);
    const x = isMotionValue(contentOffsetX) ? contentOffsetX : defaultX;
    const y = isMotionValue(contentOffsetY) ? contentOffsetY : defaultY;
    const { initial, prev } = useRef({
        initial: { x: 0, y: 0 },
        prev: { x: 0, y: 0 },
    }).current;
    const unwrappedProps = unwrapFrameProps(props);
    const directionRef = useRef(direction);
    if (directionRef.current !== direction) {
        x.set(0);
        y.set(0);
        directionRef.current = direction;
    }
    let initialSize;
    let skipMeasureSize = false;
    if (typeof containerProps.width === "number" && typeof containerProps.height === "number") {
        initialSize = { width: containerProps.width, height: containerProps.height };
        skipMeasureSize = true;
    }
    if (containerProps.__fromCodeComponentNode && !constraintsEnabled(unwrappedProps)) {
        containerProps.width = "100%";
        containerProps.height = "100%";
        containerProps._constraints = { enabled: true };
        skipMeasureSize = false;
    }
    const calculatedContainerSize = useConstraints(unwrappedProps);
    const isPreview = RenderTarget.current() === RenderTarget.preview;
    const containerRef = useRef(null);
    const measuredContainerSize = useMeasureSize(containerRef, {
        observe: isPreview,
        skipHook: skipMeasureSize,
        initial: initialSize,
    });
    const containerSize = calculatedContainerSize || measuredContainerSize;
    const [contentSize, resizedChildren] = useScrollConstraints(containerSize, direction, children);
    const dragRef = useRef(null);
    const hasFixedContentSize = (contentWidth !== undefined && contentHeight !== undefined) || contentSize !== undefined;
    let actualContentSize = useChildrenSize(dragRef, {
        observe: isPreview,
        skipHook: hasFixedContentSize || !isPreview,
        initial: contentSize,
    });
    if (contentWidth !== undefined) {
        actualContentSize = { ...actualContentSize, width: contentWidth };
    }
    if (contentHeight !== undefined) {
        actualContentSize = { ...actualContentSize, height: contentHeight };
    }
    const dragConstraints = {
        top: -actualContentSize.height,
        left: -actualContentSize.width,
        right: 0,
        bottom: 0,
    };
    if (containerSize) {
        dragConstraints.top += containerSize.height;
        dragConstraints.left += containerSize.width;
    }
    else {
        if (typeof containerProps.width === "number") {
            dragConstraints.left += containerProps.width;
        }
        else if (containerProps.width === undefined) {
            dragConstraints.left += defaultFrameRect.width;
        }
        if (typeof containerProps.height === "number") {
            dragConstraints.top += containerProps.height;
        }
        else if (containerProps.height === undefined) {
            dragConstraints.top += defaultFrameRect.height;
        }
    }
    dragConstraints.top = Math.min(dragConstraints.top, 0);
    dragConstraints.left = Math.min(dragConstraints.left, 0);
    const getLatestPoint = () => ({ x: x.get(), y: y.get() });
    const resetInitialPoint = useCallback(() => {
        const point = getLatestPoint();
        initial.x = point.x;
        initial.y = point.y;
        prev.x = point.x;
        prev.y = point.y;
    }, []);
    const getPointData = useCallback(() => {
        const point = getLatestPoint();
        const data = {
            point,
            velocity: { x: x.getVelocity(), y: y.getVelocity() },
            offset: { x: point.x - initial.x, y: point.y - initial.y },
            delta: { x: point.x - prev.x, y: point.y - prev.y },
        };
        prev.x = point.x;
        prev.y = point.y;
        return data;
    }, [x, y]);
    const updateScrollListeners = useCallback(values => {
        onUpdate && onUpdate(values);
        onScroll && onScroll(getPointData());
    }, [onScroll, onUpdate, getPointData]);
    const onMotionDragStart = (event, info) => {
        resetInitialPoint();
        onDragStart && onDragStart(event, info);
        onScrollStart && onScrollStart(info);
    };
    const onMotionDragTransitionEnd = () => onScrollEnd && onScrollEnd(getPointData());
    useWheelScroll(containerRef, {
        enabled: wheelEnabled,
        initial,
        prev,
        direction,
        dragConstraints,
        offsetX: x,
        offsetY: y,
        onScrollStart,
        onScroll,
        onScrollEnd,
    });
    return (React.createElement(FrameWithMotion, Object.assign({}, containerProps, { overflow: overflow, style: { background: "transparent", ...style }, preserve3d: containerProps.preserve3d, ref: containerRef }),
        React.createElement(FrameWithMotion, { animate: scrollAnimate, drag: dragEnabled && convertScrollDirectionToDrag(direction), dragDirectionLock: directionLock, dragConstraints: dragConstraints, onDragStart: onMotionDragStart, onDrag: onDrag, onDragEnd: onDragEnd, onDragTransitionEnd: onMotionDragTransitionEnd, onUpdate: updateScrollListeners, onDirectionLock: onDirectionLock, width: actualContentSize.width, height: actualContentSize.height, style: {
                background: "transparent",
                overflow: "visible",
                x,
                y,
            }, preserve3d: containerProps.preserve3d },
            React.createElement("div", { ref: dragRef, style: { display: "contain" } },
                React.createElement(EmptyState, { children: children, size: {
                        width: (containerSize && containerSize.width) ||
                            unwrapMotionValue(containerProps.width) ||
                            defaultFrameRect.width,
                        height: (containerSize && containerSize.height) ||
                            unwrapMotionValue(containerProps.height) ||
                            defaultFrameRect.height,
                    }, insideUserCodeComponent: !containerProps.__fromCodeComponentNode, title: "Connect to scrollable content" }),
                resizedChildren))));
}
addPropertyControls(Scroll, {
    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        options: ["vertical", "horizontal", "both"],
        defaultValue: "vertical",
    },
    directionLock: {
        type: ControlType.Boolean,
        title: "Lock",
        enabledTitle: "1 Axis",
        disabledTitle: "Off",
        defaultValue: true,
    },
    dragEnabled: {
        type: ControlType.Boolean,
        title: "Drag scroll",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    wheelEnabled: {
        type: ControlType.Boolean,
        title: "Wheel scroll",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    onScroll: {
        type: ControlType.EventHandler,
    },
    onScrollStart: {
        type: ControlType.EventHandler,
    },
    onScrollEnd: {
        type: ControlType.EventHandler,
    },
});
Scroll.supportsConstraints = true;
