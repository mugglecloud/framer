import React, { memo, useMemo } from "react";
import { json, mutate } from "overmind";
import { IS_OPERATOR } from "overmind/es/utils";

import { useOvermind, StoreScope, ScopeContext } from "../hooks";

import { installPlugin } from "./runtime";

export const getScopeId = (context) => {
  const { actionName, actionId, operatorId } = context.execution;
  return `${actionName}:${actionId}:${operatorId}`;
};

const INSTALLED_MODULE_CACHE = new Map();

function scope(name, operator) {
  operator = operator[IS_OPERATOR] ? operator : mutate(operator);
  const instance = (err, context, next, final) => {
    ScopeContext.set(getScopeId(context), name);
    operator(err, context, next, final);
  };
  instance[IS_OPERATOR] = true;

  return instance;
}

function scopeActions(name, actions) {
  const modActions = {};
  for (let k in actions) {
    modActions[k] = scope(name, actions[k]);
  }
  return modActions;
}

function mergeNamespace(store, ns, name) {
  const { state, actions, effects } = store;

  state[name] = store.getState(ns);
  actions[name] = store.getActions(scopeActions(name, ns.actions));
  effects[name] = ns.effects;
}

// export const mergeNamespaces = (store, namespaces = {}) => {
//   console.log(namespaces);
//   for (let k in namespaces) {
//     const ns = namespaces[k];
//     console.log(ns);
//     mergeNamespace(store, ns, k);
//   }
// };

export const installModule = (store, mod) => {
  const { state, actions, effects } = store;
  const ns = mod.namespace;
  const name = mod.name;

  if (!ns || !name)
    throw new Error(`namespace(${ns}) and name(${name}) is required`);

  ns.actions.INTERNAL_INIT_FOR_INTERNAL_USE_ONLY_DO_NOT_USE_IT_ELSEWHERE = (
    overmindInstance,
    initialProps
  ) => {
    Object.assign(overmindInstance.state[name], json(initialProps));
  };

  // state[name] = store.getState(ns);
  // actions[name] = store.getActions(scopeActions(name, ns.actions));
  // effects[name] = ns.effects;
  mergeNamespace(store, ns, name);

  if (ns.onInitialize) {
    const onInitialize = store.createAction(
      "onInitialize",
      scope(name, ns.onInitialize)
    );
    Promise.resolve(onInitialize(store));
  }

  return name;
};

export function renderUi(ui, store) {
  let mod = ui.component ? ui : installPlugin(ui.name, ui.source);

  mod = mod && (mod.default || mod);
  if (!mod) {
    return null;
  }

  if (!INSTALLED_MODULE_CACHE.has(ui.name)) {
    INSTALLED_MODULE_CACHE.set(ui.name, installModule(store, mod));
  }

  return memo((props) => {
    const { actions } = useOvermind();
    useMemo(() => {
      actions[
        mod.name
      ].INTERNAL_INIT_FOR_INTERNAL_USE_ONLY_DO_NOT_USE_IT_ELSEWHERE(
        props.initialProps
      );
    }, [props.initialProps, mod.name]);
    return mod.component ? (
      <StoreScope.Provider value={INSTALLED_MODULE_CACHE.get(ui.name)}>
        <mod.component {...props.initialProps} />
      </StoreScope.Provider>
    ) : null;
  });
}
