import { fontStore } from "../fonts/fontStore";
import { TypefaceSourceNames } from "../fonts/types";
import { ConvertColor } from "../types/Color";
import { isFiniteNumber } from "../utils/isFiniteNumber";
// Style queries and changes
export const draftStyles = {
    font: {
        prefix: "FONT:",
        default: fontStore.defaultFont.selector,
        setCSS: getStyleForTypefaceOrSelector,
        fromCSS: getFontStyleStringFromCSS,
    },
    color: {
        prefix: "COLOR:",
        default: "rgb(0, 0, 0)",
        setCSS: (value, css) => (css.WebkitTextFillColor = value),
        fromCSS: css => {
            let color;
            if (css.webkitTextFillColor !== null) {
                color = css.webkitTextFillColor;
            }
            if (css.color !== null) {
                color = css.color;
            }
            if (color) {
                return ConvertColor.toRgbString(color);
            }
        },
    },
    size: {
        prefix: "SIZE:",
        default: 16,
        setCSS: (value, css) => (css.fontSize = `${value}px`),
        fromCSS: css => getCSSFloatString(css, "fontSize"),
    },
    letterSpacing: {
        prefix: "LETTERSPACING:",
        default: 0,
        setCSS: (value, css) => (css.letterSpacing = `${value}px`),
        fromCSS: css => getCSSFloatString(css, "letterSpacing", 1),
    },
    lineHeight: {
        prefix: "LINEHEIGHT:",
        default: 1.2,
        setCSS: (value, css) => (css.lineHeight = `${value}`),
        fromCSS: css => getCSSFloatString(css, "lineHeight", 1),
    },
    align: {
        prefix: "ALIGN:",
    },
};
const getCSSFloatString = (css, key, fractionDigits) => {
    if (css[key] === null) {
        return;
    }
    const result = parseFloat(css[key]);
    if (isNaN(result)) {
        return;
    }
    return fractionDigits === undefined ? `${result}` : result.toFixed(fractionDigits);
};
function isStyleHandler(object) {
    return object.setCSS !== undefined;
}
export const draftStyleFunction = (styles, styleSelection = true) => {
    const CSS = {
        tabSize: 4,
    };
    for (const styleType in draftStyles) {
        const styleHandler = draftStyles[styleType];
        if (isStyleHandler(styleHandler)) {
            styleHandler.setCSS(styleHandler.default, CSS);
        }
    }
    styles.forEach((style) => {
        if (style === "BOLD") {
            if (isFiniteNumber(CSS.fontWeight)) {
                CSS.fontWeight = Math.max(CSS.fontWeight + 300, 900); /* Assume we have a correct number */
            }
            else {
                CSS.fontWeight = "bold";
            }
        }
        else if (style === "ITALIC") {
            CSS.fontStyle = "italic";
        }
        else if (style === "UNDERLINE") {
            CSS.textDecoration = "underline";
        }
        else if (style === "SELECTION" && styleSelection) {
            CSS.backgroundColor = "rgba(128,128,128,0.33)";
        }
        else {
            for (const styleType in draftStyles) {
                const styleHandler = draftStyles[styleType];
                if (!isStyleHandler(styleHandler)) {
                    continue;
                }
                if (style.startsWith(styleHandler.prefix)) {
                    styleHandler.setCSS(style.slice(styleHandler.prefix.length), CSS);
                    break;
                }
            }
        }
    });
    return CSS;
};
export function getStyleForTypefaceOrSelector(value, css = {}) {
    let selectors = [];
    let selector = "";
    let alias = "";
    // Styled text will have the alias set as "value". See if this is the case:
    if (fontStore.local.isTypefaceAlias(value)) {
        alias = value;
        // The value is an alias. Resolve it to the full selector:
        value = fontStore.local.getTypefaceSelectorByAlias(value) || "";
    }
    const typeface = fontStore.getTypeface({ source: TypefaceSourceNames.Local, family: value });
    if (typeface && typeface.fonts.length) {
        // Try to match by an exact selector since taking typeface.fonts[0]
        // relies on the order of fonts, which may arrive in a different order
        const font = typeface.fonts.find(t => t.selector === value) || typeface.fonts[0];
        selector = font.selector;
    }
    if (selector) {
        // An alias comes in at this level for the font selector. See if this is the case:
        if (fontStore.local.isTypefaceAlias(selector)) {
            // The value is an alias. Resolve it to the full selector:
            selector = fontStore.local.getTypefaceSelectorByAlias(selector) || "";
        }
        selectors = selector.split("|");
    }
    if (!selector) {
        selectors = value.split("|");
        const font = fontStore.getOrCreateFontBySelector(alias || value);
        if (font) {
            const family = font.typeface.family;
            let weight = font.weight;
            let style = font.style;
            const isSFPro = family.startsWith("SF Pro");
            // SF Pro and other special system font selectors are not available on iOS 13
            // So we fall back on to -apple-system for SF Pro, and we have to set weight and style
            if (isSFPro) {
                if (weight) {
                    // SF style css is always applied first as a default initial value, we don't want to overwrite the weight in this case.
                    // There's an edge case for `SF Pro Text Semibold`, which is defined as font-weight: 600,
                    // but examining `/System/Library/Fonts/SFNSText.ttf` shows that it's actually 590.9791409170672
                    // If we set 600 on MacOS 10.14 or lower, it makes the font bolder
                    // Setting it to 599 is below the 600 threshold and does not mess it up.
                    // We still need the font-weight to be set for newer OSs that will fallback to -apple-system font
                    // It ain't pretty, but hopefully this holds so we won't have to test OS in this part of the code.
                    weight = weight === 400 ? undefined : weight - 1;
                }
                // Currently, font-style does not get sent from the app host so we detect if it's needed by the variant name
                if (!style && /italic/i.test(font.variant)) {
                    style = "italic";
                }
            }
            if (selectors.indexOf(family) === -1 && weight !== undefined) {
                selectors.push(family);
                if (weight) {
                    css.fontWeight = weight;
                }
            }
            if (isSFPro) {
                selectors.push("-apple-system", "BlinkMacSystemFont");
            }
            if (style) {
                css.fontStyle = style;
            }
        }
    }
    // remove duplicate entries in font-family
    const families = Array.from(new Set(selectors.map(t => {
        const parsed = fontStore.getOrCreateFontBySelector(t);
        if (parsed && parsed.typeface.source === TypefaceSourceNames.Google)
            return parsed.typeface.family;
        return t;
    })));
    css.fontFamily = `"${families.join(`", "`)}"`;
    // add monospace, sans-serif, or serif, based on some lists of known fonts
    if (value.match(/mono|consolas|console|courier|menlo|monaco/i)) {
        css.fontFamily += ", monospace";
    }
    else if (value.match(/serif|roboto.slab/i)) {
        css.fontFamily += ", serif";
    }
    else if (value.match(/sans|arial|roboto|sfui|futura|helvetica|grande|tahoma|verdana/i)) {
        css.fontFamily += ", sans-serif";
    }
    else {
        css.fontFamily += ", serif";
    }
    return css;
}
export function getFontStyleStringFromCSS(css) {
    if (css.fontFamily === null) {
        return;
    }
    const familyMembers = css.fontFamily.split(/['"]?, ['"]?/);
    if (familyMembers.length === 0) {
        return;
    }
    if (familyMembers.length > 1) {
        familyMembers.pop(); // Remove fallback
    }
    familyMembers[0] = familyMembers[0].replace(/^['"]/, "");
    let selector = familyMembers.join("|");
    // Note: this is an assumption, because copying from another document with a missing font
    // might also end up here, that’s why we’ll keep it intact if we can’t find it.
    let font = fontStore.getFontBySelector(selector);
    if (!font) {
        familyMembers.pop();
        const possibleSelector = familyMembers.join("|");
        if (fontStore.getFontBySelector(possibleSelector)) {
            selector = possibleSelector;
        }
    }
    // Resolve aliases
    const aliasSelector = fontStore.local.getTypefaceAliasBySelector(selector);
    if (aliasSelector) {
        selector = aliasSelector;
    }
    // Clear font weight, if we have a selector this is already set and matches the weight
    // NOTE: This is a hack! It modifies the parameter passed in because it “knows” that font weight will
    // be processed after getting the font.
    font = fontStore.getFontBySelector(selector);
    if (font) {
        const weight = font.weight;
        if (weight && `${weight}` === css.fontWeight) {
            css.fontWeight = "normal";
        }
    }
    return selector;
}
