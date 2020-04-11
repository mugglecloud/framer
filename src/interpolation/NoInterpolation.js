import { Interpolation } from "./Interpolation";
export const NoInterpolation = {
    interpolate(from, to) {
        [from, to] = Interpolation.handleUndefined(from, to);
        return (progress) => {
            return progress < 0.5 ? from : to;
        };
    },
    difference(from, to) {
        return from === to ? 0 : 1;
    },
};
