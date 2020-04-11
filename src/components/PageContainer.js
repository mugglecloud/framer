import * as React from "react";
import { FrameWithMotion } from "../render";
import { toJustifyOrAlignment } from "./Stack/Stack";
export function PageContainer({
  children,
  effect,
  dragEnabled,
  direction,
  contentHeight,
  contentWidth,
  alignment,
  gap,
  isLastPage,
  contentOffset,
  scrollControls,
  maxScrollOffset,
  directionLock,
  onDragStart,
  onDrag,
  onDragEnd,
}) {
  const isHorizontalDirection = direction === "horizontal";
  const dragAxis = isHorizontalDirection ? "x" : "y";
  const hasHorizontalGap = isHorizontalDirection && !isLastPage && gap;
  const hasVerticalGap = !isHorizontalDirection && !isLastPage && gap;
  const hasAutoWidth = contentWidth !== "stretch" && isHorizontalDirection;
  const hasAutoHeight = contentHeight !== "stretch" && !isHorizontalDirection;
  const wrapperWidth = hasAutoWidth ? "auto" : "100%";
  const wrapperHeight = hasAutoHeight ? "auto" : "100%";
  const containerWidth =
    hasHorizontalGap && wrapperWidth === "100%"
      ? `calc(100% + ${gap}px)`
      : wrapperWidth;
  const containerHeight =
    hasVerticalGap && wrapperHeight === "100%"
      ? `calc(100% + ${gap}px)`
      : wrapperHeight;
  return React.createElement(
    FrameWithMotion,
    {
      position: "relative",
      "data-framer-component-type": "PageContainer",
      width: containerWidth,
      height: containerHeight,
      background: "transparent",
      drag: dragEnabled ? dragAxis : false,
      dragDirectionLock: directionLock,
      _dragValueX: contentOffset.x,
      _dragValueY: contentOffset.y,
      _dragTransitionControls: scrollControls,
      dragConstraints: {
        top: -maxScrollOffset,
        left: -maxScrollOffset,
        right: 0,
        bottom: 0,
      },
      onDrag: onDrag,
      onDragStart: onDragStart,
      onDragEnd: onDragEnd,
      preserve3d: true,
      style: {
        paddingRight: hasHorizontalGap ? gap : 0,
        paddingBottom: hasVerticalGap ? gap : 0,
      },
    },
    React.createElement(
      FrameWithMotion,
      {
        position: "relative",
        "data-framer-component-type": "PageContentWrapper",
        width: wrapperWidth,
        height: wrapperHeight,
        preserve3d: false,
        key: effect ? Object.keys(effect).join("") : "",
        background: "transparent",
        style: Object.assign(Object.assign({}, effect), {
          display: "flex",
          flexDirection: isHorizontalDirection ? "row" : "column",
          alignItems: alignment && toJustifyOrAlignment(alignment),
        }),
      },
      children
    )
  );
}
