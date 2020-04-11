import { TypefaceSourceNames } from "./types";
import { loadWebFont } from "./webFonts";
export const googleFontSelectorPrefix = "GF;";
export class GoogleFontSource {
    constructor() {
        this.name = TypefaceSourceNames.Google;
        this.typefaces = [];
        this.byFamily = new Map();
    }
    parseSelector(selector) {
        if (!selector.startsWith(googleFontSelectorPrefix))
            return null;
        const tokens = selector.split("-");
        if (tokens.length !== 2)
            return null;
        const family = tokens[0].replace(googleFontSelectorPrefix, "");
        const variant = tokens[1];
        return { family, variant, source: this.name };
    }
    // TODO: these are duplicated across implementations of FontSource
    // When adding a third source, we should abstract them
    createTypeface(family) {
        const typeface = { family: family, fonts: [], source: this.name };
        this.addTypeface(typeface);
        return typeface;
    }
    addTypeface(typeface) {
        this.typefaces.push(typeface);
        this.byFamily.set(typeface.family, typeface);
    }
    // end of duplication
    loadWebFont(family, variants, onFontLoaded) {
        return loadWebFont(family, variants, onFontLoaded);
    }
    importFonts(webFonts) {
        let fontLocators = [];
        webFonts.forEach(webFont => {
            const locators = webFont.variants.map(variant => ({
                source: this.name,
                variant: variant,
                family: webFont.family,
            }));
            fontLocators = fontLocators.concat(locators);
        });
        return fontLocators;
    }
}
