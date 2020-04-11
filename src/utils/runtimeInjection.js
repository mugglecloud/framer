import { warnOnce } from "./warnOnce";
const mockWithWarning = (message) => {
    return () => {
        warnOnce(message);
    };
};
/** This stores the injected implementations */
const implementation = {};
let isRuntimeInjected = false;
const runtimeProxy = {
    get(target, key, reciever) {
        if (Reflect.has(target, key)) {
            return Reflect.get(target, key, reciever);
        }
        if (isRuntimeInjected) {
            return mockWithWarning(`${String(key)} is not available in this version of Framer X.`);
        }
        else {
            return mockWithWarning(`${String(key)} is only available inside of Framer X. Get it at https://www.framer.com/download`);
        }
    },
};
/**
 * This proxy makes sure that any key on the runtime object will return a
 * function that logs a warning to the console. Functions for which a
 * implementation is provided are available through this object, e.g.
 * `runtime.addActionControls()`
 * @internal
 */
export const runtime = new Proxy(implementation, runtimeProxy);
/**
 * This function is used by the `initializeRuntime()` function of the runtime to
 * provide the implementation of the functions defined in the `Runtime`
 * interface.
 * @internal
 */
export function _injectRuntime(injectedRuntime) {
    Object.assign(implementation, injectedRuntime);
    isRuntimeInjected = true;
}
