import { ValueInterpolation } from "../interpolation";
import { Animatable, isAnimatable } from "./Animatable";
import { MainLoopAnimationDriver } from "./Drivers/MainLoopDriver";
import { PrecalculatedAnimator } from "./Animators/PrecalculatedAnimator";
import { BezierAnimator } from "./Animators/BezierAnimator";
import { ColorMixModelType } from "../render/types/Color/types";
import { isMotionValue } from "../render/utils/isMotionValue";
const DefaultAnimationOptions = {
    precalculate: false,
    colorModel: ColorMixModelType.HUSL,
};
/**
 * The animation object returned by the {@link (animate:function)} functions
 * @remarks
 * Can be used to control a animation or wait for it to finish. You never create a FramerAnimation yourself, but store the return type from the animate function.
 * ```jsx
 * const animation = animate.ease(value, 100)
 * await animation.finished()
 * const animation = animate.spring(value, 200)
 * animation.cancel()
 * ```
 * @privateRemarks
 * This could be called just Animation, but it's type would clash with
 * javascript's native Animation: https://developer.mozilla.org/en-US/docs/Web/API/Animation
 * So if you forget the import, you would get weird errors.
 *
 * Also, this class follows the native Animation as much as possible.
 * @public
 * @deprecated Use the {@link useAnimation} hook instead
 */
export class FramerAnimation {
    /**
     * @internal
     */
    constructor(target, from, to, animatorClass, options, driverClass = MainLoopAnimationDriver) {
        /**
         * @internal
         */
        this.playStateSource = "idle";
        /**
         * @internal
         */
        this.readyPromise = Promise.resolve();
        this.resetFinishedPromise();
        const animationOptions = { ...DefaultAnimationOptions };
        const animatorOptions = {};
        if (options) {
            Object.assign(animationOptions, options);
            Object.assign(animatorOptions, options);
        }
        let interpolation;
        if (animationOptions.customInterpolation) {
            interpolation = animationOptions.customInterpolation;
        }
        else {
            interpolation = new ValueInterpolation(options);
        }
        let animator;
        if (!animatorClass) {
            animator = new BezierAnimator({}, interpolation);
        }
        else {
            animator = new animatorClass(animatorOptions, interpolation);
        }
        if (animationOptions.precalculate) {
            animator = new PrecalculatedAnimator({ animator });
        }
        animator.setFrom(from);
        animator.setTo(to);
        const updateCallback = (value) => {
            FramerAnimation.driverCallbackHandler(target, value);
        };
        const finishedCallback = (isFinished) => {
            if (isFinished) {
                FramerAnimation.driverCallbackHandler(target, to);
                if (this.playStateSource === "running") {
                    this.playStateValue = "finished";
                }
            }
        };
        this.driver = new driverClass(animator, updateCallback, finishedCallback);
    }
    /**
     * @internal
     */
    static driverCallbackHandler(target, value) {
        if (isAnimatable(target) || isMotionValue(target)) {
            target.set(value);
        }
        else {
            const targetObject = target;
            Animatable.transaction(update => {
                for (const key in targetObject) {
                    const targetValue = targetObject[key];
                    if (isAnimatable(targetValue)) {
                        update(targetValue, value[key]);
                    }
                    else {
                        targetObject[key] = value[key];
                    }
                }
            });
        }
    }
    /**
     * @internal
     */
    get playStateValue() {
        return this.playStateSource;
    }
    /**
     * @internal
     */
    set playStateValue(value) {
        if (value !== this.playStateSource) {
            const oldValue = value;
            this.playStateSource = value;
            switch (value) {
                case "idle":
                    if (oldValue === "running") {
                        this.oncancel && this.oncancel();
                    }
                    this.readyResolve && this.readyResolve();
                    this.resetReadyPromise();
                    break;
                case "finished":
                    if (oldValue === "idle") {
                        // tslint:disable-next-line:no-console
                        console.warn("Bad state transition");
                        break;
                    }
                    this.onfinish && this.onfinish();
                    this.finishedResolve && this.finishedResolve();
                    break;
                case "running":
                    this.resetReadyPromise();
                    break;
            }
            if (oldValue === "finished") {
                this.resetFinishedPromise();
            }
            if (value === "finished") {
                // Jump to idle state:
                this.playStateValue = "idle";
            }
        }
    }
    /**
     * @internal
     */
    get playState() {
        return this.playStateValue;
    }
    /**
     * @internal
     */
    resetReadyPromise() {
        this.readyResolve = null;
        this.readyPromise = new Promise((resolve, reject) => {
            this.readyResolve = resolve;
        });
    }
    /**
     * Wait for the animation to be ready to play.
     * @remarks
     * ```jsx
     * const animation = animate.ease(value, 100)
     * animation.ready().then(() => {
     *    // Animation is ready
     * })

     * // async/await syntax
     * const animation = animate.ease(value, 100)
     * await animation.ready()
     * // Animation is ready
     * ```
     * @returns Promise that is resolved when the animation is ready to play
     * @public
     */
    get ready() {
        return this.readyPromise;
    }
    /**
     * @internal
     */
    resetFinishedPromise() {
        this.finishedResolve = null;
        this.finishedReject = null;
        this.finishedPromise = new Promise((resolve, reject) => {
            this.finishedResolve = resolve;
            this.finishedReject = reject;
        });
        this.finishedPromise.catch(reason => {
            // Eat the exception that will occur when no 'reject' handler
            // is set.
        });
    }
    /**
     * Wait for the animation to be finished.
     * @remarks
     * ```jsx
     * // async/await syntax
     * const animation = animate.ease(value, 100)
     * await animation.finished()
     * // Animation is finished
     *
     *
     * const animation = animate.ease(value, 100)
     * animation.ready().then(() => {
     *    // Animation is finished
     * })
     * ```
     * @returns Promise that is resolved when the animation is ready to play
     * @public
     */
    get finished() {
        return this.finishedPromise;
    }
    /**
     * @internal
     */
    play() {
        this.playStateValue = "running";
        this.driver.play();
    }
    /**
     * Cancels the animation if it is still running.
     * @remarks
     * ```jsx
     * const animation = animate.ease(value, 100, {duration: 3})
     * setTimeout(() => animation.cancel(), 500)
     * ```
     * @public
     */
    cancel() {
        if (this.playStateValue !== "running") {
            return;
        }
        this.driver.cancel();
        if (this.playState !== "idle") {
            const reason = "AbortError";
            this.finishedReject && this.finishedReject(reason);
        }
        this.playStateValue = "idle";
    }
    /**
     * @internal
     */
    finish() {
        if (this.playStateSource === "running") {
            this.playStateValue = "finished";
            this.driver.finish();
        }
    }
    /**
     * @internal
     */
    isFinished() {
        return this.playStateValue === "finished";
    }
}
