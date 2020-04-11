import { useState, useEffect } from "react";
import { useResizeObserver } from "./useResizeObserver";
function reportSize(element, size, setSize) {
    if (!element) {
        return;
    }
    const children = [...element.children];
    let maxHeight = 0;
    let maxWidth = 0;
    children.forEach((child) => {
        maxHeight = Math.max(maxHeight, child.scrollHeight + child.offsetTop);
        maxWidth = Math.max(maxWidth, child.scrollWidth + child.offsetLeft);
    });
    if (size.width !== maxWidth || size.height !== maxHeight) {
        setSize({
            width: maxWidth,
            height: maxHeight,
        });
    }
}
export function useChildrenSize(ref, options = {}) {
    const { observe = false, skipHook = false, initial = { width: 0, height: 0 } } = options;
    const [size, setSize] = useState(initial);
    const onResize = () => {
        reportSize(ref.current, size, setSize);
    };
    useResizeObserver(ref, onResize, { skipHook: skipHook || !observe, observeChildren: true });
    useEffect(() => {
        if (skipHook || observe) {
            return;
        }
        reportSize(ref.current, size, setSize);
    });
    return skipHook ? initial : size;
}
