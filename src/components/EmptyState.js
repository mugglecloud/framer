import * as React from "react";
import { RenderEnvironment, RenderTarget } from "../render/types/RenderEnvironment";
import { FrameWithMotion } from "../render/presentation/Frame";
export function EmptyState({ title = "Connect to content", children, size, hide, showArrow = true, insideUserCodeComponent = false, }) {
    const { target } = RenderEnvironment;
    const childCount = React.Children.count(children);
    const width = size.width;
    const height = size.height;
    if (insideUserCodeComponent && childCount === 0) {
        return React.createElement(FrameWithMotion, { width: width, height: height, "data-name": "placeholder" });
    }
    if (target !== RenderTarget.canvas)
        return null;
    if (hide)
        return null;
    if (childCount !== 0)
        return null;
    // Determine when the frame is too small to show the text/arrow
    const minHeight = 24;
    const arrowWidth = 28;
    const hasAvailableHeight = height !== undefined && height >= minHeight;
    const shouldShowArrow = showArrow && hasAvailableHeight && width !== undefined && width >= arrowWidth + 6;
    const shouldShowTitle = hasAvailableHeight && (!showArrow || shouldShowArrow);
    return (React.createElement(FrameWithMotion, { key: `empty-state`, className: "framerInternalUI-canvasPlaceholder", top: 0, left: 0, width: width, height: height, style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "1",
            padding: "0 10px",
        } },
        shouldShowTitle && React.createElement(Title, null, title),
        shouldShowArrow && React.createElement(Arrow, null)));
}
const scaleFactor = "var(--framerInternalCanvas-canvasPlaceholderContentScaleFactor, 1)";
const Title = ({ children }) => {
    return (React.createElement("span", { style: {
            flex: "auto",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textAlign: "center",
            // Use a mask to fade out the right edge of the text as it moves under the arrow.
            WebkitMaskImage: `linear-gradient(90deg, black, black calc(100% - 12px * ${scaleFactor}), transparent)`,
        } }, children));
};
const Arrow = () => {
    const height = 7;
    const width = 14;
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: `0 0 ${width} ${height}`, style: {
            width: width,
            opacity: 0.9,
            transform: `scale(${scaleFactor})`,
            transformOrigin: "100% 50%",
            marginTop: 1,
        } },
        React.createElement("g", { transform: "translate(0.5 0.5)" },
            React.createElement("path", { d: "M 0 3 L 12 3", fill: "transparent", stroke: "currentColor", strokeLinecap: "butt" }),
            React.createElement("path", { d: "M 9 0 L 12 3 L 9 6", fill: "transparent", stroke: "currentColor", strokeLinecap: "butt" }))));
};
