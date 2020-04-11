import * as React from "react";
import { FramerEvent } from "../";
import { safeWindow } from "../../utils/safeWindow";
/**
 * @internal
 */
export class TouchEventListener extends React.Component {
    constructor() {
        super(...arguments);
        /**
         * @internal
         */
        this.domTouchStart = (originalEvent) => {
            safeWindow.addEventListener("touchmove", this.domTouchMove);
            safeWindow.addEventListener("touchend", this.domTouchEnd);
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.pointerDown(event);
        };
        /**
         * @internal
         */
        this.domTouchMove = (originalEvent) => {
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.pointerMove(event);
        };
        /**
         * @internal
         */
        this.domTouchEnd = (originalEvent) => {
            safeWindow.removeEventListener("touchmove", this.domTouchMove);
            safeWindow.removeEventListener("touchend", this.domTouchEnd);
            const event = new FramerEvent(originalEvent, this.props.session);
            this.props.session.pointerUp(event);
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
        safeWindow.addEventListener("touchstart", this.domTouchStart);
    }
    /**
     * @internal
     */
    componentWillUnmount() {
        safeWindow.removeEventListener("touchstart", this.domTouchStart);
        safeWindow.removeEventListener("touchmove", this.domTouchMove);
        safeWindow.removeEventListener("touchend", this.domTouchEnd);
    }
}
