/**
 * Take the user-defined `actions` map and return a version of the same functions
 * that update the store.
 *
 * @param get - Store data getter
 * @param set - Store data setter
 * @param actions - The actions to bind to the store
 */
function bindActionsToStore(get, set, actions) {
    const boundActions = {};
    for (const key in actions) {
        boundActions[key] = (data) => set(actions[key](get(), data));
    }
    return boundActions;
}
/**
 * A data store instance. `useData` can create and access multiple different data stores depending
 * on the `storeId` passed to it (if any).
 *
 * @param initialState - The initial state of the store.
 * @param unboundActions - Optional map of actions to make available for manipulating the data store.
 */
export function createStore(initialState, unboundActions) {
    let state = initialState;
    let version = 0;
    const subscribers = new Set();
    const notifySubscriber = (sub) => sub(version);
    const get = () => state;
    const set = (latestState) => {
        version++;
        state = latestState;
        subscribers.forEach(notifySubscriber);
    };
    const actions = unboundActions ? bindActionsToStore(get, set, unboundActions) : set;
    return {
        get,
        set,
        getVersion: () => version,
        getActions: () => actions,
        subscribe: sub => {
            subscribers.add(sub);
            return () => subscribers.delete(sub);
        },
    };
}
