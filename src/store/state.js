export const state = {
  token: localStorage.getItem("jwt") || null,
  error: null,
  config: {},
  runtimeDepsLoaded: false
};
