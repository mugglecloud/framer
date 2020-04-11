import { Rect } from "../types/Rect";
import { safeWindow } from "../../utils/safeWindow";
export const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(callback));
        return;
    }
    callback();
};
export const frameFromElement = (element) => {
    const frame = Rect.fromRect(element.getBoundingClientRect());
    frame.x = frame.x + safeWindow.scrollX;
    frame.y = frame.y + safeWindow.scrollY;
    return frame;
};
export const frameFromElements = (elements) => {
    return Rect.merge(...elements.map(frameFromElement));
};
/** Returns a page frame for the given element */
export const convertToPageFrame = (frame, element) => {
    const point = convertToPagePoint(frame, element);
    return {
        x: point.x,
        y: point.y,
        width: frame.width,
        height: frame.height,
    };
};
/** Returns a parent frame for the given element */
export const convertFromPageFrame = (frame, element) => {
    const point = convertFromPagePoint(frame, element);
    return {
        x: point.x,
        y: point.y,
        width: frame.width,
        height: frame.height,
    };
};
export const getPageFrame = (element) => {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + safeWindow.scrollX,
        y: rect.top + safeWindow.scrollY,
        width: rect.width,
        height: rect.height,
    };
};
export const fromEventForPage = (event) => {
    return {
        x: event.pageX,
        y: event.pageY,
    };
};
export const fromEventForClient = (event) => {
    return {
        x: event.clientX,
        y: event.clientY,
    };
};
export const convertToPagePoint = (point, element) => {
    const frame = getPageFrame(element);
    return {
        x: point.x + frame.x,
        y: point.y + frame.y,
    };
};
export const convertFromPagePoint = (point, element) => {
    const frame = getPageFrame(element);
    return {
        x: point.x - frame.x,
        y: point.y - frame.y,
    };
};
export const dispatchKeyDownEvent = (keyCode, options = {}) => {
    const keyboardEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        keyCode: keyCode,
        ...options,
    });
    const activeElement = document.activeElement;
    if (activeElement) {
        activeElement.dispatchEvent(keyboardEvent);
    }
};
export const DOM = {
    frameFromElement,
    frameFromElements,
    convertToPageFrame,
    convertFromPageFrame,
    getPageFrame,
    fromEventForPage,
    fromEventForClient,
    convertToPagePoint,
    convertFromPagePoint,
};
