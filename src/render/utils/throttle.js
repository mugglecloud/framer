import { safeWindow } from "../../utils/safeWindow";
/** @internal */
export function throttle(fn, time) {
    let previous = 0;
    let timeout;
    const later = (...args) => {
        previous = Date.now();
        timeout = undefined;
        fn(...args);
    };
    return (...args) => {
        const now = Date.now();
        const remaining = time - (now - previous);
        if (remaining <= 0 || remaining > time) {
            if (timeout) {
                safeWindow.clearTimeout(timeout);
                timeout = undefined;
            }
            previous = now;
            fn(...args);
        }
        else if (!timeout) {
            timeout = safeWindow.setTimeout(later, remaining, ...args);
        }
    };
}
