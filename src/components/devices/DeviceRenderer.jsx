import * as React from "react";
import { Screen } from "../Screen";
import { Size, ProvideParentSize } from "../../render";
import { isMobile } from "../../utils/environment";
import { safeWindow } from "../../utils/safeWindow";
import { MotionPlugins } from "framer-motion";
/** @internal */
export var DeviceRendererMode;
(function (DeviceRendererMode) {
    DeviceRendererMode[DeviceRendererMode["Canvas"] = 0] = "Canvas";
    DeviceRendererMode[DeviceRendererMode["Screen"] = 1] = "Screen";
    DeviceRendererMode[DeviceRendererMode["Device"] = 2] = "Device";
})(DeviceRendererMode || (DeviceRendererMode = {}));
/** @internal */
export class DeviceRenderer extends React.Component {
    constructor() {
        super(...arguments);
        this.screenTop = 0;
        this.screenLeft = 0;
        this.contentScale = 1;
        this.isViewingOnMobile = isMobile();
        /**
         * This method is stateful rather than a pure function because Framer Motion's plugin system
         * is currently immutable. For external consumption we might want to rethink this but for now
         * the approach avoids unnecessary additional renders.
         */
        this.transformDevicePoint = ({ x, y }) => {
            return {
                x: (x - this.screenLeft) / this.contentScale,
                y: (y - this.screenTop) / this.contentScale,
            };
        };
    }
    static getMode(props) {
        const skin = props.skin;
        if (!skin) {
            if (Size.isZero(props.screen)) {
                return DeviceRendererMode.Canvas;
            }
            else {
                return DeviceRendererMode.Screen;
            }
        } // else
        return DeviceRendererMode.Device;
    }
    // Styling
    //
    getScreenStyle(screen, device, rotate, scale, svgScreenMask) {
        const screenRect = this.calculateScreenRect(screen, device, rotate, scale);
        const dimX = rotate ? screen.height : screen.width;
        const dimY = rotate ? screen.width : screen.height;
        const svgMaskTransform = rotate ? `translate(0 ${dimY}) rotate(-90)` : "";
        let svgMaskImage;
        if (svgScreenMask) {
            // Need to encode string to avoid special characters such as "#" breaking the url.
            const encoded = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="${dimX}" height="${dimY}"><g transform="${svgMaskTransform}" x="0" y="0"> ${svgScreenMask}</g></svg>`);
            svgMaskImage = `url("data:image/svg+xml;utf8,${encoded}")`;
        }
        return {
            display: this.props.children ? "block" : "none",
            position: "absolute",
            top: screenRect.top,
            left: screenRect.left,
            width: screenRect.width,
            height: screenRect.height,
            overflow: "hidden",
            // For Chrome & FF
            maskImage: svgMaskImage,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "100% 100%",
            // For Safari / WebKit
            WebkitMaskImage: svgMaskImage,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "100% 100%",
        };
    }
    setScreenPosition({ top, left }) {
        this.screenTop = typeof top === "string" ? parseFloat(top) : top || 0;
        this.screenLeft = typeof left === "string" ? parseFloat(left) : left || 0;
    }
    // Rendition
    //
    willRenderWithScale(scale) {
        // FIXME: this is a horrible hack and depends on knowledge of Framer's internals
        if (safeWindow["_bridge"]) {
            safeWindow["_bridge"]("fixmeHackyNotePreviewContentScale", scale);
        }
    }
    render() {
        switch (DeviceRenderer.getMode(this.props)) {
            case DeviceRendererMode.Canvas:
                return this.renderCanvasMode();
            case DeviceRendererMode.Screen:
                return this.renderScreenOnly();
            case DeviceRendererMode.Device:
                return this.renderSkinAndScreen(this.props.skin, this.props.hand);
        }
    }
    renderCanvasMode() {
        const { device, content, responsive, autoScale } = this.props;
        if (responsive) {
            // The content is resized to match the window size:
            this.willRenderWithScale(1);
            return (<Screen width={device.width} height={device.height} scale={1}>
                    <ProvideParentSize parentSize={content}>{this.props.children}</ProvideParentSize>
                </Screen>);
        } // else
        this.contentScale = 1;
        const scalesDown = content.width > device.width || content.height > device.height;
        const scalesUp = content.width <= device.width || content.height <= device.height;
        const scaleUpAllowed = !autoScale || autoScale === "both" || autoScale === "up";
        const scaleDownAllowed = !autoScale || autoScale === "both" || autoScale === "down";
        // Scale if the content doesn't fit
        if ((scalesUp && scaleUpAllowed) || (scalesDown && scaleDownAllowed)) {
            this.contentScale = Math.min(device.width / content.width, device.height / content.height);
        }
        this.willRenderWithScale(this.contentScale);
        const screenStyle = this.getScreenStyle(content, device, false, this.contentScale);
        this.setScreenPosition(screenStyle);
        return (<div style={screenStyle}>
                <Screen width={device.width} height={device.height} scale={this.contentScale}>
                    <MotionPlugins transformPagePoint={this.transformDevicePoint}>
                        <ProvideParentSize parentSize={content}>{this.props.children}</ProvideParentSize>
                    </MotionPlugins>
                </Screen>
            </div>);
    }
    renderScreenOnly() {
        const { screen, rotate, device, pixelRatio, svgScreenMask } = this.props;
        const scaleX = device.width / (rotate ? screen.height : screen.width);
        const scaleY = device.height / (rotate ? screen.width : screen.height);
        const scale = Math.min(scaleX, scaleY);
        const screenWidth = rotate ? screen.height : screen.width;
        const screenHeight = rotate ? screen.width : screen.height;
        this.willRenderWithScale(scale * pixelRatio);
        const screenStyle = this.getScreenStyle(screen, device, rotate, scale, this.isViewingOnMobile ? undefined : svgScreenMask);
        this.contentScale = scale * pixelRatio;
        this.setScreenPosition(screenStyle);
        return (<div style={screenStyle}>
                <Screen width={screenWidth / pixelRatio} height={screenHeight / pixelRatio} scale={this.contentScale}>
                    <MotionPlugins transformPagePoint={this.transformDevicePoint}>{this.props.children}</MotionPlugins>
                </Screen>
            </div>);
    }
    renderSkinAndScreen(skin, hand) {
        const { rotate, device, content, pixelRatio, svgScreenMask } = this.props;
        // When using a skin, limit the amount of upscaling
        let maxScale = 2;
        // When viewing on a touch device, only show the skin if we're previewing a wearable
        if (this.isViewingOnMobile) {
            const isWatchContent = content.height < 220;
            if (isWatchContent) {
                maxScale = 1;
            }
            else {
                return this.renderScreenOnly();
            }
        }
        const imageRectAndScale = this.calculateSkinRectAndScreenScale(skin, device, rotate, maxScale / pixelRatio);
        const imageStyle = {
            pointerEvents: "none",
            display: "block",
            position: "absolute",
            top: imageRectAndScale.top,
            left: imageRectAndScale.left,
            width: imageRectAndScale.width,
            height: imageRectAndScale.height,
            transform: rotate ? "rotate(-90deg)" : undefined,
        };
        const screen = Size.defaultIfZero(device.width, device.height, this.props.screen);
        const screenStyle = this.getScreenStyle(screen, device, rotate, imageRectAndScale.scale, svgScreenMask);
        const rendition = [];
        // Hand
        if (!rotate && hand !== null) {
            const width = hand.width * imageRectAndScale.scale;
            const height = hand.height * imageRectAndScale.scale;
            const handStyle = {
                pointerEvents: "none",
                display: "block",
                position: "absolute",
                width,
                height,
                top: (hand.offset || 0) + (this.props.device.height - height) / 2,
                left: (this.props.device.width - width) / 2,
            };
            rendition.push(<img key="hand" src={hand.image} style={handStyle}/>);
        }
        // Screen
        this.willRenderWithScale(imageRectAndScale.scale * pixelRatio);
        this.contentScale = imageRectAndScale.scale * pixelRatio;
        this.setScreenPosition(screenStyle);
        const screenElement = (<div key="screen" style={screenStyle}>
                <Screen width={screen.width / pixelRatio} height={screen.height / pixelRatio} scale={this.contentScale}>
                    <MotionPlugins transformPagePoint={this.transformDevicePoint}>{this.props.children}</MotionPlugins>
                </Screen>
            </div>);
        // Device
        const deviceElement = <img key="device" src={skin.image} style={imageStyle}/>;
        rendition.push(deviceElement, screenElement);
        // FIXME: this check assumed that the presence of a mask path implies the device images uses a cutout. Devices should have a specific over- and underlay instead
        // if (this.props.svgScreenMask) {
        //     // Screen first, device second:
        //     rendition.push(screenElement, deviceElement)
        // } else {
        //     // Device first, screen second:
        //     rendition.push(deviceElement, screenElement)
        // }
        return rendition;
    }
    // Calculators
    //
    calculateSkinRectAndScreenScale(skin, outerSize, rotate, maxScale) {
        const outerWidth = outerSize.width;
        const outerHeight = outerSize.height;
        const { padding } = skin;
        let { imageWidth, imageHeight } = skin;
        if (rotate) {
            const r = imageWidth;
            imageWidth = imageHeight;
            imageHeight = r;
        }
        const scaleX = (outerWidth - padding * 2) / imageWidth;
        const scaleY = (outerHeight - padding * 2) / imageHeight;
        const scale = Math.min(scaleX, scaleY, maxScale);
        const width = scale * (rotate ? imageHeight : imageWidth);
        const height = scale * (rotate ? imageWidth : imageHeight);
        const left = (outerWidth - width) / 2;
        const top = (outerHeight - height) / 2;
        return {
            width,
            height,
            left,
            top,
            scale,
        };
    }
    calculateScreenRect(screen, outerSize, rotate, scale) {
        const screenWidth = screen.width;
        const screenHeight = screen.height;
        const width = scale * (rotate ? screenHeight : screenWidth);
        const height = scale * (rotate ? screenWidth : screenHeight);
        const left = (outerSize.width - width) / 2;
        const top = (outerSize.height - height) / 2;
        return {
            width,
            height,
            left,
            top,
        };
    }
}
DeviceRenderer.defaultProps = {
    skin: null,
    hand: null,
    device: Size.zero,
    screen: Size.zero,
    content: Size.zero,
    pixelRatio: 1,
    rotate: false,
    responsive: false,
};
