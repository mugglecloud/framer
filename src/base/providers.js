import { OvermindProvider } from "../hooks";
import store from "store";

import { LocaleProvider } from "antd-mobile";

const providers = [
  { provider: LocaleProvider, props: { locale: navigator.language } },
  { provider: OvermindProvider, props: { value: store } }
];

export default providers;
