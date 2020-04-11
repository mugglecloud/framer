const key = "calculatedPaths";
export function withShape(target) {
    return key in target;
}
