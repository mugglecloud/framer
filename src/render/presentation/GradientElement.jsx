import * as React from "react";
export class LinearGradientElement extends React.Component {
    render() {
        const { id, angle, stops } = this.props;
        return (<linearGradient id={id} gradientTransform={`rotate(${angle}, 0.5, 0.5)`}>
                {stops.map((stop, idx) => {
            return <stop key={idx} offset={stop.position} stopColor={stop.color} stopOpacity={stop.alpha}/>;
        })}
            </linearGradient>);
    }
}
export class RadialGradientElement extends React.Component {
    render() {
        const { centerAnchorX, centerAnchorY, id, widthFactor, heightFactor, stops } = this.props;
        return (<radialGradient id={id} cy={centerAnchorY} cx={centerAnchorX} r={widthFactor} gradientTransform={`translate(${centerAnchorX}, ${centerAnchorY}) scale(1 ${heightFactor /
            widthFactor}) translate(-${centerAnchorX}, -${centerAnchorY})`}>
                {stops.map((stop, idx) => {
            return <stop key={idx} offset={stop.position} stopColor={stop.color} stopOpacity={stop.alpha}/>;
        })}
            </radialGradient>);
    }
}
