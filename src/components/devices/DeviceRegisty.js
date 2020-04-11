import { componentLoader } from "../../render/componentLoader";
/**
 * @internal
 */
export class DeviceRegistry {
    resolve(identifier) {
        const component = componentLoader.componentForIdentifier(identifier);
        if (!component || component.type !== "device") {
            return undefined;
        }
        return component.class;
    }
    list() {
        const devices = {};
        const deviceSkins = {};
        const componentIdentifiers = componentLoader.componentIdentifiers();
        componentIdentifiers.map((identifier) => {
            const component = componentLoader.componentForIdentifier(identifier);
            if (component && component.type === "device") {
                devices[component.identifier] = component.class.descriptor;
                if (component) {
                    if (component.type === "device") {
                        devices[component.identifier] = component.class.descriptor;
                    }
                    else if (component.type === "device-skin") {
                        deviceSkins[component.identifier] = component.class.descriptor;
                    }
                }
            }
        });
        return { devices, deviceSkins };
    }
}
