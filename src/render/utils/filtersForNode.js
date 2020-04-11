import { isFiniteNumber } from "../";
import { shadowsAsFilter } from "../style/shadow";
import { RenderEnvironment } from "../types/RenderEnvironment";
export function collectLayerFilters(props, style) {
    const filters = [];
    if (isFiniteNumber(props.brightness)) {
        filters.push(`brightness(${props.brightness}%)`);
    }
    if (isFiniteNumber(props.contrast)) {
        filters.push(`contrast(${props.contrast}%)`);
    }
    if (isFiniteNumber(props.grayscale)) {
        filters.push(`grayscale(${props.grayscale}%)`);
    }
    if (isFiniteNumber(props.hueRotate)) {
        filters.push(`hue-rotate(${props.hueRotate}deg)`);
    }
    if (isFiniteNumber(props.invert)) {
        filters.push(`invert(${props.invert}%)`);
    }
    if (isFiniteNumber(props.saturate)) {
        filters.push(`saturate(${props.saturate}%)`);
    }
    if (isFiniteNumber(props.sepia)) {
        filters.push(`sepia(${props.sepia}%)`);
    }
    if (isFiniteNumber(props.blur)) {
        filters.push(`blur(${props.blur}px)`);
    }
    if (props.dropShadows) {
        const { zoom } = RenderEnvironment;
        const ignoreShadows = zoom >= 8;
        if (!ignoreShadows) {
            filters.push(...shadowsAsFilter(props.dropShadows));
        }
    }
    if (filters.length === 0)
        return;
    style.filter = style.WebkitFilter = filters.join(" ");
}
export function collectBackgroundFilters(props, style) {
    if (isFiniteNumber(props.backgroundBlur)) {
        style.backdropFilter = style.WebkitBackdropFilter = `blur(${props.backgroundBlur}px)`;
    }
}
export function collectFiltersFromProps(props, style) {
    collectBackgroundFilters(props, style);
    collectLayerFilters(props, style);
}
