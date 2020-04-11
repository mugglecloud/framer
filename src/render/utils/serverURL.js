import { getConfigFromPreviewURL, getConfigFromVekterURL } from "./getConfigFromURL";
import { safeWindow } from "../../utils/safeWindow";
function joinPaths(paths) {
    let res = "";
    for (const p of paths) {
        if (!p)
            continue;
        if (res.length > 0 && !res.endsWith("/")) {
            res += "/";
        }
        if (Array.isArray(p)) {
            res += joinPaths(p);
        }
        else {
            res += encodeURIComponent(p).replace(/%2F/g, "/");
        }
    }
    return res;
}
/** @internal */
export function calculateServerURL(windowURLString = safeWindow.location.href) {
    // Check to see if we're getting the "motion" window mock, in which case
    // we need to return the Framer project server url here for server side
    // rendering in Framer X.
    const windowURL = parseURL(windowURLString);
    if (!windowURL) {
        return "http://localhost:4567";
    }
    // Otherwise try and find the project URL from the Vekter canvas url
    const { projectURL, documentURL = "" } = getConfigFromVekterURL(windowURLString);
    const vekterProjectURL = parseURL(projectURL);
    if (vekterProjectURL) {
        return vekterProjectURL.href;
    }
    else if (documentURL.startsWith("http:")) {
        // Fallback to legacy behaviour, when the vekter window url contains a single url starting with "http"
        // we use the origin. We're not sure where this might be used but the code is retained for backwards
        // compatibility.
        const legacyDocumentURL = parseURL(documentURL);
        if (legacyDocumentURL) {
            return legacyDocumentURL.origin;
        }
    }
    // Otherwise try the query string params from the Preview URL
    const previewProjectURL = parseURL(getConfigFromPreviewURL(windowURLString).projectURL);
    if (previewProjectURL) {
        return previewProjectURL.href;
    }
    // At this point we're likely in an exported project.
    const supportedProtocols = new Set(["file:", "http:", "https:"]);
    if (supportedProtocols.has(windowURL.protocol)) {
        // If we're outside of Framer the project could be hosted in a
        // subdirectory. In this case we want the projectURL to be relative
        // to the current file.
        const exportedProjectURL = parseURL("./", windowURL.href);
        if (exportedProjectURL) {
            return exportedProjectURL.href;
        }
    }
    // Fallback to relative paths.
    const fallback = "";
    // tslint:disable-next-line:no-console
    console.warn("Unable to figure out server base address, using fallback:", fallback);
    return fallback;
}
function parseURL(url, base) {
    try {
        // Safari will throw a TypeError if base is undefined.
        return typeof base === "undefined" ? new URL(url) : new URL(url, base);
    }
    catch (err) {
        return null;
    }
}
let __cachedWebBase = null;
function cachedServerURL() {
    if (__cachedWebBase === null) {
        __cachedWebBase = calculateServerURL();
    }
    return __cachedWebBase;
}
export function __setCachedServerURLForTesting(url) {
    __cachedWebBase = url;
}
/**
 * @internal
 */
export function serverURL(...paths) {
    const path = joinPaths(paths);
    // test if it already has a protocol:server style
    const match = /^(\w+)%3A(.*)$/.exec(path);
    if (match) {
        return match[1] + ":" + match[2];
    }
    const server = cachedServerURL();
    const url = parseURL(path, server);
    if (!url) {
        // If we have no server url, use a relative path instead of absolute.
        return path;
    }
    return url.href;
}
