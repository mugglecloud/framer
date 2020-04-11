import * as React from "react";
import { FramerEvent } from "../FramerEvent";
import { safeWindow } from "../../utils/safeWindow";
/**
 * @internal
 */
export class MouseEventListener extends React.Component {
    constructor() {
        super(...arguments);
        /**
         * @internal
         */
        this.domMouseDown = (originalEvent) => {
            safeWindow.addEventListener("mousemove", this.domMouseMove);
            safeWindow.addEventListener("mouseup", this.domMouseUp);
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.pointerDown(event);
        };
        /**
         * @internal
         */
        this.domMouseMove = (originalEvent) => {
            const leftMouseButtonOnlyDown = originalEvent.buttons === undefined ? originalEvent.which === 1 : originalEvent.buttons === 1;
            // mousemoves should only be registred when left mouse button is down
            if (!leftMouseButtonOnlyDown) {
                this.domMouseUp(originalEvent);
                return;
            }
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.pointerMove(event);
        };
        /**
         * @internal
         */
        this.domMouseUp = (originalEvent) => {
            safeWindow.removeEventListener("mousemove", this.domMouseMove);
            safeWindow.removeEventListener("mouseup", this.domMouseUp);
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.pointerUp(event);
        };
        /**
         * @internal
         */
        this.domMouseWheel = (originalEvent) => {
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.mouseWheel(event);
        };
    }
    /**
     * @internal
     */
    render() {
        return this.props.children;
    }
    /**
     * @internal
     */
    componentDidMount() {
        safeWindow.addEventListener("mousedown", this.domMouseDown);
        safeWindow.addEventListener("wheel", this.domMouseWheel);
    }
    /**
     * @internal
     */
    componentWillUnmount() {
        safeWindow.removeEventListener("mousemove", this.domMouseMove);
        safeWindow.removeEventListener("mousedown", this.domMouseDown);
        safeWindow.removeEventListener("mouseup", this.domMouseUp);
        safeWindow.removeEventListener("wheel", this.domMouseWheel);
    }
}
