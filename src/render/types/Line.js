import { Point } from "../";
/**
 * @alpha
 */
function Line(a, b) {
    return { a, b };
}
/**
 * @alpha
 */
(function (Line) {
    function intersection(lineA, lineB) {
        const x1 = lineA.a.x;
        const y1 = lineA.a.y;
        const x2 = lineA.b.x;
        const y2 = lineA.b.y;
        const x3 = lineB.a.x;
        const y3 = lineB.a.y;
        const x4 = lineB.b.x;
        const y4 = lineB.b.y;
        const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (d === 0) {
            return null;
        }
        const xi = ((x3 - x4) * (x1 * y2 - y1 * x2) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d;
        const yi = ((y3 - y4) * (x1 * y2 - y1 * x2) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d;
        return { x: xi, y: yi };
    }
    Line.intersection = intersection;
    Line.isOrthogonal = (line) => {
        return line.a.x === line.b.x || line.a.y === line.b.y;
    };
    Line.perpendicular = (line, pointOnLine) => {
        const deltaX = line.a.x - line.b.x;
        const deltaY = line.a.y - line.b.y;
        const pointB = Point(pointOnLine.x - deltaY, pointOnLine.y + deltaX);
        return Line(pointB, pointOnLine);
    };
    function projectPoint(line, point) {
        const perp = Line.perpendicular(line, point);
        return intersection(line, perp);
    }
    Line.projectPoint = projectPoint;
})(Line || (Line = {}));
export { Line };
