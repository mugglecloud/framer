/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import ReactDOM from "react-dom";
import App from "./containers/App";
import { RuntimeProvider } from "./containers/Runtime";

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

export { useOvermind, useStore, bindScope } from "./hooks";
export { RuntimeProvider } from "./containers/Runtime";

/*
config: {
  providers: Array<{
    element: ReactElement,
    props: ReactProps
  }>

  initializer: ReactElement,

  routes: Array<{
    path: string,
    exact: boolean,
    need_auth: boolean,
    redirect: string,
    ui_components: Array<{
      name,
      props,
      component | source,
    }>
  }>

  pages: {
    auth: ReactElement,
    redirect: string,
    nomatch: ReactElement
  }

  runtime_deps: Array<{
    name,
    url
  }>
}
*/

export default function render(
  config = {
    style: {},
    providers: [],
    initializer: null,
    routes: [],
    pages: {
      auth: null,
      nomatch: null,
      loading: null
    },
    runtime_deps: [],
    ui_components: null,
    namespaces: null
  }
) {
  ReactDOM.render(
    <RuntimeProvider config={config}>
      <App />
    </RuntimeProvider>,
    document.getElementById("root")
  );
}
