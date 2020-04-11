/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { json } from "overmind";

import store from "../store";
import { useOvermind } from "../hooks";
import { renderUi } from "../base/utils";

function renderComponents(ui_components) {
  return ui_components.map(ui => {
    const OC = renderUi(ui, store);
    return OC && <OC key={ui.name} initialProps={ui.props} />;
  });
}

function Routes({ routes, pages = {} }) {
  const { state } = useOvermind();

  const routeComponents = routes.map(route => {
    if (!route.ui_components || !route.ui_components.length) {
      console.warn("ui is required", route.ui_components);
      return null;
    }

    const component = renderComponents(route.ui_components);

    const path = route.path;
    const exact = route.exact == null ? path === "/" || !path : route.exact;

    const C = route.redirect ? (
      <Redirect to={route.redirect} />
    ) : !route.need_auth || state.token ? (
      component
    ) : (
      pages.auth
    );

    return (
      <Route key={path} path={path} exact={exact}>
        {C}
      </Route>
    );
  });

  return (
    <Switch>
      {routeComponents}
      <Route>{pages.nomatch}</Route>
    </Switch>
  );
}

export default () => {
  const { state } = useOvermind();

  const { routes, pages, style, ui_components = [] } = state.config;

  if (!routes.length)
    return (
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "10px"
        }}
      >
        {pages.loading || "loading ..."}
      </div>
    );

  return (
    <div
      style={Object.assign(
        {
          width: "100%",
          height: "100%"
        },
        style && json(style)
      )}
    >
      {renderComponents(json(ui_components))}
      <Routes routes={json(routes)} pages={json(pages)} />
    </div>
  );
};
