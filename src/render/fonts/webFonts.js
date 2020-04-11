import * as webfontloader from "webfontloader";
import { TypefaceSourceNames } from "./types";
const queue = new PromiseQueue(1);
/**
 * Loads a web font using Google's Web Font Loader - https://developers.google.com/fonts/docs/webfont_loader
 * Calls to this methods with the same parameters are cached by the `family` and `variants` parameters,
 * so the same promise will be returned to all callers and that font will be loaded only once.
 */
export function loadWebFont(family, variants, onFontLoaded) {
    const familyAndVariants = variants && variants.length ? `${family}:${variants.join(",")}` : family;
    const cached = loadWebFontCache.get(familyAndVariants);
    if (cached)
        return cached;
    // We avoid loading fonts in parallel because of a limitation in google web font loader:
    // https://github.com/typekit/webfontloader/issues/345
    // When that gets fixed, the queue can be removed
    const promise = queue.add(() => loadWebFontNoCache(familyAndVariants, onFontLoaded));
    loadWebFontCache.set(familyAndVariants, promise);
    return promise;
}
const loadWebFontCache = new Map();
/**
 * Expects a single font family name and optional variants in a google fonts format:
 * ```Roboto:Regular,600i```
 * Roboto font, 2 variants:
 * 1. Regular
 * 2. 600 italic
 * */
async function loadWebFontNoCache(familyAndVariants, onFontLoaded) {
    await new Promise((resolve, reject) => {
        webfontloader.load({
            active: () => {
                resolve();
            },
            inactive: () => {
                reject();
            },
            fontactive: (family, fvd) => {
                if (!onFontLoaded)
                    return;
                const variant = fvdToVariant(fvd);
                const locator = { family, variant, source: TypefaceSourceNames.Google };
                onFontLoaded(locator);
            },
            google: {
                families: [familyAndVariants],
            },
        });
    });
}
const fvdToVariantRules = {
    fontStyle: {
        n: "",
        i: "italic",
        o: "oblique",
    },
    fontWeight: {
        "1": "100",
        "2": "200",
        "3": "300",
        "4": "",
        "5": "500",
        "6": "600",
        "7": "700",
        "8": "800",
        "9": "900",
    },
};
/**
 * Converts an FVD string (Font variation description, http://typekit.github.io/fvd/)
 * to a variant name as used in google web fonts
 * */
function fvdToVariant(s) {
    const variant = fvdToVariantRules.fontWeight[s[1]] + fvdToVariantRules.fontStyle[s[0]];
    return variant || "regular";
}
