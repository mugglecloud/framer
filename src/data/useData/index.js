import { useEffect, useMemo, useState, createContext, useContext } from "react";
import { createStore } from "./store";
const defaultId = Symbol("default");
/**
 * @internal
 */
export const DataContext = createContext(defaultId);
export function createData(defaultState, actions) {
    const stores = new Map();
    const useData = (id, initialState) => {
        const contextId = useContext(DataContext);
        id = id || contextId;
        const store = useMemo(() => {
            // If no store with this ID exists, create it.
            if (!stores.has(id)) {
                stores.set(id, createStore(initialState || defaultState, actions));
            }
            return stores.get(id);
        }, [id]);
        // Just use a version number to set state rather than replicating the actual data
        // for every subscribed component.
        const [, notifyUpdates] = useState(store.getVersion());
        const storeValueAtHookCallTime = useMemo(() => store.get(), [store]);
        // Subscribe to changes from this store.
        useEffect(() => {
            const unsubscribe = store.subscribe(notifyUpdates);
            // if the store value was updated between calling `useData` and≠
            // execution of this `useEffect` callback, e.g. in one of the other subscribers
            // `useEffect(() => { setStoreValue(99) }, [])`
            // make sure we notify the newly created subscriber about that change
            if (storeValueAtHookCallTime !== store.get())
                notifyUpdates(store.getVersion());
            return unsubscribe;
        }, [store, storeValueAtHookCallTime]);
        return [store.get(), store.getActions()];
    };
    return useData;
}
