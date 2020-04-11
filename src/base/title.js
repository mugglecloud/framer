import pathToRegexp from "path-to-regexp";
import { useI18n } from "../hooks/i18n";

export function getTitle() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  const pathname = window.location.pathname;
  for (let k of Object.keys(i18n.title)) {
    const regexp = pathToRegexp(k);
    if (regexp.test(pathname)) return i18n.title[k];
  }

  return i18n.title.default || "";
}
