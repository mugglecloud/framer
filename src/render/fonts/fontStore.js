import { defaultFontSelector } from "./fonts";
import { googleFontSelectorPrefix, GoogleFontSource } from "./GoogleFontSource";
import { LocalFontSource } from "./LocalFontSource";
import { TypefaceSourceNames, } from "./types";
import { parseVariant } from "./utils";
/**
 * Stores all available fonts, whether they are currently loaded or not
 * Provides APIs to import, add and resolve fonts and font selectors
 * Model:
 * `FontStore` (single instance available via `fontStore`)
 *   `FontSource` (local/google)
 *     `Typeface` (font family and its variants)
 *       `Font` (font family with a specific variant)
 * Every `Font` has a `selector` (string), which is a unique identifier of a font
 * Google web fonts provide consistent naming for fonts,
 * so it's also possible to `parseFontSelector()` and get some info about a web font from only its selector
 */
export class FontStore {
    constructor() {
        this.bySelector = new Map();
        this.createWebFontIfNeeded = (locator) => {
            const { source, family, variant } = locator;
            const typeface = this.createTypefaceIfNeeded({ source, family });
            let font = typeface.fonts.find(t => t.variant === locator.variant);
            if (!font) {
                const variantInfo = parseVariant(variant) || {};
                const { weight, style } = variantInfo;
                const selector = this.getFontSelector(locator) || "";
                if (!selector) {
                    // tslint:disable-next-line:no-console
                    console.warn("Invalid font locator", locator);
                }
                font = {
                    typeface,
                    variant,
                    selector,
                    weight,
                    style,
                };
                typeface.fonts.push(font);
                this.addFont(font);
            }
            return font;
        };
        this.local = new LocalFontSource();
        this.google = new GoogleFontSource();
        this.bySelector = new Map();
        this.allFonts = [];
        this.importFonts(TypefaceSourceNames.Local);
        this.defaultFont = this.getFontBySelector(defaultFontSelector);
    }
    importFonts(source, fonts) {
        if (source === TypefaceSourceNames.Google) {
            if (!fonts)
                return;
            const results = this.google.importFonts(fonts);
            results.forEach(font => this.createWebFontIfNeeded(font));
            return;
        }
        else if (source === TypefaceSourceNames.Local) {
            const results = this.local.importFonts();
            results.forEach(font => this.addFont(font));
        }
    }
    addFont(font) {
        this.bySelector.set(font.selector, font);
        this.allFonts.push(font);
    }
    getSource(sourceName) {
        return this[sourceName];
    }
    getTypeface(info) {
        const source = this.getSource(info.source);
        const typeface = source.byFamily.get(info.family);
        return typeface || null;
    }
    getFontSelector(locator) {
        const { family, variant, source } = locator;
        if (source === TypefaceSourceNames.Local) {
            const typeface = this.getTypeface(locator);
            if (!typeface)
                return null;
            const info = typeface.fonts.find(t => t.variant === variant);
            if (!info)
                return null;
            return info.selector;
        }
        return `GF;${family}-${variant}`;
    }
    getFontBySelector(selector) {
        return this.bySelector.get(selector) || null;
    }
    getOrCreateFontBySelector(selector) {
        let font = this.getFontBySelector(selector);
        if (font)
            return font;
        // We can only create google fonts from a selector for now
        const locator = this.google.parseSelector(selector);
        if (!locator)
            return null;
        font = this.createWebFontIfNeeded(locator);
        return font;
    }
    getAvailableFonts() {
        return this.allFonts;
    }
    createTypefaceIfNeeded(locator) {
        let typeface = fontStore.getTypeface(locator);
        if (!typeface) {
            const source = this.getSource(locator.source);
            typeface = source.createTypeface(locator.family);
        }
        return typeface;
    }
    isSelectorLoaded(selector) {
        const font = this.getFontBySelector(selector);
        return (font && font.status === "loaded") || false;
    }
    /** We can only load google webfonts for now */
    canLoadSelector(selector) {
        return selector.startsWith(googleFontSelectorPrefix);
    }
    async loadWebFont(sourceName, family, variants) {
        const fonts = [];
        const source = this.getSource(sourceName);
        if (source instanceof LocalFontSource)
            return fonts;
        await source.loadWebFont(family, variants, locator => {
            const font = this.createWebFontIfNeeded(locator);
            font.status = "loaded";
            fonts.push(font);
            return font;
        });
        return fonts;
    }
    async loadWebFontFromSelector(selector) {
        if (this.isSelectorLoaded(selector))
            return [];
        if (!this.canLoadSelector(selector))
            return [];
        const parsed = this.google.parseSelector(selector);
        if (!parsed)
            return [];
        const fonts = await this.loadWebFont(TypefaceSourceNames.Google, parsed.family, [parsed.variant]);
        return fonts;
    }
    async loadWebFontsFromSelectors(selectors) {
        const fonts = [];
        // TODO: Using Promise.all() resulted in a lost promise, check why
        // TODO: Consider loading all in parallel, but maybe without Promise.all()
        for (const selector of selectors) {
            const list = await this.loadWebFontFromSelector(selector);
            fonts.push(...list);
        }
        return fonts;
    }
}
export const fontStore = new FontStore();
