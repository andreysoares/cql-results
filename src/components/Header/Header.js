import React from "react";
import { CQLlibrary } from "../../data/cql-files.json";

const header = (props) => {
  const pt = props.patient
    ? props.patient.name[0].given + " " + props.patient.name[0].family
    : "";
  const total =
    props.total && props.total > 0 ? props.total + " resources" : "...";

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark navbar-static-top">
        <h1 className="navbar-brand">CQL Results</h1>
        <ul className="navbar-nav">
          <li className="nav-item nav-link active">{CQLlibrary} </li>
        </ul>
      </nav>
      <div className="container-fluid">
        <h2 className="text-secondary">{pt}</h2>
        <h3 className="lead">Bundle: {total} </h3>
      </div>
    </div>
  );
};

export default header;
