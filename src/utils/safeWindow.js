const mockWindow = {
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => false,
    onpointerdown: false,
    onpointermove: false,
    onpointerup: false,
    ontouchstart: false,
    ontouchmove: false,
    ontouchend: false,
    onmousedown: false,
    onmousemove: false,
    onmouseup: false,
    devicePixelRatio: 1,
    scrollX: 0,
    scrollY: 0,
    location: {
        href: "",
    },
    setTimeout: () => 0,
    clearTimeout: () => { },
    setInterval: () => 0,
    clearInterval: () => { },
    webkitConvertPointFromPageToNode: (_, pt) => pt,
};
/**
 * Creates a server-safe reference to `window`, returning a mock if none is available.
 *
 * @internal
 */
export const safeWindow = typeof window === "undefined" ? mockWindow : window;
