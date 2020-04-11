import * as React from "react";
const hoistNonReactStatic = require("hoist-non-react-statics");
import { DeprecatedStack } from "./DeprecatedStack";
import { Stack as StackWithDOM, StackProperties } from "./Stack";
import { DeprecatedStackProperties, StackSpecificProps } from "./types";
import * as StackLayout from "./layoutUtils";
import {
  ParentSizeState,
  useParentSize,
  deprecatedParentSize,
} from "../../render/types/NewConstraints";
export {
  StackLayout,
  StackProperties,
  DeprecatedStackProperties,
  StackSpecificProps,
};
/**
 * The Stack component will automatically distribute its contents based on its
 * properties. See `StackProperties` for details on configuration.
 *
 * @remarks
 * ```jsx
 * function MyComponent() {
 *   return (
 *     <Stack>
 *       <Frame />
 *       <Frame />
 *       <Frame />
 *     </Stack>
 *   )
 * }
 * ```
 * @public
 */
export function Stack(props) {
  const parentSize = useParentSize();
  if (
    props.__fromCodeComponentNode &&
    parentSize !== ParentSizeState.Disabled
  ) {
    const currentParentSize = deprecatedParentSize(parentSize);
    let width = undefined;
    let height = undefined;
    if (currentParentSize !== null) {
      width = currentParentSize.width;
      height = currentParentSize.height;
    }
    return React.createElement(
      DeprecatedStack,
      Object.assign({ width: width, height: height }, props)
    );
  }
  return React.createElement(StackWithDOM, Object.assign({}, props));
}
hoistNonReactStatic(Stack, DeprecatedStack);
Stack.displayName = "Stack";
