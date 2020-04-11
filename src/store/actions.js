/* eslint-disable react-hooks/rules-of-hooks */
// import * as o from "./operators";
import { json } from "overmind";
import { installPlugin } from "../base/runtime";

export const addNamespaces = async ({ state }, namespaces) => {
  if (state.config.namespaces == null) state.config.namespaces = {};
  Object.assign(state.config.namespaces, namespaces);
};

function fetchRuntimeDeps(deps = []) {
  const promises = deps.map(async (dep) => {
    let r = await window.fetch(dep.url);
    // console.log(r.get("Content-Type"));
    let code = await r.text();
    installPlugin(dep.name, code);
    return dep;
  });

  return Promise.all(promises);
}

// export const addRuntimeDeps = async ({ state, actions }, deps = []) => {
//   state.config.runtime_deps = await fetchRuntimeDeps(deps);
// };

export const setConfig = async ({ state }, { runtime_deps, ...config }) => {
  state.config = config;
  state.config.runtime_deps = await fetchRuntimeDeps(json(config.runtime_deps));
};
