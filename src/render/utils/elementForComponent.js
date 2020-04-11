import { optionalReactDOM } from "../utils/optionalReactDOM";
export function elementForComponent(component) {
    const ReactDOM = optionalReactDOM();
    if (!ReactDOM) {
        return null;
    }
    const element = ReactDOM.findDOMNode(component);
    return element;
}
