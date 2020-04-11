const multiStopGradientKeys = ["stops"];
export function isMultiStopGradient(value) {
    return value && multiStopGradientKeys.every(key => key in value);
}
