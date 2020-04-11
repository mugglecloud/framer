export * from "framer-motion";
export {
  Scroll,
  ScrollProps,
  ScrollEvents,
  ScrollConfig,
  Page,
  PageEvents,
  PageProps,
  PageProperties,
  PageEffect,
  PageEffectInfo,
  PageAlignment,
  Draggable,
  Stack,
  StackProperties,
  StackSpecificProps,
  Navigation,
  calcChildLayoutRects,
} from "./components";
export { WithNavigator } from "./components/hoc/WithNavigator";
export {
  Device,
  DeviceSkin,
  DeviceSkins,
  DeviceRenderer,
} from "./components/devices/Device";
export * from "./components/devices/Devices";
export { AnyInterpolation, ValueInterpolation } from "./interpolation";
export {
  Animatable,
  AnimatableObject,
  Cancel,
  DeprecatedAnimationTarget,
  isAnimatable,
} from "./animation/Animatable";
export { animate } from "./animation/animate";
export { FramerAnimation } from "./animation/FramerAnimation";
export { BezierAnimator, SpringAnimator } from "./animation/Animators";
export { FramerEvent, FramerEventListener, FramerEventSession } from "./events";
export {
  Point,
  Size,
  Rect,
  Vector,
  VectorGroup,
  ComponentContainer,
  ComponentIdentifier,
  SVG,
  Text,
  TextColorProperties,
  Frame,
  FrameProps,
  BaseFrameProps,
  FrameLayoutProperties,
  CSSTransformProperties,
  VisualProperties,
  DeprecatedFrame,
  QualityOptions,
  DeprecatedFrameProperties,
  DeprecatedFrameWithEvents,
  DeprecatedFrameWithEventsProps,
  componentLoader,
  setGlobalRenderEnvironment,
  RenderTarget,
  ControlType,
  PropertyControls,
  NumberControlDescription,
  EnumControlDescription,
  BooleanControlDescription,
  StringControlDescription,
  ColorControlDescription,
  FusedNumberControlDescription,
  SegmentedEnumControlDescription,
  ImageControlDescription,
  FileControlDescription,
  ComponentInstanceDescription,
  ArrayControlDescription,
  EventHandlerControlDescription,
  ControlDescription,
  getConfigFromPreviewURL as getConfigFromURL,
  getConfigFromPreviewURL,
  getConfigFromVekterURL,
  serverURL,
  NavigationInterface,
  NavigationConsumer,
  NavigationLink,
  NavigationTransitionDirection,
  NavigationTransitionSide,
  NavigationTransitionPosition,
  NavigationTransitionAnimation,
  NavigationTransitionAppearsFrom,
  NavigationTransitionBackdropColor,
  NavigationTransition,
  FadeTransitionOptions,
  PushTransitionOptions,
  ModalTransitionOptions,
  OverlayTransitionOptions,
  FlipTransitionOptions,
  NavigationProps,
  useNavigation,
  isReactDefinition,
  createDesignComponent,
  CanvasStore,
  isOverride,
  Color,
  ConvertColor,
  ColorMixModelType,
  addServerUrlToResourceProps,
  BackgroundProperties,
  CustomProperties,
  CustomPropertiesContext,
  constraintsEnabled,
  throttle,
  debounce,
  LinearGradient,
  RadialGradient,
  BackgroundImage,
  ImageFit,
  isMotionValue,
} from "./render";
export { ObservableObject } from "./data/ObservableObject";
export { Data } from "./data/Data";
export { createData, DataContext } from "./data/useData";
export { WithOverride } from "./deprecated/WithOverride";
export {
  Action,
  ActionHandler,
  ActionControlDescription,
  ActionControls,
} from "./render/types/Action";
export { addActionControls } from "./utils/addActionControls";
export { DataObserver, DataObserverContext } from "./deprecated/DataObserver";
export { PropertyStore } from "./data/PropertyStore";
export { loadJSON } from "./utils/network";
export { print } from "./utils/print";
export { _injectRuntime } from "./utils/runtimeInjection";
export {
  addPropertyControls,
  getPropertyControls,
} from "./utils/addPropertyControls";
export { version } from "./version";
import { MainLoop } from "./core/Loop";
export { MainLoop };
// Only start the loop if this is the library
if (process.env.BUILD_NAME === "framer") {
  MainLoop.start();
}
