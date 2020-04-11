import * as React from "react";
import { Layer } from "./Layer";
/**
 * @internal
 */
export class SVGRoot extends React.Component {
    render() {
        const { children, frame } = this.props;
        const { width, height } = frame;
        const fx = Math.floor(frame.x);
        const fy = Math.floor(frame.y);
        const svgStyle = {
            position: "absolute",
            width: Math.ceil(width),
            height: Math.ceil(height),
            overflow: "visible",
            display: "block",
            transform: `translate(${fx}px, ${fy}px)`,
        };
        Layer.applyWillChange(this.props, svgStyle, false);
        return (<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={svgStyle}>
                {children}
            </svg>);
    }
}
