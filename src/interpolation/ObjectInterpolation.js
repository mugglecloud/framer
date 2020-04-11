import { Interpolation } from "./Interpolation";
export const ObjectInterpolation = (valueInterpolation) => {
    return {
        interpolate(from, to) {
            ;
            [from, to] = Interpolation.handleUndefined(from, to);
            // We can't use a spread operator here because TypeScript doesn't understand the types
            const result = Object.assign({}, from);
            const interpolations = {};
            const keys = new Set();
            for (const key in from) {
                interpolations[key] = valueInterpolation.interpolate(from[key], to[key]);
                keys.add(key);
            }
            for (const key in to) {
                if (!keys.has(key)) {
                    interpolations[key] = valueInterpolation.interpolate(from[key], to[key]);
                    keys.add(key);
                }
            }
            return (progress) => {
                for (const key in interpolations) {
                    result[key] = interpolations[key](progress);
                }
                return result;
            };
        },
        difference(from, to) {
            // calculate Eucleadean distance
            let sum = 0;
            for (const key in from) {
                const difference = valueInterpolation.difference(from[key], to[key]);
                sum += Math.pow(difference, 2);
            }
            return Math.sqrt(sum);
        },
    };
};
