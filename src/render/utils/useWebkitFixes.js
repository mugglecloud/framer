import { useRef, useEffect } from "react";
import { RenderEnvironment } from "../types/RenderEnvironment";
/**
 * Workarounds for WebKit bugs
 * Some styles have to be toggled to take effect in certain situations.
 * To use in a class, see Layer.tsx
 * @internal
 */
export function useWebkitFixes(elementRef, style) {
    const mixBlendModeSet = style.mixBlendMode && style.mixBlendMode !== "normal";
    const radiusSet = style.borderRadius !== undefined;
    const clip = style.overflow === "hidden";
    useDidUpdate(() => {
        if (mixBlendModeSet) {
            resetSetStyle(elementRef.current, "mixBlendMode", style.mixBlendMode);
        }
    }, [RenderEnvironment.zoom, mixBlendModeSet, elementRef.current]);
    useDidUpdate(() => {
        if (clip && radiusSet) {
            resetSetStyle(elementRef.current, "overflow", "hidden", false);
        }
    }, [clip, radiusSet, elementRef.current]);
}
function useDidUpdate(update, dependencies) {
    // Because hasMounted only changes and is only used inside of useEffect, it's not a depedency
    const hasMounted = useRef(false);
    useEffect(() => {
        if (hasMounted.current) {
            update();
        }
        hasMounted.current = true;
    }, dependencies);
}
/** @internal */
export function resetSetStyle(element, key, toValue, microtask = true) {
    if (!element) {
        return;
    }
    const value = toValue ? toValue : element.style[key];
    const reset = () => {
        element.style[key] = value;
    };
    element.style[key] = null;
    if (microtask) {
        void Promise.resolve().then(reset);
    }
    else {
        setTimeout(reset, 0);
    }
}
