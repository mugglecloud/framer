import { map } from "overmind";
import * as filterHandlers from './filters';

export const convertFilters = map(({state}, {filters, ...rest}) => {
  const filterTypes = state.collections.filterTypes;
  let r = []
  filters.forEach(v => {
    let h = filterTypes[v.id] ? filterHandlers[filterTypes[v.id]] : filterHandlers.defaultHandler;
    r.push(...h(v));
  });

  return {filters: r, ...rest};
});