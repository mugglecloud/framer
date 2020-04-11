import { FramerAnimation } from "./FramerAnimation";
import { SpringAnimator, BezierAnimator, Bezier } from "./Animators";
import { Animatable } from "./Animatable";
import { isAnimatable } from "./Animatable";
import { isMotionValue } from "../render";
import { deprecationWarning } from "../utils/deprecation";
/**
 * Animate an {@link (Animatable:interface)} value to a new value.
 * @remarks
 * Recommended use is to use convenience functions from the `animate` namespace
 * instead of passing an animator. Only use this for low-level animation tweaking.
 *
 * ```jsx
 * const value = Animatable(0)
 * animate(value, 100)
 *
 * const value = Animatable({x: 0, y: 0})
 * animate(value, {x: 100, y: 100})
 * ```
 *
 * @param from - The animatable value or object to start from
 * @param to - Value to animate to
 * @param animator - Animator class to use.
 * @param options - Animation options
 * @returns Instance of {@link FramerAnimation} that can be used to control the animation
 * @public
 * @deprecated Use the {@link AnimationProps.animate} prop on {@link Frame} instead.
 */
export function animate(from, to, animator, options) {
    deprecationWarning("animate()", "2.0.0", "the new animation API (https://www.framer.com/api/animation/)");
    const target = from;
    let fromValue;
    if (isAnimatable(from) || isMotionValue(from)) {
        fromValue = from.get();
    }
    else {
        fromValue = Animatable.objectToValues(from);
    }
    const animation = new FramerAnimation(target, fromValue, to, animator, options);
    animation.play();
    return animation;
}
/**
 * @public
 * @deprecated Use the {@link MotionProps.animate} prop on {@link Frame} instead.
 */
(function (animate) {
    /**
     * Animate value with a spring curve
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.spring(value, 100, {tension: 100, friction: 100})
     *
     * animate.spring(value, 100, {dampingRatio: 0.5, duration: 1})
     * ```
     * @param from - Value to animate
     * @param to - Value to animate to
     * @param options - Options for the spring
     * These can be either `tension`, `friction`, `velocity` and `tolerance` _or_ `dampingRatio`, `duration`, `velocity` and `mass`
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function spring(from, to, options) {
        return animate(from, to, SpringAnimator, options);
    }
    animate.spring = spring;
    /**
     * Animate value with a bezier curve
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.bezier(value, 100, {duration: 1, curve: Bezier.EaseIn})
     *
     * animate.bezier(value, 100, {duration: 1, curve: [0.3, 0.1, 0.4, 1]})
     * ```
     * @param from - Value to animate
     * @param to - Value to animate to
     * @param options - Options for the bezier curve
     *
     * - `duration` Duration of the animation
     * - `curve` One of the `Bezier` enum values or an array with 4 control points
     *
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function bezier(from, to, options) {
        return animate(from, to, BezierAnimator, options);
    }
    animate.bezier = bezier;
    /**
     * Animate value with a linear animation
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.linear(value, 100)
     *
     * animate.linear(value, 100, {duration: 1})
     * ```
     * @param from  - Value to animate
     * @param to - Value to animate to
     * @param options - The options for the animation
     *
     * - `duration` - Duration of the animation
     *
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function linear(from, to, options) {
        return animate.bezier(from, to, { ...options, curve: Bezier.Linear });
    }
    animate.linear = linear;
    /**
     * Animate value with a ease animation
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.ease(value, 100)
     *
     * animate.ease(value, 100, {duration: 1})
     * ```
     * @param from  - Value to animate
     * @param to - Value to animate to
     * @param options - The options for the animation
     *
     * - `duration` - Duration of the animation
     *
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function ease(from, to, options) {
        return animate.bezier(from, to, { ...options, curve: Bezier.Ease });
    }
    animate.ease = ease;
    /**
     * Animate value with a ease in animation
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.easeIn(value, 100)
     *
     * animate.easeIn(value, 100, {duration: 1})
     * ```
     * @param from  - Value to animate
     * @param to - Value to animate to
     * @param options - The options for the animation
     *
     * - `duration` - Duration of the animation
     *
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function easeIn(from, to, options) {
        return animate.bezier(from, to, { ...options, curve: Bezier.EaseIn });
    }
    animate.easeIn = easeIn;
    /**
     * Animate value with a ease out animation
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.easeOut(value, 100)
     *
     * animate.easeOUt(value, 100, {duration: 1})
     * ```
     * @param from  - Value to animate
     * @param to - Value to animate to
     * @param options - The options for the animation
     *
     * - `duration` - Duration of the animation
     *
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function easeOut(from, to, options) {
        return animate.bezier(from, to, { ...options, curve: Bezier.EaseOut });
    }
    animate.easeOut = easeOut;
    /**
     * Animate value with a ease in out animation
     * @remarks
     * ```jsx
     * const value = Animatable(0)
     * animate.easeInOut(value, 100)
     *
     * animate.easeInOut(value, 100, {duration: 1})
     * ```
     * @param from  - Value to animate
     * @param to - Value to animate to
     * @param options - The options for the animation
     *
     * - `duration` - Duration of the animation
     *
     * @returns Instance of {@link FramerAnimation} that can be used to control the animation
     * @deprecated Use {@link MotionProps.animate} on {@link Frame} instead.
     */
    function easeInOut(from, to, options) {
        return animate.bezier(from, to, { ...options, curve: Bezier.EaseInOut });
    }
    animate.easeInOut = easeInOut;
})(animate || (animate = {}));
