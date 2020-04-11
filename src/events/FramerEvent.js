import { pointForEvent } from "../utils/events";
import { MainLoop } from "../core/Loop";
import { Point } from "../render";
import { environment } from "../utils";
/**
 * @public
 */
export class FramerEvent {
    /**
     * @internal
     */
    constructor(
    /** @internal */ originalEvent, 
    /** @internal */ session) {
        this.originalEvent = originalEvent;
        this.session = session;
        /**
         * @internal
         */
        this.time = Date.now();
        /**
         * @internal
         */
        this.loopTime = MainLoop.time;
        const customTarget = (session && session.startEvent && session.startEvent.target) || originalEvent.target;
        const eventLike = FramerEvent.eventLikeFromOriginalEvent(originalEvent);
        this.point = pointForEvent(eventLike, customTarget);
        const deviceTarget = session && session.originElement ? session.originElement : document.body;
        this.devicePoint = pointForEvent(eventLike, deviceTarget);
        this.target = originalEvent.target || null;
        const lastEvent = session && session.lastEvent;
        if (originalEvent instanceof WheelEvent) {
            this.delta = { x: originalEvent.deltaX, y: originalEvent.deltaY };
        }
        else if (lastEvent && this.devicePoint && lastEvent.devicePoint) {
            this.delta = Point.subtract(this.devicePoint, lastEvent.devicePoint);
        }
        else {
            this.delta = { x: 0, y: 0 };
        }
    }
    static eventLikeFromOriginalEvent(originalEvent) {
        if ("touches" in originalEvent) {
            let touches = originalEvent.touches;
            if (!touches || !touches.length) {
                // touchend events only have changed touches
                if (originalEvent.changedTouches && originalEvent.changedTouches.length) {
                    touches = originalEvent.changedTouches;
                }
            }
            if (!touches || !touches.length) {
                return { pageX: 0, pageY: 0, target: null };
            }
            const firstTouch = touches[0];
            // We use the clientX first, because that one is not affected by the page's scrolling
            // (which influences the event position even if the body is position: fixed)
            const pageX = firstTouch.clientX || firstTouch.screenX || firstTouch.pageX;
            const pageY = firstTouch.clientY || firstTouch.screenY || firstTouch.pageY;
            return {
                pageX,
                pageY,
                target: originalEvent.target,
            };
        }
        return originalEvent;
    }
    /**
     * @internal
     */
    velocity(t) {
        return this.session ? this.session.velocity(t) : { x: 0, y: 0 };
    }
    /**
     * @internal
     */
    get offset() {
        return this.session ? this.session.offset(this) : { x: 0, y: 0 };
    }
    /**
     * @internal
     */
    get isLeftMouseClick() {
        if (environment.isTouch()) {
            return undefined;
        }
        if ("button" in this.originalEvent && "buttons" in this.originalEvent && "ctrlKey" in this.originalEvent) {
            return (this.originalEvent.button === 0 || this.originalEvent.buttons === 1) && !this.originalEvent.ctrlKey;
        }
        return false;
    }
}
