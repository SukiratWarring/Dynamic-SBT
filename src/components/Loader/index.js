import loader from "../../assets/loader/Loading.gif";
import React from "react";
import { Loader } from "../../styles/Loader";

const Spinner = () => (
  <div
    style={{
      display: "flex",
      position: "fixed",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      backdropFilter: "blur(0.4px)",
    }}
  >
    <Loader src={loader} alt="loader" />
  </div>
);

Spinner.defaultProps = {
  fullScreen: false,
};

export default Spinner;
