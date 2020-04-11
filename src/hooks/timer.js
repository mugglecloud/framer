/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export const useInterval = (action = null, ms = 1000) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (action) action();

    let tid = setTimeout(() => {
      setTimer(timer + 1);
    }, ms);

    return () => clearTimeout(tid);
  }, [timer]);
};
