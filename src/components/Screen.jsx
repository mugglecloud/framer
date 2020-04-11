import * as React from "react";
import { FramerEventSession } from "../events/FramerEventSession";
import { FrameWithMotion } from "../render/presentation/Frame";
import { FramerEventListener } from "../events";
export class Screen extends React.Component {
    constructor() {
        super(...arguments);
        this.session = new FramerEventSession(this.dispatcher);
        this.elementRef = React.createRef();
    }
    componentDidMount() {
        if (this.elementRef.current) {
            this.session.originElement = this.elementRef.current;
        }
    }
    render() {
        const { width, height, scale, color = "none", children } = this.props;
        const frame = (<FrameWithMotion ref={this.elementRef} width={width} height={height} style={{ originX: 0, originY: 0, scale, backgroundColor: color }}>
                {children}
            </FrameWithMotion>);
        return <FramerEventListener session={this.session}>{frame}</FramerEventListener>;
    }
    dispatcher(type, event, target) {
        target.dispatchEvent(new CustomEvent("FramerEvent", { bubbles: true, detail: { type: type, event: event } }));
    }
}
