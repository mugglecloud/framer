// Based on https://github.com/ZeeCoder/react-resize-observer/blob/master/src/index.js
import ResizeObserverPoly from "resize-observer-polyfill";
import { useEffect } from "react";
/**
 * A hook to observe the size changes of an HTML element. Uses native ResizeObserver if available, a polyfill otherwise
 * @param ref - A ref to the html element to observe
 * @param onResize - The function to call when the size of the element changes
 * @param skipHook - If false this hook is disabled. Defaults to false
 * @param observeChildren - If true, not the element, but it's children are observed
 */
export function useResizeObserver(ref, onResize, options = {}) {
    const { skipHook = false, observeChildren = false } = options;
    useEffect(() => {
        if (skipHook || !ref.current) {
            return;
        }
        const observer = new ResizeObserverPoly(onResize);
        if (observeChildren) {
            for (const child of ref.current.children) {
                observer.observe(child);
            }
        }
        else {
            observer.observe(ref.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [ref.current, skipHook, observeChildren, onResize]);
}
