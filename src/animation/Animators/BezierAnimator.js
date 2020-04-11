import { Point } from "../../render/types/Point";
/**
 * @public
 */
export var Bezier;
(function (Bezier) {
    Bezier["Linear"] = "linear";
    Bezier["Ease"] = "ease";
    Bezier["EaseIn"] = "ease-in";
    Bezier["EaseOut"] = "ease-out";
    Bezier["EaseInOut"] = "ease-in-out";
})(Bezier || (Bezier = {}));
export const BezierDefaults = {
    curve: Bezier.Ease,
    duration: 1,
};
function controlPointsForCurve(curve) {
    switch (curve) {
        case Bezier.Linear:
            return [0, 0, 1, 1];
        case Bezier.Ease:
            return [0.25, 0.1, 0.25, 1];
        case Bezier.EaseIn:
            return [0.42, 0, 1, 1];
        case Bezier.EaseOut:
            return [0, 0, 0.58, 1];
        case Bezier.EaseInOut:
            return [0.42, 0, 0.58, 1];
    }
}
/**
 * Animator class using a bezier curve.
 * @internal
 * @deprecated Use the `transition` prop instead
 */
export class BezierAnimator {
    constructor(options, interpolation) {
        this.interpolation = interpolation;
        this.progress = 0;
        this.next = (delta) => {
            const { duration } = this.options;
            this.progress += delta / duration;
            const value = this.unitBezier.solve(this.progress, this.solveEpsilon(duration));
            this.current = this.interpolator(value);
            return this.current;
        };
        this.options = { ...BezierDefaults, ...options };
        let controlPoints;
        if (typeof this.options.curve === "string") {
            controlPoints = controlPointsForCurve(this.options.curve);
        }
        else {
            controlPoints = this.options.curve;
        }
        const [p1x, p1y, p2x, p2y] = controlPoints;
        this.unitBezier = new UnitBezier(Point(p1x, p1y), Point(p2x, p2y));
    }
    setFrom(value) {
        this.current = value;
        this.updateInterpolator();
    }
    setTo(value) {
        this.destination = value;
        this.updateInterpolator();
    }
    isReady() {
        return this.interpolator !== undefined;
    }
    updateInterpolator() {
        if (this.current === undefined || this.destination === undefined) {
            return;
        }
        this.interpolator = this.interpolation.interpolate(this.current, this.destination);
    }
    isFinished() {
        return this.progress >= 1;
    }
    solveEpsilon(duration) {
        return 1.0 / (200.0 * duration);
    }
}
// Based on WebKit implementation from https://github.com/WebKit/webkit/blob/master/PerformanceTests/MotionMark/resources/extensions.js#L379
class UnitBezier {
    constructor(point1, point2) {
        // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
        this.c = Point.multiply(point1, 3);
        this.b = Point.subtract(Point.multiply(Point.subtract(point2, point1), 3), this.c);
        this.a = Point.subtract(Point.subtract(Point(1, 1), this.c), this.b);
    }
    solve(x, epsilon) {
        return this.sampleY(this.solveForT(x, epsilon));
    }
    sampleX(t) {
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        return ((this.a.x * t + this.b.x) * t + this.c.x) * t;
    }
    sampleY(t) {
        return ((this.a.y * t + this.b.y) * t + this.c.y) * t;
    }
    sampleDerivativeX(t) {
        return (3 * this.a.x * t + 2 * this.b.x) * t + this.c.x;
    }
    solveForT(x, epsilon) {
        let t0, t1, t2, x2, d2, i;
        t2 = x;
        for (i = 0; i < 8; ++i) {
            x2 = this.sampleX(t2) - x;
            if (Math.abs(x2) < epsilon)
                return t2;
            d2 = this.sampleDerivativeX(t2);
            if (Math.abs(d2) < epsilon)
                break;
            t2 = t2 - x2 / d2;
        }
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t2 < t0)
            return t0;
        if (t2 > t1)
            return t1;
        while (t0 < t1) {
            x2 = this.sampleX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }
        return t2;
    }
}
