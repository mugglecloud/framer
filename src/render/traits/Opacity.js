import { Animatable } from "../../animation/Animatable";
const key = "opacity";
export function withOpacity(target) {
    return key in target;
}
export function collectOpacityFromProps(props, style) {
    if (!withOpacity(props))
        return;
    const opacity = Animatable.getNumber(props.opacity);
    if (opacity === 1)
        return;
    style.opacity = opacity;
}
