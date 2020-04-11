import { ContentState, convertFromRaw, Editor, EditorState } from "draft-js";
import { safeWindow } from "../../utils/safeWindow";
import * as React from "react";
import { Animatable } from "../../animation/Animatable";
import { deviceFont } from "../../utils/environment";
import { fontStore } from "../fonts/fontStore";
import { draftStyleFunction } from "../style/draft";
import { collectTextShadowsForProps } from "../style/shadow";
import { calculateRect, ParentSizeState, useParentSize, } from "../types/NewConstraints";
import { RenderEnvironment, RenderTarget } from "../types/RenderEnvironment";
import { collectFiltersFromProps } from "../utils/filtersForNode";
import { injectComponentCSSRules } from "../utils/injectComponentCSSRules";
import { ComponentContainerContext } from "./ComponentContainer";
import { Layer } from "./Layer";
import { draftBlockRendererFunction } from "./TextBlock";
import { forceLayerBackingWithCSSProperties } from "../utils/setLayerBacked";
// Before migrating to functional components we need to get parentSize data from context
/**
 * @internal
 */
export function Text(props) {
    const parentSize = useParentSize();
    return <TextComponent {...props} parentSize={parentSize}/>;
}
class TextComponent extends Layer {
    constructor() {
        super(...arguments);
        /** Used by the ComponentContainerContext */
        this.renderMain = (isCodeComponentChild) => {
            if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
                safeWindow["perf"].nodeRender();
            const { font, fonts: fontSelectors, visible, rotation, alignment, autoSize, clip, calculatedSize, willChangeTransform, opacity, id, _forwardedOverrides, } = this.props;
            const { zoom } = RenderEnvironment;
            const frame = this.frame;
            if (!visible) {
                return null;
            }
            if (fontSelectors) {
                fontStore.loadWebFontsFromSelectors(fontSelectors);
            }
            injectComponentCSSRules();
            // We want to hide the Text component underneath the TextEditor when editing
            // but never when displayed in the preview or as child of a code component.
            const shouldHide = this.props.environment() === RenderTarget.canvas && !isCodeComponentChild;
            const isHidden = this.props.isEditable && shouldHide;
            const style = {
                wordWrap: "break-word",
                outline: "none",
                display: "inline-block",
                opacity: isHidden ? 0 : opacity,
                transform: `rotate(${Animatable.getNumber(rotation).toFixed(4)}deg)`,
            };
            const dataProps = {
                "data-framer-component-type": "Text",
            };
            if (frame && RenderTarget.hasRestrictions()) {
                Object.assign(style, {
                    transform: `translate(${frame.x}px, ${frame.y}px) ${style.transform}`,
                    // Using “auto” fixes wrapping problems where our size calculation does not work out well when zooming the
                    // text (due to rendering differences).
                    width: autoSize ? "auto" : `${frame.width}px`,
                    minWidth: `${frame.width}px`,
                    height: `${frame.height}px`,
                });
            }
            else {
                const { left, right, top, bottom, width, height, center } = this.props;
                Object.assign(style, {
                    left,
                    right,
                    top,
                    bottom,
                    width: autoSize ? "auto" : width,
                    minWidth: width,
                    height,
                });
                let additionalTransform = "";
                if (center === true) {
                    additionalTransform = "translate(-50%, -50%) ";
                }
                else {
                    if (center === "x") {
                        additionalTransform = "translateX(-50%) ";
                    }
                    else if (center === "y") {
                        additionalTransform = "translateY(-50%) ";
                    }
                }
                style.transform = `${additionalTransform}${style.transform}`;
            }
            collectFiltersFromProps(this.props, style);
            const ignoreShadows = zoom >= 8;
            if (!ignoreShadows) {
                collectTextShadowsForProps(this.props, style);
            }
            if (style.opacity === 1 || style.opacity === undefined) {
                // Wipe opacity setting if it's the default (1 or undefined)
                delete style.opacity;
            }
            if (willChangeTransform) {
                // We're not using Layer.applyWillChange here, because adding willChange:transform causes clipping issues in export
                forceLayerBackingWithCSSProperties(style);
            }
            // Only clip text if it’s actually overflowing, else shadows might be clipped
            if (clip || (!autoSize && frame && calculatedSize.height > frame.height)) {
                style.overflow = "hidden";
            }
            let rawHTML = this.props.rawHTML;
            let contentState = this.props.contentState;
            let text = undefined;
            if (id && _forwardedOverrides) {
                const value = _forwardedOverrides[id];
                if (typeof value === "string") {
                    text = _forwardedOverrides[id];
                }
            }
            else {
                text = this.props.text;
            }
            if (text !== undefined) {
                if (rawHTML) {
                    rawHTML = replaceHTMLWithText(rawHTML, text);
                }
                else if (contentState) {
                    contentState = replaceContentStateWithText(contentState, text);
                }
                else {
                    rawHTML = `<p style="font: ${font}">${text}</p>`;
                }
            }
            if (this.props.style) {
                Object.assign(style, this.props.style);
            }
            if (rawHTML) {
                style.textAlign = alignment;
                style.whiteSpace = "pre-wrap";
                style.wordWrap = "break-word";
                style.lineHeight = "1px";
                return <div id={id} style={style} {...dataProps} dangerouslySetInnerHTML={{ __html: rawHTML }}/>;
            }
            if (!this.editorState || this.editorText !== text) {
                this.editorText = text;
                this.editorState = this.editorStateForContentState(contentState);
            }
            return (<div id={id} style={style} {...dataProps}>
                <Editor editorState={this.editorState} onChange={this.onChange} readOnly={true} customStyleFn={draftStyleFunction} blockRendererFn={this.blockRendererFn} textAlignment={alignment}/>
            </div>);
        };
        this.blockRendererFn = block => {
            return draftBlockRendererFunction({ editable: false, alignment: this.props.alignment })(block);
        };
        this.onChange = (_) => {
            // NOOP
        };
    }
    get frame() {
        return calculateRect(this.props, this.props.parentSize || ParentSizeState.Unknown, false);
    }
    editorStateForContentState(contentState) {
        if (contentState) {
            if (!(contentState instanceof ContentState)) {
                contentState = convertFromRaw(contentState);
            }
            return EditorState.createWithContent(contentState);
        }
        else {
            return EditorState.createEmpty();
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.contentState !== this.props.contentState) {
            this.editorState = this.editorStateForContentState(nextProps.contentState);
        }
    }
    render() {
        // Refactor to use React.useContext()
        return <ComponentContainerContext.Consumer>{this.renderMain}</ComponentContainerContext.Consumer>;
    }
}
TextComponent.supportsConstraints = true;
TextComponent.defaultTextProps = {
    opacity: undefined,
    left: undefined,
    right: undefined,
    top: undefined,
    bottom: undefined,
    _constraints: {
        enabled: true,
        aspectRatio: null,
    },
    rotation: 0,
    clip: false,
    visible: true,
    contentState: undefined,
    alignment: undefined,
    autoSize: true,
    calculatedSize: { width: 1, height: 0 },
    shadows: [],
    font: "16px " + deviceFont(),
};
TextComponent.defaultProps = {
    ...Layer.defaultProps,
    ...TextComponent.defaultTextProps,
    isEditable: false,
    environment: RenderTarget.current,
};
function replaceHTMLWithText(rawHTML, text) {
    const orig = rawHTML.split('<span data-text="true">');
    return orig[0] + '<span data-text="true">' + text + "</span></span>";
}
function replaceContentStateWithText(contentState, text) {
    const block0 = contentState.blocks[0] || { inlineStyleRanges: [] };
    const length = text.length;
    const inlineStyleRanges = [];
    block0.inlineStyleRanges.forEach((range) => {
        if (range.offset !== 0)
            return;
        inlineStyleRanges.push({ ...range, length });
    });
    return { blocks: [{ ...block0, text, inlineStyleRanges }], entityMap: {} };
}
