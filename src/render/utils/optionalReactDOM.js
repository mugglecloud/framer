import { safeWindow } from "../../utils/safeWindow";
export function optionalReactDOM() {
    if (typeof safeWindow !== "undefined" && safeWindow["ReactDOM"]) {
        return safeWindow["ReactDOM"];
    }
    return undefined;
}
