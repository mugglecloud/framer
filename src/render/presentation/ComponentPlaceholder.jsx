import * as React from "react";
import { FrameWithMotion } from "./Frame";
/**
 * @internal
 */
export var PlaceholderType;
(function (PlaceholderType) {
    PlaceholderType[PlaceholderType["Loading"] = 0] = "Loading";
    PlaceholderType[PlaceholderType["Error"] = 1] = "Error";
})(PlaceholderType || (PlaceholderType = {}));
/**
 * @internal
 */
export function ComponentPlaceholder({ type, title, message, props, }) {
    return (<FrameWithMotion className={className(type)} style={baseStyle} width={"100%"} height={"100%"} {...props}>
            <div style={titleStyle}>{placeholderTitle(type, title)}</div>
            {message && <div style={messageStyle}>{message}</div>}
        </FrameWithMotion>);
}
const baseStyle = {
    background: undefined,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    lineHeight: "1.4em",
    textOverflow: "ellipsis",
    overflow: "hidden",
    minHeight: 0,
};
const textStyle = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    flexShrink: 0,
    padding: `0 10px`,
};
const titleStyle = {
    ...textStyle,
    fontWeight: 500,
};
const messageStyle = {
    ...textStyle,
    whiteSpace: "pre",
    maxHeight: "calc(50% - calc(20px * var(--framerInternalCanvas-canvasPlaceholderContentScaleFactor, 1)))",
    opacity: 0.8,
    WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
};
function className(type) {
    switch (type) {
        case PlaceholderType.Error:
            return "framerInternalUI-errorPlaceholder";
        case PlaceholderType.Loading:
            return "framerInternalUI-componentPlaceholder";
    }
}
function placeholderTitle(type, title) {
    if (!title)
        return typeTitle(type);
    return `${typeTitle(type)} in ${stripSlash(title)}`;
}
function typeTitle(type) {
    switch (type) {
        case PlaceholderType.Loading:
            return "Loading";
        case PlaceholderType.Error:
            return "Error";
    }
}
function stripSlash(title) {
    if (title.startsWith("./")) {
        return title.replace("./", "");
    }
    return title;
}
