import { PathSegmentRecord } from "./PathSegmentRecord";
import { Point } from "../";
/**
 * @internal
 */
export class PathSegment extends PathSegmentRecord {
    toJS() {
        const JS = super.toJS();
        JS["__class"] = this.constructor.name;
        return JS;
    }
    toJSON() {
        return this.toJS();
    }
}
/**
 * @internal
 */
(function (PathSegment) {
    PathSegment.point = (pathSegment) => {
        return { x: pathSegment.x, y: pathSegment.y };
    };
    PathSegment.handleOut = (pathSegment) => {
        return { x: pathSegment.handleOutX, y: pathSegment.handleOutY };
    };
    PathSegment.handleIn = (pathSegment) => {
        return { x: pathSegment.handleInX, y: pathSegment.handleInY };
    };
    PathSegment.calculatedHandleOut = (pathSegment) => {
        switch (pathSegment.handleMirroring) {
            case "symmetric":
            case "disconnected":
            case "asymmetric":
                return Point.add(PathSegment.point(pathSegment), PathSegment.handleOut(pathSegment));
            default:
                return { x: pathSegment.x, y: pathSegment.y };
        }
    };
    PathSegment.calculatedHandleIn = (pathSegment) => {
        switch (pathSegment.handleMirroring) {
            case "symmetric":
                return Point.subtract(PathSegment.point(pathSegment), PathSegment.handleOut(pathSegment));
            case "disconnected":
            case "asymmetric":
                return Point.add(PathSegment.point(pathSegment), PathSegment.handleIn(pathSegment));
            default:
                return PathSegment.point(pathSegment);
        }
    };
    PathSegment.curveDefault = (points, index) => {
        if (points.length > 2) {
            let pointBefore;
            let pointAfter;
            if (index === 0) {
                pointBefore = points[points.length - 1];
            }
            else {
                pointBefore = points[index - 1];
            }
            if (index === points.length - 1) {
                pointAfter = points[0];
            }
            else {
                pointAfter = points[index + 1];
            }
            const delta = Point.subtract(PathSegment.point(pointAfter), PathSegment.point(pointBefore));
            return { x: delta.x / 4, y: delta.y / 4 };
        }
        return { x: 10, y: 10 };
    };
})(PathSegment || (PathSegment = {}));
