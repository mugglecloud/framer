import { Rect } from "./Rect";
import { isFiniteNumber } from "../utils/isFiniteNumber";
import { Animatable, isAnimatable } from "../../animation/Animatable";
import { isReactChild, isReactElement } from "../../utils/type-guards";
export const constraintDefaults = {
    left: null,
    right: null,
    top: null,
    bottom: null,
    centerX: "50%",
    centerY: "50%",
    aspectRatio: null,
    parentSize: null,
    width: 100,
    height: 100,
};
export var DimensionType;
(function (DimensionType) {
    DimensionType[DimensionType["FixedNumber"] = 0] = "FixedNumber";
    DimensionType[DimensionType["Percentage"] = 1] = "Percentage";
    /** @internal */ DimensionType[DimensionType["Auto"] = 2] = "Auto";
    DimensionType[DimensionType["FractionOfFreeSpace"] = 3] = "FractionOfFreeSpace";
})(DimensionType || (DimensionType = {}));
export function isConstraintSupportingChild(child) {
    if (!isReactChild(child) || !isReactElement(child)) {
        return false;
    }
    // Assume for now that all children support constraints (so they get passed parentSize)
    return true;
}
export function isConstraintSupportingClass(classToTest) {
    if (classToTest === null || classToTest === undefined) {
        return false;
    }
    return classToTest.supportsConstraints === true;
}
export var ConstraintMask;
(function (ConstraintMask) {
    // Modifies the constraint mask to remove invalid (mutually exclusive) options and returns the original.
    // TODO: this removes major inconsistencies but probably needs to be merged with ConstraintSolver.
    ConstraintMask.quickfix = (constraints) => {
        if (constraints.fixedSize) {
            // auto sized text
            // TODO: use auto dimension type
            constraints.widthType = DimensionType.FixedNumber;
            constraints.heightType = DimensionType.FixedNumber;
            constraints.aspectRatio = null;
        }
        if (isFiniteNumber(constraints.aspectRatio)) {
            if ((constraints.left && constraints.right) || (constraints.top && constraints.bottom)) {
                constraints.widthType = DimensionType.FixedNumber;
                constraints.heightType = DimensionType.FixedNumber;
            }
            if (constraints.left && constraints.right && constraints.top && constraints.bottom) {
                constraints.bottom = false;
            }
            if (constraints.widthType !== DimensionType.FixedNumber &&
                constraints.heightType !== DimensionType.FixedNumber) {
                constraints.heightType = DimensionType.FixedNumber;
            }
        }
        if (constraints.left && constraints.right) {
            constraints.widthType = DimensionType.FixedNumber;
            if (constraints.fixedSize) {
                constraints.right = false;
            }
        }
        if (constraints.top && constraints.bottom) {
            constraints.heightType = DimensionType.FixedNumber;
            if (constraints.fixedSize) {
                constraints.bottom = false;
            }
        }
        return constraints;
    };
})(ConstraintMask || (ConstraintMask = {}));
export function valueToDimensionType(value) {
    if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue === "auto")
            return DimensionType.Auto;
        if (trimmedValue.endsWith("fr"))
            return DimensionType.FractionOfFreeSpace;
        if (trimmedValue.endsWith("%"))
            return DimensionType.Percentage;
    }
    return DimensionType.FixedNumber;
}
export var ConstraintValues;
(function (ConstraintValues) {
    // Returns concrete current values given some ConstraintProperties.
    ConstraintValues.fromProperties = (props) => {
        const { left, right, top, bottom, width, height, centerX, centerY, aspectRatio, autoSize } = props;
        const constraints = ConstraintMask.quickfix({
            left: isFiniteNumber(left) || isAnimatable(left),
            right: isFiniteNumber(right) || isAnimatable(right),
            top: isFiniteNumber(top) || isAnimatable(top),
            bottom: isFiniteNumber(bottom) || isAnimatable(bottom),
            widthType: valueToDimensionType(width),
            heightType: valueToDimensionType(height),
            aspectRatio: aspectRatio || null,
            fixedSize: autoSize === true,
        });
        let widthValue = null;
        let heightValue = null;
        let widthType = DimensionType.FixedNumber;
        let heightType = DimensionType.FixedNumber;
        if (constraints.widthType !== DimensionType.FixedNumber && typeof width === "string") {
            const parsedWidth = parseFloat(width);
            if (width.endsWith("fr")) {
                widthType = DimensionType.FractionOfFreeSpace;
                widthValue = parsedWidth;
            }
            else if (width === "auto") {
                widthType = DimensionType.Auto;
            }
            else {
                // Percentage
                widthType = DimensionType.Percentage;
                widthValue = parsedWidth / 100;
            }
        }
        else if (width !== undefined && typeof width !== "string") {
            widthValue = Animatable.getNumber(width);
        }
        if (constraints.heightType !== DimensionType.FixedNumber && typeof height === "string") {
            const parsedHeight = parseFloat(height);
            if (height.endsWith("fr")) {
                heightType = DimensionType.FractionOfFreeSpace;
                heightValue = parsedHeight;
            }
            else if (height === "auto") {
                heightType = DimensionType.Auto;
            }
            else {
                // Percentage
                heightType = DimensionType.Percentage;
                heightValue = parseFloat(height) / 100;
            }
        }
        else if (height !== undefined && typeof height !== "string") {
            heightValue = Animatable.getNumber(height);
        }
        let centerAnchorX = 0.5;
        let centerAnchorY = 0.5;
        if (centerX) {
            centerAnchorX = parseFloat(centerX) / 100;
        }
        if (centerY) {
            centerAnchorY = parseFloat(centerY) / 100;
        }
        return {
            left: constraints.left ? Animatable.getNumber(left) : null,
            right: constraints.right ? Animatable.getNumber(right) : null,
            top: constraints.top ? Animatable.getNumber(top) : null,
            bottom: constraints.bottom ? Animatable.getNumber(bottom) : null,
            widthType,
            heightType,
            width: widthValue,
            height: heightValue,
            aspectRatio: constraints.aspectRatio || null,
            centerAnchorX: centerAnchorX,
            centerAnchorY: centerAnchorY,
        };
    };
    ConstraintValues.toMinSize = (values, parentSize, autoSize = null) => {
        let width = null;
        let height = null;
        const parentWidth = parentSize ? parentSize.width : null;
        const parentHeight = parentSize ? parentSize.height : null;
        const hOpposingPinsOffset = pinnedOffset(values.left, values.right);
        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset;
        }
        else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width;
        }
        else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width;
                    break;
                case DimensionType.FractionOfFreeSpace:
                    width = 0;
                    break;
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width;
                    }
                    break;
            }
        }
        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom);
        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset;
        }
        else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height;
        }
        else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height;
                    break;
                case DimensionType.FractionOfFreeSpace:
                    height = 0;
                    break;
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height;
                    }
                    break;
            }
        }
        return sizeAfterApplyingDefaultsAndAspectRatio(width, height, values);
    };
    ConstraintValues.toSize = (values, parentSize, autoSize, freeSpace) => {
        let width = null;
        let height = null;
        const parentWidth = parentSize ? Animatable.getNumber(parentSize.width) : null;
        const parentHeight = parentSize ? Animatable.getNumber(parentSize.height) : null;
        const hOpposingPinsOffset = pinnedOffset(values.left, values.right);
        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset;
        }
        else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width;
        }
        else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width;
                    break;
                case DimensionType.FractionOfFreeSpace:
                    width = freeSpace
                        ? (freeSpace.freeSpaceInParent.width / freeSpace.freeSpaceUnitDivisor.width) * values.width
                        : 0;
                    break;
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width;
                    }
                    break;
            }
        }
        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom);
        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset;
        }
        else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height;
        }
        else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height;
                    break;
                case DimensionType.FractionOfFreeSpace:
                    height = freeSpace
                        ? (freeSpace.freeSpaceInParent.height / freeSpace.freeSpaceUnitDivisor.height) * values.height
                        : 0;
                    break;
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height;
                    }
                    break;
            }
        }
        return sizeAfterApplyingDefaultsAndAspectRatio(width, height, values);
    };
    // Returns a parent-relative rect given concrete ConstraintValues.
    ConstraintValues.toRect = (values, parentSize, autoSize = null, pixelAlign = false, 
    // This argument is actually never used, because fractional sizes are always calculated by it's parent to static sizes
    freeSpace = null) => {
        let x = values.left || 0;
        let y = values.top || 0;
        let width = null;
        let height = null;
        const parentWidth = parentSize ? Animatable.getNumber(parentSize.width) : null;
        const parentHeight = parentSize ? Animatable.getNumber(parentSize.height) : null;
        const hOpposingPinsOffset = pinnedOffset(values.left, values.right);
        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset;
        }
        else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width;
        }
        else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width;
                    break;
                case DimensionType.FractionOfFreeSpace:
                    width = freeSpace
                        ? (freeSpace.freeSpaceInParent.width / freeSpace.freeSpaceUnitDivisor.width) * values.width
                        : null;
                    break;
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width;
                    }
                    break;
            }
        }
        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom);
        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset;
        }
        else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height;
        }
        else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height;
                    break;
                case DimensionType.FractionOfFreeSpace:
                    height = freeSpace
                        ? (freeSpace.freeSpaceInParent.height / freeSpace.freeSpaceUnitDivisor.height) * values.height
                        : null;
                    break;
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height;
                    }
                    break;
            }
        }
        const sizeWithDefaults = sizeAfterApplyingDefaultsAndAspectRatio(width, height, values);
        width = sizeWithDefaults.width;
        height = sizeWithDefaults.height;
        if (values.left !== null) {
            x = values.left;
        }
        else if (parentWidth && values.right !== null) {
            x = parentWidth - values.right - width;
        }
        else if (parentWidth) {
            x = values.centerAnchorX * parentWidth - width / 2;
        }
        if (values.top !== null) {
            y = values.top;
        }
        else if (parentHeight && values.bottom !== null) {
            y = parentHeight - values.bottom - height;
        }
        else if (parentHeight) {
            y = values.centerAnchorY * parentHeight - height / 2;
        }
        const f = { x, y, width, height };
        if (pixelAlign) {
            return Rect.pixelAligned(f);
        }
        return f;
    };
})(ConstraintValues || (ConstraintValues = {}));
const defaultWidth = 200;
const defaultHeight = 200;
function sizeAfterApplyingDefaultsAndAspectRatio(width, height, values) {
    let w = isFiniteNumber(width) ? width : defaultWidth;
    let h = isFiniteNumber(height) ? height : defaultHeight;
    if (isFiniteNumber(values.aspectRatio)) {
        if (isFiniteNumber(values.left) && isFiniteNumber(values.right)) {
            h = w / values.aspectRatio;
        }
        else if (isFiniteNumber(values.top) && isFiniteNumber(values.bottom)) {
            w = h * values.aspectRatio;
        }
        else if (values.widthType !== DimensionType.FixedNumber) {
            h = w / values.aspectRatio;
        }
        else {
            w = h * values.aspectRatio;
        }
    }
    return {
        width: w,
        height: h,
    };
}
function pinnedOffset(start, end) {
    if (!isFiniteNumber(start) || !isFiniteNumber(end))
        return null;
    return start + end;
}
export function getMergedConstraintsProps(props, constraints) {
    const result = {};
    if (props.constraints) {
        result.constraints = { ...props.constraints, ...constraints };
    }
    else {
        Object.assign(result, constraints);
    }
    return result;
}
