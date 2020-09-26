import React from "react";

const spinner = (props) => {
  if (props.type === "Loading")
    return (
      <button className="btn " type="button" disabled>
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>{" "}
        Loading...
      </button>
    );
  else
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
};

export default spinner;
