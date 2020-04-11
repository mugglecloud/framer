import { LinearGradient, RadialGradient } from "../types/Gradient";
import { elementPropertiesForLinearGradient, elementPropertiesForRadialGradient, } from "./elementPropertiesForGradient";
export function gradientForShape(nodeId, node) {
    if (LinearGradient.isLinearGradient(node.fill)) {
        return elementPropertiesForLinearGradient(node.fill, nodeId);
    }
    if (RadialGradient.isRadialGradient(node.fill)) {
        return elementPropertiesForRadialGradient(node.fill, nodeId);
    }
    return undefined;
}
