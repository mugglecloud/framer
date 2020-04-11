import { isAnimatable } from "../animation/Animatable";
export function getObservableNumber(value, defaultValue = 0) {
    if (!value) {
        return defaultValue;
    }
    if (isAnimatable(value)) {
        return value.get();
    }
    return value;
}
