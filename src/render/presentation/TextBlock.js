import * as React from "react";
import { OrderedSet } from "immutable";
import { EditorBlock, CharacterMetadata } from "draft-js";
/**
 * @internal
 */
export class TextBlock extends React.Component {
    render() {
        const { block, blockProps } = this.props;
        let styledBlock;
        // Empty block
        if (block.getLength() === 0) {
            // Modify the character list to make the block have a style.
            // This is a hack that relies on the characterList not being used
            // for anything else down the line.
            const emptyStyle = block.getData().get("emptyStyle", OrderedSet());
            const emptyStyleCharacter = CharacterMetadata.create({ style: emptyStyle });
            const characterList = block.getCharacterList().insert(0, emptyStyleCharacter);
            styledBlock = block.set("characterList", characterList);
        }
        const blockStyle = {
            fontSize: "1px",
            textAlign: blockProps.alignment,
        };
        return (React.createElement("div", { style: blockStyle },
            React.createElement(EditorBlock, Object.assign({}, this.props, { block: styledBlock || block }))));
    }
}
/**
 * @internal
 */
export const draftBlockRendererFunction = ({ alignment, editable, }) => {
    return (block) => {
        return {
            component: TextBlock,
            props: { alignment },
            editable,
        };
    };
};
