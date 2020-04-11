import { Color } from "../types/Color";
export function collectTextColorFromProps(props, style) {
    const { color } = props;
    if (typeof color === "string") {
        style.color = color;
    }
    else if (Color.isColorObject(color)) {
        style.color = color.initialValue || Color.toRgbString(color);
    }
}
