var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
import * as React from "react";
import { motionValue, useAnimation } from "framer-motion";
import { PageContainer } from "./PageContainer";
import { ControlType, FrameWithMotion, constraintsEnabled } from "../render";
import { EmptyState } from "./EmptyState";
import { RenderTarget } from "../render/types/RenderEnvironment";
import { isReactChild, isReactElement } from "../utils/type-guards";
import { isMotionValue } from "../render/utils/isMotionValue";
import { inertia } from "popmotion";
import { paddingFromProps, makePaddingString } from "./utils/paddingFromProps";
import { injectComponentCSSRules } from "../render/utils/injectComponentCSSRules";
import { addPropertyControls } from "../utils/addPropertyControls";
import { unwrapFrameProps } from "../render/presentation/Frame/FrameWithMotion";
import { useMeasureSize } from "./Scroll/useMeasureSize";
import { useWheelScroll } from "./Scroll/useWheelScroll";
import { warnOnce } from "../utils/warnOnce";
var ContentDimension;
(function (ContentDimension) {
  ContentDimension.Auto = "auto";
  ContentDimension.Stretch = "stretch";
})(ContentDimension || (ContentDimension = {}));
const pageContentDimensionOptions = [
  ContentDimension.Auto,
  ContentDimension.Stretch,
];
const pageContentDimensionTitles = pageContentDimensionOptions.map((option) => {
  switch (option) {
    case ContentDimension.Auto:
      return "Auto";
    case ContentDimension.Stretch:
      return "Stretch";
  }
});
const pageAlignmentOptions = ["start", "center", "end"];
const genericAlignmentTitles = pageAlignmentOptions.map((option) => {
  switch (option) {
    case "start":
      return "Start";
    case "center":
      return "Center";
    case "end":
      return "End";
  }
});
const horizontalAlignmentTitles = pageAlignmentOptions.map((option) => {
  switch (option) {
    case "start":
      return "Left";
    case "center":
      return "Center";
    case "end":
      return "Right";
  }
});
const verticalAlignmentTitles = pageAlignmentOptions.map((option) => {
  switch (option) {
    case "start":
      return "Top";
    case "center":
      return "Center";
    case "end":
      return "Bottom";
  }
});
const pageEffectOptions = ["none", "cube", "coverflow", "wheel", "pile"];
const pageEffectTitles = pageEffectOptions.map((option) => {
  switch (option) {
    case "none":
      return "None";
    case "cube":
      return "Cube";
    case "coverflow":
      return "Cover Flow";
    case "wheel":
      return "Wheel";
    case "pile":
      return "Pile";
  }
});
/**
 * The Page component allows you to create horizontally or vertically swipeable areas. It can be
 * imported from the Framer Library and used in code components. Add children to create pages to
 * swipe between. These children will be stretched to the size of the page component by default,
 * but can also be set to auto to maintain their original size.
 *
 * @remarks
 * ```jsx
 * import * as React from "react"
 * import { Frame, Page } from "framer"
 * export class Page extends React.Component {
 *   render() {
 *     return (
 *       <Page>
 *         <Frame />
 *       </Page>
 *     )
 *   }
 * }
 * ```
 * @public
 */
