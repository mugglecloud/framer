import { useEffect } from "react";
import { useOvermind } from "../hooks";

export default props => {
  const { actions } = useOvermind();

  useEffect(() => {
    actions.setRoutes(props.routes);
  }, [props.routes, actions]);

  return props.children || null;
};
