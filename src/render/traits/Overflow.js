export function collectOverflowFromProps(props, style) {
    if (props.overflow) {
        style.overflow = props.overflow;
    }
}
