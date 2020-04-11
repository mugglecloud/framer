import { collectBackgroundFromProps } from "../traits/Background";
import { collectRadiusFromProps } from "../traits/Radius";
import { collectBlendingFromProps } from "../traits/Blending";
import { collectOverflowFromProps } from "../traits/Overflow";
import { collectOpacityFromProps } from "../traits/Opacity";
import { collectFiltersFromProps } from "../";
import { collectBoxShadowsForProps, collectTextShadowsForProps } from "./shadow";
import { collectTextColorFromProps } from "../traits/TextColor";
export function collectVisualStyleFromProps(props, style, isTextNode = false) {
    collectBackgroundFromProps(props, style);
    collectRadiusFromProps(props, style);
    collectFiltersFromProps(props, style);
    collectBlendingFromProps(props, style);
    collectOverflowFromProps(props, style);
    collectOpacityFromProps(props, style);
    collectTextColorFromProps(props, style);
    if (isTextNode) {
        collectTextShadowsForProps(props, style);
    }
    else {
        collectBoxShadowsForProps(props, style);
    }
}
