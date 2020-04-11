import { Children } from "react";
import { ConstraintValues, valueToDimensionType, DimensionType, isFiniteNumber, } from "../../render";
import { isAnimatable } from "../../animation/Animatable";
import { Rect } from "../../render/types/Rect";
import { ObservableObject } from "../../data/ObservableObject";
import { DeprecatedStack } from "./DeprecatedStack";
import { RenderEnvironment, RenderTarget } from "../../render/types/RenderEnvironment";
import { isReactChild, isReactElement } from "../../utils/type-guards";
const calcComponentSize = (props, parentSize, freeSpace) => {
    const constraintValues = ConstraintValues.fromProperties(props);
    return ConstraintValues.toSize(constraintValues, parentSize || null, null, freeSpace);
};
const calcComponentMinSize = (props, parentSize) => {
    const constraintValues = ConstraintValues.fromProperties(props);
    return ConstraintValues.toMinSize(constraintValues, parentSize || null);
};
const calcStackComponentSize = (props, parentSize, freeSpace) => {
    const constraintValues = ConstraintValues.fromProperties(props);
    const minSize = ConstraintValues.toMinSize(constraintValues, parentSize);
    let size = null;
    const widthDimensionType = valueToDimensionType(props.width);
    const heightDimensionType = valueToDimensionType(props.height);
    if (widthDimensionType === DimensionType.Auto || heightDimensionType === DimensionType.Auto) {
        const minChildrenSizes = calcMinChildSizes(props.children, minSize);
        const invisibleItems = invisibleItemIndexes(props.children);
        size = calcAutoSize(minChildrenSizes, props, invisibleItems);
    }
    return ConstraintValues.toSize(constraintValues, props.parentSize, size, freeSpace);
};
const calcStackComponentMinSize = (props, parentSize) => {
    const constraintValues = ConstraintValues.fromProperties(props);
    const minSize = ConstraintValues.toMinSize(constraintValues, parentSize);
    let autoSize = null;
    const widthDimensionType = valueToDimensionType(props.width);
    const heightDimensionType = valueToDimensionType(props.height);
    if (widthDimensionType === DimensionType.Auto || heightDimensionType === DimensionType.Auto) {
        const minChildrenSizes = calcMinChildSizes(props.children, minSize);
        const invisibleItems = invisibleItemIndexes(props.children);
        autoSize = calcAutoSize(minChildrenSizes, props, invisibleItems);
    }
    return ConstraintValues.toMinSize(constraintValues, parentSize, autoSize);
};
const calcSize = (component, props, parentSize, freeSpace) => {
    if (component === DeprecatedStack) {
        return calcStackComponentSize(props, parentSize, freeSpace);
    }
    else {
        return calcComponentSize(props.constraints || props, parentSize, freeSpace);
    }
};
const calcMinSize = (component, props, parentSize) => {
    if (component === DeprecatedStack) {
        return calcStackComponentMinSize(props, parentSize);
    }
    else {
        return calcComponentMinSize(props.constraints || props, parentSize);
    }
};
const invisibleItemIndexes = (children, placeholders) => {
    const invisibleItems = [];
    Children.forEach(children, (child, index) => {
        if (!isReactChild(child) || !isReactElement(child) || child.props.visible !== false) {
            return child;
        }
        if (placeholders && placeholders.index <= index) {
            index += placeholders.sizes.length;
        }
        invisibleItems.push(index);
    });
    return invisibleItems;
};
const calcMinChildSizes = (children, size, placeholders) => {
    const sizes = Children.map(children, (child) => {
        if (!isReactChild(child) || !isReactElement(child)) {
            return { width: 0, height: 0 };
        }
        return calcMinSize(child.type, child.props, size);
    });
    if (placeholders) {
        sizes.splice(placeholders.index, 0, ...placeholders.sizes);
    }
    return sizes;
};
const calcChildSizes = (children, size, freeSpace, placeholders) => {
    const sizes = Children.map(children, (child) => {
        if (!isReactChild(child) || !isReactElement(child)) {
            return { width: 0, height: 0 };
        }
        return calcSize(child.type, child.props, size, freeSpace);
    });
    if (placeholders) {
        sizes.splice(placeholders.index, 0, ...placeholders.sizes);
    }
    return sizes;
};
const calcAutoSize = (minChildrenSizes = [], props, invisibleItems) => {
    const { direction, gap } = props;
    const isHorizontalStack = direction === "horizontal";
    let totalWidth = 0;
    let totalHeight = 0;
    minChildrenSizes.forEach((childSize, index) => {
        if (invisibleItems.indexOf(index) !== -1)
            return;
        const { width, height } = childSize;
        if (isHorizontalStack) {
            totalWidth += width;
            if (height > totalHeight)
                totalHeight = height;
        }
        else {
            totalHeight += height;
            if (width > totalWidth)
                totalWidth = width;
        }
    });
    if (isGapEnabled(props.distribution)) {
        const gapCount = Math.max(0, minChildrenSizes.length - 1 - invisibleItems.length);
        if (isHorizontalStack) {
            totalWidth += gapCount * gap;
        }
        else {
            totalHeight += gapCount * gap;
        }
    }
    const padding = calcPaddingSize(props);
    return {
        width: totalWidth + padding.width,
        height: totalHeight + padding.height,
    };
};
const paddingSizeFromEachSide = ({ paddingTop, paddingRight, paddingBottom, paddingLeft, }) => ({
    width: paddingLeft + paddingRight,
    height: paddingTop + paddingBottom,
});
const paddingSizeFromSingle = ({ padding }) => ({
    width: padding * 2,
    height: padding * 2,
});
const calcPaddingSize = (props) => {
    return props.paddingPerSide ? paddingSizeFromEachSide(props) : paddingSizeFromSingle(props);
};
const distWithGapEnabled = new Set(["start", "center", "end"]);
const isGapEnabled = (distribution) => distWithGapEnabled.has(distribution);
const calcChildFractions = (children) => {
    const freeSpaceUnitDivisor = { width: 0, height: 0 };
    Children.forEach(children, (child) => {
        if (!isReactChild(child) || !isReactElement(child) || child.props.visible === false) {
            return;
        }
        const width = (child.props.constraints && child.props.constraints.width) || child.props.width;
        const height = (child.props.constraints && child.props.constraints.height) || child.props.height;
        if (typeof width === "string" && width.endsWith("fr")) {
            const widthValue = parseFloat(width);
            if (isFiniteNumber(widthValue)) {
                freeSpaceUnitDivisor.width += widthValue;
            }
        }
        if (typeof height === "string" && height.endsWith("fr")) {
            const heightValue = parseFloat(height);
            if (isFiniteNumber(heightValue)) {
                freeSpaceUnitDivisor.height += heightValue;
            }
        }
    });
    return freeSpaceUnitDivisor;
};
const calcFreeSpace = (size, autoSize, childFractions, props) => {
    const isHorizontalStack = props.direction === "horizontal";
    const freeSpaceUnitDivisor = childFractions;
    let freeSpaceWidth = Math.max(0, size.width - autoSize.width);
    let freeSpaceHeight = Math.max(0, size.height - autoSize.height);
    const padding = calcPaddingSize(props);
    // Give all elements full amount of space in cross direction
    if (isHorizontalStack) {
        freeSpaceHeight = childFractions.height * (size.height - padding.height);
    }
    else {
        freeSpaceWidth = childFractions.width * (size.width - padding.width);
    }
    return {
        freeSpaceInParent: {
            width: freeSpaceWidth,
            height: freeSpaceHeight,
        },
        freeSpaceUnitDivisor,
    };
};
/** @internal */
const calcChildLayoutRects = (childSizes = [], size, props, invisibleItems) => {
    const childCount = childSizes.length;
    if (childCount === 0)
        return [];
    const { direction, alignment } = props;
    const isColumn = direction === "vertical";
    const isAutoSizedForAxis = (isColumn ? props.height : props.width) === "auto";
    const distribution = isAutoSizedForAxis ? "start" : props.distribution;
    const { width, height } = size;
    // Calculate the length children occupy on the main axis, and apply cross-axis alignment
    let axisLengthFittingChildren = 0;
    const childRects = childSizes.map((childSize, index) => {
        if (invisibleItems.indexOf(index) === -1) {
            axisLengthFittingChildren += isColumn ? childSize.height : childSize.width;
        }
        const rect = { ...childSize, x: 0, y: 0 };
        switch (alignment) {
            case "center":
                isColumn ? (rect.x = width / 2 - childSize.width / 2) : (rect.y = height / 2 - childSize.height / 2);
                break;
            case "end":
                isColumn ? (rect.x = width - childSize.width) : (rect.y = height - childSize.height);
                break;
        }
        return rect;
    });
    const axisLength = isColumn ? height : width;
    const invisibleItemCount = invisibleItems.length;
    const gap = isGapEnabled(props.distribution) ? props.gap || 0 : 0;
    let offset = 0;
    switch (distribution) {
        case "center":
            axisLengthFittingChildren += Math.max(childCount - 1 - invisibleItemCount, 0) * gap;
            offset = axisLength / 2 - axisLengthFittingChildren / 2;
            break;
        case "end":
            axisLengthFittingChildren += Math.max(childCount - 1 - invisibleItemCount, 0) * gap;
            offset = axisLength - axisLengthFittingChildren;
            break;
    }
    const emptyAxisLength = Math.max(axisLength, axisLengthFittingChildren) - axisLengthFittingChildren;
    const padding = paddingInset(props);
    // Position children
    let iterativeSize = 0;
    let skippedItems = 0;
    return childRects.map((rect, index) => {
        let pos;
        let spacing;
        if (invisibleItems.indexOf(index) !== -1) {
            skippedItems++;
            return rect;
        }
        index -= skippedItems;
        switch (distribution) {
            case "start":
            case "center":
            case "end":
                pos = offset + iterativeSize + index * gap;
                isColumn ? (rect.y = pos) : (rect.x = pos);
                break;
            case "space-between":
                pos = iterativeSize + (emptyAxisLength / Math.max(1, childCount - invisibleItemCount - 1)) * index;
                isColumn ? (rect.y = pos) : (rect.x = pos);
                break;
            case "space-around":
                spacing = emptyAxisLength / ((childCount - invisibleItemCount) * 2);
                pos = iterativeSize + spacing * index + spacing * (index + 1);
                isColumn ? (rect.y = pos) : (rect.x = pos);
                break;
            case "space-evenly":
                spacing = emptyAxisLength / (childCount - invisibleItemCount + 1);
                pos = iterativeSize + spacing * (index + 1);
                isColumn ? (rect.y = pos) : (rect.x = pos);
                break;
        }
        iterativeSize += isColumn ? rect.height : rect.width;
        rect.x += padding.x;
        rect.y += padding.y;
        return Rect.pixelAligned(rect);
    });
};
const paddingInset = (props) => {
    return props.paddingPerSide
        ? {
            x: props.paddingLeft,
            y: props.paddingTop,
        }
        : {
            x: props.padding,
            y: props.padding,
        };
};
const calcStackRect = (props, autoSize) => {
    const constraintValues = ConstraintValues.fromProperties(props);
    return ConstraintValues.toRect(constraintValues, props.parentSize || null, autoSize, true);
};
const calcUpdatedStackComponentSize = (props, state) => {
    const rect = calcStackRect(props, null);
    let size = state.size;
    const newSize = { width: rect.width, height: rect.height };
    const { target } = RenderEnvironment;
    if (!size) {
        if (target === RenderTarget.preview) {
            size = ObservableObject(newSize, true);
        }
        else {
            size = newSize;
        }
    }
    else {
        if (isAnimatable(size.width) && isAnimatable(size.height)) {
            size.width.set(newSize.width);
            size.height.set(newSize.height);
        }
        else {
            size = newSize;
        }
    }
    return size;
};
export { calcSize, calcMinSize, calcAutoSize, calcChildFractions, calcChildSizes, calcFreeSpace, calcChildLayoutRects, calcMinChildSizes, calcPaddingSize, calcUpdatedStackComponentSize, calcStackRect, invisibleItemIndexes, };
