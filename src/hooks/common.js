/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export const useInit = action => {
  useEffect(() => {
    if (action) action();
  }, []);
};
