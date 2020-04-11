import * as React from "react";
import { Data } from "../data/Data";
import { MainLoop } from "../core/Loop";
const initialState = { update: 0 };
/**
 * @deprecated
 * @internal
 */
export const DataObserverContext = React.createContext(initialState);
/**
 * @deprecated
 * @internal
 */
export class DataObserver extends React.Component {
    constructor() {
        super(...arguments);
        this.observers = [];
        this.state = initialState;
        this.taskAdded = false;
        this.frameTask = () => {
            this.setState({ update: this.state.update + 1 });
            this.taskAdded = false; // Set after updating state, else the component might become unresponsive
        };
        this.observer = () => {
            if (this.taskAdded)
                return;
            this.taskAdded = true;
            MainLoop.addFrameTask(this.frameTask);
        };
    }
    render() {
        const { children } = this.props;
        this.observers.map(cancel => cancel());
        this.observers = [];
        Data._stores.forEach((d) => {
            const observer = Data.addObserver(d, this.observer);
            this.observers.push(observer);
        });
        return React.createElement(DataObserverContext.Provider, { value: Object.assign({}, this.state) }, children);
    }
}
