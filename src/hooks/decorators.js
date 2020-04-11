import React from "react";

export const decorators = (...decorators) => {
  return (C) => {
    let R = (props) => <C {...props}/>;
    decorators.reverse().forEach(d => {
      if (d && typeof d === 'function') R = d(R);
    });
    return R;
  };
};

export default decorators;