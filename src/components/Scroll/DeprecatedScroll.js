import { Draggable } from "../Draggable";
import * as React from "react";
import { Rect, ControlType, DeprecatedFrame, } from "../../render";
import { isRectProviding } from "../utils/RectProvider";
import { getObservableNumber } from "../../utils/observable";
import { EmptyState } from "../EmptyState";
import { ConsumeParentSize, deprecatedParentSize } from "../../render/types/NewConstraints";
/**
 * The Scroll component in Framer allows you create scrollable areas.
 * @remarks
 * It can be imported from the Framer Library and used in code components.
 * Add children that exceed the height or width of the component to create
 * horizontally or vertically scrollable areas.
 *
 * ```jsx
 * const MyComponent: React.SFC<DeprecatedScrollProps> = props => {
 *   return (
 *     <Scroll {...props} direction="vertical">
 *       <Frame width={props.width} height={props.height * 2}>
 *         Hello
 *       </Frame>
 *      </Scroll>
 *   )
 * }
 * ```
 *
 * See: {@link DeprecatedScrollProps} for its properties
 * @public
 */
export class DeprecatedScroll extends React.Component {
    wrapHandlers(dragHandler, scrollHandler) {
        if (!scrollHandler) {
            return dragHandler;
        }
        return (event, draggable) => {
            if (dragHandler) {
                dragHandler(event, draggable);
            }
            scrollHandler(event, this);
        };
    }
    /** @internal */
    render() {
        return (React.createElement(ConsumeParentSize, null, ({ size: newParentSize }) => {
            const parentSize = deprecatedParentSize(newParentSize);
            const frameProps = Object.assign({}, this.props, {
                parentSize,
            });
            Object.keys(DeprecatedScroll.scrollProps).map(key => {
                delete frameProps[key];
            });
            // If there are no children we render a single child at the size of the component so we have visual feedback.
            if (!this.props.children) {
                return (React.createElement(DeprecatedFrame, Object.assign({}, frameProps),
                    React.createElement(Draggable, { width: frameProps.width, height: frameProps.height })));
            }
            // TODO: Move this to Frame.contentFrame
            const contentSize = { top: 0, left: 0, bottom: 0, right: 0 };
            const { width, height } = DeprecatedFrame.rect(frameProps);
            const children = React.Children.map(this.props.children, (child) => {
                if (child === null || typeof child !== "object" || typeof child.type === "string") {
                    return child;
                }
                const type = child.type;
                if (isRectProviding(type)) {
                    const frame = type.rect(child.props, parentSize);
                    if (frame) {
                        // TODO: move this to utils/frame as merge(frame: Frame)?
                        contentSize.top = Math.min(Rect.minY(frame), contentSize.top);
                        contentSize.left = Math.min(Rect.minX(frame), contentSize.left);
                        contentSize.bottom = Math.max(Rect.maxY(frame), contentSize.bottom);
                        contentSize.right = Math.max(Rect.maxX(frame), contentSize.right);
                    }
                }
                const update = {};
                if (this.props.direction === "vertical") {
                    update.width = width;
                }
                else if (this.props.direction === "horizontal") {
                    update.height = height;
                }
                return React.cloneElement(child, update);
            });
            const { onScrollStart, onScroll, onScrollEnd, onScrollSessionStart, onScrollSessionEnd, } = this.props;
            const w = getObservableNumber(width);
            const h = getObservableNumber(height);
            const contentW = Math.max(contentSize.right, w);
            const contentH = Math.max(contentSize.bottom, h);
            const x = Math.min(0, w - contentW);
            const y = Math.min(0, h - contentH);
            const constraints = {
                x: x,
                y: y,
                width: contentW + contentW - w,
                height: contentH + contentH - h,
            };
            const draggableProps = {};
            draggableProps.enabled = this.props.draggingEnabled;
            draggableProps.background = "none";
            draggableProps.width = contentW;
            draggableProps.height = contentH;
            draggableProps.constraints = constraints;
            draggableProps.onMove = this.props.onMove;
            draggableProps.onDragSessionStart = this.wrapHandlers(this.props.onDragSessionStart, onScrollSessionStart);
            draggableProps.onDragSessionMove = this.props.onDragSessionMove;
            draggableProps.onDragSessionEnd = this.wrapHandlers(this.props.onDragSessionEnd, onScrollSessionEnd);
            draggableProps.onDragAnimationStart = this.props.onDragAnimationStart;
            draggableProps.onDragAnimationEnd = this.props.onDragAnimationEnd;
            draggableProps.onDragDidMove = this.wrapHandlers(this.props.onDragDidMove, onScroll);
            draggableProps.onDragDirectionLockStart = this.props.onDragDirectionLockStart;
            draggableProps.onDragStart = this.wrapHandlers(this.props.onDragStart, onScrollStart);
            draggableProps.onDragEnd = this.wrapHandlers(this.props.onDragEnd, onScrollEnd);
            draggableProps.onDragWillMove = this.props.onDragWillMove;
            draggableProps.horizontal = this.props.direction !== "vertical";
            draggableProps.vertical = this.props.direction !== "horizontal";
            draggableProps.directionLock = this.props.directionLock;
            draggableProps.mouseWheel = true; // TODO: see https://github.com/framer/company/issues/10018 for future direction
            draggableProps.left = this.props.contentOffsetX;
            draggableProps.top = this.props.contentOffsetY;
            draggableProps.preserve3d = this.props.preserve3d;
            return (React.createElement(DeprecatedFrame, Object.assign({}, frameProps),
                React.createElement(Draggable, Object.assign({}, draggableProps), children),
                React.createElement(EmptyState, { children: this.props.children, size: { width: w, height: h }, title: "Connect to scrollable content" })));
        }));
    }
}
/** @internal */
DeprecatedScroll.supportsConstraints = true;
/** @internal */
DeprecatedScroll.scrollProps = {
    draggingEnabled: true,
    direction: "vertical",
    directionLock: true,
    mouseWheel: true,
    contentOffsetX: null,
    contentOffsetY: null,
};
/** @internal */
DeprecatedScroll.defaultProps = Object.assign({}, DeprecatedFrame.defaultProps, DeprecatedScroll.scrollProps, {
    overflow: "visible",
    background: "none",
    width: "100%",
    height: "100%",
});
/** @internal */
DeprecatedScroll.propertyControls = {
    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        options: ["vertical", "horizontal", "both"],
    },
    directionLock: {
        type: ControlType.Boolean,
        title: "Lock",
        enabledTitle: "1 Axis",
        disabledTitle: "Off",
        hidden(props) {
            return props.direction !== "both";
        },
    },
};
