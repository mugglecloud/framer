import { environment } from "../utils";
import { TouchEventListener } from "./recognizer/TouchEventListener";
import { MouseEventListener } from "./recognizer/MouseEventListener";
/** @internal */
export const FramerEventListener = environment.isTouch()
    ? TouchEventListener
    : MouseEventListener;
