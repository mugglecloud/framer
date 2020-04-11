import { Animatable } from "../../animation/Animatable";
import { BackgroundImage } from "../types/BackgroundImage";
import { RenderEnvironment } from "../types/RenderEnvironment";
import { setImageForFill } from "../utils/imageForFill";
/** @internal */
export function collectBackgroundImageFromProps(props, rect, style) {
    let background = Animatable.get(props.background, null);
    if (BackgroundImage.isImageObject(background)) {
        const { _forwardedOverrides, id } = props;
        const src = _forwardedOverrides && id ? _forwardedOverrides[id] : undefined;
        if (src && typeof src === "string") {
            background = { ...background, src };
        }
        const { target, zoom } = RenderEnvironment;
        if (target !== undefined && zoom) {
            // Don't load lower quality images when the image changed, because lower quality images are generated async
            const qualityOptions = rect
                ? {
                    frame: rect,
                    target,
                    zoom,
                }
                : null;
            setImageForFill(background, qualityOptions, style);
        }
    }
}
