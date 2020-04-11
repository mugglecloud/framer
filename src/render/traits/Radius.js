import { Animatable, isAnimatable } from "../../animation/Animatable";
import { isFiniteNumber } from "../";
const key = "radius";
function hasRadius(props) {
    return key in props;
}
/**
 * Takes a border-radius value supporting a range of types and returns
 * a string representation for use in CSS.
 * NOTE: We always return a string so that we support both React.CSSProperties
 * as well as the CSSStyleDeclaration interface.
 */
function getRadiusValue(value) {
    // Coerce value into a number by default. This handles strings containing
    // numbers eg. "123.456" and acutal numbers.
    let num = Number(value);
    // If value is a string and failed to coerce it's likely an alternative
    // representation such as "10%" or "1em" so return that immediately.
    if (typeof value === "string" && isNaN(num)) {
        return value;
    }
    else if (isAnimatable(value)) {
        // Otherwise it's an animatable object, so extract the value.
        num = Animatable.getNumber(value);
    }
    // Return NaN or 0 as 0 without px units to keep things clean.
    return num ? `${num}px` : "0";
}
function hasRadiusValue(value) {
    return value && value !== "0";
}
export function collectRadiusFromProps(props, style) {
    if (!hasRadius(props))
        return;
    const { radius } = props;
    if (typeof radius === "string" || isAnimatable(radius) || isFiniteNumber(radius)) {
        const radiusValue = getRadiusValue(radius);
        if (hasRadiusValue(radiusValue))
            style.borderRadius = radiusValue;
    }
    else if (radius) {
        const topLeft = getRadiusValue(radius.topLeft);
        const topRight = getRadiusValue(radius.topRight);
        const bottomRight = getRadiusValue(radius.bottomRight);
        const bottomLeft = getRadiusValue(radius.bottomLeft);
        if (hasRadiusValue(topLeft) ||
            hasRadiusValue(topRight) ||
            hasRadiusValue(bottomRight) ||
            hasRadiusValue(bottomLeft)) {
            style.borderRadius = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
        }
    }
}
