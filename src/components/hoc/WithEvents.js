import * as React from "react";
import { FramerEvent } from "../../events/FramerEvent";
import { DraggingContext } from "./WithDragging";
const hoistNonReactStatic = require("hoist-non-react-statics");
const hoverProps = {
  onMouseEnter: "mouseenter",
  onMouseLeave: "mouseleave",
};
const hoverEventKeys = Object.keys(hoverProps);
const eventHandlerMapping = {
  panstart: ["onPanStart"],
  pan: ["onPan"],
  panend: ["onPanEnd"],
  tapstart: ["onTapStart", "onMouseDown"],
  tap: ["onTap", "onClick"],
  tapend: ["onTapEnd", "onMouseUp"],
  mousewheelstart: ["onMouseWheelStart"],
  mousewheel: ["onMouseWheel"],
  mousewheelend: ["onMouseWheelEnd"],
};
const tapEventKeys = new Set(["tapstart", "tap", "tapend"]);
export function WithEvents(BaseComponent) {
  var _a;
  const withEvents =
    ((_a = class WithEventsHOC extends React.Component {
      constructor() {
        super(...arguments);
        // This local variable is used to track if we should ignore a tap after a drag
        // It's not in a state because we want to change it from the render function (so not cause a render)
        this.shouldCancelTap = false;
        this.activeEventListeners = new Map();
        this.hasFramerEventListener = false;
        this.component = React.createRef();
      }
      get element() {
        return this.component.current && this.component.current.element;
      }
      componentDidMount() {
        this.addEventListeners();
      }
      componentDidUpdate(prevProps) {
        this.addEventListeners(prevProps);
      }
      componentWillUnmount() {
        this.removeEventListeners();
      }
      addEventListeners(prevProps) {
        if (this.element && !this.hasFramerEventListener) {
          this.element.addEventListener("FramerEvent", ({ detail }) => {
            const type = detail.type;
            const framerEvent = detail.event;
            this.handleEvent(type, framerEvent);
          });
          hoverEventKeys.forEach((eventName) => this.addHoverEvent(eventName));
          this.hasFramerEventListener = true;
        } else if (this.element && prevProps) {
          hoverEventKeys.forEach((eventName) =>
            this.checkHoverEvent(eventName, prevProps)
          );
        } else if (!this.element) {
          this.hasFramerEventListener = false;
        }
      }
      removeEventListeners() {
        hoverEventKeys.forEach((eventName) => this.removeHoverEvent(eventName));
      }
      addHoverEvent(eventName) {
        const originalEventListener = this.props[eventName];
        if (this.element && originalEventListener) {
          const eventListener = (e) => {
            const framerEvent = new FramerEvent(e);
            originalEventListener(framerEvent);
          };
          this.activeEventListeners.set(eventName, eventListener);
          const domEventName = hoverProps[eventName];
          this.element.addEventListener(domEventName, eventListener);
        }
      }
      removeHoverEvent(eventName) {
        const eventListener = this.activeEventListeners.get(eventName);
        if (this.element && eventListener) {
          const domEventName = hoverProps[eventName];
          this.element.removeEventListener(domEventName, eventListener);
          this.activeEventListeners.delete(eventName);
        }
      }
      checkHoverEvent(eventName, prevProps) {
        if (prevProps[eventName] !== this.props[eventName]) {
          this.removeHoverEvent(eventName);
          this.addHoverEvent(eventName);
        }
      }
      handleEvent(type, framerEvent) {
        const eventListenerKeys = eventHandlerMapping[type];
        if (!eventListenerKeys) return;
        eventListenerKeys.forEach((eventKey) => {
          const eventListener = this.props[eventKey];
          const cancelEvent =
            this.shouldCancelTap && tapEventKeys.has(eventKey);
          if (eventListener && !cancelEvent) {
            eventListener(framerEvent);
          }
        });
      }
      render() {
        return React.createElement(DraggingContext.Consumer, null, (value) => {
          this.shouldCancelTap = value.dragging;
          return React.createElement(
            BaseComponent,
            Object.assign({}, this.props, { ref: this.component })
          );
        });
      }
    }),
    (_a.defaultProps = Object.assign({}, BaseComponent.defaultProps)),
    _a);
  hoistNonReactStatic(withEvents, BaseComponent);
  return withEvents;
}
