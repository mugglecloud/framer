export function isFiniteNumber(value) {
    return typeof value === "number" && isFinite(value);
}
export function finiteNumber(value) {
    return isFiniteNumber(value) ? value : undefined;
}
