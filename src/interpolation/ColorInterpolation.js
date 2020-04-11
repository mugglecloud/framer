import { Interpolation } from "./Interpolation";
import { Color } from "../render/types/Color";
import { ColorMixModelType } from "../render/types/Color/types";
export const ColorInterpolation = (type = ColorMixModelType.HUSL) => {
    return {
        interpolate(from, to) {
            [from, to] = Interpolation.handleUndefined(from, to);
            return Color.interpolate(Color(from), Color(to), type);
        },
        difference(from, to) {
            return Color.difference(Color(from), Color(to));
        },
    };
};
