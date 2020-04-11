import React, { useContext } from "react";

const I18nContext = React.createContext({});

export const I18nProvider = ({
  lang = navigator.language || "zh-CN",
  i18n,
  children
}) => {
  const value = i18n ? i18n[lang] : {};

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = () => useContext(I18nContext);
