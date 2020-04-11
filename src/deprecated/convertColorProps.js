import { LinearGradient, RadialGradient, Color } from "../render";
import { isMotionValue } from "../render/utils/isMotionValue";
function convertColorObject(prop) {
    if (typeof prop === "string" || isMotionValue(prop)) {
        return prop;
    }
    else if (LinearGradient.isLinearGradient(prop)) {
        return LinearGradient.toCSS(prop);
    }
    else if (RadialGradient.isRadialGradient(prop)) {
        return RadialGradient.toCSS(prop);
    }
    else if (Color.isColorObject(prop)) {
        return Color.toRgbString(prop);
    }
    return prop;
}
export function convertColorProps(props) {
    if (props.background || props.color) {
        const converted = Object.assign({}, props);
        if (props.background) {
            converted.background = convertColorObject(props.background);
        }
        if (props.color) {
            converted.color = convertColorObject(props.color);
        }
        return converted;
    }
    return props;
}
