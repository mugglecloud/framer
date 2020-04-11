import { ObservableObject } from "./ObservableObject";
import { deprecationWarning } from "../utils/deprecation";
/**
 * @internal
 * @deprecated Use Data instead
 */
export function PropertyStore(initial = {}, makeAnimatables = false) {
    deprecationWarning("PropertyStore", "1.0.0", "Data() or ObservableObject()");
    return ObservableObject(initial, makeAnimatables);
}
/**
 * @internal
 * @deprecated Use Data instead
 */
(function (PropertyStore) {
    function addObserver(target, observer) {
        return ObservableObject.addObserver(target, observer);
    }
    PropertyStore.addObserver = addObserver;
})(PropertyStore || (PropertyStore = {}));
