import { NumberInterpolation } from "./NumberInterpolation";
import { ObjectInterpolation } from "./ObjectInterpolation";
import { NoInterpolation } from "./NoInterpolation";
import { Color } from "../render/types/Color/Color";
import { ColorInterpolation } from "./ColorInterpolation";
import { ColorMixModelType } from "../render/types/Color/types";
import { Interpolation, isInterpolatable } from "./Interpolation";
const DefaultInterpolationOptions = {
    colorModel: ColorMixModelType.HUSL,
};
/**
 * @internal
 */
export class ValueInterpolation {
    /**
     * @internal
     */
    constructor(options = DefaultInterpolationOptions) {
        /**
         * @beta
         */
        this.interpolate = (from, to) => {
            ;
            [from, to] = Interpolation.handleUndefined(from, to);
            return this.interPolationForValue(from).interpolate(from, to);
        };
        /**
         * @beta
         */
        this.difference = (from, to) => {
            const interpolation = this.interPolationForValue(from);
            return interpolation.difference(from, to);
        };
        this.options = { ...DefaultInterpolationOptions, ...options };
    }
    /**
     * @internal
     */
    interPolationForValue(value) {
        const type = typeof value;
        if (type === "number") {
            return NumberInterpolation;
        }
        else if (type === "boolean" || type === "function") {
            return NoInterpolation;
        }
        else if (Color.isColor(value)) {
            return ColorInterpolation(this.options.colorModel);
        }
        else if (type === "object") {
            if (value === null) {
                return NoInterpolation;
            }
            const constructor = value.constructor;
            if (constructor && isInterpolatable(constructor)) {
                const interpolation = constructor.interpolationFor(value, this);
                if (interpolation && interpolation !== this && interpolation.constructor !== ValueInterpolation) {
                    return interpolation;
                }
            }
            return ObjectInterpolation(this);
        }
        // tslint:disable-next-line:no-console
        console.warn(`No interpolation defined for ${value}`);
        return NoInterpolation;
    }
}
/**
 * @internal
 */
export const AnyInterpolation = new ValueInterpolation();
