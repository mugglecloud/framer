import * as React from "react";
import { DeviceRegistry } from "./DeviceRegisty";
import { Size } from "../../render/types/Size";
import { Animatable } from "../../animation/Animatable";
import { componentLoader } from "../../render/componentLoader";
import { imageUrlForAsset } from "../../render/utils/imageForFill";
import { DeviceRenderer } from "./DeviceRenderer";
export { DeviceRenderer };
import { isWithPackage } from "./WithPackage";
export * from "./DeviceSkin";
export * from "./DeviceHand";
const FramerLocalScheme = "framer-local://";
/**
 * @internal
 */
export class Device extends React.Component {
    /**
     * @internal
     */
    get descriptor() {
        return this.constructor.descriptor;
    }
    /**
     * @internal
     */
    get skins() {
        return this.descriptor.skins;
    }
    /**
     * @internal
     */
    get hands() {
        return this.descriptor.hands;
    }
    /**
     * @internal
     */
    get svgScreenMask() {
        return undefined;
    }
    /**
     * @internal
     */
    componentDidMount() {
        this.computeRequiredPackages();
    }
    /**
     * @internal
     */
    componentDidUpdate(prevProps) {
        this.computeRequiredPackages();
    }
    /**
     * @internal
     */
    computeRequiredPackages() {
        if (!this.props.onRequirePackage) {
            return;
        }
        const { skin, hand } = this.props;
        if (skin) {
            const skinOrPackage = this.skins[skin];
            if (isWithPackage(skinOrPackage)) {
                this.props.onRequirePackage(skinOrPackage.package, skin);
            }
        }
        if (hand) {
            const handOrPackage = this.hands[hand];
            if (isWithPackage(handOrPackage)) {
                this.props.onRequirePackage(handOrPackage.package, hand);
            }
        }
    }
    /**
     * @internal
     */
    render() {
        const { width, height } = this.props.parentSize
            ? {
                width: Animatable.getNumber(this.props.parentSize.width),
                height: Animatable.getNumber(this.props.parentSize.height),
            }
            : this.props.deviceSize;
        const rendererProps = {
            skin: this.getSkin(),
            hand: this.getHand(),
            device: Size(width, height),
            screen: this.descriptor.screen,
            content: this.props.contentSize,
            pixelRatio: this.descriptor.pixelRatio || 1,
            rotate: this.props.rotate || false,
            responsive: this.props.responsive,
            svgScreenMask: this.svgScreenMask,
            autoScale: this.props.autoScale,
        };
        const deviceRenderer = React.createElement(this.props.renderer, rendererProps, this.props.children);
        const outerStyle = this.outerStyle(rendererProps);
        let inner = deviceRenderer;
        if (this.props.zoom !== -1) {
            const innerStyle = this.outerStyle(rendererProps);
            innerStyle.transformOrigin = `center`;
            innerStyle.transform = `scale(${this.props.zoom})`;
            inner = <div style={innerStyle}>{deviceRenderer}</div>;
        }
        return <div style={outerStyle}>{inner}</div>;
    }
    getSkin() {
        const skin = this.props.skin ? this.skins[this.props.skin] : null;
        let resolvedSkin = null;
        if (isWithPackage(skin)) {
            resolvedSkin = Device.skinOrHandFromPackage(skin);
        }
        else {
            resolvedSkin = skin;
        }
        if (resolvedSkin) {
            const image = resolvedSkin.image;
            if (image.startsWith(FramerLocalScheme)) {
                resolvedSkin.image = this.toLocalPath(image.substr(FramerLocalScheme.length));
            }
        }
        return resolvedSkin;
    }
    getHand() {
        const hand = this.props.hand ? this.hands[this.props.hand] : null;
        if (isWithPackage(hand)) {
            return Device.skinOrHandFromPackage(hand);
        }
        else {
            return hand;
        }
    }
    outerStyle(rendererProps) {
        return {
            width: this.props.deviceSize.width,
            height: this.props.deviceSize.height,
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            overflow: "hidden",
            display: "block",
            position: "absolute",
            background: this.props.background || "none",
        };
    }
    static skinOrHandFromPackage(withPackage) {
        const packageId = withPackage.package;
        const components = packageId && componentLoader.componentsForPackage(packageId);
        if (components && components.length) {
            const externalSkin = components[0];
            const instance = new externalSkin.class();
            // Update the image path to go to the package folder:
            if ("image" in instance) {
                instance.image = imageUrlForAsset(`node_modules/${packageId}/${instance.image}`);
            }
            // Apply any set overrides on the externally loaded package:
            const keys = Object.keys(withPackage);
            keys.forEach(key => {
                if (key !== "image" && key in instance) {
                    instance[key] = withPackage[key];
                }
            });
            return instance;
        }
        return null;
    }
    toLocalPath(path) {
        let packageId = null;
        componentLoader.forEachComponent(component => {
            if (component.class === this.constructor) {
                if (component.depth > 0) {
                    // Resolve only if we're external:
                    packageId = component.packageIdentifier;
                }
                // Found, but as "internal", meaning we need to resolve
                // locally:
                return true;
            }
            return false;
        });
        if (packageId) {
            path = `node_modules/${packageId}/${path}`;
        }
        return imageUrlForAsset(path);
    }
}
/**
 * @internal
 */
Device.defaultProps = {
    parentSize: null,
    deviceSize: Size.zero,
    contentSize: Size.zero,
    zoom: -1,
    responsive: false,
    onRequirePackage: () => { },
    renderer: DeviceRenderer,
};
/**
 * @internal
 */
Device.registry = new DeviceRegistry();
/**
 * @internal
 */
Device.descriptor = {
    title: "Device Base Class",
    screen: Size.zero,
    pixelRatio: 1,
    skins: {},
    hands: {},
};
