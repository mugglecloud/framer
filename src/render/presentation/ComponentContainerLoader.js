import * as React from "react";
import { ComponentPlaceholder, PlaceholderType } from "./ComponentPlaceholder";
import { safeWindow } from "../../utils/safeWindow";
export const ComponentContainerLoader = props => {
    if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
        safeWindow["perf"].nodeRender();
    let type = PlaceholderType.Loading;
    let title;
    let message;
    if (props.error) {
        type = PlaceholderType.Error;
        const { error, file } = props.error;
        title = file;
        message = error instanceof Error ? error.message : error;
    }
    return React.createElement(ComponentPlaceholder, { type: type, title: title, message: message });
};
