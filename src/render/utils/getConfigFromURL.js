import { safeWindow } from "../../utils/safeWindow";
/**
 * Parses out a project preview configuration from the Preview URL.
 * NOTE: This method will throw an error when called without arguments in
 * an environment without a Location object on a global Window.
 * @internal
 */
export function getConfigFromPreviewURL(windowURLString = safeWindow.location.href) {
    // Show a more helpful error message than the TypeError given by the
    // URL constructor.
    if (!windowURLString) {
        throw new Error(`getConfigFromURL() called without url argument (location.href = "${safeWindow.location.href}")`);
    }
    const params = new URL(windowURLString).searchParams;
    const imageBaseURL = params.get("imageBaseURL") || "";
    const projectURL = params.get("projectURL") || "";
    const showConsole = params.get("console") === "1";
    const disableDevice = params.get("device") === "0";
    return { imageBaseURL, projectURL, showConsole, disableDevice };
}
/**
 * Parses out project configuration from the Vekter URL
 * NOTE: This method will throw an error when called without arguments in
 * an environment without a Location object on a global Window.
 * @internal
 */
export function getConfigFromVekterURL(windowURLString = safeWindow.location.href) {
    // Show a more helpful error message than the TypeError given by the
    // URL constructor.
    if (!windowURLString) {
        throw new Error(`getConfigFromURL() called without url argument (location.href = "${safeWindow.location.href}")`);
    }
    const hash = decodeURIComponent(new URL(windowURLString).hash.slice(1));
    const [documentURL, imageBaseURL, projectURL] = hash.split("#&#");
    return { documentURL, imageBaseURL, projectURL };
}
