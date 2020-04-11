export function paddingFromProps(props) {
    const { paddingPerSide, padding = 0, paddingTop, paddingBottom, paddingLeft, paddingRight } = props;
    if (paddingPerSide !== false &&
        (paddingTop !== undefined ||
            paddingBottom !== undefined ||
            paddingLeft !== undefined ||
            paddingRight !== undefined)) {
        return {
            top: paddingTop !== undefined ? paddingTop : padding,
            bottom: paddingBottom !== undefined ? paddingBottom : padding,
            left: paddingLeft !== undefined ? paddingLeft : padding,
            right: paddingRight !== undefined ? paddingRight : padding,
        };
    }
    return {
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
    };
}
export function makePaddingString({ top, left, bottom, right, }) {
    return `${top}px ${right}px ${bottom}px ${left}px`;
}
