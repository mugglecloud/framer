import { useState, useLayoutEffect } from "react";
import { useResizeObserver } from "./useResizeObserver";
function reportSize(element, size, setSize) {
    if (!element) {
        return;
    }
    const height = element.offsetHeight;
    const width = element.offsetWidth;
    if (size.width !== width || size.height !== height) {
        setSize({
            width,
            height,
        });
    }
}
export function useMeasureSize(ref, options = {}) {
    const { observe = false, skipHook = false, initial = { width: 0, height: 0 } } = options;
    const [size, setSize] = useState(initial);
    const onResize = () => {
        reportSize(ref.current, size, setSize);
    };
    useResizeObserver(ref, onResize, { skipHook: skipHook || !observe });
    useLayoutEffect(() => {
        if (skipHook || observe) {
            return;
        }
        reportSize(ref.current, size, setSize);
    });
    return skipHook ? initial : size;
}
