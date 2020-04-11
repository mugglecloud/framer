import { TypefaceSourceNames } from "./types";
import { typefaces as systemTypefaces, typefaceAliases } from "./fonts";
export const systemTypefaceName = "System Default";
export class LocalFontSource {
    constructor() {
        this.name = TypefaceSourceNames.Local;
        this.typefaces = [];
        this.byFamily = new Map();
        this.typefaceAliasBySelector = new Map();
        this.typefaceAliases = new Map();
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
    importFonts() {
        const fonts = [];
        for (const family of systemTypefaces.keys()) {
            const members = systemTypefaces.get(family);
            if (!members)
                continue;
            const typeface = this.createTypeface(family);
            for (const variant of members.keys()) {
                const member = members.get(variant);
                if (!member)
                    continue;
                const { selector, weight } = member;
                // font.style is never defined in local fonts, we always use a specific font family that already includes the style
                const font = {
                    variant,
                    selector,
                    weight,
                    typeface,
                    status: "loaded",
                };
                typeface.fonts.push(font);
            }
            fonts.push(...typeface.fonts);
        }
        for (const [key, value] of Object.entries(typefaceAliases)) {
            this.addTypefaceAlias(key, value);
        }
        const { typeface: systemTypeface, aliases } = this.getSystemTypeface();
        this.addTypeface(systemTypeface);
        for (const [key, value] of aliases) {
            this.addTypefaceAlias(key, value);
        }
        fonts.push(...systemTypeface.fonts);
        return fonts;
    }
    addTypefaceAlias(key, value) {
        this.typefaceAliases.set(key, value);
        this.typefaceAliasBySelector.set(value, key);
    }
    getSystemTypeface() {
        // System fonts - Taken from https://furbo.org/stuff/systemfonts-new.html - "All Platforms" section
        const fontFamilies = `system-ui|-apple-system|BlinkMacSystemFont|Segoe UI|Roboto|Oxygen|Ubuntu|Cantarell|Fira Sans|Droid Sans|Helvetica Neue|sans-serif`;
        const typeface = { family: systemTypefaceName, fonts: [], source: this.name };
        const aliases = new Map();
        const weights = [400, 100, 200, 300, 500, 600, 700, 800, 900];
        const styles = ["normal", "italic"];
        for (const style of styles) {
            for (const weight of weights) {
                const variant = createVariantName(weight, style);
                const alias = `__SystemDefault-${weight}-${style}__`;
                const font = {
                    variant,
                    selector: alias,
                    style: style === "normal" ? undefined : style,
                    weight: weight === 400 ? undefined : weight,
                    typeface,
                    status: "loaded",
                };
                typeface.fonts.push(font);
                aliases.set(alias, fontFamilies);
            }
        }
        return { typeface, aliases };
    }
    getTypefaceAliasBySelector(selector) {
        return this.typefaceAliasBySelector.get(selector) || null;
    }
    getTypefaceSelectorByAlias(alias) {
        return this.typefaceAliases.get(alias) || null;
    }
    /** Typeface aliases are in the format of `__Alias-Name__` */
    isTypefaceAlias(value) {
        if (value && value.match(/^__.*__$/))
            return true;
        return false;
    }
}
const fontWeightNames = {
    "100": "Thin",
    "200": "Extra Light",
    "300": "Light",
    "400": "Normal",
    "500": "Medium",
    "600": "Semi Bold",
    "700": "Bold",
    "800": "Extra Bold",
    "900": "Black",
};
function createVariantName(weight, style) {
    const friendlyStyle = style === "normal" ? "Regular" : "Italic";
    if (weight === 400) {
        return friendlyStyle;
    }
    if (style !== "normal") {
        return `${fontWeightNames[weight]} ${friendlyStyle}`;
    }
    return `${fontWeightNames[weight]}`;
}
