import React from "react";
const defaultState = {
  loader: false,
  setLoader: () => null,
};

const LoaderContext = React.createContext(defaultState);

export { LoaderContext };
