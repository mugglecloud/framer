export const state = {
  cache: {},
  getData: state => collection =>
    state.cache[collection] || { data: [], count: 0 },

  instances: {},
  get: state => collection => state.instances[collection],
  getInstanceState: state => (collection, defaultState = {}) =>
    state.instances[collection] ? state.instances[collection].state : defaultState,

  filterTypes: {}
};
