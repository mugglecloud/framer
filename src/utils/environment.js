import { safeWindow } from "../utils/safeWindow";
export const isWebKit = () => safeWindow["WebKitCSSMatrix"] !== undefined && !isEdge();
export const webkitVersion = () => {
    let version = -1;
    const regexp = /AppleWebKit\/([\d.]+)/;
    const result = regexp.exec(navigator.userAgent);
    if (result) {
        version = parseFloat(result[1]);
    }
    return version;
};
export const isChrome = () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
export const isSafari = () => /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
export const isFirefox = () => /^Mozilla.*Firefox\/\d+\.\d+$/.test(navigator.userAgent);
export const isFramerX = () => /FramerX/.test(navigator.userAgent);
export const isEdge = () => /Edge/.test(navigator.userAgent);
export const isAndroid = () => /(android)/i.test(navigator.userAgent);
export const isIOS = () => /(iPhone|iPod|iPad)/i.test(navigator.platform);
export const isMacOS = () => /Mac/.test(navigator.platform);
export const isWindows = () => /Win/.test(navigator.platform);
export const isTouch = () => safeWindow.ontouchstart === null && safeWindow.ontouchmove === null && safeWindow.ontouchend === null;
export const isDesktop = () => deviceType() === "desktop";
export const isPhone = () => deviceType() === "phone";
export const isTablet = () => deviceType() === "tablet";
export const isMobile = () => isPhone() || isTablet();
export const isFileUrl = (url) => url.startsWith("file://");
export const isDataUrl = (url) => url.startsWith("data:");
export const isRelativeUrl = (url) => !/^([a-zA-Z]{1,8}:\/\/).*$/.test(url);
export const isLocalServerUrl = (url) => /[a-zA-Z]{1,8}:\/\/127\.0\.0\.1/.test(url) || /[a-zA-Z]{1,8}:\/\/localhost/.test(url);
export const isLocalUrl = (url) => {
    if (isFileUrl(url))
        return true;
    if (isLocalServerUrl(url))
        return true;
    return false;
};
export const isLocalAssetUrl = (url, baseUrl) => {
    if (baseUrl === null)
        baseUrl = safeWindow.location.href;
    if (isDataUrl(url))
        return false;
    if (isLocalUrl(url))
        return true;
    if (isRelativeUrl(url) && isLocalUrl(baseUrl))
        return true;
    return false;
};
export const devicePixelRatio = () => safeWindow.devicePixelRatio;
export const isJP2Supported = function () {
    if (isFirefox())
        return false;
    return isWebKit() && !isChrome();
};
export const isWebPSupported = () => isChrome();
export const deviceType = () => {
    // https://github.com/jeffmcmahan/device-detective/blob/master/bin/device-detect.js
    if (/(tablet)|(iPad)|(Nexus 9)/i.test(navigator.userAgent))
        return "tablet";
    if (/(mobi)/i.test(navigator.userAgent))
        return "phone";
    return "desktop";
};
export const deviceOS = () => {
    if (isMacOS())
        return "macos";
    if (isIOS())
        return "ios";
    if (isAndroid())
        return "android";
    if (isWindows())
        return "windows";
};
export const deviceFont = (os) => {
    // https://github.com/jonathantneal/system-font-css
    if (!os) {
        os = deviceOS();
    }
    const fonts = {
        apple: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF UI Text, Helvetica Neue",
        google: "Roboto, Helvetica Neue",
        microsoft: "Segoe UI, Helvetica Neue",
    };
    if (os === "macos")
        return fonts.apple;
    if (os === "ios")
        return fonts.apple;
    if (os === "android")
        return fonts.google;
    if (os === "windows")
        return fonts.microsoft;
    return fonts.apple;
};
