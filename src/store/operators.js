import { mutate, map, pipe, catchError, debounce, run } from "overmind";
// import objectPath from "object-path";

export const addAuthHeader = map(({ state }, options) => {
  if (state.token)
    options.headers = Object.assign(options.headers || {}, {
      authorization: `Bearer ${state.token || ""}`
    });
  return options;
});

export const search = () =>
  pipe(
    addAuthHeader,
    map(async ({ state, effects }, { collection, query = "", headers }) => {
      let url = `${state.strapiServerOrigin}/globalsearch/${collection}?${query}`;
      let r = await effects.http.get(url, { headers });
      return { data: r.data, collection };
    }),
    catchError(({ state }, error) => (state.error = error))
  );

export const command = () =>
  pipe(
    addAuthHeader,
    map(async ({ state, effects }, { collection, headers, data }) => {
      const url = `${state.strapiServerOrigin}/command/${collection}`;
      let r = await effects.http.post(url, data, { headers });
      return r.data;
    })
  );

export const download = () =>
  pipe(
    map(
      async (
        { state },
        { collection, query = new URLSearchParams(), headers }
      ) => {
        const data = {
          filename: `${collection}?${query.toString()}`
        };
        return { collection: "links", headers, data };
      }
    ),
    command(),
    run(({ state }, data) => {
      let a = document.createElement("a");
      a.href = `${state.strapiServerOrigin}/downloader/${data.id}`;
      a.download = true;
      // a.target = '_blank';
      a.click();
    })
  );

export const debouncePipe = (ms, ...args) => pipe(debounce(ms || 300), ...args);

export const setState = (path, value = null) =>
  mutate(({ state }, v) => {
    objectPath.set(state, path, value == null ? v : value);
  });

export const getState = path => ({ state }) => objectPath.get(state, path);
