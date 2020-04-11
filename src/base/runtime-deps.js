import * as ReactDom from "react-dom";
import * as React from "react";
// import * as MaterialUiStyles from "@material-ui/styles";
// import * as styled from "styled-components";
// import * as hooks from "runtime/hooks";
import * as ReactRouterDom from "react-router-dom";
import * as ReactRouter from "react-router";
// import * as icons from "../icons";
import * as Overmind from "overmind";
// import * as ReactIntl from "react-intl";

// const AntdMobile = require("antd-mobile");

const installedModules = new Map([
  ["react-dom", ReactDom],
  ["react", React],
  ["react-router-dom", ReactRouterDom],
  ["react-router", ReactRouter],
  ["overmind", Overmind]
  // ["styled-components", styled],
  // ["antd-mobile", AntdMobile],
  // ["@material-ui/styles", MaterialUiStyles],
  // ["react-intl", ReactIntl],
  // ["runtime/hooks", hooks],
  // ["runtime/icons", icons]
]);

export default installedModules;

export const deps = Array.from(installedModules.keys());
