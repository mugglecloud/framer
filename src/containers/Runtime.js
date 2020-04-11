import React, { useEffect, useMemo } from "react";
import store from "../store";
import { BrowserRouter as Router } from "react-router-dom";
import { json } from "overmind";
import { useOvermind, OvermindProvider } from "../hooks";
// import { mergeNamespaces } from "../base/utils";

if (process.env.NODE_ENV === "development") {
  // disable proxy state tree devmode to pass track mutation
  store.proxyStateTree.master.options.devmode = false;
  console.log(store);
}

function RenderRest(props) {
  const {
    state: { config },
    actions,
  } = useOvermind();

  // useMemo(() => {
  //   console.log(props.config.namespaces);
  //   mergeNamespaces(store, props.config.namespaces);
  // }, []);

  useEffect(() => {
    actions.setConfig(props.config);
  }, []);

  if (!config || !config.runtime_deps) return null;

  return (json(config.providers) || []).reduce(
    (pre, cur) => {
      return React.cloneElement(cur.element, cur.props || null, pre);
    },
    <>
      {config.initializer}
      {props.children}
    </>
  );
}

const Runtime = ({ children, config }) => {
  return (
    <OvermindProvider value={store}>
      <RenderRest config={config}>
        <Router>{children}</Router>
      </RenderRest>
    </OvermindProvider>
  );
};

export const RuntimeProvider = ({ config = {}, children }) => {
  return <Runtime config={config}>{children}</Runtime>;
};

export default Runtime;
