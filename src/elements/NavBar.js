import React from "react";

const navbar = (props) => {
  return (
    <nav className="navbar navbar-dark bg-dark navbar-static-top">
      <h1 className="navbar-brand">CQL Results</h1>
      <ul className="navbar-nav">
        <li className="nav-item nav-link active">{props.library} </li>
      </ul>
    </nav>
  );
};

export default navbar;
