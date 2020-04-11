const flipAnimationDefaults = {
    stiffness: 350,
    damping: 100,
    restDelta: 1,
    type: "spring",
};
/**
 * @internal
 */
export var TransitionDefaults;
(function (TransitionDefaults) {
    TransitionDefaults.Fade = {
        exit: { opacity: 0 },
        enter: { opacity: 0 },
    };
    TransitionDefaults.PushLeft = {
        exit: { x: "-30%" },
        enter: { x: "100%" },
    };
    TransitionDefaults.PushRight = {
        exit: { x: "30%" },
        enter: { x: "-100%" },
    };
    TransitionDefaults.PushUp = {
        exit: { y: "-30%" },
        enter: { y: "100%" },
    };
    TransitionDefaults.PushDown = {
        exit: { y: "30%" },
        enter: { y: "-100%" },
    };
    TransitionDefaults.Instant = {
        animation: { type: false },
    };
    TransitionDefaults.Modal = {
        overCurrentContext: true,
        goBackOnTapOutside: true,
        position: { center: true },
        enter: { opacity: 0, scale: 1.2, y: 10 },
    };
    TransitionDefaults.OverlayLeft = {
        overCurrentContext: true,
        goBackOnTapOutside: true,
        position: { right: 0, top: 0, bottom: 0 },
        enter: { x: "100%" },
    };
    TransitionDefaults.OverlayRight = {
        overCurrentContext: true,
        goBackOnTapOutside: true,
        position: { left: 0, top: 0, bottom: 0 },
        enter: { x: "-100%" },
    };
    TransitionDefaults.OverlayUp = {
        overCurrentContext: true,
        goBackOnTapOutside: true,
        position: { bottom: 0, left: 0, right: 0 },
        enter: { y: "100%" },
    };
    TransitionDefaults.OverlayDown = {
        overCurrentContext: true,
        goBackOnTapOutside: true,
        position: { top: 0, left: 0, right: 0 },
        enter: { y: "-100%" },
    };
    TransitionDefaults.FlipLeft = {
        backfaceVisible: false,
        exit: { rotateY: -180 },
        enter: { rotateY: 180 },
        animation: flipAnimationDefaults,
    };
    TransitionDefaults.FlipRight = {
        backfaceVisible: false,
        exit: { rotateY: 180 },
        enter: { rotateY: -180 },
        animation: flipAnimationDefaults,
    };
    TransitionDefaults.FlipUp = {
        backfaceVisible: false,
        exit: { rotateX: 180 },
        enter: { rotateX: -180 },
        animation: flipAnimationDefaults,
    };
    TransitionDefaults.FlipDown = {
        backfaceVisible: false,
        exit: { rotateX: -180 },
        enter: { rotateX: 180 },
        animation: flipAnimationDefaults,
    };
})(TransitionDefaults || (TransitionDefaults = {}));
/**
 * @internal
 */
export function pushTransition(options) {
    const side = options && options.appearsFrom ? options.appearsFrom : "right";
    switch (side) {
        case "right":
            return TransitionDefaults.PushLeft;
        case "left":
            return TransitionDefaults.PushRight;
        case "bottom":
            return TransitionDefaults.PushUp;
        case "top":
            return TransitionDefaults.PushDown;
    }
}
/**
 * @internal
 */
export function overlayTransition(options) {
    const side = options && options.appearsFrom ? options.appearsFrom : "bottom";
    switch (side) {
        case "right":
            return TransitionDefaults.OverlayLeft;
        case "left":
            return TransitionDefaults.OverlayRight;
        case "bottom":
            return TransitionDefaults.OverlayUp;
        case "top":
            return TransitionDefaults.OverlayDown;
    }
}
/**
 * @internal
 */
export function flipTransition(options) {
    const side = options && options.appearsFrom ? options.appearsFrom : "bottom";
    switch (side) {
        case "right":
            return TransitionDefaults.FlipLeft;
        case "left":
            return TransitionDefaults.FlipRight;
        case "bottom":
            return TransitionDefaults.FlipUp;
        case "top":
            return TransitionDefaults.FlipDown;
    }
}
