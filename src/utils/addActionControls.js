import { runtime } from "./runtimeInjection";
/**
 * Provide a title and controls for an action, used by Framer X
 * @param action - a reference to an {@link Action}
 * @param title - the display title of the action
 * @param controls - the action controls
 * @internal
 */
export function addActionControls(action, title, controls) {
    runtime.addActionControls(action, title, controls);
}
