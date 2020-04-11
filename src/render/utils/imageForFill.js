import { RenderTarget, RenderEnvironment } from "../types/RenderEnvironment";
import { safeWindow } from "../../utils/safeWindow";
import { runtime } from "../../utils/runtimeInjection";
export function imageUrlForAsset(asset, size) {
    const { imageBaseURL } = RenderEnvironment;
    let quality = null;
    let intrinsicSize = null;
    if (size !== undefined) {
        // make sure we ask for at least 1x1
        size = Math.max(1, size);
        quality = {
            frame: { x: 0, y: 0, width: size, height: size },
            target: RenderTarget.canvas,
            zoom: 0,
        };
        intrinsicSize = size;
    }
    return resolveImagePath(_imageURL(asset, intrinsicSize, intrinsicSize, quality, ""), imageBaseURL, RenderTarget.current());
}
export function imageUrlForFill(image, quality = null) {
    const { src, intrinsicWidth, intrinsicHeight } = image;
    const { imageBaseURL } = RenderEnvironment;
    return resolveImagePath(_imageURL(src, intrinsicWidth || null, intrinsicHeight || null, quality, ""), imageBaseURL, quality ? quality.target : RenderTarget.canvas);
}
export function setImageForFill(image, quality, style) {
    const { src, pixelWidth, pixelHeight, intrinsicWidth, intrinsicHeight } = image;
    const { imageBaseURL } = RenderEnvironment;
    const backgroundImageURL = resolveImagePath(_imageURL(src, intrinsicWidth || null, intrinsicHeight || null, quality, ""), imageBaseURL, quality ? quality.target : RenderTarget.canvas);
    style.backgroundImage = `url("${backgroundImageURL}")`;
    style.backgroundSize = cssBackgroundSize(image.fit);
    style.backgroundRepeat = "no-repeat";
    style.backgroundPosition = "center";
    style.imageRendering = _imageScalingMethod(src, quality, intrinsicWidth || null, intrinsicHeight || null, pixelWidth || null, pixelHeight || null, image.fit);
}
function cssBackgroundSize(size) {
    switch (size) {
        case "fit":
            return "contain";
        case "stretch":
            return "100% 100%";
        case "fill":
        default:
            return "cover";
    }
}
export function _imageURL(asset, intrinsicWidth, intrinsicHeight, quality, imageBaseURL) {
    if (asset === null)
        return "";
    if (/^\w+:/.test(asset))
        return asset;
    const dpr = safeWindow.devicePixelRatio || 1;
    const bitmapMaxSize = Math.max(intrinsicWidth || 0, intrinsicHeight || 0);
    const canvasMaxSize = Math.max((quality && quality.frame.width) || 0, (quality && quality.frame.height) || 0);
    let size = undefined;
    // We limit the image size to 4096 for now. Figma does the same actually.
    if (bitmapMaxSize * dpr > 4096) {
        size = 4096;
    }
    // We generate the following sizes
    // 512, 1024, 2048, 4096
    // For larger bitmaps, we can get away with less quality
    if (canvasMaxSize * dpr < 4096)
        size = 2048;
    if (canvasMaxSize * dpr < 1024)
        size = 1024;
    if (canvasMaxSize * dpr < 512)
        size = 512;
    const resolvedAsset = runtime.assetResolver(asset, { size });
    if (resolvedAsset) {
        return resolvedAsset;
    }
    const fullQuality = !quality || quality.target === RenderTarget.export || quality.target === RenderTarget.preview;
    const noIntrinsicSize = intrinsicWidth === null || intrinsicHeight === null; // No known size means we wont have resized versions
    if (fullQuality || noIntrinsicSize) {
        return imageURLForSize(asset, imageBaseURL, undefined);
    }
    return imageURLForSize(asset, imageBaseURL, size);
}
// Use ‘auto’ when downscaling, ‘pixelated’ when upscaling
export function _imageScalingMethod(imageName, quality, intrinsicWidth, intrinsicHeight, pixelWidth, pixelHeight, size = "fill") {
    if (imageName === null)
        return "auto";
    if (!quality)
        return "auto";
    const { frame, zoom, target } = quality;
    let frameWidth = frame.width;
    let frameHeight = frame.height;
    if (zoom > 1) {
        frameWidth *= zoom;
        frameHeight *= zoom;
    }
    if (target !== RenderTarget.export && target !== RenderTarget.preview && safeWindow.devicePixelRatio) {
        frameWidth *= safeWindow.devicePixelRatio;
        frameHeight *= safeWindow.devicePixelRatio;
    }
    const imageWidth = pixelWidth || intrinsicWidth || 0;
    const imageHeight = pixelHeight || intrinsicHeight || 0;
    if (size === "fill") {
        // in this case the image will be enlarged if either the width or height is larger, and pixels are cut off
        if (frameWidth > imageWidth || frameHeight > imageHeight)
            return "pixelated";
    }
    else {
        // in these cases the images will be enlarged only if both width and height are larger
        if (frameWidth > imageWidth && frameHeight > imageHeight)
            return "pixelated";
    }
    return "auto";
}
function imageURLForSize(imageName, imageBaseURL, size) {
    if (imageName === null)
        return "";
    const slash = imageBaseURL.length === 0 || imageBaseURL.endsWith("/") ? "" : "/";
    // don't apply cache size for third party images
    // HOTFIX. Proper fix: regenerate sizes for third party images
    const cacheDir = size === undefined || imageName.indexOf("node_modules") === 0 ? "" : `../../.cache/images/${size}/`;
    return imageBaseURL + slash + cacheDir + imageName;
}
function resolveImagePath(relativePath, imageBaseURL, target) {
    // Checks if the image base url ends with a slash.
    const endsWithSlash = imageBaseURL.endsWith("/");
    // Checks if either the image base url ends with `design/images`, or if the relative path starts with `design/images`.
    // `design/images/` will only be added to the path if it's missing on both the image base url as and the relative path.
    // This is included, because Vekter expects it to be there at all times, as well as to prevent it from appearing twice in a row,
    // resulting in an invalid path.
    const useDesignImagesPrefix = !imageBaseURL.endsWith("design/images" + (endsWithSlash ? "/" : "")) &&
        !relativePath.startsWith("design/images/");
    // absolute paths
    if (relativePath.startsWith("http://") ||
        relativePath.startsWith("https://") ||
        relativePath.startsWith("file://")) {
        return relativePath;
    }
    // for images from design components, their path will start with node_modules/PACKAGE_NAME/
    if (relativePath.startsWith("node_modules/")) {
        relativePath = "../../" + relativePath;
    }
    if (target === RenderTarget.export) {
        return `##base64-${imageBaseURL}${useDesignImagesPrefix ? "design/images/" : ""}${relativePath}##`;
    }
    return `${imageBaseURL.replace(/\/$/, "")}/${useDesignImagesPrefix ? "design/images/" : ""}${relativePath}`;
}
