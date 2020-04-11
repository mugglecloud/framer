import * as CSS from "./css";
import { RenderTarget } from "../types/RenderEnvironment";
const componentCSSRules = `
[data-framer-component-type] {
    position: absolute;
}
`;
const textCSSRules = `
[data-framer-component-type="Text"] {
    cursor: default;
}
`;
const stackCSSRules = `
[data-framer-component-type="Stack"] > *,
[data-framer-component-type="Stack"] > [data-framer-component-type],
[data-framer-stack-gap] > *,
[data-framer-stack-gap] > [data-framer-component-type] {
    position: relative;
}

[data-framer-stack-gap] > * {
    margin-top: calc(var(--stack-gap-y) / 2);
    margin-bottom: calc(var(--stack-gap-y) / 2);
    margin-right: calc(var(--stack-gap-x) / 2);
    margin-left: calc(var(--stack-gap-x) / 2);
}

/* This should take the language direction into account */
[data-framer-stack-direction-reverse="false"]
[data-framer-stack-gap]
> *:first-child,
[data-framer-stack-direction-reverse="true"]
[data-framer-stack-gap]
> *:last-child {
    margin-top: 0;
    margin-left: 0;
}

/* This should take the language direction into account */
[data-framer-stack-direction-reverse="false"]
[data-framer-stack-gap]
> *:last-child,
[data-framer-stack-direction-reverse="true"]
[data-framer-stack-gap]
> *:first-child {
    margin-right: 0;
    margin-bottom: 0;
}
`;
const navigationCSSRules = `
NavigationContainer
[data-framer-component-type="NavigationContainer"] > *,
[data-framer-component-type="NavigationContainer"] > [data-framer-component-type] {
    position: relative;
}
`;
const pageContentWrapperWrapperCSSRules = `
[data-framer-component-type="PageContentWrapper"] > *,
[data-framer-component-type="PageContentWrapper"] > [data-framer-component-type] {
    position: relative;
}
`;
const combinedCSSRules = `
${componentCSSRules}
${textCSSRules}
${stackCSSRules}
${navigationCSSRules}
${pageContentWrapperWrapperCSSRules}
`;
/**
 * Add propagation-blocking if we're not on the canvas. If we add this while on the canvas,
 * strange behaviour can appear in the Component panel, with the drag event being blocked.
 */
const frameCSSRules = () => {
    const isPreview = RenderTarget.current() === RenderTarget.preview;
    return isPreview
        ? ` [data-framer-component-type="Frame"] * { pointer-events: auto; } `
        : ``;
};
export const injectComponentCSSRules = () => {
    CSS.add(combinedCSSRules);
    CSS.add(frameCSSRules());
};