export function Page(props) {
  const {
      direction = "horizontal",
      contentWidth = ContentDimension.Stretch,
      contentHeight = ContentDimension.Stretch,
      alignment = "start",
      currentPage = 0,
      animateCurrentPageUpdate = true,
      gap: gapValue = 10,
      padding = 0,
      momentum = false,
      dragEnabled = true,
      defaultEffect = "none",
      background = "transparent",
      overflow = "hidden",
      __fromCodeComponentNode,
      effect,
      children,
      contentOffsetX,
      contentOffsetY,
      onChangePage,
      onScrollStart,
      onScroll,
      onDragStart,
      onDrag,
      onDragEnd,
      directionLock,
      onScrollEnd,
      onDirectionLock,
      onUpdate,
      wheelEnabled = false,
    } = props,
    rest = __rest(props, [
      "direction",
      "contentWidth",
      "contentHeight",
      "alignment",
      "currentPage",
      "animateCurrentPageUpdate",
      "gap",
      "padding",
      "momentum",
      "dragEnabled",
      "defaultEffect",
      "background",
      "overflow",
      "__fromCodeComponentNode",
      "effect",
      "children",
      "contentOffsetX",
      "contentOffsetY",
      "onChangePage",
      "onScrollStart",
      "onScroll",
      "onDragStart",
      "onDrag",
      "onDragEnd",
      "directionLock",
      "onScrollEnd",
      "onDirectionLock",
      "onUpdate",
      "wheelEnabled",
    ]);
  const containerProps = Object.assign(Object.assign({}, rest), { background });
  if (
    props.__fromCodeComponentNode &&
    !constraintsEnabled(unwrapFrameProps(props))
  ) {
    containerProps.width = "100%";
    containerProps.height = "100%";
    containerProps._constraints = { enabled: true };
  }
  const { initial, prev } = React.useRef({
    initial: { x: 0, y: 0 },
    prev: { x: 0, y: 0 },
  }).current;
  const isHorizontal = direction === "horizontal";
  let gap = gapValue;
  if (gap < 0) {
    warnOnce(
      `The 'gap' property of Page component can not be negative, but is ${gapValue}.`
    );
    gap = 0;
  }
  injectComponentCSSRules();
  const pageCount = React.Children.count(children);
  const [maxOffset, setMaxOffset] = React.useState(0);
  const maxOffsetRef = React.useRef(maxOffset);
  maxOffsetRef.current = maxOffset;
  const containerRef = React.useRef(null);
  const scrollableRef = React.useRef(null);
  const scrollControls = useAnimation();
  const pageEffectValuesRef = React.useRef([]);
  const pageRectsRef = React.useRef([]);
  const contentOffsetRef = React.useRef({
    x: isMotionValue(contentOffsetX)
      ? contentOffsetX
      : motionValue(contentOffsetX || 0),
    y: isMotionValue(contentOffsetY)
      ? contentOffsetY
      : motionValue(contentOffsetY || 0),
  });
  const currentContentPageRef = React.useRef(0);
  const currentDirectionRef = React.useRef(direction);
  const propsBoundedCurrentPageRef = React.useRef(0); // Bounded version of props.currentPage
  const latestPropsRef = React.useRef(props);
  latestPropsRef.current = props;
  const offsetForPage = useOffsetForPage(
    pageCount,
    pageRectsRef,
    isHorizontal,
    maxOffsetRef
  );
  const snapToPage = useSnapToPage(
    offsetForPage,
    scrollControls,
    currentContentPageRef,
    contentOffsetRef,
    isHorizontal
  );
  let skipMeasureSize = false;
  let initialSize = { width: 200, height: 200 };
  if (
    typeof containerProps.width === "number" &&
    typeof containerProps.height === "number"
  ) {
    initialSize = {
      width: containerProps.width,
      height: containerProps.height,
    };
    skipMeasureSize = true;
  }
  const measuredContainerSize = useMeasureSize(containerRef, {
    observe: RenderTarget.current() === RenderTarget.preview,
    skipHook: skipMeasureSize,
    initial: initialSize,
  });
  const applyEffects = () => {
    pageEffectValuesRef.current.forEach((effectDictionary, index) => {
      const values = effectValues(
        index,
        latestPropsRef,
        pageRectsRef,
        contentOffsetRef,
        maxOffsetRef
      );
      if (!effectDictionary || !values) return;
      for (const key in values) {
        if (isMotionValue(effectDictionary[key])) {
          // Because these are the actual Animatable values passed to the Frame
          // Updating their value will modify the Frame
          effectDictionary[key].set(values[key]);
        }
      }
    });
  };
  React.useLayoutEffect(() => {
    const contentOffset = contentOffsetRef.current;
    contentOffset.x.onChange(applyEffects);
    contentOffset.y.onChange(applyEffects);
    const boundedCurrentPage = getBoundedCurrentPage(currentPage, pageCount);
    snapToPage(boundedCurrentPage);
  }, []);
  React.useLayoutEffect(() => {
    const newPageContentRects = getPageContentRects(
      containerRef,
      measuredContainerSize,
      direction,
      gap
    );
    if (newPageContentRects) pageRectsRef.current = newPageContentRects;
    const newMaxOffset = getMaxOffset(
      measuredContainerSize,
      pageRectsRef.current,
      direction,
      props
    );
    if (newMaxOffset !== maxOffset) {
      setMaxOffset(newMaxOffset);
    }
    const newBoundedCurrentPage = getBoundedCurrentPage(currentPage, pageCount);
    const boundedCurrentPageDidChange =
      newBoundedCurrentPage !== propsBoundedCurrentPageRef.current;
    if (currentDirectionRef.current !== direction) {
      currentDirectionRef.current = direction;
      const contentOffset = contentOffsetRef.current;
      contentOffset.x.set(0);
      contentOffset.y.set(0);
    } else if (boundedCurrentPageDidChange) {
      propsBoundedCurrentPageRef.current = newBoundedCurrentPage;
      updateCurrentPage(
        newBoundedCurrentPage,
        currentContentPageRef,
        onChangePage
      );
      const animated =
        animateCurrentPageUpdate &&
        RenderTarget.current() !== RenderTarget.canvas;
      snapToPage(newBoundedCurrentPage, { animated });
    } else {
      snapToPage(newBoundedCurrentPage);
    }
  });
  const onDragStartHandler = (event, info) => {
    if (onScrollStart) onScrollStart(info);
    if (onDragStart) onDragStart(event, info);
    prev.x = initial.x = info.point.x;
    prev.y = initial.y = info.point.y;
  };
  const onDragHandler = (event, info) => {
    if (onScroll) onScroll(info);
    if (onDrag) onDrag(event, info);
    prev.x = info.point.x;
    prev.y = info.point.y;
  };
  const onDragTransitionEnd = () => {
    if (props.onDragTransitionEnd) props.onDragTransitionEnd();
    if (onScrollEnd) {
      const { x, y } = contentOffsetRef.current;
      const point = { x: x.get(), y: y.get() };
      onScrollEnd({
        point,
        velocity: { x: x.getVelocity(), y: y.getVelocity() },
        offset: { x: point.x - initial.x, y: point.y - initial.y },
        delta: { x: point.x - prev.x, y: point.y - prev.y },
      });
    }
  };
  const onDragEndHandler = async (event, info) => {
    const contentOffset = isHorizontal
      ? contentOffsetRef.current.x
      : contentOffsetRef.current.y;
    contentOffset.stop();
    const startPosition = contentOffset.get();
    const axis = isHorizontal ? "x" : "y";
    const velocity = info.velocity[axis];
    let index = nearestPageIndex(
      pageRectsRef.current,
      startPosition,
      startPosition,
      isHorizontal,
      momentum
    );
    if (velocity) {
      /**
       * TODO: This is a bit hacky. We're hijacking the inertia animation for the modifyTarget functionality. Maybe this is information we can
       * pass through the `onDragEnd` event handler if `dragMomentum` is `true`.
       */
      inertia({
        from: startPosition,
        velocity,
        modifyTarget: (endPosition) => {
          index = nearestPageIndex(
            pageRectsRef.current,
            startPosition,
            endPosition,
            isHorizontal,
            momentum
          );
          return endPosition;
        },
      })
        .start()
        .stop();
    }
    updateCurrentPage(index, currentContentPageRef, onChangePage);
    const offset = offsetForPage(index);
    if (onDragEnd) onDragEnd(event, info);
    await scrollControls.start({
      [axis]: offset,
      transition: {
        type: "spring",
        from: startPosition,
        velocity: velocity,
        stiffness: 500,
        damping: 50,
      },
    });
    onDragTransitionEnd();
  };
  pageEffectValuesRef.current = [];
  const childComponents = React.Children.map(children, (child, index) => {
    if (!isReactChild(child) || !isReactElement(child)) {
      return child;
    }
    const update = {
      right: undefined,
      bottom: undefined,
      top: undefined,
      left: undefined,
      _constraints: {
        enabled: false,
      },
    };
    if (contentWidth === "stretch") {
      update.width = "100%";
    }
    if (contentHeight === "stretch") {
      update.height = "100%";
    }
    let effectDictionary;
    const values = effectValues(
      index,
      latestPropsRef,
      pageRectsRef,
      contentOffsetRef,
      maxOffsetRef
    );
    if (values) {
      // We use motion values so we can set them in the onMove function
      effectDictionary = {};
      for (const key in values) {
        effectDictionary[key] = motionValue(values[key]);
      }
    }
    pageEffectValuesRef.current.push(effectDictionary);
    return React.createElement(
      PageContainer,
      {
        key: index,
        effect: effectDictionary,
        dragEnabled: dragEnabled,
        direction: direction,
        contentHeight: contentHeight,
        contentWidth: contentWidth,
        alignment: alignment,
        gap: gap,
        isLastPage: index === pageCount - 1,
        contentOffset: contentOffsetRef.current,
        scrollControls: scrollControls,
        maxScrollOffset: maxOffset,
        directionLock: directionLock,
        onDragStart: onDragStartHandler,
        onDrag: onDragHandler,
        onDragEnd: onDragEndHandler,
      },
      React.cloneElement(child, update)
    );
  });
  useWheelScroll(scrollableRef, {
    enabled: wheelEnabled,
    initial,
    prev,
    direction,
    dragConstraints: {
      top: -maxOffset,
      left: -maxOffset,
      right: 0,
      bottom: 0,
    },
    offsetX: contentOffsetRef.current.x,
    offsetY: contentOffsetRef.current.y,
    onScrollStart,
    onScroll,
    onScrollEnd,
  });
  return React.createElement(
    FrameWithMotion,
    Object.assign(
      {
        preserve3d: false,
        perspective: hasEffect(props) ? 1200 : undefined,
        overflow: overflow,
      },
      containerProps,
      { ref: containerRef }
    ),
    React.createElement(
      FrameWithMotion,
      {
        "data-framer-component-type": "Page",
        ref: scrollableRef,
        background: null,
        x: contentOffsetRef.current.x,
        y: contentOffsetRef.current.y,
        animate: scrollControls,
        width: "100%",
        height: "100%",
        preserve3d: true,
        style: {
          padding: makePaddingString(paddingFromProps(props)),
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
        },
      },
      React.createElement(EmptyState, {
        children: children,
        size: {
          width: "100%",
          height: "100%",
        },
        insideUserCodeComponent: !__fromCodeComponentNode,
      }),
      childComponents
    )
  );
}
addPropertyControls(Page, {
  direction: {
    type: ControlType.SegmentedEnum,
    options: ["horizontal", "vertical"],
    title: "Direction",
    defaultValue: "horizontal",
  },
  directionLock: {
    type: ControlType.Boolean,
    title: "Lock",
    enabledTitle: "1 Axis",
    disabledTitle: "Off",
    defaultValue: true,
  },
  contentWidth: {
    type: ControlType.SegmentedEnum,
    options: pageContentDimensionOptions,
    optionTitles: pageContentDimensionTitles,
    title: "Width",
    defaultValue: ContentDimension.Stretch,
  },
  contentHeight: {
    type: ControlType.SegmentedEnum,
    options: pageContentDimensionOptions,
    optionTitles: pageContentDimensionTitles,
    title: "Height",
    defaultValue: ContentDimension.Stretch,
  },
  alignment: {
    type: ControlType.SegmentedEnum,
    options: pageAlignmentOptions,
    optionTitles(props) {
      if (!props) return genericAlignmentTitles;
      const crossDirectionIsHorizontal = props.direction !== "horizontal";
      return crossDirectionIsHorizontal
        ? horizontalAlignmentTitles
        : verticalAlignmentTitles;
    },
    title: "Align",
    hidden(props) {
      const { direction, contentWidth, contentHeight } = props;
      const isHorizontalDirection = direction === "horizontal";
      const crossDimension = isHorizontalDirection
        ? contentHeight
        : contentWidth;
      return crossDimension === ContentDimension.Stretch;
    },
    defaultValue: "start",
  },
  gap: {
    type: ControlType.Number,
    min: 0,
    title: "Gap",
    defaultValue: 0,
  },
  padding: {
    type: ControlType.FusedNumber,
    toggleKey: "paddingPerSide",
    toggleTitles: ["Padding", "Padding per side"],
    valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    valueLabels: ["T", "R", "B", "L"],
    min: 0,
    title: "Padding",
    defaultValue: 0,
  },
  currentPage: {
    type: ControlType.Number,
    min: 0,
    title: "Current",
    displayStepper: true,
    defaultValue: 0,
  },
  momentum: {
    type: ControlType.Boolean,
    enabledTitle: "On",
    disabledTitle: "Off",
    title: "Momentum",
    defaultValue: false,
  },
  dragEnabled: {
    type: ControlType.Boolean,
    title: "Dragging",
    enabledTitle: "On",
    disabledTitle: "Off",
    defaultValue: true,
  },
  wheelEnabled: {
    type: ControlType.Boolean,
    title: "Wheel scroll",
    enabledTitle: "On",
    disabledTitle: "Off",
    defaultValue: false,
  },
  defaultEffect: {
    type: ControlType.Enum,
    options: pageEffectOptions,
    optionTitles: pageEffectTitles,
    title: "Effect",
    defaultValue: "none",
  },
  children: {
    type: ControlType.Array,
    title: "Content",
    propertyControl: { type: ControlType.ComponentInstance, title: "Page" },
  },
  onChangePage: {
    type: ControlType.EventHandler,
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
Page.supportsConstraints = true;
// Effects
function cubeEffect(info) {
  const { normalizedOffset, direction } = info;
  const isHorizontal = direction === "horizontal";
  return {
    originX: normalizedOffset < 0 ? 1 : 0,
    originY: normalizedOffset < 0 ? 1 : 0,
    rotateY: isHorizontal
      ? Math.min(Math.max(-90, normalizedOffset * 90), 90)
      : 0,
    rotateX: isHorizontal
      ? 0
      : Math.min(Math.max(-90, normalizedOffset * -90), 90),
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };
}
function coverflowEffect(info) {
  const { normalizedOffset, direction, size } = info;
  const isHorizontal = direction === "horizontal";
  return {
    rotateY: isHorizontal
      ? Math.min(45, Math.max(-45, normalizedOffset * -45))
      : 0,
    rotateX: isHorizontal
      ? 0
      : Math.min(45, Math.max(-45, normalizedOffset * 45)),
    originX: isHorizontal ? (normalizedOffset < 0 ? 0 : 1) : 0.5,
    originY: isHorizontal ? 0.5 : normalizedOffset < 0 ? 0 : 1,
    x: isHorizontal ? `${normalizedOffset * -25}%` : 0,
    y: isHorizontal ? 0 : `${normalizedOffset * -25}%`,
    z: -Math.abs(normalizedOffset),
    scale: 1 - Math.abs(normalizedOffset / 10),
  };
}
function pileEffect(info) {
  const { normalizedOffset, direction, size } = info;
  const isHorizontal = direction === "horizontal";
  const offset = `calc(${Math.abs(normalizedOffset) * 100}% - ${
    Math.abs(normalizedOffset) * 8
  }px)`;
  return {
    x: normalizedOffset < 0 && isHorizontal ? offset : 0,
    y: normalizedOffset < 0 && !isHorizontal ? offset : 0,
    scale: normalizedOffset < 0 ? 1 - Math.abs(normalizedOffset) / 50 : 1,
  };
}
function wheelEffect(info) {
  const { normalizedOffset, direction, size } = info;
  const isHorizontal = direction === "horizontal";
  const originZ =
    ((isHorizontal ? size.width : size.height) * 18) / (2 * Math.PI);
  const rotateX = isHorizontal ? 0 : normalizedOffset * -20;
  const rotateY = isHorizontal ? normalizedOffset * 20 : 0;
  const y = isHorizontal ? 0 : normalizedOffset * -size.height;
  const x = isHorizontal ? normalizedOffset * -size.width : 0;
  return {
    opacity: 1 - Math.abs(normalizedOffset) / 4,
    transform: `translate(${x}px, ${y}px) translateZ(-${originZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${originZ}px)`,
  };
}
function getDefaultEffect(type) {
  switch (type) {
    case "cube":
      return cubeEffect;
    case "coverflow":
      return coverflowEffect;
    case "pile":
      return pileEffect;
    case "wheel":
      return wheelEffect;
    default:
      return null;
  }
}
function nearestPageIndex(
  pageRects,
  startPosition,
  endPosition,
  isHorizontalDirection,
  allowSkippingPages
) {
  const distanceToStart = function (rect) {
    const rectPosition = isHorizontalDirection ? rect.x : rect.y;
    return Math.abs(rectPosition + startPosition);
  };
  const distanceToEnd = function (rect) {
    const rectPosition = isHorizontalDirection ? rect.x : rect.y;
    return Math.abs(rectPosition + endPosition);
  };
  if (allowSkippingPages) {
    const closestPages = [...pageRects].sort(
      (a, b) => distanceToEnd(a) - distanceToEnd(b)
    );
    return pageRects.indexOf(closestPages[0]);
  } else {
    const closestToStart = [...pageRects].sort(
      (a, b) => distanceToStart(a) - distanceToStart(b)
    );
    if (closestToStart.length === 1)
      return pageRects.indexOf(closestToStart[0]);
    const pageA = closestToStart[0];
    const pageB = closestToStart[1];
    const closestPages = [pageA, pageB].sort(
      (a, b) => distanceToEnd(a) - distanceToEnd(b)
    );
    return pageRects.indexOf(closestPages[0]);
  }
}
function getPageContentRects(containerRef, containerSize, direction, gap) {
  const containerElement = containerRef.current;
  if (!containerElement) return;
  // We need to keep strict selector here to have correct size if there is nested Page component
  const contentWrappers = containerElement.querySelectorAll(
    `:scope > [data-framer-component-type="Page"] > [data-framer-component-type="PageContainer"] > [data-framer-component-type="PageContentWrapper"]`
  );
  const sizes = [];
  contentWrappers.forEach((contentWrapper) => {
    if (
      contentWrapper instanceof HTMLElement &&
      contentWrapper.firstChild instanceof HTMLElement
    ) {
      let width = contentWrapper.firstChild.offsetWidth;
      let height = contentWrapper.firstChild.offsetHeight;
      if (process.env.NODE_ENV === "test") {
        width = 100;
        height = 100;
      }
      sizes.push({ width, height });
    } else {
      sizes.push(null);
    }
  });
  let maxX = 0;
  let maxY = 0;
  const isHorizontal = direction === "horizontal";
  return sizes.map((queriedSize) => {
    const size = queriedSize || containerSize;
    const x = maxX;
    const y = maxY;
    if (isHorizontal) {
      maxX += size.width + gap;
    } else {
      maxY += size.height + gap;
    }
    return Object.assign(Object.assign({}, size), { x, y });
  });
}
function getMaxOffset(
  containerSize,
  pageContentRects,
  direction,
  paddingProps
) {
  const lastPageRect = pageContentRects[pageContentRects.length - 1];
  if (!lastPageRect) return 0;
  const paddingSides = paddingFromProps(paddingProps);
  const isHorizontal = direction === "horizontal";
  const paddingStart = isHorizontal ? paddingSides.left : paddingSides.top;
  const paddingEnd = isHorizontal ? paddingSides.right : paddingSides.bottom;
  const pageWidth = isHorizontal ? lastPageRect.width : lastPageRect.height;
  const containerWidth = isHorizontal
    ? containerSize.width
    : containerSize.height;
  const freeSpace = containerWidth - paddingStart - paddingEnd - pageWidth;
  const target = isHorizontal ? lastPageRect.x : lastPageRect.y;
  if (freeSpace <= 0) return target;
  return target - freeSpace;
}
function useOffsetForPage(pageCount, pageRectsRef, isHorizontal, maxOffsetRef) {
  return (index) => {
    const pageIndex = Math.max(0, Math.min(pageCount - 1, index));
    const currentPageRect = pageRectsRef.current[pageIndex];
    if (!currentPageRect) {
      return 0;
    }
    if (isHorizontal) {
      return -Math.min(currentPageRect.x, maxOffsetRef.current);
    } else {
      return -Math.min(currentPageRect.y, maxOffsetRef.current);
    }
  };
}
function useSnapToPage(
  offsetForPage,
  scrollControls,
  currentContentPageRef,
  contentOffsetRef,
  isHorizontal
) {
  return (pageIndex, options) => {
    const offset = offsetForPage(pageIndex);
    currentContentPageRef.current = pageIndex;
    const contentOffset = isHorizontal
      ? contentOffsetRef.current.x
      : contentOffsetRef.current.y;
    if (!options || !options.animated) {
      contentOffset.set(offset);
      return;
    } // else
    const axis = isHorizontal ? "x" : "y";
    scrollControls.start({
      [axis]: offset,
      transition: {
        type: "spring",
        from: contentOffset.get(),
        velocity: contentOffset.getVelocity(),
        stiffness: 500,
        damping: 50,
      },
    });
  };
}
// The current page property is capped to the number of children when positive, and cycles from last when negative
function getBoundedCurrentPage(pageIndex, pageCount) {
  return pageIndex >= 0
    ? Math.min(pageIndex, pageCount - 1)
    : ((pageIndex % pageCount) + pageCount) % pageCount;
}
function effectValues(
  index,
  latestPropsRef,
  pageRectsRef,
  contentOffsetRef,
  maxOffsetRef
) {
  const {
    direction: latestDirection = "horizontal",
    defaultEffect: latestDefaultEffect,
    effect: latestEffect,
    gap: latestGap = 0,
  } = latestPropsRef.current;
  const latestIsHorizontal = latestDirection === "horizontal";
  const pageRect = pageRectsRef.current[index] || {
    x: latestIsHorizontal ? index * 200 + latestGap : 0,
    y: latestIsHorizontal ? 0 : index * 200 + latestGap,
    width: 200,
    height: 200,
  };
  const effectFunction = latestEffect || getDefaultEffect(latestDefaultEffect);
  if (!effectFunction) return null;
  let offset;
  let normalizedOffset;
  const contentOffset = contentOffsetRef.current;
  const maxScrollOffset = maxOffsetRef.current;
  if (latestIsHorizontal) {
    offset =
      Math.min(pageRect.x, maxScrollOffset) +
      (contentOffset ? contentOffset.x.get() : 0);
    normalizedOffset = offset / (pageRect.width + latestGap);
  } else {
    offset =
      Math.min(pageRect.y, maxScrollOffset) +
      (contentOffset ? contentOffset.y.get() : 0);
    normalizedOffset = offset / (pageRect.height + latestGap);
  }
  const size = { width: pageRect.width, height: pageRect.height };
  return effectFunction({
    offset,
    normalizedOffset,
    size,
    index,
    direction: latestDirection,
    gap: latestGap,
    pageCount: pageRectsRef.current.length,
  });
}
function hasEffect(props) {
  return !!props.effect || !!getDefaultEffect(props.defaultEffect);
}
function updateCurrentPage(newPageIndex, currentContentPageRef, onChangePage) {
  if (currentContentPageRef.current === newPageIndex) return;
  if (onChangePage) onChangePage(newPageIndex, currentContentPageRef.current);
  currentContentPageRef.current = newPageIndex;
}
