import { isAnimatable } from "../../../animation/Animatable/Animatable";
// Complete list of FrameWithMotion props keys
const frameWithMotionPropsFields = [
    "_border",
    "_constraints",
    "animate",
    "initial",
    "variants",
    "transition",
    "inherit",
    "static",
    "center",
    "initial",
    "transformTemplate",
    "transformValues",
    "animate",
    "variants",
    "transition",
    "onUpdate",
    "onAnimationComplete",
    "onPanSessionStart",
    "onTapCancel",
    "whileTap",
    "whileHover",
    "onHoverStart",
    "onHoverEnd",
    "drag",
    "dragDirectionLock",
    "dragPropagation",
    "dragConstraints",
    "dragElastic",
    "dragMomentum",
    "dragTransition",
    "onDragStart",
    "onDragEnd",
    "onDrag",
    "onDirectionLock",
    "onDragTransitionEnd",
    "x",
    "y",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "position",
    "border",
    "borderRadius",
    "shadow",
    "size",
];
const deprecatedFramePropsFields = [
    "autoSize",
    "aspectRatio",
    "borderWidth",
    "borderStyle",
    "borderColor",
    "centerX",
    "centerY",
];
/**
 * This function guard will define is props meant to be used with old frame or with new one
 * @param props Old or new props for the frame
 */
export function isDeprecatedFrameProps(props) {
    let field;
    // If we are using animatables, definitely use a DeprecatedFrame
    for (const propKey in props) {
        if (isAnimatable(props[propKey]))
            return true;
    }
    // It is a new frame API props
    for (field of frameWithMotionPropsFields) {
        if (props.hasOwnProperty(field))
            return false;
    }
    // It is definitely an old API
    for (field of deprecatedFramePropsFields) {
        if (props.hasOwnProperty(field))
            return true;
    }
    // Fallback to new Frame API
    return false;
}
