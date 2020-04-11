import { Interpolation } from "./Interpolation";
export const NumberInterpolation = {
    interpolate(from, to) {
        [from, to] = Interpolation.handleUndefined(from, to);
        const a1 = +from;
        const b1 = to - a1;
        return (progress) => {
            const value = a1 + b1 * progress;
            return value;
        };
    },
    difference(from, to) {
        return to - from;
    },
};
