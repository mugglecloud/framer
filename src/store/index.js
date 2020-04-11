import { createOvermind } from "overmind";
// import { graphql } from "overmind-graphql";
import { merge, namespaced } from "overmind/config";

import effects from "./effects";
import { state } from "./state";
import * as actions from "./actions";
import { onInitialize } from "./onInitialize";
// import * as queries from "./queries";
// import * as mutations from "./mutations";

import user from "./namespaces/user";

// import warning from '../utils/warning
// import { getGraphqlUrl } from "./utils";

export const config = merge(
  // graphql(
  //   {
  //     onInitialize,
  //     effects,
  //     state,
  //     actions
  //   },
  //   {
  //     endpoint: getGraphqlUrl(),
  //     headers: state => {
  //       return state.token
  //         ? {
  //             Authorization: `Bearer ${state.token || ""}`
  //           }
  //         : {};
  //     },
  //     options: {
  //       // credentials: 'include',
  //       mode: "cors"
  //     },
  //     queries,
  //     mutations
  //   }
  // ),
  {
    onInitialize,
    effects,
    state,
    actions
  },
  namespaced({
    user
  })
);

export default createOvermind(config, {
  logProxies: true,
  devtools: false,
  hotReloading: process.env.NODE_ENV === "development"
});
